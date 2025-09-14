'use client';
import { useEffect, useState, useRef } from 'react';
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
  useEffect(() => {
    const serviceWorkerScope = `/sw.js`;
    navigator.serviceWorker &&
      location.protocol === 'https:' &&
      navigator.serviceWorker
        .register(serviceWorkerScope)
        .then(() => {
          // console.info(`Service worker registered at ${serviceWorkerScope}`);
        })
        .catch(error => {
          console.error('Error in serviceWorker registration: ', error);
        });
  }, []);
  return (
    <>
      <title>Home - Class Tools</title>
      <Modal isOpen={isOpen} placement={'bottom'} onOpenChange={onOpenChange}>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className='flex flex-col gap-1'>确认关机</ModalHeader>
              <ModalBody>
                <p className='text-gray-500 text-sm'>关闭所有应用，然后关闭电脑。</p>
              </ModalBody>
              <ModalFooter>
                <Button
                  color='default'
                  variant='light'
                  onPress={onClose}
                  className='min-w-1'
                  radius='full'
                  fullWidth={true}>
                  <CloseIcon></CloseIcon>取消
                </Button>
                <Button
                  color='danger'
                  className='min-w-1'
                  radius='full'
                  fullWidth={true}
                  onPress={() => {
                    window.ipc?.send('sys-shutdown');
                  }}>
                  <CheckIcon></CheckIcon>确认
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <FloatWindow onShutdownModalOpen={onOpen}></FloatWindow>
      <UpdateModal></UpdateModal>
    </>
  );
}
function FloatWindow({ onShutdownModalOpen }) {
  const [wallpapers, setWallpapers] = useState([]);
  const [currentWallpaper, setCurrentWallpaper] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const wallpaperListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedIndex = localStorage.getItem('default_wallpaper_select');
    if (savedIndex) {
      setSelectedIndex(parseInt(savedIndex, 10));
    }
  }, []);
  const updateWallpaper = (newWallpaper: string, index: number) => {
    localStorage.setItem('default_wallpaper_select', index.toString());
    setSelectedIndex(index);
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setCurrentWallpaper(newWallpaper);
      });
    } else {
      setCurrentWallpaper(newWallpaper);
    }
    // 使用 requestAnimationFrame 确保在 DOM 更新后再滚动
    requestAnimationFrame(() => {
      const container = wallpaperListRef.current;
      if (container) {
        const imageElement = container.children[index] as HTMLElement;
        if (imageElement) {
          imageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
  };

  useEffect(() => {
    const CACHE_KEY = 'default_wallpaper';
    const EXPIRES_KEY = 'default_wallpaper_expires';
    const CACHE_DURATION = 5 * 60 * 1000; // 5 mins
    const DISABLE_CACHE = false;

    const now = Date.now();
    const cached = localStorage.getItem(CACHE_KEY);
    const expires = parseInt(localStorage.getItem(EXPIRES_KEY) || '0', 10);

    if (!DISABLE_CACHE && cached && now < expires) {
      try {
        const cachedUrls = JSON.parse(cached);
        setWallpapers(cachedUrls);
        const savedIndex = parseInt(localStorage.getItem('default_wallpaper_select') || '0', 10);
        const validIndex = savedIndex < cachedUrls.length ? savedIndex : 0;
        updateWallpaper(cachedUrls[validIndex], validIndex);
      } catch (err) {
        console.error('Failed to parse json for wallpaper:', err);
      }
      return;
    }
    const fetchDnsWallpaper = async () => {
      try {
        const txtRecords: string[][] = await window.ipc?.invoke(
          'resolveDns',
          'default-bgs.class-tools.app.lukas1.eu.org',
          'TXT'
        );
        const base64String = Array.isArray(txtRecords) ? txtRecords[0].join('') : '';

        if (!base64String) throw new Error('No valid TXT record found');

        const decodedUrls_json = atob(base64String);
        const decodedUrls = JSON.parse(decodedUrls_json);
        setWallpapers(decodedUrls);
        const savedIndex = parseInt(localStorage.getItem('default_wallpaper_select') || '0', 10);
        const validIndex = savedIndex < decodedUrls.length ? savedIndex : 0;
        updateWallpaper(decodedUrls[validIndex], validIndex);

        localStorage.setItem(CACHE_KEY, JSON.stringify(decodedUrls));
        localStorage.setItem(EXPIRES_KEY, (now + CACHE_DURATION).toString());
      } catch (err) {
        console.error('Failed to resolve DNS TXT record for wallpaper:', err);
      }
    };

    fetchDnsWallpaper();
  }, []);

  const [classSchedule, setClassSchedule] = useState(null);
  const [slidingPosition, setSlidingPosition] = useState('center');
  const [progressDisplay, setProgressDisplay] = useState('always');
  const [hiddenCloseWindow, setHiddenCloseWindow] = useState(false);
  const [hiddenRefreshWindow, setHiddenRefreshWindow] = useState(false);
  const [hiddenJumpto, setHiddenJumpto] = useState(false);
  // 处理初始滚动到选中的壁纸
  useEffect(() => {
    if (wallpapers.length > 0) {
      const container = wallpaperListRef.current;
      if (container) {
        const imageElement = container.children[selectedIndex] as HTMLElement;
        if (imageElement) {
          imageElement.scrollIntoView({ behavior: 'instant', block: 'center' });
        }
      }
    }
  }, [wallpapers]);

  useEffect(() => {
    const loadConfig = async () => {
      const config = await generateConfig();
      const pos = ((await getConfigSync('display.slidingPosition')) as any) || 'center';
      const prog = ((await getConfigSync('display.progressDisplay')) as any) || 'always';
      const hiddenClose = ((await getConfigSync('display.hidden.closeWindow')) as any) || false;
      const hiddenRefresh = ((await getConfigSync('display.hidden.refreshWindow')) as any) || false;
      const hiddenJump = ((await getConfigSync('display.hidden.jumpto')) as any) || false;

      setClassSchedule(config);
      setSlidingPosition(pos);
      setProgressDisplay(prog);
      setHiddenCloseWindow(hiddenClose);
      setHiddenRefreshWindow(hiddenRefresh);
      setHiddenJumpto(hiddenJump);
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
    <div className={`flex flex-col gap-0 p-0 h-full rounded-lg shadow-lg ${currentWallpaper ? '' : 'bg-[#dbeafe88]'}`}>
      {/* Toolbar */}
      <div className='flex gap-2 items-center bg-white p-2 rounded-lg'>
        <Button
          isIconOnly
          onPress={() => {
            try {
              window.ipc?.send('settings-window');
            } catch {
              window.location.href = '/settings';
            }
          }}
          title='设置'
          aria-label='Settings'>
          <Cog6ToothIcon className='w-5 h-5' />
        </Button>
        {!hiddenRefreshWindow && (
          <Button
            isIconOnly
            onPress={() => {
              window.location.reload();
            }}
            title='刷新'
            aria-label='Refresh'>
            <ArrowPathIcon className='w-5 h-5' />
          </Button>
        )}
        {!hiddenJumpto && (
          <Button
            isIconOnly
            onPress={() => {
              window.location.href = '/float/index.html';
            }}
            title='跳转'
            aria-label='JumpTo'>
            <ArrowTopRightOnSquareIcon className='w-5 h-5' />
          </Button>
        )}
        {!hiddenCloseWindow && (
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
        )}
      </div>

      {/* Main Content */}
      <div className='flex flex-col gap-4 py-2 flex-grow overflow-y-auto scrollbar-hide'>
        <ClassList
          schedule={classSchedule}
          slidingPosition={slidingPosition}
          progressDisplay={progressDisplay}></ClassList>
        {/* Background Picture List */}
        <div className='flex flex-col gap-4 px-2'>
          <div
            ref={wallpaperListRef}
            className='flex flex-col gap-4 overflow-auto max-h-[40vh] aspect-[16/9] scrollbar-hide rounded-lg shadow-md snap-y snap-proximity'>
            {wallpapers.map((wallpaper, index) => (
              <img
                key={index}
                src={wallpaper}
                alt={`Wallpaper ${index}`}
                className='max-w-full aspect-[16/9] rounded-lg snap-center select-none object-contain'
                onClick={() => updateWallpaper(wallpaper, index)}
                draggable='true'
                // loading='lazy'
                referrerPolicy='no-referrer'
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className='flex gap-1 items-center bg-white p-1 rounded-lg'>
        <Button className='font-bold' fullWidth onPress={onShutdownModalOpen}>
          关机
        </Button>
        <Weather />
      </div>
      {/* Background */}
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
            opacity: 0.5,
            filter: 'blur(40px)',
            userSelect: 'none',
          }}
          referrerPolicy='no-referrer'
          draggable='false'
          src={currentWallpaper || null}
        />
      </div>
    </div>
  );
}
