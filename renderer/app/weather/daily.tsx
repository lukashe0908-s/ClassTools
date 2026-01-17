'use client';
import { useEffect, useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { scaleLinear } from 'd3-scale';
import { line, curveMonotoneX } from 'd3-shape';
import dayjs from 'dayjs';
import { getXiaomiWeatherIcon, getXiaomiWeatherName } from '@renderer/features/weather/convertor';
import { WeatherData } from '@renderer/features/weather/xiaomiWeatherTypes';
import { Skeleton } from '@heroui/react';

const HEIGHT = 320;
const PADDING_X = 45; // 横向 padding
const PADDING_Y = 30; // 纵向 padding
const INFO_HEIGHT = 150; // 上方信息条高度
const POINT_SPACING = 90; // 每天间距

export interface DailyPoint {
  dateLabel: string; // 今天/明天/周几
  date: string; // 月/日
  weatherCode: number;
  weatherName: string;
  high: number;
  low: number;
}

export function DailyWeatherChart() {
  const [tick, setTick] = useState(0);
  const [data, setData] = useState<DailyPoint[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 10_000);

    return () => clearInterval(timer);
  }, []);

  const totalWidth = data.length * POINT_SPACING + PADDING_X * 2;

  useEffect(() => {
    const raw = localStorage.getItem('weatherFull');
    if (!raw) return;

    try {
      const json = JSON.parse(raw);
      const forecastDaily = (json.data as WeatherData).forecastDaily;

      const points: DailyPoint[] = forecastDaily.temperature.value.map((t, i) => {
        const today = dayjs(forecastDaily.pubTime).add(i, 'day');
        const label = i === 0 ? '今天' : i === 1 ? '明天' : getWeekname(Number(today.format('d')));
        return {
          dateLabel: label,
          date: today.format('MM/DD'),
          weatherCode: Number(forecastDaily.weather.value[i].from),
          weatherName: getXiaomiWeatherName(Number(forecastDaily.weather.value[i].from)) || '',
          high: Number(t.from),
          low: Number(t.to),
        };
      });

      setData(points);
    } catch (err) {
      console.error('解析 daily weather 失败', err);
    }
  }, [tick]);

  useEffect(() => {
    if (!containerRef.current) return;
    const resize = () => setContainerWidth(containerRef.current!.clientWidth);
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [data]);

  const highValues = data.map(d => d.high);
  const lowValues = data.map(d => d.low);
  const minTemp = Math.min(...lowValues) - 2;
  const maxTemp = Math.max(...highValues) + 2;

  // x轴
  const x = scaleLinear()
    .domain([0, data.length - 1])
    .range([PADDING_X, totalWidth - PADDING_X]);

  // y轴
  const y = scaleLinear()
    .domain([minTemp, maxTemp])
    .range([HEIGHT - PADDING_Y, INFO_HEIGHT + 20]);

  // 曲线
  const highPath = useMemo(
    () =>
      line<DailyPoint>()
        .x((_, i) => x(i))
        .y(d => y(d.high))
        .curve(curveMonotoneX)(data)!,
    [data, x, y],
  );
  const lowPath = useMemo(
    () =>
      line<DailyPoint>()
        .x((_, i) => x(i))
        .y(d => y(d.low))
        .curve(curveMonotoneX)(data)!,
    [data, x, y],
  );

  return !data.length ? (
    <div className='w-[40vw] min-w-full max-w-[100vw] p-4'>
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
          {/* 上方固定信息 */}
          {data.map((d, i) => {
            const cx = x(i);
            return (
              <g key={i}>
                <text x={cx} y={15} textAnchor='middle' className='text-base fill-current text-foreground-600'>
                  {d.date}
                </text>
                <text x={cx} y={40} textAnchor='middle' className='text-base fill-current'>
                  {d.dateLabel}
                </text>
                <image
                  href={`/static/weatherIcons/${getXiaomiWeatherIcon(d.weatherCode).replace('icon_', 'icon_gray_bg_')}.webp`}
                  x={cx - 15}
                  y={60}
                  width={30}
                  height={30}
                />
                <text x={cx} y={120} textAnchor='middle' className='text-base fill-current'>
                  {d.weatherName}
                </text>
              </g>
            );
          })}

          {/* 曲线 */}
          <motion.path
            d={lowPath}
            fill='none'
            stroke='#4fc3f7'
            strokeWidth={3}
            strokeLinecap='round'
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2 }}
          />
          <motion.path
            d={highPath}
            fill='none'
            stroke='#f44336'
            strokeWidth={3}
            strokeLinecap='round'
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2 }}
          />

          {/* 每天高低温圆点及温度显示 */}
          {data.map((d, i) => {
            const cx = x(i);
            const highY = y(d.high);
            const lowY = y(d.low);
            return (
              <g key={i}>
                {/* 高温圆点 */}
                <circle cx={cx} cy={highY} r={6} fill='white' stroke='#f44336' strokeWidth={2} />
                <text x={cx} y={highY - 12} textAnchor='middle' className='text-base fill-current'>
                  {d.high}°
                </text>

                {/* 低温圆点 */}
                <circle cx={cx} cy={lowY} r={6} fill='white' stroke='#4fc3f7' strokeWidth={2} />
                <text x={cx} y={lowY + 18 + 12} textAnchor='middle' className='text-base fill-current'>
                  {d.low}°
                </text>
              </g>
            );
          })}
        </svg>
      </motion.div>
    </div>
  );
}

function getWeekname(day: number) {
  switch (day) {
    case 0:
      return '周日';
    case 1:
      return '周一';
    case 2:
      return '周二';
    case 3:
      return '周三';
    case 4:
      return '周四';
    case 5:
      return '周五';
    case 6:
      return '周六';
    default:
      break;
  }
}
