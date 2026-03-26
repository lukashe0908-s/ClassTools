'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { SettingsSidebar } from './SettingsSidebar';
import { Button } from '@heroui/react';

export default function Template({ children }: { children: ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)');
    const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    setIsMobile(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  return (
    <>
      <title>设置 - Class Tools</title>
      <div className='flex h-full select-auto bg-neutral-50 dark:bg-black text-neutral-800 dark:text-neutral-200 flex-col md:flex-row'>
        <div className='hidden md:flex h-full'>
          <SettingsSidebar />
        </div>

        {/* 小屏菜单行*/}
        {isMobile && (
          <div className='md:hidden w-full border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a] p-2'>
            <Button size='sm' onClick={() => setIsSidebarOpen(true)} className='rounded-xl' variant='outline'>
              <Bars3Icon className='h-5 w-5' />
              菜单
            </Button>
          </div>
        )}

        {/* 小屏侧边栏 */}
        {isMobile && (
          <>
            <div
              className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 md:hidden ${
                isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
              onClick={() => setIsSidebarOpen(false)}
            />
            <div
              className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[80vw] h-full md:hidden transform transition-transform duration-200 ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`}>
              <SettingsSidebar className='h-full' />
            </div>
          </>
        )}

        {/* 内容 */}
        <div className='h-full w-full p-2 overflow-auto'>{children}</div>
      </div>
    </>
  );
}
