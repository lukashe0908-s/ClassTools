'use client';
import { useState, useEffect } from 'react';
import { Button, Chip } from '@heroui/react';
import { SettingsGroup, SettingsItem } from './SettingsGroup';
import InfoIcon from '@mui/icons-material/Info';
import PersonIcon from '@mui/icons-material/Person';
import CodeIcon from '@mui/icons-material/Code';
import UpdateIcon from '@mui/icons-material/Update';
import { getVersionSync } from '../../components/p_function';
import dayjs from 'dayjs';

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
        web_version = await (await fetch('/version')).text();
        web_version = dayjs(Number(web_version)).format('YYYY.M.D');
      } catch (error) {
        web_version = 'Unknown';
      }
      seBuildVersion(web_version);
    })();
  }, []);
  return (
    <SettingsGroup title='关于应用' description='查看应用信息和开发者详情' icon={<InfoIcon />}>
      <div className='bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-4'>
        <div className='flex items-center gap-4'>
          <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center'>
            <CodeIcon className='text-white text-2xl' />
          </div>
          <div>
            <h3 className='text-xl font-bold text-gray-900'>Class Tools</h3>
            <p className='text-gray-600'>课程管理工具</p>
          </div>
        </div>
      </div>

      <SettingsItem title='开发者' description='应用开发者信息'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center'>
            <PersonIcon className='text-white' />
          </div>
          <div>
            <div className='font-semibold text-gray-900'>Lukas</div>
            <div className='text-sm text-gray-600'>主要开发者</div>
          </div>
        </div>
      </SettingsItem>

      <SettingsItem title='版本信息' description='当前应用版本和构建信息'>
        <div className='text-right'>
          <div className='font-mono text-sm text-gray-700'>v{version}</div>
          <div className='text-xs text-gray-500'>Build {buildVersion}</div>
        </div>
      </SettingsItem>

      {/* <SettingsItem title='检查更新' description='检查是否有可用的更新'>
        <Button
          color='primary'
          variant='flat'
          startContent={<UpdateIcon />}
          onPress={() => {
            // TODO: Implement update check
            alert('当前已是最新版本');
          }}>
          检查更新
        </Button>
      </SettingsItem> */}

      <div className='bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4'>
        <h4 className='font-medium text-gray-900 mb-2'>技术信息</h4>
        <div className='grid grid-cols-2 gap-4 text-sm'>
          <div>
            <span className='text-gray-600'>开源:</span>
            <span className='ml-2 font-mono'>https://github.com/lukashe0908-s/ClassTools</span>
          </div>
          <div>
            <span className='text-gray-600'>许可证:</span>
            <span className='ml-2 font-mono'>MIT</span>
          </div>
        </div>
      </div>
    </SettingsGroup>
  );
}
