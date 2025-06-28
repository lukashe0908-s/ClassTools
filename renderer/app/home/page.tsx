'use client';
import { useEffect, useState } from 'react';
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

import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import UpdateModal from './updateModal';
import ClassList from './classListNew';
import { generateConfig, getConfigSync } from '../../components/p_function';

export default function HomePage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  return (
    <>
      <title>Home - Class Tools</title>
      {/* <div className='flex justify-center gap-3 py-2 flex-shrink-0 flex-wrap'>
        <OpenSettingsWindow>Go Settings</OpenSettingsWindow>
        <Link href='/float/index.html'>
          <Button color='primary' className='font-bold'>
            Go Legacy
          </Button>
        </Link>
        <OpenAiWindow>AI Ability</OpenAiWindow>
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
  const [weekNumber, setWeekNumber] = useState('1');

  useEffect(() => {
    const fetchWallpapers = async () => {
      try {
        const response = await fetch('https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=7');
        const data = await response.json();
        setWallpapers(data.images || []);
        setCurrentWallpaper(`https://www.bing.com${data.images[0]?.url}`);
      } catch (error) {
        console.error('Error fetching wallpapers:', error);
      }
    };

    // fetchWallpapers();
    calculateWeekNumber();
  }, []);

  function calculateWeekNumber() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    const week = Math.ceil(dayOfYear / 7);
    setWeekNumber(`${week}`);
  }
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
    <div className='flex flex-col gap-0 p-0 bg-blue-100 h-screen rounded-lg shadow-lg'>
      {/* Toolbar */}
      <div className='flex gap-4 items-center bg-white p-2 rounded-lg'>
        <Button
          onPress={() => {
            window.ipc?.send('settings-window');
          }}
          className='cursor-pointer'>
          Settings
        </Button>
        <Button
          onPress={() => {
            window.location.href = '/float/index.html';
            // window.location.reload();
          }}
          className='cursor-pointer'>
          Refresh
        </Button>
        <Button
          onPress={() => {
            window.ipc?.send('close-window');
          }}
          className='ml-auto cursor-pointer'>
          Close
        </Button>
      </div>

      {/* Main Content */}
      <ScrollShadow className='flex flex-col gap-4  py-2 flex-grow scrollbar-hide'>
        <ClassList schedule={classSchedule} slidingPosition={slidingPosition} progressDisplay={progressDisplay}></ClassList>
        {
          // <div className='flex flex-col gap-4'>
          //   <div className='flex justify-between items-center'>
          //     <Checkbox defaultSelected>Show Pictures</Checkbox>
          //     <span className='bg-gray-200 px-2 py-1 rounded'>{`#${weekNumber}`}</span>
          //   </div>
          //   <div className='flex flex-col gap-4 overflow-auto max-h-64 scrollbar-hide'>
          //     {wallpapers.map((wallpaper, index) => (
          //       <img key={index} src={`https://www.bing.com${wallpaper.url}`} alt={`Wallpaper ${index}`} className='rounded-lg shadow-md' />
          //     ))}
          //   </div>
          // </div>
        }
      </ScrollShadow>

      {/* Footer */}
      <div className='flex gap-4 items-center bg-white p-1 rounded-lg'>
        <div
          className='flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer'
          onClick={() => console.log('Weather clicked')}>
          Weather
        </div>
      </div>
    </div>
  );
}

function OpenSettingsWindow({ children }) {
  return (
    <>
      <Button
        color='primary'
        className='font-bold'
        onClick={() => {
          window?.ipc?.send('settings-window', 'true');
        }}>
        {children}
      </Button>
    </>
  );
}
function OpenAiWindow({ children }) {
  return (
    <>
      <Button
        color='primary'
        className='font-bold'
        onClick={() => {
          window?.ipc?.send('ai-window', 'true');
        }}>
        {children}
      </Button>
    </>
  );
}
