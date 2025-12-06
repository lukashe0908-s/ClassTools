'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

/** 导航节点类型 */
export type NavNodeType = 'item' | 'group' | 'section';

export interface NavNode {
  type: NavNodeType;
  label: string;
  href?: string;
  external?: boolean;
  badge?: string;
  icon?: any;
  defaultOpen?: boolean;
  children?: NavNode[];
}

/** 判断节点是否激活（自身或子节点匹配路径） */
function isNodeActive(node: NavNode, pathname: string): boolean {
  if (node.href && pathname.replaceAll(/\/(index.html?)?$/g, '') === node.href.replaceAll(/\/(index.html?)?$/g, ''))
    return true;
  if (node.children) return node.children.some(child => isNodeActive(child, pathname));
  return false;
}

interface NavNodeItemProps {
  node: NavNode;
  pathname: string;
  depth?: number;
}

/** 递归渲染单个节点 */
const NavNodeItem: React.FC<NavNodeItemProps> = ({ node, pathname, depth = 0 }) => {
  const [open, setOpen] = useState(
    node.type === 'group' ? !!(node.defaultOpen || isNodeActive(node, pathname)) : false
  );

  const isActive = isNodeActive(node, pathname);

  // pathname 变化时，若子节点激活，则自动展开 group（保证 item 激活时 group 也“激活”）
  useEffect(() => {
    if (node.type === 'group') {
      const active = isNodeActive(node, pathname);
      if (active) setOpen(true);
    }
  }, [pathname, node]);

  if (node.type === 'section') {
    return (
      <li className='w-full'>
        <div className='px-3 pt-4 pb-2'>
          <div className='text-sm font-medium text-neutral-400'>{node.label}</div>
        </div>
      </li>
    );
  }

  if (node.type === 'group') {
    // 深度 0 用 pl-7 / left-[19px]，更深一层用 pl-5.5 / left-[13px]
    const childListIndentClass = depth === 0 ? 'pl-7' : 'pl-5.5';
    const childLineLeftClass = depth === 0 ? 'left-[19px]' : 'left-[13px]';

    return (
      <li className='w-full rounded-md'>
        <button
          type='button'
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          className={`group/expander cursor-pointer w-full rounded-lg min-h-8.5 px-3 py-0 flex items-center justify-between gap-2.5 text-sm transition-colors text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800`}>
          <div className='flex items-center gap-3 min-w-0'>
            {node.icon && <span className='opacity-50 shrink-0'>{node.icon}</span>}
            <span className='text-sm font-medium text-left truncate leading-none overflow-visible'>{node.label}</span>
          </div>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='12'
            height='12'
            fill='currentColor'
            viewBox='0 0 256 256'
            className={`text-neutral-400 dark:text-neutral-500 group-hover/expander:text-neutral-600 dark:group-hover/expander:text-neutral-400 transition-all flex-shrink-0 -mr-px ${
              open ? 'rotate-90' : ''
            }`}>
            <path d='M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z'></path>
          </svg>
        </button>

        <div
          className={`grid transition-[grid-template-rows] duration-200 ease-[cubic-bezier(0.77,0,0.175,1)] ${
            open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}>
          <div className='overflow-hidden'>
            {node.children && node.children.length > 0 && (
              <ul className={`relative flex flex-col mx-0 mt-0.5 mb-0 pr-0 py-0 list-none ${childListIndentClass}`}>
                <div
                  className={`absolute ${childLineLeftClass} inset-y-1 w-px bg-neutral-200 dark:bg-neutral-800 z-10`}></div>
                {node.children.map(child => (
                  <NavNodeItem key={child.label} node={child} pathname={pathname} depth={depth + 1} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </li>
    );
  }

  // item
  const baseLinkClass =
    'no-underline flex items-center font-medium text-sm gap-2 cursor-pointer w-full rounded-lg min-h-8.5 px-3 py-0 transition-colors';

  // hover: 背景颜色变深；active: 背景更深 & 字体加粗
  const stateClass = isActive
    ? 'text-neutral-950 dark:text-white bg-neutral-200 dark:bg-neutral-800 font-semibold'
    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800';

  const content = (
    <span className='flex items-center gap-2 min-w-0'>
      {node.icon && <span className='opacity-50 shrink-0'>{node.icon}</span>}
      <span className='truncate min-w-0 leading-none overflow-visible'>{node.label}</span>
      {node.badge && (
        <span className='inline-flex items-center w-fit whitespace-nowrap flex-none shrink-0 justify-self-start text-[11px]/none font-[550] px-[7px] py-[3px] rounded-full border border-dashed bg-transparent border-neutral-300 dark:border-neutral-700 text-neutral-950 dark:text-white'>
          <span>{node.badge}</span>
        </span>
      )}
    </span>
  );

  return (
    <li className='not-first-of-type:mt-0.5'>
      {node.href ? (
        <Link
          href={node.href}
          className={`${baseLinkClass} ${stateClass}`}
          aria-current={isActive ? 'page' : undefined}>
          {content}
        </Link>
      ) : (
        <button type='button' className={`${baseLinkClass} ${stateClass}`}>
          {content}
        </button>
      )}
    </li>
  );
};

interface SidebarNavProps {
  nodes: NavNode[];
  className?: string;
}

/** 侧边栏导航组件 */
export const SidebarNav: React.FC<SidebarNavProps> = ({ nodes, className }) => {
  const pathname = usePathname() || '/';

  return (
    <nav className={'w-full ' + className}>
      <ul className='list-none relative w-full mx-0 mb-[60px] mt-0 flex flex-col gap-y-0.5 items-stretch'>
        {nodes.map((node, index) => (
          <NavNodeItem key={index} node={node} pathname={pathname} depth={0} />
        ))}
      </ul>
    </nav>
  );
};
