import { createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const SubContext = createContext(false);

export function Navigation({ children }) {
  return <ul className='w-full pl-1 py-2'>{children}</ul>;
}
export function NavigationSub({ children }) {
  return (
    <SubContext.Provider value={true}>
      <ul className='w-full pl-4 pb-1'>{children}</ul>
    </SubContext.Provider>
  );
}

export function NavigationItem(props) {
  const pathname = usePathname();

  return (
    <Link href={props.link} draggable={false}>
      <NavigationItemInner active={pathname === props.link || pathname === props.link + '/'}>
        {props.children}
      </NavigationItemInner>
    </Link>
  );
}
export function NavigationItemInner(props) {
  const isSub = useContext(SubContext);
  return (
    <li
      className={`transition-all hover:underline hover:decoration-dotted underline-offset-4 flex items-center ${
        isSub ? 'py-1' : 'py-2'
      } pl-4 [color:#002b67] hover:[background-color:#E9F7FB] rounded-l-full cursor-pointer ${
        props?.active
          ? '[color:#003681] font-bold [background-color:#ecf4ff] [border-top:1px_solid_#b9d6ff] [border-bottom:1px_solid_#b9d6ff] [border-left:1px_solid_#b9d6ff]'
          : '[border-top:1px_solid_#0000] [border-bottom:1px_solid_#0000] [border-left:1px_solid_#0000]'
      }`}>
      {props.children}
    </li>
  );
}
