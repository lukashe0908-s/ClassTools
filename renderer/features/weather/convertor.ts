type Lang = 'cn' | 'en';

const WEATHER_NAME_MAP: Record<number, { cn: string; en: string }> = {
  0: { cn: '晴', en: 'Clear' },
  1: { cn: '多云', en: 'Cloudy' },
  2: { cn: '阴', en: 'Overcast' },
  3: { cn: '阵雨', en: 'Showers' },
  4: { cn: '雷阵雨', en: 'Thunderstorm' },
  5: { cn: '雷阵雨并伴有冰雹', en: 'Thunderstorm with hail' },
  6: { cn: '雨夹雪', en: 'Sleet' },
  7: { cn: '小雨', en: 'Light rain' },
  8: { cn: '中雨', en: 'Moderate rain' },
  9: { cn: '大雨', en: 'Heavy rain' },
  10: { cn: '暴雨', en: 'Rainstorm' },
  11: { cn: '大暴雨', en: 'Heavy rainstorm' },
  12: { cn: '特大暴雨', en: 'Torrential rain' },
  13: { cn: '阵雪', en: 'Snow showers' },
  14: { cn: '小雪', en: 'Light snow' },
  15: { cn: '中雪', en: 'Moderate snow' },
  16: { cn: '大雪', en: 'Heavy snow' },
  17: { cn: '暴雪', en: 'Blizzard' },
  18: { cn: '雾', en: 'Fog' },
  19: { cn: '冻雨', en: 'Freezing rain' },
  20: { cn: '沙尘暴', en: 'Sandstorm' },

  // 区间型天气
  21: { cn: '小雨-中雨', en: 'Light to moderate rain' },
  22: { cn: '中雨-大雨', en: 'Moderate to heavy rain' },
  23: { cn: '大雨-暴雨', en: 'Heavy rain to rainstorm' },
  24: { cn: '暴雨-大暴雨', en: 'Rainstorm to heavy rainstorm' },
  25: { cn: '大暴雨-特大暴雨', en: 'Heavy to torrential rain' },
  26: { cn: '小雪-中雪', en: 'Light to moderate snow' },
  27: { cn: '中雪-大雪', en: 'Moderate to heavy snow' },
  28: { cn: '大雪-暴雪', en: 'Heavy snow to blizzard' },

  29: { cn: '浮尘', en: 'Dust' },
  30: { cn: '扬沙', en: 'Blowing sand' },
  31: { cn: '强沙尘暴', en: 'Severe sandstorm' },
  32: { cn: '飑', en: 'Squall' },
  33: { cn: '龙卷风', en: 'Tornado' },
  34: { cn: '若高吹雪', en: 'Drifting snow' },
  35: { cn: '轻雾', en: 'Light fog' },
  53: { cn: '霾', en: 'Haze' },
  99: { cn: '未知', en: 'Unknown' },
};

export function getWeatherName(code: number, lang: Lang = 'cn'): string {
  return WEATHER_NAME_MAP[code]?.[lang] ?? WEATHER_NAME_MAP[99][lang];
}

type WeatherIcon = {
  day: string;
  night?: string;
};

const WEATHER_ICON_MAP: Record<number, WeatherIcon> = {
  0: { day: 'icon_sunny', night: 'icon_sunny_night' },
  1: { day: 'icon_cloudy', night: 'icon_cloudy_night' },
  2: { day: 'icon_overcast' },
  3: { day: 'icon_shower' },
  4: { day: 'icon_t_storm' },
  5: { day: 'icon_t_storm_hail' },
  6: { day: 'icon_rain_snow' },
  7: { day: 'icon_light_rain' },
  8: { day: 'icon_moderate_rain' },
  9: { day: 'icon_heavy_rain' },
  10: { day: 'icon_heavy_rain' },
  11: { day: 'icon_heavy_rain' },
  12: { day: 'icon_heavy_rain' },
  13: { day: 'icon_snow' },
  14: { day: 'icon_light_snow' },
  15: { day: 'icon_moderate_snow' },
  16: { day: 'icon_heavy_snow' },
  17: { day: 'icon_blizzard' },
  18: { day: 'icon_fog', night: 'icon_fog_night' },
  19: { day: 'icon_ice_rain' },
  20: { day: 'icon_sand' },

  // 区间天气 → 用“较重”图标
  21: { day: 'icon_moderate_rain' },
  22: { day: 'icon_heavy_rain' },
  23: { day: 'icon_heavy_rain' },
  24: { day: 'icon_heavy_rain' },
  25: { day: 'icon_heavy_rain' },
  26: { day: 'icon_moderate_snow' },
  27: { day: 'icon_heavy_snow' },
  28: { day: 'icon_blizzard' },

  29: { day: 'icon_float_dirt' },
  30: { day: 'icon_sand' },
  31: { day: 'icon_sandstorm' },
  32: { day: 'icon_wind' },
  33: { day: 'icon_tornado' },
  34: { day: 'icon_snow_wind' },
  35: { day: 'icon_fog' },
  53: { day: 'icon_haze' },
  99: { day: 'icon_unknown' },
};

const DEFAULT_ICON = 'icon_unknown';

export function getWeatherIcon(
  code: number,
  isNight = false
): string {
  const icon = WEATHER_ICON_MAP[code] ?? WEATHER_ICON_MAP[99];
  return isNight && icon.night ? icon.night : icon.day ?? DEFAULT_ICON;
}

const WIND_DIRECTIONS_CN = ['北风', '东北风', '东风', '东南风', '南风', '西南风', '西风', '西北风'];
const WIND_DIRECTIONS_EN = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

/**
 * 根据风向角度返回风向文字
 * @param degree 风向角度 0~360
 * @param lang 'cn' | 'en'
 */
export function getWindDirection(degree: number, lang: 'cn' | 'en' = 'cn'): string {
  const index = Math.round((degree % 360) / 45) % 8;
  return lang === 'en' ? WIND_DIRECTIONS_EN[index] : WIND_DIRECTIONS_CN[index];
}

// ---------- 风力等级 ----------
/**
 * 根据风速(m/s)返回蒲福风力等级
 * @param speed 风速 m/s
 */
export function getWindPower(speed: number): number {
  if (speed < 0) return 0;
  if (speed < 0.3) return 0;
  if (speed < 1.6) return 1;
  if (speed < 3.4) return 2;
  if (speed < 5.5) return 3;
  if (speed < 8.0) return 4;
  if (speed < 10.8) return 5;
  if (speed < 13.9) return 6;
  if (speed < 17.2) return 7;
  if (speed < 20.8) return 8;
  if (speed < 24.5) return 9;
  if (speed < 28.5) return 10;
  if (speed < 32.7) return 11;
  return 12;
}

// ---------- 风速单位转换 ----------
export function convertWindSpeed(
  speed: number,
  fromUnit: 'km/h' | 'm/s' | 'mph' | 'kn',
  toUnit: 'km/h' | 'm/s' | 'mph' | 'kn'
): number {
  let speedMs: number;

  // 先统一转换到 m/s
  switch (fromUnit) {
    case 'km/h':
      speedMs = speed / 3.6;
      break;
    case 'mph':
      speedMs = speed / 2.23694;
      break;
    case 'kn':
      speedMs = speed / 1.94384;
      break;
    default:
      speedMs = speed; // m/s
  }

  // 再转换到目标单位
  switch (toUnit) {
    case 'km/h':
      return +(speedMs * 3.6).toFixed(1);
    case 'mph':
      return +(speedMs * 2.23694).toFixed(1);
    case 'kn':
      return +(speedMs * 1.94384).toFixed(1);
    default:
      return +speedMs.toFixed(1);
  }
}

// ---------- 风完整描述 ----------
/**
 * 返回风完整描述
 * @param speed 风速
 * @param degree 风向角度
 * @param unit 风速单位 'km/h' | 'm/s' | 'mph' | 'kn'
 * @param lang 'cn' | 'en'
 */
export function getWindDescription(
  speed: number,
  degree: number,
  unit: 'km/h' | 'm/s' | 'mph' | 'kn' = 'km/h',
  lang: 'cn' | 'en' = 'cn'
): string {
  const direction = getWindDirection(degree, lang);
  const speedMs = convertWindSpeed(speed, unit, 'm/s'); // 计算风力等级需要 m/s
  const power = getWindPower(speedMs);
  return `${direction} ${lang === 'en' ? 'Level ' : ''}${power}${lang === 'cn' ? '级' : ''} (${speed}${unit})`;
}

// ---------- AQI映射 ----------
const AQI_DESCRIPTIONS_CN = ['优', '良', '轻度污染', '中度污染', '重度污染', '严重污染', '爆表'];
const AQI_DESCRIPTIONS_EN = [
  'Excellent',
  'Good',
  'Light pollution',
  'Moderate pollution',
  'Heavy pollution',
  'Severe pollution',
  'Beyond index',
];

export function getAQIDescription(aqi: number, lang: 'cn' | 'en' = 'cn'): string {
  const descs = lang === 'en' ? AQI_DESCRIPTIONS_EN : AQI_DESCRIPTIONS_CN;
  if (aqi <= 50) return descs[0];
  if (aqi <= 100) return descs[1];
  if (aqi <= 150) return descs[2];
  if (aqi <= 200) return descs[3];
  if (aqi <= 300) return descs[4];
  if (aqi <= 500) return descs[5];
  return descs[6];
}

// ---------- 温度转换 ----------
export function celsiusToFahrenheit(c: number): number {
  return +((c * 9) / 5 + 32).toFixed(1);
}

export function fahrenheitToCelsius(f: number): number {
  return +(((f - 32) * 5) / 9).toFixed(1);
}

// ---------- 示例完整天气描述 ----------
export function getWeatherSummary(
  tempC: number,
  windSpeed: number,
  windDegree: number,
  windUnit: 'km/h' | 'm/s' | 'mph' | 'kn' = 'km/h',
  aqi: number,
  lang: 'cn' | 'en' = 'cn'
) {
  const temp = `${tempC}°C / ${celsiusToFahrenheit(tempC)}°F`;
  const wind = getWindDescription(windSpeed, windDegree, windUnit, lang);
  const aqiDesc = getAQIDescription(aqi, lang);
  return `${temp}, ${wind}, AQI: ${aqiDesc}`;
}

// 使用示例
// console.log(getWeatherSummary(25, 18, 45, 'km/h', 80));
// 输出: 25°C / 77°F, 东北风 3级 (18km/h), AQI: 良
