'use client';
import React, { useState, useEffect } from 'react';
import { Switch, Slider, Autocomplete, AutocompleteItem, Tooltip } from '@heroui/react';
import { SettingsGroup, SettingsItem, SettingsSection } from './SettingsGroup';
import { getConfigSync } from '@renderer/features/p_function';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloudIcon from '@mui/icons-material/Cloud';
import InfoIcon from '@mui/icons-material/Info';

export function WindowSettings() {
  const [windowWidth, setWindowWidth] = useState(0.13);
  const [windowHeight, setWindowHeight] = useState(1);

  useEffect(() => {
    (async () => {
      const widthData = await getConfigSync('display.windowWidth');
      widthData && setWindowWidth(Number(widthData));

      const heightData = await getConfigSync('display.windowHeight');
      heightData && setWindowHeight(Number(heightData));
    })();
  }, []);

  return (
    <SettingsGroup title='窗口设置' description='调整应用窗口的大小和显示属性' icon={<DesktopWindowsIcon />}>
      <SettingsItem title='窗口宽度' description={`当前值: ${(windowWidth * 100).toFixed(0)}%`}>
        <div className='w-80'>
          <Slider
            step={0.01}
            maxValue={1}
            minValue={0.05}
            marks={[
              { value: 0.1, label: '10%' },
              { value: 0.2, label: '20%' },
              { value: 0.3, label: '30%' },
              { value: 0.4, label: '40%' },
              { value: 0.5, label: '50%' },
            ]}
            value={windowWidth}
            onChange={(value: number) => {
              setWindowWidth(value);
              window.ipc?.send('set-config', 'display.windowWidth', value);
            }}
          />
        </div>
      </SettingsItem>

      <SettingsItem title='窗口高度' description={`当前值: ${(windowHeight * 100).toFixed(0)}%`}>
        <div className='w-80'>
          <Slider
            step={0.01}
            maxValue={1}
            minValue={0.05}
            value={windowHeight}
            onChange={(value: number) => {
              setWindowHeight(value);
              window.ipc?.send('set-config', 'display.windowHeight', value);
            }}
          />
        </div>
      </SettingsItem>
    </SettingsGroup>
  );
}

export function AppearanceSettings() {
  const [fontSize, setFontSize] = useState(1.2);
  const [slidingPosition, setSlidingPosition] = useState('center');
  const [progressDisplay, setProgressDisplay] = useState('always');
  const [useWindowBackgroundMaterial, setUseWindowBackgroundMaterial] = useState(false);

  useEffect(() => {
    (async () => {
      const fontData = await getConfigSync('display.fontSize');
      fontData && setFontSize(Number(fontData));

      const slidingData = await getConfigSync('display.slidingPosition');
      slidingData && setSlidingPosition(String(slidingData));

      const progressData = await getConfigSync('display.progressDisplay');
      progressData && setProgressDisplay(String(progressData));

      const useWindowBackgroundMaterialData = await getConfigSync('display.useWindowBackgroundMaterial');
      useWindowBackgroundMaterialData && setUseWindowBackgroundMaterial(useWindowBackgroundMaterialData);
    })();
  }, []);

  return (
    <SettingsGroup title='外观设置' description='自定义应用的视觉显示效果' icon={<TextFieldsIcon />}>
      <SettingsItem title='字体大小' description={`当前值: ${fontSize.toFixed(1)}x`}>
        <div className='w-80'>
          <Slider
            step={0.1}
            maxValue={5}
            minValue={0.1}
            showSteps={true}
            value={fontSize}
            onChange={(value: number) => {
              setFontSize(value);
              window.ipc?.send('set-config', 'display.fontSize', value);
            }}
          />
        </div>
      </SettingsItem>
      <SettingsItem title='滑动位置' description='设置滚动时的对齐方式'>
        <Autocomplete
          selectedKey={slidingPosition}
          onSelectionChange={(value: string) => {
            setSlidingPosition(value);
            window.ipc?.send('set-config', 'display.slidingPosition', value);
          }}
          defaultItems={[
            { value: 'start', label: '开始' },
            { value: 'center', label: '居中' },
            { value: 'end', label: '结束' },
            { value: 'nearest', label: '最近' },
          ]}>
          {item => <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>}
        </Autocomplete>
      </SettingsItem>
      <SettingsItem title='进度条显示' description='设置进度条的显示时机'>
        <Autocomplete
          selectedKey={progressDisplay}
          onSelectionChange={(value: string) => {
            setProgressDisplay(value);
            window.ipc?.send('set-config', 'display.progressDisplay', value);
          }}
          defaultItems={[
            { value: 'always', label: '始终显示' },
            { value: 'active', label: '活动时显示' },
            { value: 'never', label: '从不显示' },
          ]}>
          {item => <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>}
        </Autocomplete>
      </SettingsItem>
      <SettingsItem
        title='使用窗口级背景模糊'
        description={
          <div className='flex items-center gap-2'>{`在 Windows 11 22H2 及更高版本中，窗口可使用亚克力背景`}</div>
        }>
        <Switch
          isSelected={useWindowBackgroundMaterial}
          onChange={() => {
            setUseWindowBackgroundMaterial(!useWindowBackgroundMaterial);
            window.ipc?.send('set-config', 'display.useWindowBackgroundMaterial', !useWindowBackgroundMaterial);
          }}
        />
      </SettingsItem>
    </SettingsGroup>
  );
}

export function SystemSettings() {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await getConfigSync('online');
      data && setOnline(Boolean(data));
    })();
  }, []);

  return (
    <SettingsGroup title='系统设置' description='配置应用的系统级功能' icon={<CloudIcon />}>
      <SettingsItem
        title='在线模式'
        description={
          <div className='flex items-center gap-2'>
            开启此选项后会使用最新的 UI 版本，过旧的版本使用时可能会出现问题
          </div>
        }>
        <Switch
          isSelected={online}
          onChange={() => {
            setOnline(!online);
            window.ipc?.send('set-config', 'online', !online);
          }}
        />
      </SettingsItem>

      <SettingsItem title='自动检查更新' description='自动检查并通知可用的应用更新' disabled>
        <Switch isDisabled isSelected={true} />
      </SettingsItem>
    </SettingsGroup>
  );
}

export function InterfaceSettings() {
  const [hiddenCloseWindow, setHiddenCloseWindow] = useState(false);
  const [hiddenRefreshWindow, setHiddenRefreshWindow] = useState(false);
  const [hiddenJumpto, setHiddenJumpto] = useState(false);

  useEffect(() => {
    (async () => {
      const closeData = await getConfigSync('display.hidden.closeWindow');
      closeData && setHiddenCloseWindow(Boolean(closeData));

      const refreshData = await getConfigSync('display.hidden.refreshWindow');
      refreshData && setHiddenRefreshWindow(Boolean(refreshData));

      const jumptoData = await getConfigSync('display.hidden.jumpto');
      jumptoData && setHiddenJumpto(Boolean(jumptoData));
    })();
  }, []);

  return (
    <SettingsGroup title='界面元素' description='控制界面按钮和元素的显示' icon={<VisibilityIcon />}>
      <SettingsItem title='隐藏关闭按钮' description='隐藏窗口的关闭按钮'>
        <Switch
          isSelected={hiddenCloseWindow}
          onChange={() => {
            setHiddenCloseWindow(!hiddenCloseWindow);
            window.ipc?.send('set-config', 'display.hidden.closeWindow', !hiddenCloseWindow);
          }}
        />
      </SettingsItem>

      <SettingsItem title='隐藏刷新按钮' description='隐藏窗口的刷新按钮'>
        <Switch
          isSelected={hiddenRefreshWindow}
          onChange={() => {
            setHiddenRefreshWindow(!hiddenRefreshWindow);
            window.ipc?.send('set-config', 'display.hidden.refreshWindow', !hiddenRefreshWindow);
          }}
        />
      </SettingsItem>

      <SettingsItem title='隐藏跳转按钮' description='隐藏页面跳转按钮'>
        <Switch
          isSelected={hiddenJumpto}
          onChange={() => {
            setHiddenJumpto(!hiddenJumpto);
            window.ipc?.send('set-config', 'display.hidden.jumpto', !hiddenJumpto);
          }}
        />
      </SettingsItem>
    </SettingsGroup>
  );
}
