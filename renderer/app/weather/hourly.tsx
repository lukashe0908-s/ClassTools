import { useEffect, useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { scaleLinear } from 'd3-scale';
import { line, curveMonotoneX } from 'd3-shape';
import dayjs from 'dayjs';
import { getXiaomiWeatherIcon, timeIsNight } from '@renderer/features/weather/convertor';
import { WeatherData } from '@renderer/features/weather/xiaomiWeatherTypes';
import { Skeleton } from '@heroui/react';

const HEIGHT = 200;
const PADDING_X = 45; // 横向 padding
const PADDING_Y = 30; // 纵向 padding
const POINT_SPACING = 70; // 横向间距

export type TempPoint = {
  time: string; // 显示时间
  temp: number; // 温度
  icon: string; // 图片路径
};

export function HourlyWeatherChart() {
  const [tick, setTick] = useState(0);
  const [data, setData] = useState<TempPoint[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 10_000);

    return () => clearInterval(timer);
  }, []);

  const totalWidth = data.length * POINT_SPACING + PADDING_X * 2;

  // x 轴
  const x = scaleLinear()
    .domain([0, data.length - 1])
    .range([PADDING_X, totalWidth - PADDING_X]);

  // y 轴
  const tempValues = data.map(d => d.temp);
  const minTemp = Math.min(...tempValues) - 2;
  const maxTemp = Math.max(...tempValues) + 2;
  const y = scaleLinear()
    .domain([minTemp, maxTemp])
    .range([HEIGHT - PADDING_Y - 40, PADDING_Y]);

  // 曲线专用（贴边）
  const xLine = scaleLinear()
    .domain([0, data.length - 1])
    .range([0, totalWidth]);
  const linePath = useMemo(
    () =>
      line<TempPoint>()
        .x((_, i) => xLine(i))
        .y(d => y(d.temp))
        .curve(curveMonotoneX)(data)!,
    [data, xLine, y],
  );

  useEffect(() => {
    const raw = localStorage.getItem('weatherFull');
    if (!raw) return;

    try {
      const json = JSON.parse(raw);
      const { forecastHourly, forecastDaily, current: currnetWeather } = json.data as WeatherData;

      const temps: number[] = forecastHourly.temperature.value;
      const weathers: number[] = forecastHourly.weather.value;
      const timePub = dayjs(forecastHourly.temperature.pubTime);
      const sunRiseSet = forecastDaily.sunRiseSet.value;
      forecastDaily.temperature.value;

      const points: TempPoint[] = temps.map((t, i) => {
        const currentTime = timePub.add(i, 'hour');
        const timeLabel = currentTime.hour() === 0 ? currentTime.format('M月D日') : currentTime.format('HH:mm');
        return {
          time: timeLabel,
          temp: t,
          icon: `/static/weatherIcons/${getXiaomiWeatherIcon(weathers[i], timeIsNight(sunRiseSet, currentTime)).replace('icon_', 'icon_gray_bg_')}.webp`,
        };
      });

      const pointCurrent = (() => {
        const currentTime = dayjs();
        return {
          time: '现在',
          temp: Number(currnetWeather.temperature.value),
          icon: `/static/weatherIcons/${getXiaomiWeatherIcon(Number(currnetWeather.weather), timeIsNight(sunRiseSet, currentTime)).replace('icon_', 'icon_gray_bg_')}.webp`,
        };
      })();

      setData([pointCurrent, ...points]);
    } catch (err) {
      console.error('解析 weatherFull 失败', err);
    }
  }, [tick]);
  useEffect(() => {
    if (!containerRef.current) return;
    const resize = () => setContainerWidth(containerRef.current!.clientWidth);
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [data]);

  return !data.length ? (
    <div className='w-[60em] max-w-full px-4'>
      <Skeleton className='h-50 rounded-lg'></Skeleton>
    </div>
  ) : (
    <div ref={containerRef} className='w-full overflow-x-auto scrollbar-hide'>
      <motion.div
        drag='x'
        dragConstraints={{
          left: Math.min(0, -totalWidth + containerWidth),
          right: 0,
        }}>
        <svg width={totalWidth} height={HEIGHT}>
          <defs>
            <linearGradient
              id='tempLineGradient'
              gradientUnits='userSpaceOnUse'
              x1={PADDING_X}
              x2={PADDING_X}
              y1={y(minTemp)}
              y2={y(maxTemp)}>
              <stop offset='0%' stopColor='#4fc3f7' />
              <stop offset='33%' stopColor='#81c784' />
              <stop offset='66%' stopColor='#f4d56f' />
              <stop offset='100%' stopColor='#ffb74d' />
            </linearGradient>
          </defs>

          {/* 曲线 */}
          <motion.path
            d={linePath}
            fill='none'
            stroke='url(#tempLineGradient)'
            strokeWidth={6}
            strokeLinecap='round'
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2 }}
          />

          {data.map((d, i) => {
            const cx = x(i);
            const cy = y(d.temp);

            return (
              <g key={i}>
                {/* 温度 */}
                <text x={cx} y={cy - 20} textAnchor='middle' className='fill-current text-lg'>
                  {d.temp}°
                </text>
                {/* 天气图标 */}
                <image href={d.icon} x={cx - 15} y={HEIGHT - PADDING_Y - 40} width={30} height={30} />
                {/* 时间 */}
                <text x={cx} y={HEIGHT - PADDING_Y + 16} textAnchor='middle' className='fill-current'>
                  {d.time}
                </text>
              </g>
            );
          })}
        </svg>
      </motion.div>
    </div>
  );
}
