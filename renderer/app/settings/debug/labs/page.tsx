'use client';
import { Card, CardBody, Switch, Button, Calendar, Divider, Checkbox, Input } from '@heroui/react';
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
              <span className='text-red-400'>警告: 这些功能可能不稳定!</span>
            </CardBody>
          </Card>
        </div>
        <div className='font-bold *:text-4xl flex items-center [color:#F6821F]'>
          <ScienceOutlinedIcon className='pr-1'></ScienceOutlinedIcon>
          <span>Labs</span>
        </div>
        <div className='flex gap-2 flex-col'>
          <div className='flex flex-col flex-wrap'>
            <span className='pr-2 font-bold'>开机自启动</span>
            <span>
              <span className={`ml-4 ${autoLaunch ? 'text-green-600' : 'text-gray-500'}`}>
                {autoLaunchE ?? (autoLaunch ? '已设置' : '未设置')}
              </span>
            </span>

            <div className='flex flex-wrap gap-1'>
              <Button
                color='primary'
                variant='bordered'
                onPress={async () => {
                  window.ipc?.send('autoLaunch', 'set', true);
                  setAutoLaunch(await getAutoLaunchSync());
                }}>
                {'开启 自启动'}
              </Button>
              <Button
                color='primary'
                variant='bordered'
                onPress={async () => {
                  window.ipc?.send('autoLaunch', 'set', false);
                  setAutoLaunch(await getAutoLaunchSync());
                }}>
                {'关闭 自启动'}
              </Button>
            </div>
          </div>
          <Divider></Divider>
        </div>
      </div>
    </>
  );
}
