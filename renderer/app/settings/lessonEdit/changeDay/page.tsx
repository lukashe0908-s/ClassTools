'use client';
import { Button, Card, CardBody, Input } from '@heroui/react';
import { Calendar } from '@heroui/calendar';
import { useEffect, useState } from 'react';
import * as lodash from 'lodash';
import { getConfigSync } from '../../../../components/p_function';
import { CalendarDate, parseDate } from '@internationalized/date';

interface DayChange {
  from: string;
  to: string;
}

export default function App() {
  const [rules, setRules] = useState<DayChange[]>([]);
  const [newFrom, setNewFrom] = useState('');
  const [newTo, setNewTo] = useState('');

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    const config = (await getConfigSync('lessonsList.changeDay')) as string;
    if (config) {
      const lines = config.split('\n').filter(line => line.trim() && !line.startsWith('//'));
      const parsedRules = lines
        .map(line => {
          const [from, to] = line.split('-').map(s => s.trim());
          return { from, to };
        })
        .filter(rule => rule.from && rule.to);
      setRules(parsedRules);
    }
  };

  const saveRules = (newRules: DayChange[]) => {
    const content = [
      ...newRules.map(rule => `${rule.from} - ${rule.to}`),
    ].join('\n');
    window.ipc?.send('set-config', 'lessonsList.changeDay', content);
    setRules(newRules);
  };

  const addRule = () => {
    if (newFrom && newTo) {
      const newRules = [...rules, { from: newFrom, to: newTo }];
      saveRules(newRules);
      setNewFrom('');
      setNewTo('');
    }
  };

  const deleteRule = (index: number) => {
    const newRules = rules.filter((_, i) => i !== index);
    saveRules(newRules);
  };

  return (
    <>
      <div className='h-full p-4 flex flex-col gap-4'>
        <Card>
          <CardBody>
            <div className='mb-4'>
              <h2 className='text-lg font-bold mb-2'>添加新的替换规则</h2>
              <div className='flex gap-4 items-start'>
                <div>
                  <label className='block text-sm font-medium mb-1'>原始日期</label>
                  <Calendar
                    value={newFrom ? parseDate(newFrom) : undefined}
                    onChange={(date: CalendarDate) => {
                      setNewFrom(
                        `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
                      );
                    }}
                    className='rounded-md border scrollbar-hide'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>替换为</label>
                  <Calendar
                    value={newTo ? parseDate(newTo) : undefined}
                    onChange={(date: CalendarDate) => {
                      setNewTo(
                        `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
                      );
                    }}
                    className='rounded-md border scrollbar-hide'
                  />
                </div>
                <Button onClick={addRule} disabled={!newFrom || !newTo}>
                  添加规则
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h2 className='text-lg font-bold mb-2'>当前替换规则</h2>
            {rules.length === 0 ? (
              <p className='text-gray-500'>暂无替换规则</p>
            ) : (
              <div className='flex flex-col gap-2'>
                {rules.map((rule, index) => (
                  <div key={index} className='flex items-center gap-4 p-2 bg-gray-100 rounded'>
                    <span>{rule.from}</span>
                    <span>→</span>
                    <span>{rule.to}</span>
                    <Button variant='ghost' size='sm' onClick={() => deleteRule(index)} className='ml-auto'>
                      删除
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
