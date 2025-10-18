'use client';
import { Button, Divider } from '@heroui/react';
import { useEffect, useState } from 'react';
import { getVersionSync, formatSize, getSysInfoSync } from '../../../components/p_function';
import { SettingsSection, SettingsGroup, SettingsItem } from '../../../components/settings/SettingsGroup';
import dayjs from 'dayjs';

export default function App() {
  const [navigatorInfo, setNavigatorInfo] = useState('Loading...');
  const [versionInfo, setVersionInfo] = useState('Loading...');
  const [storageInfo, setStorageInfo] = useState('Loading...');
  const [sysInfo, setSysInfo] = useState('Loading...');
  const [runHotspotScriptInfo, setRunHotspotScriptInfo] = useState('');

  // 加载系统信息
  async function loadSysInfo() {
    try {
      const data = await getSysInfoSync({
        uuid: '*',
        memLayout: '*',
        osInfo: '*',
      });
      setSysInfo(JSON.stringify(data, null, '\t'));
    } catch (err) {
      setSysInfo(err instanceof Error ? err.message : String(err));
    }
  }

  // 加载版本信息
  async function loadVersion() {
    let mainVersion = 'Unknown';
    let webVersion = 'Unknown';
    try {
      mainVersion = (await getVersionSync()) as string;
    } catch {}

    try {
      const res = await fetch('/version');
      const text = await res.text();
      webVersion = dayjs(Number(text)).format('YYYY/M/D HH:mm:ss');
    } catch {}

    setVersionInfo(`Main: ${mainVersion}\nWeb: ${webVersion}`);
  }

  // 刷新浏览器与存储信息
  async function refreshNavigatorAndStorage() {
    // navigator
    const navData: Record<string, any> = {};
    for (const key in navigator) {
      try {
        const val = navigator[key];
        if (typeof val !== 'object') navData[key] = val;
      } catch {}
    }
    setNavigatorInfo(JSON.stringify(navData, null, '\t'));
    // storage
    try {
      const est = await navigator.storage.estimate();
      const persisted = await navigator.storage.persisted();
      setStorageInfo(`${formatSize(est.usage)} / ${formatSize(est.quota)}\nPersisted: ${persisted}`);
    } catch {
      setStorageInfo('Unknown');
    }
  }

  useEffect(() => {
    loadSysInfo();
    loadVersion();
    refreshNavigatorAndStorage();
    const id = setInterval(refreshNavigatorAndStorage, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className='min-h-screen'>
      <div className='max-w-4xl mx-auto py-6 px-4'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>调试</h1>
          <p className='text-gray-600'>用于开发与排除错误</p>
        </div>
        <SettingsSection>
          <SettingsGroup title='工具'>
            <SettingsItem title='存储测试' alignRight={false}>
              <div className='flex gap-2 flex-wrap'>
                <Button
                  color='primary'
                  variant='bordered'
                  onPress={() => {
                    const sw = navigator.serviceWorker;
                    sw.getRegistrations
                      ? sw.getRegistrations().then(sws => {
                          sws.forEach(sw => sw.unregister());
                        })
                      : sw.getRegistration?.().then(sw => sw?.unregister());
                  }}>
                  移除Service Worker
                </Button>

                <Button
                  color='primary'
                  variant='bordered'
                  onPress={() => {
                    caches.delete('class-tools');
                    indexedDB.deleteDatabase('workbox-expiration');
                  }}>
                  删除Workbox缓存
                </Button>

                <Button
                  color='primary'
                  variant='bordered'
                  onPress={async () => {
                    const allow = await navigator.storage.persist();
                    alert(`Persist Storage: ${allow ? 'Success' : 'Failed'}`);
                  }}>
                  Apply Persist Storage
                </Button>
              </div>
            </SettingsItem>
            <Divider></Divider>
            <SettingsItem title='热点Debug' alignRight={false} alignCenter={false}>
              <div className='flex gap-2 flex-wrap'>
                <Button
                  color='primary'
                  variant='bordered'
                  onPress={async () => {
                    const foo = await window.ipc.invoke('runHotspotScript');
                    setRunHotspotScriptInfo(foo);
                  }}>
                  尝试打开
                </Button>
                <Button
                  color='primary'
                  variant='bordered'
                  onPress={async () => {
                    setRunHotspotScriptInfo('');
                  }}>
                  清除下方日志
                </Button>
              </div>
              <pre className='whitespace-pre-wrap text-sm pt-2'>{runHotspotScriptInfo}</pre>
            </SettingsItem>
          </SettingsGroup>

          <SettingsGroup title='系统信息'>
            <SettingsItem title='版本' alignRight={false}>
              <pre className='whitespace-pre-wrap text-sm'>{versionInfo}</pre>
            </SettingsItem>
            <SettingsItem title='存储使用' alignRight={false}>
              <pre className='whitespace-pre-wrap text-sm'>{storageInfo}</pre>
            </SettingsItem>
            <Divider></Divider>
            <SettingsItem title='Navigator' alignRight={false} alignCenter={false}>
              <pre className='whitespace-pre-wrap text-sm'>{navigatorInfo}</pre>
            </SettingsItem>
            <SettingsItem title='系统信息' alignRight={false} alignCenter={false}>
              <pre className='whitespace-pre-wrap text-sm'>{sysInfo}</pre>
            </SettingsItem>
          </SettingsGroup>
        </SettingsSection>
      </div>
    </div>
  );
}
