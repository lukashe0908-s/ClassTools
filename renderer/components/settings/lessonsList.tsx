'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Input,
  Textarea,
  Button,
  Divider,
  CircularProgress,
  getKeyValue,
  Checkbox,
  Accordion,
  AccordionItem,
} from '@heroui/react';
import { DataGridPremium, useGridApiRef } from '@mui/x-data-grid-premium';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';
import { LocalizationProvider, TimePicker, renderTimeViewClock } from '@mui/x-date-pickers-pro';
import { OverlayScrollbars } from 'overlayscrollbars';
import { getConfigSync } from '../p_function';

const columns = [
  {
    id: 'id',
    label: 'Index',
  },
  {
    id: 'all',
    label: 'All',
  },
  {
    id: 'sunday',
    label: 'Sunday',
  },
  {
    id: 'monday',
    label: 'Monday',
  },
  {
    id: 'tuesday',
    label: 'Tuesday',
  },
  {
    id: 'wednesday',
    label: 'Wednesday',
  },
  {
    id: 'thursday',
    label: 'Thursday',
  },
  {
    id: 'friday',
    label: 'Friday',
  },
  {
    id: 'saturday',
    label: 'Saturday',
  },
];
function formattedRows(rows) {
  return rows.map((row, rowIndex) => {
    const formattedRow = { id: rowIndex, ...row };
    return formattedRow;
  });
}
const formattedColumns = columns.map(column => ({
  field: column.id,
  headerName: column.label,
  editable: true,
}));

function List({ rows, setRows, children }) {
  const refTable = useRef(null);
  useEffect(() => {
    const Table = refTable.current as HTMLElement;
    const osInstance = OverlayScrollbars(Table.parentElement, { scrollbars: { autoHide: 'move' } });
  }, []);

  return (
    <>
      <div className='*:mb-4'>
        <Table
          isStriped
          isHeaderSticky
          aria-label=' '
          ref={refTable}
          classNames={{
            base: 'max-h-[80vh] overflow-auto',
            wrapper: 'rounded-none !p-0 scrollbar-hide',
            thead: 'z-[11]',
          }}>
          <TableHeader>
            {columns.map(column => (
              <TableColumn key={column.id}>{column.label}</TableColumn>
            ))}
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columnKey => {
                  return (
                    <TableCell className={columnKey == 'id' ? 'sticky left-0 bg-white z-[10]' : 'min-w-[14ch]'}>
                      {columnKey == 'id' ? rowIndex + 1 : children(row, rowIndex, columnKey)}
                    </TableCell>
                  );
                }}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function CustomTextarea(props) {
  const component = useRef(null);
  useEffect(() => {
    const ele = component.current as HTMLTextAreaElement;
    ele.style.height = `auto`;
    ele.style.height = `${ele.scrollHeight}px`;
  });
  return (
    <textarea
      {...props}
      className={
        'resize-none focus-visible:!outline-none bg-[transparent] w-full h-full rounded-sm' +
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
  const [rows, setRows] = useState([{}]) as any;
  useEffect(() => {
    (async () => {
      const data: any = await getConfigSync('lessonsList.name');
      if (data.length > 0) data && setRows(data);
    })();
  }, []);

  return (
    <>
      <List rows={rows} setRows={setRows}>
        {(row, rowIndex, columnKey) => {
          return (
            <CustomTextarea
              value={getKeyValue(row, columnKey)}
              onChange={e => {
                let new_rows = [...rows];
                if (e.target.value) {
                  new_rows[rowIndex][columnKey] = e.target.value;
                } else {
                  delete new_rows[rowIndex][columnKey];
                }
                let finished_delete = false;
                for (let i = 0; i < new_rows.length; i++) {
                  const element = new_rows[new_rows.length - 1 - i];
                  if (!finished_delete) {
                    if (Object.keys(element).length == 0) {
                      new_rows[new_rows.length - 1 - i] = undefined;
                    } else {
                      finished_delete = true;
                    }
                  }
                }
                new_rows = new_rows.filter(value => value != undefined);
                new_rows.push({});
                window.ipc?.send('set-config', 'lessonsList.name', new_rows);
                setRows(new_rows);
              }}
            />
          );
        }}
      </List>
      <Divider className='my-2'></Divider>
      <CellSelectionGrid rows={rows}></CellSelectionGrid>
    </>
  );
}
export function LessonsListTime() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoading2, setIsLoading2] = useState(true);
  const [isEditMode, setEditMode] = useState(false);
  const [rows, setRows] = useState([{}]) as any;
  const [weekStart, setWeekStart] = useState('') as any;
  useEffect(() => {
    (async () => {
      try {
        const data: any = await getConfigSync('lessonsList.time');
        if (data.length > 0) data && setRows(data);
      } catch (error) {}
      setIsLoading(false);
    })();
    (async () => {
      try {
        const data = await getConfigSync('lessonsList.weekStart');
        data && setWeekStart(data);
      } catch (error) {}
      setIsLoading2(false);
    })();
  }, []);
  return (
    <>
      {(() => {
        if (isLoading || isLoading2) {
          return (
            <div className='fixed w-full h-full bg-white z-50 flex justify-center items-center'>
              <CircularProgress size='lg' label='Loading...' className='-translate-x-unit-20' />
            </div>
          );
        }
      })()}
      <div className='*:mb-4'>
        <Input
          label='Week Start Time'
          className='max-w-xs'
          value={weekStart}
          onChange={e => {
            window.ipc?.send('set-config', 'lessonsList.weekStart', e.target.value);
            setWeekStart(e.target.value);
          }}></Input>
        <div>
          <Checkbox
            isSelected={isEditMode}
            onValueChange={value => {
              setEditMode(value);
            }}>
            使用时间选择器
          </Checkbox>
          <List rows={rows} setRows={setRows}>
            {(row, rowIndex, columnKey) => {
              let context: { [key: string]: string } | undefined = getKeyValue(row, columnKey);
              const startTime = context?.start;
              const endTime = context?.end;
              const addDivide = context?.divide;
              return (
                <div
                  className='flex flex-col gap-1'
                  onContextMenu={event => {
                    event.preventDefault();
                    window.ipc?.send('showContextMenu_listTime', addDivide);
                    window.ipc?.once('showContextMenu_listTime', (action, ...args) => {
                      switch (action) {
                        case 'divide':
                          let checked = args[0];
                          if (checked) {
                            let new_rows = [...rows];
                            if (!new_rows[rowIndex][columnKey]) new_rows[rowIndex][columnKey] = {};
                            new_rows[rowIndex][columnKey].divide = checked;
                            window.ipc?.send('set-config', 'lessonsList.time', new_rows);
                            setRows(new_rows);
                          } else {
                            if (rows[rowIndex][columnKey] && rows[rowIndex][columnKey].divide) {
                              let new_rows = [...rows];
                              delete new_rows[rowIndex][columnKey].divide;
                              window.ipc?.send('set-config', 'lessonsList.time', new_rows);
                              setRows(new_rows);
                            }
                          }
                          break;
                        case 'clear':
                          let new_rows = [...rows];
                          delete new_rows[rowIndex][columnKey];
                          window.ipc?.send('set-config', 'lessonsList.time', new_rows);
                          setRows(new_rows);
                          break;

                        default:
                          break;
                      }
                    });
                  }}>
                  {!isEditMode ? (
                    <>
                      <LessonsListTime_TimeDisplayer
                        time={startTime}
                        onChange={e => {
                          const time = dayjs('1970-1-1 ' + e.target.value).format('HH:mm');
                          if (time == 'Invalid Date') return;
                          let new_rows = [...rows];
                          if (time && e.target.value !== '') {
                            if (!new_rows[rowIndex][columnKey]) new_rows[rowIndex][columnKey] = {};
                            new_rows[rowIndex][columnKey].start = time;
                          } else {
                            delete new_rows[rowIndex][columnKey];
                          }
                          let finished_delete = false;
                          for (let i = 0; i < new_rows.length; i++) {
                            const element = new_rows[new_rows.length - 1 - i];
                            if (!finished_delete) {
                              if (Object.keys(element).length == 0) {
                                new_rows[new_rows.length - 1 - i] = undefined;
                              } else {
                                finished_delete = true;
                              }
                            }
                          }
                          new_rows = new_rows.filter(value => value != undefined);
                          new_rows.push({});
                          window.ipc?.send('set-config', 'lessonsList.time', new_rows);
                          setRows(new_rows);
                        }}>
                        Start Time
                      </LessonsListTime_TimeDisplayer>
                      <LessonsListTime_TimeDisplayer
                        time={endTime}
                        onChange={e => {
                          const time = dayjs('1970-1-1 ' + e.target.value).format('HH:mm');
                          if (time == 'Invalid Date') return;
                          let new_rows = [...rows];
                          if (time && e.target.value !== '') {
                            if (!new_rows[rowIndex][columnKey]) new_rows[rowIndex][columnKey] = {};
                            new_rows[rowIndex][columnKey]['end'] = time;
                          } else {
                            delete new_rows[rowIndex][columnKey]['end'];
                          }
                          let finished_delete = false;
                          for (let i = 0; i < new_rows.length; i++) {
                            const element = new_rows[new_rows.length - 1 - i];
                            if (!finished_delete) {
                              if (Object.keys(element).length == 0) {
                                new_rows[new_rows.length - 1 - i] = undefined;
                              } else {
                                finished_delete = true;
                              }
                            }
                          }
                          new_rows = new_rows.filter(value => value != undefined);
                          new_rows.push({});
                          window.ipc?.send('set-config', 'lessonsList.time', new_rows);
                          setRows(new_rows);
                        }}>
                        End Time
                      </LessonsListTime_TimeDisplayer>
                    </>
                  ) : (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <TimePicker
                        label='Start Time'
                        viewRenderers={{
                          hours: renderTimeViewClock,
                          minutes: renderTimeViewClock,
                        }}
                        ampm={false}
                        className='resize-none !outline-0 !border-0 w-full h-full rounded-sm !min-w-[14ch]'
                        value={getKeyValue(row, columnKey) ? dayjs('1970-1-1 ' + startTime) : null}
                        onChange={e => {
                          const time = e.format('HH:mm');
                          let new_rows = [...rows];
                          if (time && time !== 'Invalid Date') {
                            if (!new_rows[rowIndex][columnKey]) new_rows[rowIndex][columnKey] = {};
                            new_rows[rowIndex][columnKey]['start'] = time;
                          } else {
                            delete new_rows[rowIndex][columnKey];
                          }
                          let finished_delete = false;
                          for (let i = 0; i < new_rows.length; i++) {
                            const element = new_rows[new_rows.length - 1 - i];
                            if (!finished_delete) {
                              if (Object.keys(element).length == 0) {
                                new_rows[new_rows.length - 1 - i] = undefined;
                              } else {
                                finished_delete = true;
                              }
                            }
                          }
                          new_rows = new_rows.filter(value => value != undefined);
                          new_rows.push({});
                          window.ipc?.send('set-config', 'lessonsList.time', new_rows);
                          setRows(new_rows);
                        }}
                      />
                      <TimePicker
                        label='End Time'
                        viewRenderers={{
                          hours: renderTimeViewClock,
                          minutes: renderTimeViewClock,
                        }}
                        ampm={false}
                        className='resize-none !outline-0 !border-0 w-full h-full rounded-sm'
                        value={getKeyValue(row, columnKey) ? dayjs('1970-1-1 ' + endTime) : null}
                        onChange={e => {
                          const time = e.format('HH:mm');
                          let new_rows = [...rows];
                          if (time && time !== 'Invalid Date') {
                            if (!new_rows[rowIndex][columnKey]) new_rows[rowIndex][columnKey] = {};
                            new_rows[rowIndex][columnKey]['end'] = time;
                          } else {
                            delete new_rows[rowIndex][columnKey]['end'];
                          }
                          let finished_delete = false;
                          for (let i = 0; i < new_rows.length; i++) {
                            const element = new_rows[new_rows.length - 1 - i];
                            if (!finished_delete) {
                              if (Object.keys(element).length == 0) {
                                new_rows[new_rows.length - 1 - i] = undefined;
                              } else {
                                finished_delete = true;
                              }
                            }
                          }
                          new_rows = new_rows.filter(value => value != undefined);
                          new_rows.push({});
                          window.ipc?.send('set-config', 'lessonsList.time', new_rows);
                          setRows(new_rows);
                        }}
                      />
                    </LocalizationProvider>
                  )}
                  {addDivide ? <Divider></Divider> : <></>}
                </div>
              );
            }}
          </List>
          <Divider className='my-2'></Divider>
          <Accordion isCompact={true} variant='shadow'>
            <AccordionItem title='数据迁移'>
              <div className='flex flex-wrap gap-2'>
                <Button
                  variant='faded'
                  onClick={() => {
                    const rows_ = [];
                    for (const key in rows) {
                      const element = rows[key];
                      const element_ = {};
                      if (typeof element == 'object') {
                        for (const key in element) {
                          const elementIn = element[key];
                          if (typeof elementIn == 'string') {
                            let context_: any = {};
                            let foo = (elementIn as unknown as string).split('-')[0];
                            if (foo) context_.start = foo;
                            let bar = (elementIn as unknown as string).split('-')[1];
                            if (bar) context_.end = bar;
                            element_[key] = context_;
                          } else {
                            element_[key] = elementIn;
                          }
                        }
                        rows_.push(element_);
                      }
                    }
                    window.ipc?.send('set-config', 'lessonsList.time', rows_);
                    setRows(rows_);
                  }}>
                  从旧版数据格式迁移
                </Button>
                <Button
                  color='danger'
                  variant='faded'
                  onClick={() => {
                    const rows_ = [];
                    for (const key in rows) {
                      const element = rows[key];
                      const element_ = {};
                      if (typeof element == 'object') {
                        for (const key in element) {
                          const elementIn = element[key];
                          if (typeof elementIn == 'object') {
                            const textArray = [];
                            textArray.push(elementIn?.start);
                            textArray.push(elementIn?.end);
                            // textArray.push(elementIn?.divide);
                            element_[key] = textArray.join('-');
                          } else {
                            element_[key] = elementIn;
                          }
                        }
                        rows_.push(element_);
                      }
                    }
                    window.ipc?.send('set-config', 'lessonsList.time', rows_);
                    setRows(rows_);
                  }}>
                  迁移到旧版数据格式(会丢失分隔符)
                </Button>
              </div>
            </AccordionItem>
          </Accordion>
          <Divider className='my-2'></Divider>
          <CellSelectionGrid
            rows={(() => {
              const rows_ = [];
              for (const key in rows) {
                const element = rows[key];
                const element_ = {};
                if (typeof element == 'object') {
                  for (const key in element) {
                    const elementIn = element[key];
                    if (typeof elementIn == 'object') {
                      const textArray = [];
                      textArray.push(elementIn?.start);
                      textArray.push(elementIn?.end);
                      textArray.push(elementIn?.divide);
                      element_[key] = textArray.join('-');
                    } else {
                      element_[key] = `[Old] ${elementIn}`;
                    }
                  }
                  rows_.push(element_);
                }
              }
              return rows_;
            })()}></CellSelectionGrid>
        </div>
      </div>
    </>
  );
}

export function LessonsListTime_TimeDisplayer({
  time,
  children = <>&ensp;</>,
  onChange,
}: {
  time: string;
  children?: any;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <div className='inline-flex items-start justify-center box-border select-none whitespace-nowrap overflow-hidden text-small rounded-medium bg-default h-auto min-h-10 flex-col gap-0 py-1 px-3'>
      <div className='text-sm text-default-foreground'>{children}</div>
      <input
        className='text-lg bg-transparent focus-visible:![outline:0] min-w-[6ch] !w-full'
        defaultValue={time ? time : ''}
        onChange={onChange}></input>
    </div>
  );
}

export function CellSelectionGrid(props) {
  const apiRef = useGridApiRef();
  const autosizeOptions = {
    includeHeaders: true,
    includeOutliers: true,
    expand: true,
  };
  useEffect(() => {
    apiRef.current.autosizeColumns(autosizeOptions);
  }, [props.rows]);
  return (
    <>
      <Button className='!z-[5]' onClick={() => apiRef.current.autosizeColumns(autosizeOptions)}>
        AUTOWEIGHT
      </Button>
      <div style={{ width: '100%' }}>
        <div style={{ height: '90vh' }}>
          <DataGridPremium
            throttleRowsMs={2000}
            rowSelection={false}
            checkboxSelection={false}
            cellSelection={true}
            disableColumnMenu={true}
            // sortingOrder={['asc']}
            rows={formattedRows(props.rows)}
            columns={formattedColumns}
            apiRef={apiRef}
            autosizeOptions={autosizeOptions}
            autosizeOnMount
          />
        </div>
      </div>
    </>
  );
}
