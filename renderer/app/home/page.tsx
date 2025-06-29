'use client';
import { cache, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Button,
  ButtonGroup,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
  Checkbox,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
  ScrollShadow,
} from '@heroui/react';
import { Cog6ToothIcon, ArrowPathIcon, ArrowTopRightOnSquareIcon, XMarkIcon } from '@heroicons/react/24/solid';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import UpdateModal from './updateModal';
import ClassList from './classListNew';
import { Weather } from './weather';
import { generateConfig, getConfigSync } from '../../components/p_function';

export default function HomePage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  return (
    <>
      <title>Home - Class Tools</title>
      {/* <div className='flex justify-center gap-3 py-2 flex-shrink-0 flex-wrap'>
        <Link href='/float/index.html'>
          <Button color='primary' className='font-bold'>
            Go Legacy
          </Button>
        </Link>
        <Button color='primary' className='font-bold' onClick={onOpen}>
          关机
        </Button>
      </div> */}
      <Modal isOpen={isOpen} placement={'bottom'} onOpenChange={onOpenChange}>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className='flex flex-col gap-1'>确认关机</ModalHeader>
              <ModalBody>
                <p className='text-gray-500 text-sm'>关闭所有应用，然后关闭电脑。</p>
              </ModalBody>
              <ModalFooter>
                <Button color='default' variant='light' onPress={onClose} className='min-w-1' radius='full' fullWidth={true}>
                  <CloseIcon></CloseIcon>Cancel
                </Button>
                <Button color='danger' onPress={onClose} className='min-w-1' radius='full' fullWidth={true}>
                  <CheckIcon></CheckIcon>Confirm
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <FloatWindow></FloatWindow>
      <UpdateModal></UpdateModal>
    </>
  );
}
function FloatWindow() {
  const [wallpapers, setWallpapers] = useState([]);
  const [currentWallpaper, setCurrentWallpaper] = useState('');

  useEffect(() => {
    const fetchWallpapers = async () => {
      const CACHE_KEY = 'wallpapers';
      const EXPIRES_KEY = 'wallpapers_expires';
      const CACHE_DURATION = 30 * 60 * 1000; // 30 Mins

      const now = Date.now();
      const cached = localStorage.getItem(CACHE_KEY);
      const expires = parseInt(localStorage.getItem(EXPIRES_KEY) || '0', 10);

      if (cached && now < expires) {
        try {
          const images = JSON.parse(cached);
          setWallpapers(images);
          setCurrentWallpaper(images[0]);
          return;
        } catch (e) {
          console.warn('Cached wallpaper parse failed, refetching.');
        }
      }
      try {
        const response = await fetch('https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=7');
        const data = await response.json();
        const images = data.images.map(img => `https://www.bing.com${img.url}`);

        setWallpapers(images || []);
        setCurrentWallpaper(`https://www.bing.com${data.images[0]?.url}`);

        // 更新缓存
        localStorage.setItem(CACHE_KEY, JSON.stringify(images));
        localStorage.setItem(EXPIRES_KEY, (now + CACHE_DURATION).toString());
      } catch (error) {
        console.error('Error fetching wallpapers:', error);
      }
    };
    const USE_DEFAULT_WALLPAPER = true;
    if (USE_DEFAULT_WALLPAPER) {
      let default_link = 'https://s1.imagehub.cc/images/2025/06/29/a085471b696c1d4e867b90034a01f350.png';
      setWallpapers([default_link]);
      setCurrentWallpaper(default_link);
    } else {
      fetchWallpapers();
    }
  }, []);

  const [classSchedule, setClassSchedule] = useState(null);
  const [slidingPosition, setSlidingPosition] = useState('center');
  const [progressDisplay, setProgressDisplay] = useState('always');
  useEffect(() => {
    const loadConfig = async () => {
      const config = await generateConfig();
      const pos = ((await getConfigSync('display.slidingPosition')) as any) || 'center';
      const prog = ((await getConfigSync('display.progressDisplay')) as any) || 'always';

      setClassSchedule(config);
      setSlidingPosition(pos);
      setProgressDisplay(prog);
    };

    loadConfig();

    const handler = () => {
      loadConfig();
    };

    window.ipc?.on('sync-config', handler);

    return () => {
      window.ipc?.removeListener?.('sync-config', handler);
    };
  }, []);

  return (
    <div className={`flex flex-col gap-0 p-0 h-full rounded-lg shadow-lg ${currentWallpaper ? '' : 'bg-blue-100'}`}>
      {/* Toolbar */}
      <div className='flex gap-2 items-center bg-white p-2 rounded-lg'>
        <Button
          isIconOnly
          onPress={() => {
            try {
              window.ipc.send('settings-window');
            } catch {
              window.location.href = '/settings';
            }
          }}
          title='设置'
          aria-label='Settings'>
          <Cog6ToothIcon className='w-5 h-5' />
        </Button>
        <Button
          isIconOnly
          onPress={() => {
            window.location.reload();
          }}
          title='刷新'
          aria-label='Refresh'>
          <ArrowPathIcon className='w-5 h-5' />
        </Button>
        <Button
          isIconOnly
          onPress={() => {
            window.location.href = '/float/index.html';
          }}
          title='跳转'
          aria-label='JumpTo'>
          <ArrowTopRightOnSquareIcon className='w-5 h-5' />
        </Button>
        <Button
          isIconOnly
          variant='faded'
          onPress={() => {
            window.ipc?.send('close-window');
          }}
          title='关闭'
          aria-label='Close'
          className='ml-auto'>
          <XMarkIcon className='w-5 h-5' />
        </Button>
      </div>

      {/* Main Content */}
      <ScrollShadow className='flex flex-col gap-4 py-2 flex-grow scrollbar-hide'>
        <ClassList schedule={classSchedule} slidingPosition={slidingPosition} progressDisplay={progressDisplay}></ClassList>
        {
          <div className='flex flex-col gap-4 px-2'>
            <div className='flex flex-col gap-4 overflow-auto max-h-[40vh] aspect-[16/9] scrollbar-hide rounded-lg shadow-md snap-y snap-proximity'>
              {wallpapers.map((wallpaper, index) => (
                <img key={index} src={wallpaper} alt={`Wallpaper ${index}`} className='max-w-full rounded-lg snap-center' />
              ))}
            </div>
          </div>
        }
      </ScrollShadow>

      {/* Footer */}
      <div className='flex gap-1 items-center bg-white p-1 rounded-lg'>
        <Button fullWidth></Button>
        <Weather />
      </div>
      <div style={{ position: 'absolute', top: 0, zIndex: -1, width: '100%', height: '100%' }}>
        <img
          id='bing-wallpaper-bg'
          style={{
            zIndex: -1,
            top: 0,
            left: '50%',
            position: 'absolute',
            objectFit: 'cover',
            minWidth: '100%',
            width: 'auto',
            height: '100%',
            transform: 'translate(-50%, 0)',
            opacity: 0.4,
            filter: 'blur(40px) brightness(0.8)',
          }}
          loading='lazy'
          referrerPolicy='no-referrer'
          draggable='false'
          src={currentWallpaper || null}
        />
      </div>
    </div>
  );
}
