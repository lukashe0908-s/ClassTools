'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Separator, Spinner, Table } from '@heroui/react';
import { getConfigSync, setConfigSync } from '@renderer/features/ipc/config';
import { SettingDatePicker, SettingTimeField } from './SettingFields';

const columns = [
  { id: 'id', label: '#' },
  { id: 'all', label: '全部' },
  { id: 'sunday', label: '日' },
  { id: 'monday', label: '一' },
  { id: 'tuesday', label: '二' },
  { id: 'wednesday', label: '三' },
  { id: 'thursday', label: '四' },
  { id: 'friday', label: '五' },
  { id: 'saturday', label: '六' },
];

function getKeyValue(row: Record<string, any>, key: string) {
  return row?.[key];
}

function trimTailRows(newRows: any[]) {
  let finishedDelete = false;
  for (let i = 0; i < newRows.length; i++) {
    const element = newRows[newRows.length - 1 - i];
    if (!finishedDelete) {
      if (element && Object.keys(element).length === 0) {
        newRows[newRows.length - 1 - i] = undefined;
      } else {
        finishedDelete = true;
      }
    }
  }
  return newRows.filter(value => value !== undefined);
}

function List({
  rows,
  children,
  className,
}: {
  rows: Record<string, any>[];
  children: (row: Record<string, any>, rowIndex: number, columnKey: string) => React.ReactNode;
  className?: string;
}) {
  return (
    <Table className={className}>
      <Table.ScrollContainer>
        <Table.Content aria-label='lessons list table'>
          <Table.Header>
            {columns.map(column => (
              <Table.Column key={column.id} id={column.id} isRowHeader={column.id === 'id'}>
                <span>{column.label}</span>
              </Table.Column>
            ))}
          </Table.Header>
          <Table.Body>
            {rows.map((row, rowIndex) => (
              <Table.Row key={rowIndex} id={rowIndex}>
                {columns.map(column => (
                  <Table.Cell key={column.id} className={column.id === 'id' ? 'sticky left-0 bg-white dark:bg-neutral-900 z-10' : 'min-w-[14ch]'}>
                    {column.id === 'id' ? rowIndex + 1 : children(row, rowIndex, column.id)}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}

function CustomTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const component = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const ele = component.current;
    if (!ele) return;
    ele.style.height = 'auto';
    ele.style.height = `${ele.scrollHeight}px`;
  });

  return (
    <textarea
      {...props}
      className={
        'resize-none focus-visible:outline-none! bg-transparent w-full h-full rounded-sm' +
        (props.className ? ' ' + props.className : '')
      }
      onInput={e => {
        const ele = e.target as HTMLTextAreaElement;
        ele.style.height = `auto`;
        ele.style.height = `${ele.scrollHeight}px`;
      }}
      ref={component}></textarea>
  );
}

export function LessonsListName() {
  const [rows, setRows] = useState<Record<string, any>[]>([{}]);

  useEffect(() => {
    (async () => {
      const data = (await getConfigSync('lessonsList.name')) as Record<string, any>[] | undefined;
      if (data && data.length > 0) setRows(data);
    })();
  }, []);

  return (
    <List rows={rows} className='h-full'>
      {(row, rowIndex, columnKey) => (
        <CustomTextarea
          value={String(getKeyValue(row, columnKey) ?? '')}
          onChange={e => {
            let newRows = [...rows];
            if (!newRows[rowIndex]) newRows[rowIndex] = {};
            if (e.target.value) {
              newRows[rowIndex][columnKey] = e.target.value;
            } else {
              delete newRows[rowIndex][columnKey];
            }
            newRows = trimTailRows(newRows);
            newRows.push({});
            setConfigSync('lessonsList.name', newRows);
            setRows(newRows);
          }}
        />
      )}
    </List>
  );
}

function TimeEditor({ value, onChange, label }: { value?: string; onChange: (value?: string) => void; label: string }) {
  return (
    <SettingTimeField
      className='rounded-md bg-transparent px-2 py-1'
      label={label}
      value={value ?? ''}
      onChange={next => onChange(next || undefined)}
    />
  );
}

export function LessonsListTime() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoading2, setIsLoading2] = useState(true);
  const [rows, setRows] = useState<Record<string, any>[]>([{}]);
  const [weekStart, setWeekStart] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = (await getConfigSync('lessonsList.time')) as Record<string, any>[] | undefined;
        if (data && data.length > 0) setRows(data);
      } catch {}
      setIsLoading(false);
    })();

    (async () => {
      try {
        const data = await getConfigSync('lessonsList.weekStart');
        if (data) setWeekStart(String(data));
      } catch {}
      setIsLoading2(false);
    })();
  }, []);

  const updateCell = (rowIndex: number, columnKey: string, updater: (cell: Record<string, any>) => void) => {
    let newRows = [...rows];
    if (!newRows[rowIndex]) newRows[rowIndex] = {};
    if (!newRows[rowIndex][columnKey]) newRows[rowIndex][columnKey] = {};
    updater(newRows[rowIndex][columnKey]);

    if (Object.keys(newRows[rowIndex][columnKey]).length === 0) {
      delete newRows[rowIndex][columnKey];
    }

    newRows = trimTailRows(newRows);
    newRows.push({});
    setConfigSync('lessonsList.time', newRows);
    setRows(newRows);
  };

  return (
    <div className='h-full flex flex-col'>
      {(isLoading || isLoading2) && (
        <div className='absolute w-full bg-background h-full z-50 flex justify-center items-center'>
          <Spinner size='lg' />
        </div>
      )}

      <div className='mb-2 max-w-xs'>
        <label className='text-sm mb-1 block'>学期开始日期</label>
        <SettingDatePicker
          className='w-64'
          value={weekStart}
          onChange={next => {
            setConfigSync('lessonsList.weekStart', next);
            setWeekStart(next);
          }}
        />
      </div>

      <List rows={rows} className='min-h-0 flex-1'>
        {(row, rowIndex, columnKey) => {
          const context = getKeyValue(row, columnKey);
          const startTime = context?.start;
          const endTime = context?.end;
          const addDivide = context?.divide;

          return (
            <div className='flex flex-col gap-2'>
              <TimeEditor
                label='开始'
                value={startTime}
                onChange={value => {
                  updateCell(rowIndex, columnKey, cell => {
                    if (value) cell.start = value;
                    else delete cell.start;
                  });
                }}
              />

              <TimeEditor
                label='结束'
                value={endTime}
                onChange={value => {
                  updateCell(rowIndex, columnKey, cell => {
                    if (value) cell.end = value;
                    else delete cell.end;
                  });
                }}
              />

              <div className='flex gap-2'>
                <Button
                  size='sm'
                  variant='tertiary'
                  onPress={() => {
                    updateCell(rowIndex, columnKey, cell => {
                      cell.divide = !cell.divide;
                    });
                  }}>
                  {addDivide ? '取消分割线' : '添加分割线'}
                </Button>
                <Button
                  size='sm'
                  variant='danger-soft'
                  onPress={() => {
                    let newRows = [...rows];
                    if (newRows[rowIndex]) {
                      delete newRows[rowIndex][columnKey];
                    }
                    newRows = trimTailRows(newRows);
                    newRows.push({});
                    setConfigSync('lessonsList.time', newRows);
                    setRows(newRows);
                  }}>
                  清空
                </Button>
              </div>
            </div>
          );
        }}
      </List>
    </div>
  );
}
