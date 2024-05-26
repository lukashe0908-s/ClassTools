'use client';
import { Card, CardBody, Switch, Button } from '@nextui-org/react';
import axios from 'axios';
import { getConfigSync } from '../../../components/p_function';
export default function App() {
  return (
    <>
      <div className='flex gap-5 flex-col'>
        <Card>
          <CardBody className='block'>
            <p>你正在发送必需诊断数据</p>
            <span className='text-gray-600 text-sm'>帮助改进软件并使其保特安全、最新并按预期工作</span>
          </CardBody>
        </Card>
        <div className='flex gap-4 flex-wrap'>
          <Switch isDisabled defaultSelected>
            Remote Overlay
          </Switch>
          <Switch>配置云端备份</Switch>
        </div>
        <Button
          onClick={() => {
            (async () => {
              let foo = await axios.post('https://s.lukass.link/pastebin/api.php/edit/backup_dt', JSON.stringify(await getConfigSync()));
              let bar = await axios.post(
                'https://s.lukass.link/pastebin_with_oss/process.php?path=/setFile',
                JSON.stringify({
                  password: '5de4c32b-595d-47b4-a924-b0f456e72c8a',
                  folder: 'f1798983-42d0-4e49-809c-944c8742817f/',
                  name: 'backup_dt.txt',
                  content: JSON.stringify(await getConfigSync()),
                }),
                {
                  headers: {
                    'Content-Type': 'application/json',
                  },
                }
              );
              console.log(foo.data, bar.data);
              alert(foo.data + '\n' + JSON.stringify(bar.data));
              alert();
            })();
          }}
        >
          备份
        </Button>
        <Button
          onClick={() => {
            (async () => {
              let foo = await axios.post('https://s.lukass.link/pastebin/api.php/edit/backup_dt2', JSON.stringify(await getConfigSync()));
              let bar = await axios.post(
                'https://s.lukass.link/pastebin_with_oss/process.php?path=/setFile',
                JSON.stringify({
                  password: '5de4c32b-595d-47b4-a924-b0f456e72c8a',
                  folder: 'f1798983-42d0-4e49-809c-944c8742817f/',
                  name: 'backup_dt2.txt',
                  content: JSON.stringify(await getConfigSync()),
                }),
                {
                  headers: {
                    'Content-Type': 'application/json',
                  },
                }
              );
              console.log(foo.data, bar.data);
              alert(foo.data + '\n' + JSON.stringify(bar.data));
              alert();
            })();
          }}
        >
          备份2
        </Button>
      </div>
    </>
  );
}
