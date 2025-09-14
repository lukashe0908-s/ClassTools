'use client';
import { Card, CardBody, Switch, Button, Calendar, Divider, Checkbox, Input } from '@heroui/react';
import { useEffect, useState } from 'react';
import { getConfigSync, getAutoLaunchSync } from '../../../../components/p_function';
import { SettingsSection, SettingsGroup, SettingsItem } from '../../../../components/settings/SettingsGroup';

export default function App() {
  const [autoLaunch, setAutoLaunch] = useState(false);
  const [autoLaunchE, setAutoLaunchE] = useState('Finding');
  const [startAction_openHotspot, setStartAction_openHotspot] = useState(false);

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
            <SettingsItem title='自动开启热点' description={`在应用启动时开启 Windows 的移动热点`}>
              <Switch
                isSelected={startAction_openHotspot}
                onChange={() => {
                  setStartAction_openHotspot(!startAction_openHotspot);
                  window.ipc?.send('set-config', 'main.startAction.openHotspot', !startAction_openHotspot);
                }}
              />
            </SettingsItem>
          </SettingsGroup>
        </SettingsSection>
      </div>
    </div>
  );
}
