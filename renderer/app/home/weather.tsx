// components/Weather.tsx
import { useEffect, useState } from 'react';
import './qweather-icons.css';

const WEATHER_KEY = 'bdd98ec1d87747f3a2e8b1741a5af796';
const LOCATION = '101300505'; // 可换为动态参数

export function Weather() {
  const [weather, setWeather] = useState<any>(null);

  useEffect(() => {
    let timer: any;

    const fetchWeather = async (force = false) => {
      try {
        if (!force && localStorage.getItem('weather') && +localStorage.getItem('weather_expires') > Date.now()) {
          setWeather(JSON.parse(localStorage.getItem('weather')!));
          return;
        }

        const res = await fetch(`https://api.qweather.com/v7/weather/now?location=${LOCATION}&key=${WEATHER_KEY}`, {
          referrerPolicy: 'no-referrer',
        });
        const json = await res.json();
        localStorage.setItem('weather', JSON.stringify(json));
        localStorage.setItem('weather_expires', `${Date.now() + 10 * 60 * 1000}`);
        setWeather(json);
      } catch (error) {
        setWeather(null);
      }
    };

    fetchWeather();
    timer = setInterval(() => fetchWeather(), 60 * 1000);

    return () => clearInterval(timer);
  }, []);

  const handleClick = () => {
    // if (weather?.fxLink) window.open(weather.fxLink, '_blank');
  };

  if (!weather?.now) {
    return <span id='weather'>--°</span>;
  }

  const icon = weather.now.icon === 154 ? 104 : weather.now.icon;

  return (
    <span
      id='weather'
      className='flex flex-row whitespace-nowrap items-center justify-center bg-blue-500 text-white px-2 py-2 rounded-lg cursor-pointer'
      onClick={handleClick}>
      {icon && <i className={`qi-${icon} pr-2`} />}
      {weather.now.text ? `${weather.now.text} ` : ''}
      {weather.now.temp ?? '--'}°
    </span>
  );
}
