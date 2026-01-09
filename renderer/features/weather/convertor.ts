const WEATHER_NAMES_CN = [
  '晴',
  '多云',
  '阴',
  '雾',
  '特大暴雨',
  '大暴雨',
  '暴雨',
  '雷阵雨',
  '阵雨',
  '大雨',
  '中雨',
  '小雨',
  '雨夹雪',
  '暴雪',
  '阵雪',
  '大雪',
  '中雪',
  '小雪',
  '强沙尘暴',
  '沙尘暴',
  '沙尘',
  '扬沙',
  '冰雹',
  '浮尘',
  '霾',
  '冻雨',
];
const WEATHER_NAMES_EN = [
  'Clear',
  'Cloudy',
  'Overcast',
  'Foggy',
  'Heavy rainstorm',
  'Downpour',
  'Rainstorm',
  'Thunderstorm',
  'Rain',
  'Heavy rainfall',
  'Moderate rain',
  'Light rain',
  'Rain and snow mixed',
  'Blizzard',
  'Snow',
  'Heavy snow',
  'Moderate snow',
  'Light snow',
  'Strong sandstorm',
  'Sand storm',
  'Sand',
  'Windy',
  'Hail',
  'Dust',
  'Haze',
  'Freezing rain',
];
const WEATHER_ICONS = [
  { day: 'icon_sunny', night: 'icon_sunny_night' }, // 0
  { day: 'icon_cloudy', night: 'icon_cloudy_night' }, // 1
  { day: 'icon_overcast' }, // 2
  { day: 'icon_fog', night: 'icon_fog_night' }, // 3
  { day: 'icon_heavy_rain' }, // 4
  { day: 'icon_heavy_rain' }, // 5
  { day: 'icon_heavy_rain' }, // 6
  { day: 'icon_t_storm' }, // 7
  { day: 'icon_light_rain' }, // 8
  { day: 'icon_heavy_rain' }, // 9
  { day: 'icon_moderate_rain' }, // 10
  { day: 'icon_light_rain' }, // 11
  { day: 'icon_rain_snow' }, // 12
  { day: 'icon_heavy_snow' }, // 13
  { day: 'icon_light_snow' }, // 14
  { day: 'icon_heavy_snow' }, // 15
  { day: 'icon_moderate_snow' }, // 16
  { day: 'icon_light_snow' }, // 17
  { day: 'icon_sand' }, // 18
  { day: 'icon_sand' }, // 19
  { day: 'icon_pm_dirt' }, // 20
  { day: 'icon_pm_dirt' }, // 21
  { day: 'icon_t_storm' }, // 22
  { day: 'icon_float_dirt' }, // 23
  { day: 'icon_pm_dirt' }, // 24
  { day: 'icon_ice_rain' }, // 25
];

export function getXiaomiWeatherName(type: number, lang: 'cn' | 'en' = 'cn'): string {
  const names = lang === 'en' ? WEATHER_NAMES_EN : WEATHER_NAMES_CN;
  if (type >= 0 && type < names.length) {
    return names[type];
  }
  return lang === 'en' ? 'Unknown' : '未知';
}

export function getXiaomiWeatherIcon(type: number, isNight: boolean = false): string {
  const icon = WEATHER_ICONS[type];
  return icon ? (isNight && icon.night ? icon.night : icon.day) : '';
}

// ---------- 风向映射 ----------
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
