'use client';
import React, { useState } from 'react';
import { SettingsGroup, SettingsItem } from './SettingsGroup';
import { SettingSelect, SettingSlider, SettingSwitch } from './SettingFields';
import { WindowIcon, PaintBrushIcon, CloudIcon, EyeIcon } from '@heroicons/react/24/outline';

export function WindowSettings() {
  const [windowWidth, setWindowWidth] = useState(0.2);
  const [windowHeight, setWindowHeight] = useState(1);

  return (
    <SettingsGroup title='窗口设置' icon={<WindowIcon className='w-6 h-6' />}>
      <SettingsItem title='窗口宽度' description={`当前值 ${Math.round(windowWidth * 100)}%`}>
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

      <SettingsItem title='窗口高度' description={`当前值 ${Math.round(windowHeight * 100)}%`}>
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
  const [fontSize, setFontSize] = useState(1);
  const [slidingPosition, setSlidingPosition] = useState('center');
  const [timeDisplay, setTimeDisplay] = useState('always');
  const [progressDisplay, setProgressDisplay] = useState('always');
  const [useWindowBackgroundMaterial, setUseWindowBackgroundMaterial] = useState(false);

  return (
    <SettingsGroup title='外观设置' icon={<PaintBrushIcon className='w-6 h-6' />}>
      <SettingsItem title='字体大小' description={`当前值 ${fontSize.toFixed(1)}x`}>
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

      <SettingsItem title='滚动位置' description='设置滚动时的对齐方式'>
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

      <SettingsItem title='时间显示' description='设置课程时间的显示时机'>
        <SettingSelect
          configName='display.timeDisplay'
          value={timeDisplay}
          onLoaded={setTimeDisplay}
          onChange={setTimeDisplay}
          options={[
            { value: 'always', label: '始终显示' },
            { value: 'active', label: '活动时显示' },
            { value: 'never', label: '从不显示' },
          ]}
        />
      </SettingsItem>

      <SettingsItem title='进度条显示' description='设置进度条的显示时机'>
        <SettingSelect
          configName='display.progressDisplay'
          value={progressDisplay}
          onLoaded={setProgressDisplay}
          onChange={setProgressDisplay}
          options={[
            { value: 'always', label: '始终显示' },
            { value: 'active', label: '活动时显示' },
            { value: 'never', label: '从不显示' },
          ]}
        />
      </SettingsItem>

      <SettingsItem title='使用窗口级背景材质' description='在 Windows 11 22H2 及更高版本中可启用窗口材质背景'>
        <SettingSwitch
          configName='display.useWindowBackgroundMaterial'
          checked={useWindowBackgroundMaterial}
          onLoaded={setUseWindowBackgroundMaterial}
          onChange={setUseWindowBackgroundMaterial}
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
    <SettingsGroup title='更新设置' icon={<CloudIcon className='w-6 h-6' />}>
      <SettingsItem title='在线模式' description='启用后优先使用最新 UI 版本'>
        <SettingSwitch configName='useOnlineVersion' checked={online} onLoaded={setOnline} onChange={setOnline} />
      </SettingsItem>

      <SettingsItem title='检查更新' description='自动检查并通知可用的新版本'>
        <SettingSwitch
          configName='upgrade.autoCheckUpdate'
          checked={autoCheckUpdate}
          onLoaded={setAutoCheckUpdate}
          onChange={setAutoCheckUpdate}
        />
      </SettingsItem>

      <SettingsItem title='自动下载更新' description='检测到新版本后在后台自动下载更新包'>
        <SettingSwitch
          configName='upgrade.autoDownloadUpdate'
          checked={autoDownloadUpdate}
          onLoaded={setAutoDownloadUpdate}
          onChange={setAutoDownloadUpdate}
        />
      </SettingsItem>
    </SettingsGroup>
  );
}

export function InterfaceSettings() {
  const [hiddenControlBar, setHiddenControlBar] = useState(false);
  const [hiddenRefreshWindow, setHiddenRefreshWindow] = useState(false);

  return (
    <SettingsGroup title='交互设置' icon={<EyeIcon className='w-6 h-6' />}>
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
