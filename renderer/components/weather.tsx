'use client';
import { useEffect, useState } from 'react';
import { Skeleton, Image } from '@heroui/react';
import { getConfigSync } from '@renderer/features/p_function';
import { getXiaomiWeatherName, getXiaomiWeatherIcon } from '@renderer/features/weather/convertor';
import { fetchTotalWeather, fetchApartWeather } from '@renderer/features/weather/xiaomiWeather';
import { WeatherData } from '@renderer/features/weather/xiaomiWeatherTypes';

export function Weather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(true);
  const [showFeellike, setShowFeellike] = useState(true);

  useEffect(() => {
    let timer: any
    (async () => {
      const useWeather = (await getConfigSync('features.weather.enable')) || false;
      setEnabled(Boolean(useWeather));

      const showWeatherFeellike = (await getConfigSync('features.weather.showFeellike')) || true;
      setShowFeellike(Boolean(showWeatherFeellike));

      if (!Boolean(useWeather)) return;

      const fetchWeather = async (force = false) => {
      let requestLocation = (await getConfigSync('features.weather.locationKey')) || 'weathercn:101010100';

      try {
        setLoading(true);

        // 使用缓存
        if (!force && localStorage.getItem('weatherFull')) {
          const weatherFull: { data: any; location: string; updateTime: number } = JSON.parse(
            localStorage.getItem('weatherFull')
          );
          if (
            weatherFull.location === requestLocation &&
            weatherFull?.updateTime + 10 * 60 * 1000 > Date.now() &&
            weatherFull?.data?.current
          ) {
            setWeather(weatherFull?.data);
            setLoading(false);
            return;
          }
        }

        const weatherData = await fetchTotalWeather(requestLocation);
        console.log(weatherData);

        if (weatherData?.current) {
          localStorage.setItem(
            'weatherFull',
            JSON.stringify({ data: weatherData, location: requestLocation, updateTime: Date.now() })
          );
          setWeather(weatherData);
        } else {
          alert('天气获取失败: 配置错误');
        }
      } catch (error) {
        setWeather(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    timer = setInterval(() => fetchWeather(), 10 * 1000);
    })();

    return () => timer && clearInterval(timer);
  }, []);

  const handleClick = () => {
   window.open('/weather', '_blank');
  };

  if (loading || !weather?.current) {
    return <Skeleton className='w-28 h-10 rounded-lg' />;
  }

  if (!enabled) return;

  // 判断是否是夜间
  const now = Date.now();
  const sunRise = new Date(weather.forecastDaily.sunRiseSet.value[0].from).getTime();
  const sunSet = new Date(weather.forecastDaily.sunRiseSet.value[0].to).getTime();
  const isNight = now < sunRise || now > sunSet;
  
  const weatherName = getXiaomiWeatherName(Number(weather.current.weather));
  const weatherIcon = getXiaomiWeatherIcon(Number(weather.current.weather), isNight);

  return (
    <div
      className='flex gap-1 items-center bg-primary-400 text-primary-foreground px-3 py-2 rounded-lg cursor-pointer select-none'
      onClick={handleClick}>
      {weatherIcon && (
        <Image
          src={`/static/weatherIcons/${weatherIcon}.webp`}
          radius='none'
          className='w-[1.5em] shrink-0'
          removeWrapper={true}
          draggable={false}></Image>
      )}
      <span className='whitespace-nowrap'>
        {`${weatherName ? `${weatherName} ` : ''}${weather.current.temperature.value}°`}
      </span>
      {showFeellike && (
        <span className='text-sm text-gray-300 hidden min-[20em]:inline whitespace-nowrap'>
          体感 {weather.current.feelsLike.value}°
        </span>
      )}
    </div>
  );
}
