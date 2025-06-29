import { useEffect, useRef, useState, Fragment } from 'react';
import { Card, CardBody, CardHeader, Divider, Progress } from '@heroui/react';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { getChangeDay, getWeekNumber, getWeekDate, listClassesForDay } from '../../components/p_function';

export default function ClassList({ schedule, progressDisplay = 'active', slidingPosition = 'nearest' }) {
  const containerRef = useRef(null);
  const [classes, setClasses] = useState([]);
  const [weekInfo, setWeekInfo] = useState({ now: 0, total: 0 });
  const [tick, setTick] = useState(0);
  const [currentDate, setCurrentDate] = useState(dayjs().format('YYYY-MM-DD')); // 当前日期字符串
  const refList = useRef([]);

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
          { startTime: '14:30', endTime: '16:00', subject: 'Example 2', divide: true },
          { startTime: '16:10', endTime: '18:00', subject: 'Example 3' },
        ];
      }
      setClasses(dayClasses);
    })();
  }, [schedule, currentDate]);

  useEffect(() => {
    const interval = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);
  // 当tick变化，判断是否跨天
  useEffect(() => {
    const todayStr = dayjs().format('YYYY-MM-DD');
    if (todayStr !== currentDate) {
      setCurrentDate(todayStr); // 触发重新获取课程数据
    }
  }, [tick, currentDate]);

  useEffect(() => {
    // 自动滚动到最后一个非 after 的课程
    for (let i = refList.current.length - 1; i >= 0; i--) {
      const el = refList.current[i];
      if (el && el.dataset.state !== 'after') {
        el.scrollIntoView({ behavior: 'smooth', block: slidingPosition });
        break;
      }
    }
  }, [tick, slidingPosition]);

  const groupedClasses = [];
  let currentGroup = [];

  for (let i = 0; i < classes.length; i++) {
    if (classes[i].startTime && classes[i].endTime && classes[i].subject) {
      currentGroup.push(classes[i]);
    }
    if (classes[i].divide || i === classes.length - 1) {
      groupedClasses.push(currentGroup);
      currentGroup = [];
    }
  }

  return (
    <div className='class-list' ref={containerRef}>
      {groupedClasses
        .filter(group => group.length > 0)
        .map((group, groupIdx) => (
          <div key={groupIdx} className='mb-2'>
            <Card className='mx-2 shadow-md'>
              {group.map((cls, idx) => {
                const refIndex = groupIdx * 100 + idx; // 避免冲突

                const currentTime = new Date();
                const [sh, sm] = cls.startTime.split(':').map(Number);
                const [eh, em] = cls.endTime.split(':').map(Number);
                const start = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), sh, sm);
                const end = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), eh, em);

                // state timeline: default | before > active > after
                let state = 'default';
                if (currentTime >= start && currentTime <= end) state = 'active';
                else if (currentTime > end) state = 'before';
                else state = 'after';

                const percent = ((currentTime.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100;
                const baseClass = `transition-all duration-300 ease-in-out ${
                  state === 'active'
                    ? 'border border-blue-500 bg-blue-50 shadow-inner'
                    : state === 'before'
                    ? 'opacity-60 bg-gray-100'
                    : 'bg-white'
                }`;

                return (
                  <Fragment key={refIndex}>
                    {idx !== 0 && <Divider />}
                    <div
                      ref={el => {
                        refList.current[groupIdx * 100 + idx] = el;
                      }}
                      data-state={state}
                      className={`px-4 py-2 ${baseClass} first:rounded-t-2xl last:rounded-b-2xl`}>
                      <div className='text-sm text-gray-600 mb-0'>
                        {cls.startTime} - {cls.endTime}
                      </div>
                      <div className='text-xl font-semibold mb-0'>{cls.subject}</div>
                      {(progressDisplay === 'always' || (progressDisplay === 'active' && state === 'active')) && (
                        <Progress
                          aria-label='progress'
                          size='sm'
                          value={Math.min(Math.max(percent, 0), 100)}
                          color='primary'
                          className='mt-1 w-full'
                        />
                      )}
                    </div>
                  </Fragment>
                );
              })}
            </Card>
          </div>
        ))}
      <div className='py-4 px-2'>
        <span id='weekNumber' className='text-md text-gray-800 bg-gray-100 p-2 rounded-md shadow-md'>
          #{weekInfo.now}/{weekInfo.total}
        </span>
      </div>
    </div>
  );
}
