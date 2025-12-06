'use client';
import {
  EditOutlined,
  BugReportOutlined,
  ShieldOutlined,
  SettingsOutlined,
  DateRangeOutlined,
  AccessTimeOutlined,
  FormatColorTextOutlined,
  AssessmentOutlined,
  ScienceOutlined,
  InfoOutlined,
} from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { Divider } from '@heroui/react';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

import { SidebarNav, NavNode } from '../../components/SidebarNav';
const settingsNavNodes: NavNode[] = [
  {
    type: 'group',
    label: '课程管理',
    defaultOpen: true,
    icon: <EditOutlined fontSize='small'></EditOutlined>,
    children: [
      {
        type: 'item',
        label: '总览',
        href: '/settings/lessonEdit',
      },
      {
        type: 'item',
        label: '基本配置',
        href: '/settings/lessonEdit/default',
        badge: 'Beta',
      },
      {
        type: 'item',
        label: '名称',
        href: '/settings/lessonEdit/name',
      },
      {
        type: 'item',
        label: '时间',
        href: '/settings/lessonEdit/time',
      },
      {
        type: 'item',
        label: '换课 (天)',
        href: '/settings/lessonEdit/changeDay',
      },
      {
        type: 'item',
        label: '换课',
        href: '/settings/lessonEdit/change',
        badge: 'Beta',
      },
    ],
  },
  {
    type: 'group',
    label: '应用配置',
    defaultOpen: true,
    icon: <SettingsOutlined fontSize='small'></SettingsOutlined>,
    children: [
      {
        type: 'item',
        label: '常规',
        href: '/settings/display',
      },
      {
        type: 'item',
        label: '隐私与数据',
        href: '/settings/privacy',
      },
    ],
  },
  {
    type: 'group',
    label: '开发者选项',
    defaultOpen: true,
    icon: <ScienceOutlined fontSize='small'></ScienceOutlined>,
    children: [
      {
        type: 'item',
        label: '调试',
        href: '/settings/debug',
      },
      {
        type: 'item',
        label: '实验室',
        href: '/settings/debug/labs',
      },
    ],
  },
  {
    type: 'item',
    label: '关于',
    href: '/settings/about',
    icon: <InfoOutlined fontSize='small'></InfoOutlined>,
  },
];

export function SettingsSidebar() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(media.matches);
    const listener = e => setIsDark(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  return (
    <OverlayScrollbarsComponent
      defer
      className='overflow-auto scrollbar-hide border-r border-[hsl(var(--heroui-divider)/.15)] min-w-50 bg-white dark:bg-[#0a0a0a]'
      options={{ scrollbars: { autoHide: 'move', theme: isDark ? 'os-theme-light' : 'os-theme-dark' } }}>
      <div className='p-2'>
        <div className='flex items-center justify-center gap-2 mb-2'>
          <SettingsOutlinedIcon className=' text-xl' />
          <span className='font-bold text-2xl'>设置</span>
        </div>
        <Divider className='mb-2' />

        <SidebarNav nodes={settingsNavNodes} className='min-w-50 pr-1' />
      </div>
    </OverlayScrollbarsComponent>
  );
}
