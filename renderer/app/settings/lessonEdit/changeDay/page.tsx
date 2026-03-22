'use client';
import { Button, Separator } from '@heroui/react';
import { useEffect, useState } from 'react';
import * as lodash from 'lodash';
import { getConfigSync, setConfigSync } from '@renderer/features/ipc/config';
import { PlusIcon, ArrowRightIcon, TrashIcon } from '@heroicons/react/24/outline';
import { SettingsGroup, SettingsPage } from '@renderer/components/settings/SettingsGroup';
import { SettingDatePicker } from '@renderer/components/settings/SettingFields';

interface DayChange {
  from: string;
  to: string;
}

function useDayChangeRules() {
  const [rules, setRules] = useState<DayChange[]>([]);

  useEffect(() => {
    void loadRules();
  }, []);

  const loadRules = async () => {
    const config = (await getConfigSync('lessonsList.changeDay')) as string;
    if (!config) return;

    const parsed = config
      .split('\n')
      .filter(line => line.trim() && !line.startsWith('//'))
      .map(line => {
        const [from, to] = line.split(/\s*-\s*/);
        return { from, to };
      })
      .filter(r => r.from && r.to);

    setRules(parsed);
  };

  const saveRules = (newRules: DayChange[]) => {
    const uniqueRules = lodash.uniqBy(newRules, r => `${r.from}-${r.to}`);
    const content = uniqueRules.map(r => `${r.from} - ${r.to}`).join('\n');
    setConfigSync('lessonsList.changeDay', content);
    setRules(uniqueRules);
  };

  const addRule = (rule: DayChange) => saveRules([...rules, rule]);
  const deleteRule = (index: number) => saveRules(rules.filter((_, i) => i !== index));

  return { rules, addRule, deleteRule };
}

function normalizeDate(date: string) {
  return date.replaceAll('-', '/');
}

function toInputDate(date: string) {
  return date.replaceAll('/', '-');
}

export default function ChangeDayPage() {
  const { rules, addRule, deleteRule } = useDayChangeRules();
  const today = new Date();
  const initialDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [newFrom, setNewFrom] = useState(initialDate);
  const [newTo, setNewTo] = useState(initialDate);

  const handleAdd = () => {
    if (!newFrom || !newTo) return;
    addRule({ from: normalizeDate(newFrom), to: normalizeDate(newTo) });
  };

  return (
    <SettingsPage>
      <SettingsGroup title='添加替换规则'>
        <div className='flex flex-wrap gap-5 justify-center'>
          <div className='flex flex-col items-center gap-2'>
            <span>原始日期</span>
            <SettingDatePicker
              className='w-64'
              value={newFrom}
              onChange={setNewFrom}
            />
          </div>
          <div className='flex flex-col items-center gap-2'>
            <span>替换日期</span>
            <SettingDatePicker
              className='w-64'
              value={newTo}
              onChange={setNewTo}
            />
          </div>
        </div>
        <div className='flex justify-center'>
          <Button onPress={handleAdd} isDisabled={!newFrom || !newTo}>
            <PlusIcon className='w-6 h-6' />
          </Button>
        </div>
      </SettingsGroup>

      <SettingsGroup title='当前替换规则'>
        <div className='grid gap-2 lg:grid-cols-2'>
          {rules.length === 0 ? (
            <p className='text-content3-foreground'>暂无替换规则</p>
          ) : (
            rules.map((rule, index) => (
              <div key={index} className='flex items-center gap-2 w-full'>
                <span className='bg-neutral-200 dark:bg-neutral-800 px-2 py-1 rounded-md'>{rule.from}</span>
                <ArrowRightIcon className='w-6 h-6' />
                <span className='bg-neutral-200 dark:bg-neutral-800 px-2 py-1 rounded-md'>{rule.to}</span>
                <Button
                  variant='secondary'
                  isIconOnly
                  size='sm'
                  className='text-red-600 rounded-lg'
                  onPress={() => {
                    deleteRule(index);
                  }}>
                  <TrashIcon className='w-6 h-6' />
                </Button>
              </div>
            ))
          )}
        </div>
      </SettingsGroup>
    </SettingsPage>
  );
}
