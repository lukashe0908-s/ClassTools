'use client';
import { Card, CardBody, Skeleton } from '@heroui/react';
import { HourlyWeatherChart } from './hourly';
import { DailyWeatherChart } from './daily';

export default function App() {
  return (
    <div className='flex flex-col p-2 gap-2'>
      <div className='w-full flex justify-center'>
        <Card>
          <CardBody className='px-0'>
            <span className='pl-4'>24小时预报</span>
            <HourlyWeatherChart></HourlyWeatherChart>
          </CardBody>
        </Card>
      </div>
      <div className='w-full flex justify-center'>
        <Card>
          <CardBody className='px-0'>
            <DailyWeatherChart></DailyWeatherChart>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
