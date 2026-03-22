'use client';
import { Card } from '@heroui/react';
import { HourlyWeatherChart } from './hourly';
import { DailyWeatherChart } from './daily';

export default function App() {
  return (
    <div className='flex flex-col p-2 gap-2'>
      <div className='w-full flex justify-center'>
        <Card>
          <Card.Content className='px-0'>
            <span className='pl-4 pb-2'>24小时预报</span>
            <HourlyWeatherChart></HourlyWeatherChart>
          </Card.Content>
        </Card>
      </div>
      <div className='w-full flex justify-center'>
        <Card>
          <Card.Content className='px-0'>
            <DailyWeatherChart></DailyWeatherChart>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
