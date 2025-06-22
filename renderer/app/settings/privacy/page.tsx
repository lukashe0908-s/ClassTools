'use client';
import { Card, CardBody, Switch, Button, CardHeader } from "@heroui/react";
import axios from 'axios';
import { getConfigSync } from '../../../components/p_function';
export default function App() {
  return (
    <>
      <div className='flex gap-5 flex-col'>
        <Card>
          <CardBody className='block'>
            <p>你正在发送必需诊断数据</p>
            <span className='text-gray-600 text-sm'>您的数据将会被发送至Sentry及Cloudflare Web Analytics，以帮助改进软件并使其保特安全、最新并按预期工作</span>
          </CardBody>
        </Card>
        <div className='flex gap-4 flex-wrap'>
          <Switch isDisabled defaultSelected>
            Remote Overlay
          </Switch>
          <Switch>配置云端备份</Switch>
        </div>
        <div className='flex flex-wrap gap-1'>
          <Button
            onClick={() => {
              (async () => {
                let foo = await axios.post('https://hk.lukas1.eu.org/pastebin/api.php/edit/backup_dt', JSON.stringify(await getConfigSync()));
                console.log(foo.data);
                alert(foo.data);
                alert();
              })();
            }}
          >
            备份
          </Button>
          <Button
            onClick={() => {
              (async () => {
                let foo = await axios.post('https://hk.lukas1.eu.org/pastebin/api.php/edit/backup_dt2', JSON.stringify(await getConfigSync()));
                console.log(foo.data);
                alert(foo.data);
                alert();
              })();
            }}
          >
            备份2
          </Button>
        </div>
      </div>
    </>
  );
}
