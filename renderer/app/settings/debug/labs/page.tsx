'use client';
import { Card, CardBody, Switch, Button, Calendar, Divider, Checkbox, Input } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import { getAutoLaunchSync } from '../../../../components/p_function';

export default function App() {
  const [autoLaunch, setAutoLaunch] = useState(false);
  const [autoLaunchE, setAutoLaunchE] = useState('Finding');
  useEffect(() => {
    (async () => {
      try {
        setAutoLaunch(await getAutoLaunchSync());
        setAutoLaunchE(null);
      } catch (error) {
        setAutoLaunchE('Failed Found');
      }
    })();
  }, []);
  return (
    <>
      <div className='flex gap-5 flex-col'>
        <div className='flex justify-center'>
          <Card className='md:w-fit'>
            <CardBody className='block whitespace-pre-wrap'>
              <span className='text-red-400'>WARNING: EXPERIMENTAL FEATURES AHEAD!</span>
              <span className='hidden md:inline'>{``}</span>
            </CardBody>
          </Card>
        </div>
        <div className='font-bold *:text-4xl flex items-center [color:#F6821F]'>
          <ScienceOutlinedIcon className='pr-1'></ScienceOutlinedIcon>
          <span>Labs </span>
        </div>
        <div className='flex gap-2 flex-col'>
          <div className='flex flex-col flex-wrap'>
            <Checkbox defaultSelected>Enable Telegram Bot File Downloader</Checkbox>
            <div>
              <Input label='Search Token' className='w-[50ch]'></Input>
            </div>
          </div>
          <Divider></Divider>
          <div className='flex flex-col flex-wrap'>
            <span className='pr-2 font-bold'>Auto Launch</span>
            <span>
              (Need 1.0.9 or higher)
              <span className={`ml-4 ${autoLaunch ? 'text-green-600' : 'text-gray-500'}`}>
                {autoLaunchE ?? (autoLaunch ? 'Found' : 'Not Found')}
              </span>
            </span>

            <div className='flex flex-wrap gap-1'>
              <Button
                color='primary'
                variant='bordered'
                onClick={async () => {
                  window.ipc.send('autoLaunch', 'set', true);
                  setAutoLaunch(await getAutoLaunchSync());
                }}
              >
                Enable Auto Launch
              </Button>
              <Button
                color='primary'
                variant='bordered'
                onClick={async () => {
                  window.ipc.send('autoLaunch', 'set', false);
                  setAutoLaunch(await getAutoLaunchSync());
                }}
              >
                Disable Auto Launch
              </Button>
            </div>
          </div>
          <Divider></Divider>
        </div>
      </div>
    </>
  );
}
