import { WeatherData, LightWeatherData } from './xiaomiWeatherTypes';

export async function fetchCityList(
  name: string,
  locale: string = 'zh_cn'
): Promise<
  {
    affiliation: string;
    key: string;
    latitude: string;
    locationKey: string;
    longitude: string;
    name: string;
    status: number;
    timeZoneShift: number; // Unit: second
  }[]
> {
  let req = await fetch(
    `https://weatherapi.market.xiaomi.com/wtr-v3/location/city/search?locale=${locale}&name=${name}`
  );
  req = await req.json();
  return req as any;
}

export async function fetchTotalWeather(locationKey: string, locale: string = 'zh_cn'): Promise<WeatherData> {
  let req = await fetch(
    `https://weatherapi.market.xiaomi.com/wtr-v3/weather/all?sign=zUFJoAR2ZVrDy1vF3D07&appKey=weather&locale=${locale}&latitude=0&longitude=0&isGlobal=false&locationKey=${locationKey}&days=15`
  );
  req = await req.json();
  return req as any;
}

export async function fetchApartWeather(locationKey: string, locale: string = 'zh_cn'): Promise<LightWeatherData> {
  let req = await fetch(
    `https://weatherapi.market.xiaomi.com/wtr-v3/weather/all?sign=zUFJoAR2ZVrDy1vF3D07&appKey=weather&locale=${locale}&latitude=0&longitude=0&isGlobal=false&locationKey=${locationKey}&days=15`
  );
  req = await req.json();
  return req as any;
}
