'use client';
import { useState, useEffect } from 'react';
import { SettingsGroup, SettingsItem } from './SettingsGroup';
import InfoIcon from '@mui/icons-material/Info';
import PersonIcon from '@mui/icons-material/Person';
import CodeIcon from '@mui/icons-material/Code';
import { getVersionSync } from '@renderer/features/p_function';
import dayjs from 'dayjs';
import { Button } from '@heroui/react';
import UpdateIcon from '@mui/icons-material/Update';

export function AboutSettings() {
  const [version, setVersion] = useState('1.0.0');
  const [buildVersion, seBuildVersion] = useState('');
  useEffect(() => {
    (async () => {
      let main_version;
      try {
        main_version = (await getVersionSync()) as string;
      } catch (error) {
        main_version = 'Unknown';
      }
      setVersion(main_version);
      let web_version;
      try {
        web_version = await (await fetch('/buildArtifacts/UIVersion')).text();
        web_version = dayjs(Number(web_version)).format('YYYY.M.D');
      } catch (error) {
        web_version = 'Unknown';
      }
      seBuildVersion(web_version);
    })();
  }, []);
  return (
    <SettingsGroup title='关于应用' description='查看应用信息和开发者详情' icon={<InfoIcon />}>
      <div className='bg-blue-50 dark:bg-blue-900/60 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-4'>
        <div className='flex items-center gap-4'>
          <div className='w-16 h-16 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center'>
            <CodeIcon className='text-white text-2xl' />
          </div>
          <div>
            <h3 className='text-xl font-bold'>Class Tools</h3>
            <p className='text-content3-foreground'>课程管理工具</p>
          </div>
        </div>
      </div>

      <SettingsItem title='开发者' description='应用开发者信息'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-linear-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center'>
            <PersonIcon className='text-white' />
          </div>
          <div>
            <div className='font-semibold'>Lukas</div>
            <div className='text-sm text-content3-foreground'>主要开发者</div>
          </div>
        </div>
      </SettingsItem>

      <SettingsItem title='版本信息' description='当前应用版本和构建信息'>
        <div className='text-right'>
          <div className='font-mono text-sm'>{version}</div>
          <div className='text-xs text-content3-foreground'>Build {buildVersion}</div>
        </div>
      </SettingsItem>

      <div className='bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 mt-4'>
        <h4 className='font-medium mb-2'>技术信息</h4>
        <div className='grid grid-cols-2 gap-4 text-sm'>
          <div>
            <span className='text-content3-foreground'>开源:</span>
            <span className='ml-2 font-mono'>https://github.com/lukashe0908-s/ClassTools</span>
          </div>
          <div>
            <span className='text-content3-foreground'>许可证:</span>
            <span className='ml-2 font-mono'>MIT</span>
          </div>
        </div>
      </div>
    </SettingsGroup>
  );
}
