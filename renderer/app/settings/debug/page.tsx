'use client';
import { Card, CardBody, Switch, Button, Calendar, Divider } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import { getVersionSync } from '../../../components/p_function';
import dayjs from 'dayjs';

export default function App() {
  const [navigatorInfo, setNavigatorInfo] = useState('');
  const [versionInfo, setVersionInfo] = useState('');
  useEffect(() => {
    const interval = setInterval(() => {
      let foo = {};
      for (const key in navigator) {
        const element = navigator[key];
        if (typeof element !== 'object') foo[key] = element;
      }
      setNavigatorInfo(JSON.stringify(foo, null, '\t'));
    }, 100);
    (async () => {
      let main_version;
      try {
        main_version = JSON.parse((await getVersionSync()) as string);
        main_version = main_version?.version;
      } catch (error) {
        main_version = '';
      }
      let web_version;
      try {
        web_version = await (await fetch('/version')).text();
        web_version = dayjs(Number(web_version)).format('YYYY/M/D HH:mm:ss');
      } catch (error) {
        web_version = '';
      }
      setVersionInfo(`Main: ${main_version}\nWeb: ${web_version}`);
    })();
    return () => {
      clearInterval(interval);
    };
  });
  return (
    <>
      <div className='flex gap-5 flex-col'>
        {/* <Card>
          <CardBody className='block'>
            <span className='text-red-600 font-bold text-xl'>仅供调试使用</span>
          </CardBody>
        </Card> */}
        <div className='flex gap-4 flex-wrap'>
          <Button
            color='primary'
            variant='bordered'
            onClick={() => {
              var serviceWorker = navigator.serviceWorker;
              serviceWorker.getRegistrations
                ? serviceWorker.getRegistrations().then(function (sws) {
                    sws.forEach(function (sw) {
                      sw.unregister();
                      console.log('sw unregister 1', sw);
                    });
                  })
                : serviceWorker.getRegistration &&
                  serviceWorker.getRegistration().then(function (sw) {
                    sw && sw.unregister();
                    console.log('sw unregister 2', sw);
                  });
            }}
          >
            删除Service Worker
          </Button>
          <Button
            color='primary'
            variant='bordered'
            onClick={async () => {
              caches.delete('desktop-tool').then(function (e) {
                console.log('cache storage', e);
              });
              var request = indexedDB.deleteDatabase('workbox-expiration');
              console.log(request);
            }}
          >
            删除缓存
          </Button>
        </div>
        <Divider></Divider>
        <div className=' bg-orange-100 rounded-lg w-fit px-4'>
          <span className='font-bold'>Versions:</span>
          <br />
          <span className='whitespace-pre-wrap'>{versionInfo}</span>
        </div>
        <div>
          <Calendar aria-label='Date (No Selection)' />
          <div className='h-10'></div>
        </div>
        <div className=' bg-orange-100 rounded-lg w-fit px-4'>
          <span className='text-lg font-bold'>Navigator:</span>
          <br />
          <span className='whitespace-pre-wrap'>{navigatorInfo}</span>
        </div>
      </div>
    </>
  );
}
