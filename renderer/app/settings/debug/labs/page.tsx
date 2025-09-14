'use client';
import { Card, CardBody, Switch, Button, Calendar, Divider, Checkbox, Input } from '@heroui/react';
import { useEffect, useState } from 'react';
import { getConfigSync, getAutoLaunchSync } from '../../../../components/p_function';
import { SettingsSection, SettingsGroup, SettingsItem } from '../../../../components/settings/SettingsGroup';

export default function App() {
  const [autoLaunch, setAutoLaunch] = useState(false);
  const [autoLaunchE, setAutoLaunchE] = useState('Finding');
  const [startAction_openHotspot, setStartAction_openHotspot] = useState(false);
  const [startAction_openHotspotDelay, setStartAction_openHotspotDelay] = useState('0');

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
          <SettingsGroup title='自动化'>
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
        </SettingsSection>
      </div>
    </div>
  );
}
