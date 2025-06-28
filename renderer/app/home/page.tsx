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

    // fetchWallpapers();
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
      <ScrollShadow className='flex flex-col gap-4  p-4 flex-grow scrollbar-hide'>
        <div className='flex gap-4'>
          <Button onPress={togglePicList} className='w-full'>
            {picListVisible ? '收起' : '展开'}
          </Button>
        </div>

        <div>
          正文{' '}
          <div>
            <p>
              Sit nulla est ex deserunt exercitation anim occaecat. Nostrud ullamco deserunt aute id consequat veniam incididunt duis in
              sint irure nisi. Mollit officia cillum Lorem ullamco minim nostrud elit officia tempor esse quis.
            </p>
            <p>
              Sunt ad dolore quis aute consequat. Magna exercitation reprehenderit magna aute tempor cupidatat consequat elit dolor
              adipisicing. Mollit dolor eiusmod sunt ex incididunt cillum quis. Velit duis sit officia eiusmod Lorem aliqua enim laboris do
              dolor eiusmod. Et mollit incididunt nisi consectetur esse laborum eiusmod pariatur proident Lorem eiusmod et. Culpa deserunt
              nostrud ad veniam.
            </p>
            <p>
              Est velit labore esse esse cupidatat. Velit id elit consequat minim. Mollit enim excepteur ea laboris adipisicing aliqua
              proident occaecat do do adipisicing adipisicing ut fugiat. Consequat pariatur ullamco aute sunt esse. Irure excepteur eu non
              eiusmod. Commodo commodo et ad ipsum elit esse pariatur sit adipisicing sunt excepteur enim.
            </p>
            <p>
              Incididunt duis commodo mollit esse veniam non exercitation dolore occaecat ea nostrud laboris. Adipisicing occaecat fugiat
              fugiat irure fugiat in magna non consectetur proident fugiat. Commodo magna et aliqua elit sint cupidatat. Sint aute ullamco
              enim cillum anim ex. Est eiusmod commodo occaecat consequat laboris est do duis. Enim incididunt non culpa velit quis aute in
              elit magna ullamco in consequat ex proident.
            </p>
            <p>
              Dolore incididunt mollit fugiat pariatur cupidatat ipsum laborum cillum. Commodo consequat velit cupidatat duis ex nisi non
              aliquip ad ea pariatur do culpa. Eiusmod proident adipisicing tempor tempor qui pariatur voluptate dolor do ea commodo. Veniam
              voluptate cupidatat ex nisi do ullamco in quis elit.
            </p>
            <p>
              Cillum proident veniam cupidatat pariatur laborum tempor cupidatat anim eiusmod id nostrud pariatur tempor reprehenderit. Do
              esse ullamco laboris sunt proident est ea exercitation cupidatat. Do Lorem eiusmod aliqua culpa ullamco consectetur veniam
              voluptate cillum. Dolor consequat cillum tempor laboris mollit laborum reprehenderit reprehenderit veniam aliqua deserunt
              cupidatat consequat id.
            </p>
            <p>
              Est id tempor excepteur enim labore sint aliquip consequat duis minim tempor proident. Dolor incididunt aliquip minim elit ea.
              Exercitation non officia eu id.
            </p>
            <p>
              Ipsum ipsum consequat incididunt do aliquip pariatur nostrud. Qui ut sint culpa labore Lorem. Magna deserunt aliquip aute duis
              consectetur magna amet anim. Magna fugiat est nostrud veniam. Officia duis ea sunt aliqua.
            </p>
            <p>
              Ipsum minim officia aute anim minim aute aliquip aute non in non. Ipsum aliquip proident ut dolore eiusmod ad fugiat fugiat ut
              ex. Ea velit Lorem ut et commodo nulla voluptate veniam ea et aliqua esse id. Pariatur dolor et adipisicing ea mollit. Ipsum
              non irure proident ipsum dolore aliquip adipisicing laborum irure dolor nostrud occaecat exercitation.
            </p>
            <p>
              Culpa qui reprehenderit nostrud aliqua reprehenderit et ullamco proident nisi commodo non ut. Ipsum quis irure nisi sint do
              qui velit nisi. Sunt voluptate eu reprehenderit tempor consequat eiusmod Lorem irure velit duis Lorem laboris ipsum cupidatat.
              Pariatur excepteur tempor veniam cillum et nulla ipsum veniam ad ipsum ad aute. Est officia duis pariatur ad eiusmod id
              voluptate.
            </p>
          </div>
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
