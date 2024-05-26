'use client';
import { Card, CardBody, Switch, Button, Calendar, Divider, Checkbox, Input } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';

export default function App() {
  return (
    <>
      <div className='flex gap-5 flex-col'>
        <div className='flex justify-center'>
          <Card className='md:w-fit'>
            <CardBody className='block whitespace-pre-wrap'>
              <span className='text-red-400'>WARNING: EXPERIMENTAL FEATURES AHEAD!</span>
              <span className='hidden md:inline'>{`\nBy enabling these features, you could lose browser data or compromise your security or privacy.
If you are an enterprise admin you should not be using these flags in production.`}</span>
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
          <div className='flex gap-1 flex-wrap items-center'>
            <span className='pr-2 font-bold'>Auto Run</span>
            <Button color='primary' variant='bordered'>
              Register Service
            </Button>
            <Button color='primary' variant='bordered'>
              Unegister Service
            </Button>
          </div>
          <Divider></Divider>
        </div>
      </div>
    </>
  );
}
