'use client';
import { Card, CardBody, Switch, Button, Calendar, Divider } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import { getVersionSync, formatSize } from '../../../components/p_function';
import dayjs from 'dayjs';

export default function App() {
  const [navigatorInfo, setNavigatorInfo] = useState('');
  const [versionInfo, setVersionInfo] = useState('');
  const [storageInfo, setstorageInfo] = useState('');

  useEffect(() => {
    intervalFn();
    const interval = setInterval(intervalFn, 500);
    function intervalFn() {
      (async () => {
        let foo = {};
        for (const key in navigator) {
          const element = navigator[key];
          if (typeof element !== 'object') foo[key] = element;
        }
        setNavigatorInfo(JSON.stringify(foo, null, '\t'));
      })();
      (async () => {
        try {
          let storageEstimate = await navigator.storage.estimate();
          let storagePersisted = await navigator.storage.persisted();
          setstorageInfo(`${formatSize(storageEstimate.usage)} / ${formatSize(storageEstimate.quota)}\nPersisted: ${storagePersisted}`);
        } catch (error) {
          setstorageInfo('Unknown');
        }
      })();
    }
    (async () => {
      let main_version;
      try {
        main_version = JSON.parse((await getVersionSync()) as string);
        main_version = main_version?.version;
      } catch (error) {
        main_version = 'Unknown';
      }
      setVersionInfo(`Main: ${main_version}`);
      let web_version;
      try {
        web_version = await (await fetch('/version')).text();
        web_version = dayjs(Number(web_version)).format('YYYY/M/D HH:mm:ss');
      } catch (error) {
        web_version = 'Unknown';
      }
      setVersionInfo(`Main: ${main_version}\nWeb: ${web_version}`);
    })();
    return () => {
      clearInterval(interval);
    };
  }, []);
  return (
    <>
      <div className='flex gap-5 flex-col'>
        <div className='flex gap-2 flex-wrap'>
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
            Remove Service Worker
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
            Delete Cache
          </Button>
          <Button
            color='primary'
            variant='bordered'
            onClick={async () => {
              let allow = await navigator.storage.persist();
              alert(`Persiste Storage: Apply ${allow ? 'Success' : 'Failed'}`);
            }}
          >
            Apply Persiste Storage
          </Button>
        </div>
        <Divider></Divider>
        <div className='flex gap-1 flex-col'>
          <div className=' bg-orange-100 rounded-lg w-fit px-4'>
            <span className='font-bold'>Versions:</span>
            <br />
            <span className='whitespace-pre-wrap'>{versionInfo}</span>
          </div>
          <div className=' bg-orange-100 rounded-lg w-fit px-4'>
            <span className='font-bold'>Storage Usage:</span>
            <br />
            <span className='whitespace-pre-wrap'>{storageInfo}</span>
          </div>
          <div className=' bg-orange-100 rounded-lg w-fit px-4'>
            <span className='text-lg font-bold'>Navigator:</span>
            <br />
            <span className='whitespace-pre-wrap'>{navigatorInfo}</span>
          </div>
        </div>
      </div>
    </>
  );
}
