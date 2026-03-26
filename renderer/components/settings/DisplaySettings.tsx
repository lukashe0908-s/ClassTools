'use client';
import React, { useState } from 'react';
import { SettingsGroup, SettingsItem } from './SettingsGroup';
import { SettingSelect, SettingSlider, SettingSwitch } from './SettingFields';
import { WindowIcon, PaintBrushIcon, CloudIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useTheme } from 'next-themes';
import { Separator } from '@heroui/react';

export function WindowSettings() {
  const [windowWidth, setWindowWidth] = useState(0.2);
  const [windowHeight, setWindowHeight] = useState(1);

  return (
    <SettingsGroup title='窗口' icon={<WindowIcon className='w-6 h-6' />}>
      <SettingsItem title='宽度' description={`当前: ${Math.round(windowWidth * 100)}%`}>
        <SettingSlider
          configName='display.windowWidth'
          step={0.01}
          max={1}
          min={0.05}
          value={windowWidth}
          onLoaded={setWindowWidth}
          onChange={setWindowWidth}
        />
      </SettingsItem>

      <SettingsItem title='高度' description={`当前: ${Math.round(windowHeight * 100)}%`}>
        <SettingSlider
          configName='display.windowHeight'
          step={0.01}
          max={1}
          min={0.05}
          value={windowHeight}
          onLoaded={setWindowHeight}
          onChange={setWindowHeight}
        />
      </SettingsItem>
    </SettingsGroup>
  );
}

export function AppearanceSettings() {
  const { setTheme } = useTheme();
  const [fontSize, setFontSize] = useState(1);
  const [theme, setThemeValue] = useState<'system' | 'light' | 'dark'>('system');
  const [slidingPosition, setSlidingPosition] = useState('center');
  const [timeDisplay, setTimeDisplay] = useState('always');
  const [progressDisplay, setProgressDisplay] = useState('always');
  const [useWindowBackgroundMaterial, setUseWindowBackgroundMaterial] = useState(false);

  const handleThemeChange = (value: string) => {
    if (value !== 'system' && value !== 'light' && value !== 'dark') return;
    setThemeValue(value);
    setTheme(value);
  };

  return (
    <SettingsGroup title='个性化' icon={<PaintBrushIcon className='w-6 h-6' />}>
      <SettingsItem title='外观'>
        <SettingSelect
          configName='display.theme'
          value={theme}
          onLoaded={handleThemeChange}
          onChange={handleThemeChange}
          options={[
            { value: 'system', label: '使用系统设置' },
            { value: 'light', label: '浅色' },
            { value: 'dark', label: '深色' },
          ]}
        />
      </SettingsItem>

      <SettingsItem title='字体大小' description={`当前: ${fontSize.toFixed(1)}x`}>
        <SettingSlider
          configName='display.fontSize'
          step={0.1}
          max={5}
          min={0.5}
          value={fontSize}
          onLoaded={setFontSize}
          onChange={setFontSize}
        />
      </SettingsItem>

      <SettingsItem title='使用窗口背景材质' description='在支持的 Windows 11 版本上启用亚克力材质'>
        <SettingSwitch
          configName='display.useWindowBackgroundMaterial'
          checked={useWindowBackgroundMaterial}
          onLoaded={setUseWindowBackgroundMaterial}
          onChange={setUseWindowBackgroundMaterial}
        />
      </SettingsItem>

      <Separator></Separator>

      <SettingsItem title='滚动位置' description='滚动时的对齐方式'>
        <SettingSelect
          configName='display.slidingPosition'
          value={slidingPosition}
          onLoaded={setSlidingPosition}
          onChange={setSlidingPosition}
          options={[
            { value: 'start', label: '开始' },
            { value: 'center', label: '居中' },
            { value: 'end', label: '结束' },
            { value: 'nearest', label: '最近' },
          ]}
        />
      </SettingsItem>

      <SettingsItem title='时间显示' description='课程时间的显示时机'>
        <SettingSelect
          configName='display.timeDisplay'
          value={timeDisplay}
          onLoaded={setTimeDisplay}
          onChange={setTimeDisplay}
          options={[
            { value: 'always', label: '始终' },
            { value: 'active', label: '活动时' },
            { value: 'never', label: '从不' },
          ]}
        />
      </SettingsItem>

      <SettingsItem title='进度条显示' description='进度条的显示时机'>
        <SettingSelect
          configName='display.progressDisplay'
          value={progressDisplay}
          onLoaded={setProgressDisplay}
          onChange={setProgressDisplay}
          options={[
            { value: 'always', label: '始终' },
            { value: 'active', label: '活动时' },
            { value: 'never', label: '从不' },
          ]}
        />
      </SettingsItem>
    </SettingsGroup>
  );
}

export function UpgradeSettings() {
  const [online, setOnline] = useState(false);
  const [autoCheckUpdate, setAutoCheckUpdate] = useState(true);
  const [autoDownloadUpdate, setAutoDownloadUpdate] = useState(true);

  return (
    <SettingsGroup title='更新' icon={<CloudIcon className='w-6 h-6' />}>
      <SettingsItem title='检查更新'>
        <SettingSwitch
          configName='upgrade.autoCheckUpdate'
          checked={autoCheckUpdate}
          onLoaded={setAutoCheckUpdate}
          onChange={setAutoCheckUpdate}
        />
      </SettingsItem>

      <SettingsItem title='自动下载更新' description='检测到更新后自动下载更新'>
        <SettingSwitch
          configName='upgrade.autoDownloadUpdate'
          checked={autoDownloadUpdate}
          onLoaded={setAutoDownloadUpdate}
          onChange={setAutoDownloadUpdate}
        />
      </SettingsItem>

      <Separator></Separator>

      <SettingsItem title='在线模式' description='优先在线加载最新的用户界面'>
        <SettingSwitch configName='useOnlineVersion' checked={online} onLoaded={setOnline} onChange={setOnline} />
      </SettingsItem>
    </SettingsGroup>
  );
}

export function InterfaceSettings() {
  const [hiddenControlBar, setHiddenControlBar] = useState(false);
  const [hiddenRefreshWindow, setHiddenRefreshWindow] = useState(false);

  return (
    <SettingsGroup title='交互' icon={<EyeIcon className='w-6 h-6' />}>
      <SettingsItem title='禁用控制栏操作'>
        <SettingSwitch
          configName='display.hidden.controlBar'
          checked={hiddenControlBar}
          onLoaded={setHiddenControlBar}
          onChange={setHiddenControlBar}
        />
      </SettingsItem>

      <SettingsItem title='隐藏刷新按钮'>
        <SettingSwitch
          configName='display.hidden.refreshWindow'
          checked={hiddenRefreshWindow}
          onLoaded={setHiddenRefreshWindow}
          onChange={setHiddenRefreshWindow}
        />
      </SettingsItem>
    </SettingsGroup>
  );
}
