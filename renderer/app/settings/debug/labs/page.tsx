'use client';
import {
  Card,
  CardBody,
  Switch,
  Button,
  Calendar,
  Divider,
  Checkbox,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react';
import { useEffect, useState } from 'react';
import { getConfigSync, getAutoLaunchSync } from '../../../../components/p_function';
import { SettingsSection, SettingsGroup, SettingsItem } from '../../../../components/settings/SettingsGroup';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import WallpaperIcon from '@mui/icons-material/Wallpaper';
import RefreshIcon from '@mui/icons-material/Refresh';

export default function App() {
  const [autoLaunch, setAutoLaunch] = useState(false);
  const [autoLaunchE, setAutoLaunchE] = useState('Finding');
  const [startAction_openHotspot, setStartAction_openHotspot] = useState(false);
  const [startAction_openHotspotDelay, setStartAction_openHotspotDelay] = useState('0');

  const [useGameBgs, setUseGameBgs] = useState(false);
  const [gameList, setGameList] = useState<{ id: string; name: string }[]>([]);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [loadingGames, setLoadingGames] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setAutoLaunch(await getAutoLaunchSync());
        setAutoLaunchE(null);
      } catch (error) {
        setAutoLaunchE('Failed Found');
      }
      const openHotspot = await getConfigSync('main.startAction.openHotspot');
      openHotspot && setStartAction_openHotspot(Boolean(openHotspot));
      const openHotspotDelay = await getConfigSync('main.startAction.openHotspotDelay');
      openHotspotDelay && setStartAction_openHotspotDelay(openHotspotDelay);
    })();
  }, []);
  useEffect(() => {
    (async () => {
      try {
        setAutoLaunch(await getAutoLaunchSync());
        setAutoLaunchE(null);
      } catch (error) {
        setAutoLaunchE('Failed Found');
      }

      const openHotspot = await getConfigSync('main.startAction.openHotspot');
      openHotspot && setStartAction_openHotspot(Boolean(openHotspot));

      const openHotspotDelay = await getConfigSync('main.startAction.openHotspotDelay');
      openHotspotDelay && setStartAction_openHotspotDelay(openHotspotDelay);

      const useBg = await getConfigSync('display.background.useGameBgs');
      setUseGameBgs(Boolean(useBg));

      const gameListRaw = await getConfigSync('display.background.gameList');
      gameListRaw && setGameList(gameListRaw);

      const selected = await getConfigSync('display.background.useGame');
      selected && setSelectedGame(selected);
    })();
  }, []);
  const fetchGameList = async () => {
    try {
      setLoadingGames(true);
      const res = await fetch('https://hyp-api.mihoyo.com/hyp/hyp-connect/api/getGames?launcher_id=jGHBHlcOq1');
      const json = await res.json();
      const games = json?.data?.games?.map((g: any) => ({ id: g.id, name: g.display?.name })) ?? [];
      setGameList(games);
      window.ipc?.send('set-config', 'display.background.gameList', games);
    } catch (err) {
      console.error('Failed to fetch game list:', err);
    } finally {
      setLoadingGames(false);
    }
  };

  return (
    <div className='min-h-screen'>
      <div className='max-w-4xl mx-auto py-6 px-4'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>实验室</h1>
          <p className='text-gray-600'>
            <span className='text-red-400'>这些功能可能不稳定</span>
          </p>
        </div>
        <SettingsSection>
          <SettingsGroup title='自动化' icon={<AutoModeIcon></AutoModeIcon>}>
            <SettingsItem title='开机启动' description={`跟随系统启动此应用${autoLaunchE ? ', ' + autoLaunchE : ''}`}>
              <Switch
                isSelected={autoLaunch}
                onChange={async () => {
                  window.ipc?.invoke('autoLaunch', 'set', !autoLaunch);
                  setAutoLaunch(await getAutoLaunchSync());
                }}
              />
            </SettingsItem>
            <Divider></Divider>
            <SettingsItem title='自动开启热点' description={`在应用启动时开启 Windows 的移动热点`}>
              <Switch
                isSelected={startAction_openHotspot}
                onChange={() => {
                  setStartAction_openHotspot(!startAction_openHotspot);
                  window.ipc?.send('set-config', 'main.startAction.openHotspot', !startAction_openHotspot);
                }}
              />
            </SettingsItem>
            <SettingsItem title='开启热点延迟' description='应用启动后延迟开启热点（单位：秒）'>
              <Input
                type='number'
                min={0}
                max={600}
                className='w-24'
                value={startAction_openHotspotDelay}
                onChange={e => {
                  setStartAction_openHotspotDelay(e.target.value);
                  const value = parseInt(e.target.value, 10) || 0;
                  if (value >= Number(e.target.min) && value <= Number(e.target.max)) {
                    window.ipc?.send('set-config', 'main.startAction.openHotspotDelay', value);
                  }
                }}
              />
            </SettingsItem>
          </SettingsGroup>
          <Divider className='my-6' />

          <SettingsGroup title='背景' icon={<WallpaperIcon></WallpaperIcon>}>
            <SettingsItem title='使用 米哈游 游戏背景' description='从米哈游的游戏中获取动态背景'>
              <Switch
                isSelected={useGameBgs}
                onChange={() => {
                  const newValue = !useGameBgs;
                  setUseGameBgs(newValue);
                  window.ipc?.send('set-config', 'display.background.useGameBgs', newValue);
                }}
              />
            </SettingsItem>

            {useGameBgs && (
              <SettingsItem title='选择游戏' description='选择用于背景展示的游戏'>
                <div className='flex items-center space-x-2'>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button variant='flat' className='min-w-[160px] justify-start'>
                        {selectedGame
                          ? gameList.find(g => g.id === selectedGame)?.name || '已选择未知游戏'
                          : '选择游戏'}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label='游戏列表'
                      disallowEmptySelection
                      selectionMode='single'
                      onAction={key => {
                        setSelectedGame(String(key));
                        window.ipc?.send('set-config', 'display.background.useGame', String(key));
                      }}>
                      {gameList.length > 0 ? (
                        gameList.map(game => <DropdownItem key={game.id}>{game.name}</DropdownItem>)
                      ) : (
                        <DropdownItem key=''>请点击右侧按钮获取列表</DropdownItem>
                      )}
                    </DropdownMenu>
                  </Dropdown>
                  <Button
                    isIconOnly
                    variant='light'
                    isLoading={loadingGames}
                    onPress={fetchGameList}
                    title='刷新列表'
                    className='text-gray-600'>
                    <RefreshIcon></RefreshIcon>
                  </Button>
                </div>
              </SettingsItem>
            )}
          </SettingsGroup>
        </SettingsSection>
      </div>
    </div>
  );
}
