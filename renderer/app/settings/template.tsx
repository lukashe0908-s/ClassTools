'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { SettingsSidebar } from './SettingsSidebar';
import { Menu } from 'lucide-react';

export default function Template({ children }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // 路由变化 → 自动关闭 drawer（仅小屏有意义）
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <title>设置 - Class Tools</title>

      <div className="flex h-full bg-neutral-50 dark:bg-black text-neutral-800 dark:text-neutral-200">
        {/* Sidebar */}
        <aside
          className={`
            h-full transition-transform duration-300

            /* 小屏：抽屉 */
            fixed z-50
            ${open ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0

            /* 宽屏：正常 flex */
            md:static
          `}
        >
          <SettingsSidebar />
        </aside>

        {/* 遮罩（仅小屏） */}
        {open && (
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        {/* 内容区 */}
        <main className="flex-1 h-full overflow-auto">
          {/* 小屏 sticky 顶栏 */}
          <div
            className="
              md:hidden
              sticky top-0 z-30
              flex items-center gap-2
              p-2
              bg-neutral-50/90 dark:bg-black/90
              backdrop-blur
              border-b border-neutral-200 dark:border-neutral-800
            "
          >
            <button
              onClick={() => setOpen(true)}
              className="p-2 rounded-lg
                         bg-neutral-200/80 dark:bg-neutral-800"
            >
              <Menu size={20} />
            </button>
            <span className="text-sm font-medium">设置</span>
          </div>

          <div className="p-2">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
