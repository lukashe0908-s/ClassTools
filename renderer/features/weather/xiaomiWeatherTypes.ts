export interface WeatherData {
  typhoon: any[];
  current: CurrentWeather;
  forecastDaily: ForecastDaily;
  forecastHourly: ForecastHourly;
  indices: Indices;
  alerts: Alert[];
  yesterday: Yesterday;
  url: Record<string, string>;
  brandInfo: BrandInfo;
  preHour: PreHour[];
  sourceMaps: SourceMaps;
  updateTime: number;
  aqi: AQI;
}

export interface CurrentWeather {
  feelsLike: ValueUnit;
  humidity: ValueUnit;
  pressure: ValueUnit;
  pubTime: string;
  temperature: ValueUnit;
  uvIndex: string;
  visibility: ValueUnit;
  weather: string;
  wind: Wind;
}

export interface ValueUnit {
  unit: string;
  value: string;
}

export interface Wind {
  direction: ValueUnit;
  speed: ValueUnit;
}

export interface ForecastDaily {
  aqi: AQIForecast;
  moonPhase: any | null;
  precipitationProbability: StatusValue<string>;
  pubTime: string;
  status: number;
  sunRiseSet: StatusValue<SunRiseSet[]>;
  temperature: StatusValue<TempRange[]>;
  weather: StatusValue<WeatherRange[]>;
  wind: StatusValue<WindRange[]>;
}

export interface AQIForecast {
  brandInfo: BrandInfo;
  pubTime: string;
  status: number;
  value: number[];
}

export interface BrandInfo {
  brands: Brand[];
}

export interface Brand {
  brandId: string;
  logo: string;
  names: {
    zh_TW: string;
    en_US: string;
    zh_CN: string;
  };
  url: string;
}

export interface StatusValue<T> {
  status: number;
  value: T;
}

export interface SunRiseSet {
  from: string;
  to: string;
}

export interface TempRange {
  from: string;
  to: string;
}

export interface WeatherRange {
  from: string;
  to: string;
}

export interface WindRange {
  direction: { from: string; to: string };
  speed: { from: string; to: string };
}

export interface ForecastHourly {
  aqi: AQIForecast;
  desc: string;
  status: number;
  temperature: HourlyValue;
  weather: HourlyValue<number>;
  wind: HourlyWind;
}

export interface HourlyValue<T = number> {
  pubTime: string;
  status: number;
  unit?: string;
  value: T[];
}

export interface HourlyWind {
  status: number;
  value: HourlyWindItem[];
}

export interface HourlyWindItem {
  datetime: string;
  direction: string;
  speed: string;
}

export interface Indices {
  indices: IndexItem[];
  pubTime: string;
  status: number;
}

export interface IndexItem {
  type: string;
  value: string;
}

export interface Alert {
  locationKey: string;
  alertId: string;
  pubTime: string;
  title: string;
  type: string;
  level: string;
  detail: string;
  images: {
    icon: string;
    notice: string;
  };
  defense?: Defense[];
}

export interface Defense {
  defenseIcon: string;
  defenseText: string;
}

export interface Yesterday {
  aqi: string;
  date: string;
  status: number;
  sunRise: string;
  sunSet: string;
  tempMax: string;
  tempMin: string;
  weatherEnd: string;
  weatherStart: string;
  windDircEnd: string;
  windDircStart: string;
  windSpeedEnd: string;
  windSpeedStart: string;
}

export interface PreHour extends CurrentWeather {
  aqi: AQI;
}

export interface AQI {
  aqi: string | number;
  brandInfo: BrandInfo;
  co: string;
  no2: string;
  o3: string;
  pm10: string;
  pm25: string;
  primary: string;
  pubTime: string;
  so2: string;
  src: string;
  status: number;
  suggest: string;
  pm25Desc: string;
  pm10Desc: string;
  no2Desc: string;
  so2Desc: string;
  coDesc: string;
  o3Desc: string;
}

export interface SourceMaps {
  current: Record<string, string>;
  indices: Record<string, string>;
  daily: Record<string, string>;
  clientInfo: ClientInfo;
  hourly: Record<string, string>;
}

export interface ClientInfo {
  appVersion: number;
  isLocated: boolean;
  isGlobal: boolean;
  appKey: string;
  locale: string;
}

export interface LightWeatherData {
  forecastDaily: {
    pubTime: string;
    temperature: {
      status: number;
      unit: string;
      value: {
        from: string;
        to: string;
      }[];
    };
    weather: {
      status: number;
      value: {
        from: string;
        to: string;
      }[];
    };
    aqi: {
      brandInfo: BrandInfo;
      pubTime: string;
      status: number;
      value: number[];
    };
  };
  current: {
    pubTime: string;
    temperature: {
      unit: string;
      value: string;
    };
    weather: string;
    humidity: {
      unit: string;
      value: string;
    };
    pressure: {
      unit: string;
      value: string;
    };
  };
  aqi: {
    pubTime: string;
    aqi: string;
  };
  alerts: Alert[];
}
