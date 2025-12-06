'use client';

import { SettingsSidebar } from './SettingsSidebar';

export default function Template({ children }) {
  return (
    <>
      <title>设置 - Class Tools</title>
      <div className='flex h-full select-auto bg-neutral-50 dark:bg-black text-neutral-800 dark:text-neutral-200'>
        {/* 导航 */}
        <div className='h-full flex select-none'>
          <SettingsSidebar />
        </div>
        {/* 内容 */}
        <div className='h-full w-full p-2 overflow-auto'>{children}</div>
      </div>
    </>
  );
}
