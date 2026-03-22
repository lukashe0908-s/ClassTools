'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Autocomplete, EmptyState, Label, ListBox, SearchField } from '@heroui/react';
import { SettingsGroup, SettingsItem } from '@renderer/components/settings/SettingsGroup';
import { SettingSwitch } from '@renderer/components/settings/SettingFields';
import { getConfigSync, setConfigSync } from '@renderer/features/ipc/config';
import { fetchCityList } from '@renderer/features/weather/xiaomiWeather';
import { MapPinIcon } from '@heroicons/react/24/outline';

export default function WeatherSettings() {
  const [useWeather, setUseWeather] = useState(false);
  const [showWeatherFeelslike, setShowWeatherFeelslike] = useState(false);
  const [location, setLocation] = useState<{ key: string; label: string } | null>(null);
  const [cityList, setCityList] = useState<{ key: string; label: string }[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    (async () => {
      const savedLocationKey = await getConfigSync('features.weather.locationKey');
      const savedLocationLabel = await getConfigSync('features.weather.locationLabel');
      if (savedLocationKey && savedLocationLabel) {
        const saved = { key: String(savedLocationKey), label: String(savedLocationLabel) };
        setCityList([saved]);
        setLocation(saved);
      }
    })();
  }, []);

  const fetchCities = async (query: string) => {
    setLoadingCities(true);
    try {
      const res = await fetchCityList(query, 'zh_cn');
      const formatted = res.map(city => ({
        key: city.locationKey,
        label: `${city.name} - ${city.affiliation}`,
      }));
      setCityList(formatted);
    } catch (err) {
      console.error('Failed to fetch city list:', err);
    } finally {
      setLoadingCities(false);
    }
  };

  const selectedKey = useMemo(() => location?.key ?? null, [location]);

  return (
    <SettingsGroup title='天气' icon={<MapPinIcon className='w-6 h-6' />}>
      <SettingsItem title='启用天气' description='开启后显示天气功能'>
        <SettingSwitch configName='features.weather.enable' checked={useWeather} onLoaded={setUseWeather} onChange={setUseWeather} />
      </SettingsItem>

      {useWeather && (
        <>
          <SettingsItem title='选择位置'>
            <Autocomplete selectionMode='single' value={selectedKey} onChange={key => {
              const selected = cityList.find(c => c.key === String(key ?? ''));
              if (!selected) return;
              setLocation(selected);
              setConfigSync('features.weather.locationKey', selected.key);
              setConfigSync('features.weather.locationLabel', selected.label);
            }}>
              <Autocomplete.Trigger>
                <Autocomplete.Value />
                <Autocomplete.ClearButton />
                <Autocomplete.Indicator />
              </Autocomplete.Trigger>
              <Autocomplete.Popover>
                <Autocomplete.Filter
                  filter={() => true}
                  onInputChange={query => {
                    if (isFirstRender.current) {
                      isFirstRender.current = false;
                      return;
                    }
                    if (query.length >= 2) {
                      void fetchCities(query);
                    }
                  }}>
                  <SearchField autoFocus name='search' variant='secondary'>
                    <SearchField.Group>
                      <SearchField.SearchIcon />
                      <SearchField.Input placeholder='输入城市名（至少 2 字）' />
                      <SearchField.ClearButton />
                    </SearchField.Group>
                  </SearchField>
                  <ListBox renderEmptyState={() => <EmptyState>{loadingCities ? '搜索中...' : '暂无结果'}</EmptyState>}>
                    {cityList.map(item => (
                      <ListBox.Item key={item.key} id={item.key} textValue={item.label}>
                        {item.label}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Autocomplete.Filter>
              </Autocomplete.Popover>
            </Autocomplete>
          </SettingsItem>

          <SettingsItem title='显示体感温度'>
            <SettingSwitch
              configName='features.weather.showFeelslike'
              checked={showWeatherFeelslike}
              onLoaded={setShowWeatherFeelslike}
              onChange={setShowWeatherFeelslike}
            />
          </SettingsItem>
        </>
      )}
    </SettingsGroup>
  );
}
