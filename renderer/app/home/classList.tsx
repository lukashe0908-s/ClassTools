import { useEffect, useRef, useState } from 'react';
import { Card, CardBody, CardHeader, Divider, Progress } from '@heroui/react';
import { Fragment } from 'react';

import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { getChangeDay, getWeekNumber, getWeekDate, listClassesForDay } from '../../components/p_function';

export default function ClassList({ schedule, progressDisplay = 'active', slidingPosition = 'nearest' }) {
  const containerRef = useRef(null);
  const [classes, setClasses] = useState([]);
  const [weekInfo, setWeekInfo] = useState({ now: 0, total: 0 });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    dayjs.extend(weekOfYear);
    (async () => {
      const inputTime = dayjs();
      const changed = await getChangeDay(true, inputTime);
      let weekStartDate = dayjs(schedule?.weekStartDate);
      const weekChanged = getWeekNumber(weekStartDate, changed);
      const weekNow = getWeekNumber(weekStartDate, inputTime);
      const weekTotal = inputTime.week();
      setWeekInfo({ now: weekNow, total: weekTotal });

      let classDay = getWeekDate(changed).toLowerCase();
      let dayClasses = listClassesForDay(schedule, classDay, Math.abs(weekChanged % 2) === 1);
      if (!dayClasses || Object.keys(dayClasses).length === 0) {
        dayClasses = [
          { startTime: '11:45', endTime: '14:19', subject: 'Example' },
          { startTime: '11:45', endTime: '14:19', subject: 'Example' },
        ];
      }
      setClasses(dayClasses);
    })();
  }, [schedule]);
  // 每秒刷新 tick
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='class-list' ref={containerRef}>
      {classes.map((cls, idx) => {
        if (cls.startTime && cls.endTime && cls.subject) {
          const currentTime = new Date();
          const [sh, sm] = cls.startTime.split(':').map(Number);
          const [eh, em] = cls.endTime.split(':').map(Number);
          const start = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), sh, sm);
          const end = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), eh, em);

          let state = 'default';
          if (currentTime >= start && currentTime <= end) {
            state = 'active';
          } else if (currentTime > end) {
            state = 'before';
          } else {
            state = 'after';
          }

          const percent = ((currentTime.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100;

          const baseClass = `transition-all duration-300 ease-in-out ${
            state === 'active' ? 'border border-blue-500 bg-blue-50 shadow-lg' : state === 'before' ? 'opacity-60 bg-gray-100' : 'bg-white'
          }`;

          return (
            <Fragment key={idx}>
              <Card className={`mx-2 mb-2 ${baseClass}`}>
                <CardHeader className='text-sm text-gray-600 px-4 pt-3 pb-1'>
                  {cls.startTime} - {cls.endTime}
                </CardHeader>
                <CardBody className='px-4 pt-0 pb-4'>
                  <div className='text-lg font-semibold mb-2'>{cls.subject}</div>
                  {(progressDisplay === 'always' || (progressDisplay === 'active' && state === 'active')) && (
                    <Progress
                      aria-label='progress'
                      size='sm'
                      value={Math.min(Math.max(percent, 0), 100)}
                      color='primary'
                      className='w-full'
                    />
                  )}
                </CardBody>
              </Card>
              {cls.divide && (
                <div className='my-4 px-1'>
                  <Divider className='h-[2px]' />
                </div>
              )}
            </Fragment>
          );
        }
      })}

      <div className='py-4 px-2'>
        <span id='weekNumber' className='text-md text-gray-800 bg-gray-100 p-2 rounded-md'>
          #{weekInfo.now}/{weekInfo.total}
        </span>
      </div>
    </div>
  );
}
