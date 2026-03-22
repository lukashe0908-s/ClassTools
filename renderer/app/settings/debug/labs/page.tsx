'use client';
import { Button, Separator } from '@heroui/react';
import { useEffect, useMemo, useState } from 'react';
import { getConfigSync, setConfigSync } from '@renderer/features/ipc/config';
import { getAutoLaunchSync } from '@renderer/features/ipc/functions';
import { SettingsPage, SettingsGroup, SettingsItem } from '@renderer/components/settings/SettingsGroup';
import { SettingInput, SettingSelect, SettingSwitch } from '@renderer/components/settings/SettingFields';
import { ClockIcon, PhotoIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import WeatherSettings from '@renderer/components/settings/WeatherSettings';

export default function LabsSettingsPage() {
  const [autoLaunch, setAutoLaunch] = useState(false);
  const [autoLaunchState, setAutoLaunchState] = useState('Finding');
  const [startActionOpenHotspot, setStartActionOpenHotspot] = useState(false);
  const [startActionOpenHotspotDelay, setStartActionOpenHotspotDelay] = useState('0');

  const [useGameBgs, setUseGameBgs] = useState(false);
  const [gameList, setGameList] = useState<{ id: string; name: string }[]>([]);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [loadingGames, setLoadingGames] = useState(false);
  const [allowGameBgsType, setAllowGameBgsType] = useState('mixed-video-image');

  useEffect(() => {
    (async () => {
      try {
        setAutoLaunch(await getAutoLaunchSync());
        setAutoLaunchState('');
      } catch {
        setAutoLaunchState('Failed Found');
      }

      const gameListRaw = await getConfigSync('display.background.gameList');
      if (gameListRaw) setGameList(gameListRaw);
    })();
  }, []);

  const gameOptions = useMemo(() => gameList.map(game => ({ value: game.id, label: game.name })), [gameList]);

  const fetchGameList = async () => {
    try {
      setLoadingGames(true);
      const res = await fetch('https://hyp-api.mihoyo.com/hyp/hyp-connect/api/getGames?launcher_id=jGHBHlcOq1');
      const json = await res.json();
      const games = json?.data?.games?.map((g: any) => ({ id: g.id, name: g.display?.name })) ?? [];
      setGameList(games);
      setConfigSync('display.background.gameList', games);
    } catch (err) {
      console.error('Failed to fetch game list:', err);
    } finally {
      setLoadingGames(false);
    }
  };

  return (
    <SettingsPage description={<span className='text-red-400'>这些功能处于实验阶段</span>}>
      <SettingsGroup title='自动化' icon={<ClockIcon className='w-6 h-6' />}>
        <SettingsItem title='开机启动' description={`跟随系统启动${autoLaunchState ? `, ${autoLaunchState}` : ''}`}>
          <SettingSwitch
            checked={autoLaunch}
            onChange={async next => {
              await window.ipc?.invoke('autoLaunch', 'set', next);
              setAutoLaunch(await getAutoLaunchSync());
            }}
          />
        </SettingsItem>

        <Separator />

        <SettingsItem title='启动后自动开启热点' description='应用启动时尝试开启 Windows 移动热点'>
          <SettingSwitch
            configName='features.startActions.openHotspot'
            checked={startActionOpenHotspot}
            onLoaded={setStartActionOpenHotspot}
            onChange={setStartActionOpenHotspot}
          />
        </SettingsItem>

        <SettingsItem title='开启热点延迟' description='单位：秒'>
          <SettingInput
            configName='features.startActions.openHotspotDelay'
            type='number'
            min={0}
            max={600}
            value={startActionOpenHotspotDelay}
            className='w-24'
            onLoaded={setStartActionOpenHotspotDelay}
            onChange={setStartActionOpenHotspotDelay}
            serialize={value => {
              const parsed = parseInt(value, 10) || 0;
              return Math.max(0, Math.min(600, parsed));
            }}
          />
        </SettingsItem>
      </SettingsGroup>

      <SettingsGroup title='背景' icon={<PhotoIcon className='w-6 h-6' />}>
        <SettingsItem title='使用米哈游游戏背景' description='从米哈游启动器 API 获取背景素材'>
          <SettingSwitch
            configName='display.background.useGameBgs'
            checked={useGameBgs}
            onLoaded={setUseGameBgs}
            onChange={setUseGameBgs}
          />
        </SettingsItem>

        {useGameBgs && (
          <>
            <SettingsItem title='选择游戏'>
              <div className='flex items-center space-x-2'>
                <SettingSelect
                  configName='display.background.useGame'
                  value={selectedGame ?? ''}
                  placeholder='请选择游戏'
                  className='min-w-40'
                  options={gameOptions}
                  onLoaded={value => setSelectedGame(value || null)}
                  onChange={value => setSelectedGame(value || null)}
                />
                <Button isIconOnly variant='tertiary' isPending={loadingGames} onPress={fetchGameList}>
                  <ArrowPathIcon className='w-4 h-4' />
                </Button>
              </div>
            </SettingsItem>

            <SettingsItem title='允许类型'>
              <SettingSelect
                configName='display.background.useGameBgsAllowType'
                value={allowGameBgsType}
                className='min-w-52'
                options={[
                  { value: 'video-image', label: '视频与图片' },
                  { value: 'mixed-video-image', label: '可暂停视频与图片' },
                  { value: 'image-only', label: '仅图片' },
                ]}
                onLoaded={setAllowGameBgsType}
                onChange={setAllowGameBgsType}
              />
            </SettingsItem>
          </>
        )}
      </SettingsGroup>

      <WeatherSettings />
    </SettingsPage>
  );
}
