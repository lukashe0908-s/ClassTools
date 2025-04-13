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
} from '@heroui/react';

import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

export default function HomePage() {
  // mouse penerate
  useEffect(() => {
    return;
    if (!window.ipc) return;
    window.ipc.send('mainWindow_ignoreMouseEvent', false);
    let status = false;
    let moveEvent = event => {
      let flag = event.target === document.documentElement || event.target === document.body;
      if (flag) {
        if (status === false) {
          status = true;
          window.ipc.send('mainWindow_ignoreMouseEvent', true);
        }
      } else {
        if (status === true) {
          status = false;
          window.ipc.send('mainWindow_ignoreMouseEvent', false);
        }
      }
    };
    window.addEventListener('mousemove', moveEvent);
    window.addEventListener('pointermove', moveEvent);
    window.addEventListener('touchmove', moveEvent);
    return () => {
      window.removeEventListener('mousemove', moveEvent);
      window.removeEventListener('pointermove', moveEvent);
      window.removeEventListener('touchmove', moveEvent);
    };
  }, []);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  return (
    <>
      <title>Home - Desktop Tool</title>
      <div className='flex justify-center gap-3 py-2 flex-shrink-0 flex-wrap'>
        <OpenSettingsWindow>Go Settings</OpenSettingsWindow>
        <Link href='/float/index.html'>
          <Button color='primary' className='font-bold'>
            Go Legacy
          </Button>
        </Link>
        <OpenAiWindow>Ai Ability</OpenAiWindow>
        <Button color='primary' className='font-bold' onClick={onOpen}>
          关机
        </Button>
      </div>
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
    </>
  );
}
function FloatWindow() {
  const [picListVisible, setPicListVisible] = useState(true);
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

    fetchWallpapers();
    calculateWeekNumber();
  }, []);

  function calculateWeekNumber() {
    const startOfYear: any = new Date(new Date().getFullYear(), 0, 1);
    const today: any = new Date();
    const weekNumber = Math.ceil((today - startOfYear) / (7 * 24 * 60 * 60 * 1000) + 1);
    setWeekNumber(`${weekNumber}`);
  }

  function togglePicList() {
    setPicListVisible(!picListVisible);
  }

  return (
    <div className='flex flex-col gap-4 p-4 bg-gray-100 h-screen m-4 rounded-lg shadow-lg'>
      {/* Toolbar */}
      <div className='flex gap-4 items-center bg-white p-4 rounded-lg shadow-md'>
        <Button onPress={() => console.log('Settings clicked')} className='cursor-pointer'>
          Settings
        </Button>
        <Button onPress={() => window.location.reload()} className='cursor-pointer'>
          Refresh
        </Button>
        <Button onPress={() => console.log('Close clicked')} className='ml-auto cursor-pointer'>
          Close
        </Button>
      </div>

      {/* Main Content */}
      <div className='flex flex-col gap-4 bg-white p-4 rounded-lg shadow-md'>
        <div className='flex gap-4'>
          <Button onPress={togglePicList} className='w-full'>
            {picListVisible ? '收起' : '展开'}
          </Button>
          <Button onPress={() => (window.location.href = '/home')} className='w-1/2'>
            Dev
          </Button>
        </div>

        {picListVisible && (
          <div className='flex flex-col gap-4'>
            <div className='flex justify-between items-center'>
              <Checkbox defaultSelected>Show Pictures</Checkbox>
              <span className='bg-gray-200 px-2 py-1 rounded'>{`#${weekNumber}`}</span>
            </div>

            <div className='flex flex-col gap-4 overflow-auto max-h-64 scrollbar-hide'>
              {wallpapers.map((wallpaper, index) => (
                <img key={index} src={`https://www.bing.com${wallpaper.url}`} alt={`Wallpaper ${index}`} className='rounded-lg shadow-md' />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className='flex gap-4 items-center bg-white p-4 rounded-lg shadow-md'>
        <Dropdown>
          <DropdownTrigger>
            <Button variant='flat'>Power</Button>
          </DropdownTrigger>
          <DropdownMenu>
            <DropdownItem key='shutdown' onClick={() => console.log('Shutdown clicked')}>
              确认
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
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
