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
} from '@nextui-org/react';
import { DataGridPremium, GridApiPro, useGridApiRef } from '@mui/x-data-grid-premium';
import dayjs from 'dayjs';
import { Popper } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';
import { LocalizationProvider, TimePicker, renderTimeViewClock, StaticTimePicker } from '@mui/x-date-pickers-pro';
import { OverlayScrollbars } from 'overlayscrollbars';

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
async function getConfigSync(arg) {
  return new Promise((resolve, reject) => {
    try {
      window.ipc.send('get-config', arg);
      window.ipc.once('get-config/' + arg, data => {
        resolve(data);
      });
    } catch (error) {
      resolve('');
    }
  });
}

function List({ rows, setRows, children }) {
  const refTable = useRef();
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
          }}
        >
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
        <Divider></Divider>
        <CellSelectionGrid rows={rows}></CellSelectionGrid>
      </div>
    </>
  );
}

function CustomTextarea(props) {
  const component = useRef();
  useEffect(() => {
    const ele = component.current as HTMLTextAreaElement;
    ele.style.height = `auto`;
    ele.style.height = `${ele.scrollHeight}px`;
  });
  return (
    <textarea
      {...props}
      className={
        'resize-none focus-visible:!outline-none bg-[transparent] w-full h-full rounded-sm' + (props.className ? ' ' + props.className : '')
      }
      onInput={e => {
        const ele = e.target as HTMLTextAreaElement;
        ele.style.height = `auto`;
        ele.style.height = `${ele.scrollHeight}px`;
      }}
      ref={component}
    ></textarea>
  );
}

export function LessonsListName() {
  const [rows, setRows] = useState([{}]) as any;
  useEffect(() => {
    (async () => {
      const data = await getConfigSync('lessonsList.name');
      data && setRows(data);
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
                // console.log(new_rows);
                window.ipc?.send('set-config', 'lessonsList.name', new_rows);
                setRows(new_rows);
              }}
            />
          );
        }}
      </List>
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
      const data = await getConfigSync('lessonsList.time');
      data && setRows(data);
      setIsLoading(false);
    })();
    (async () => {
      const data = await getConfigSync('lessonsList.weekStart');
      data && setWeekStart(data);
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
          }}
        ></Input>
        <div>
          <Checkbox
            isSelected={isEditMode}
            onValueChange={value => {
              setEditMode(value);
            }}
          >
            使用时间选择器
          </Checkbox>
          <List rows={rows} setRows={setRows}>
            {(row, rowIndex, columnKey) => {
              const context = getKeyValue(row, columnKey);
              const startTime = context && context.split('-')[0];
              const endTime = context && context.split('-')[1];
              return (
                <div className='flex flex-col gap-1'>
                  {!isEditMode ? (
                    <>
                      <LessonsListTime_TimeDisplayer
                        time={startTime}
                        onChange={e => {
                          const time = dayjs('1970-1-1 ' + e.target.value).format('HH:mm');
                          if (time == 'Invalid Date') return;
                          let new_rows = [...rows];
                          if (time) {
                            if (new_rows[rowIndex][columnKey] && new_rows[rowIndex][columnKey].split('-')[1]) {
                              new_rows[rowIndex][columnKey] = time + '-' + new_rows[rowIndex][columnKey].split('-')[1];
                            } else {
                              new_rows[rowIndex][columnKey] = time + '-';
                            }
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
                          // console.log(new_rows);
                          window.ipc?.send('set-config', 'lessonsList.time', new_rows);
                          setRows(new_rows);
                        }}
                      >
                        Start Time
                      </LessonsListTime_TimeDisplayer>
                      <LessonsListTime_TimeDisplayer
                        time={endTime}
                        onChange={e => {
                          const time = dayjs('1970-1-1 ' + e.target.value).format('HH:mm');
                          if (time == 'Invalid Date') return;
                          let new_rows = [...rows];
                          if (time) {
                            if (new_rows[rowIndex][columnKey] && new_rows[rowIndex][columnKey].split('-')[0]) {
                              new_rows[rowIndex][columnKey] = new_rows[rowIndex][columnKey].split('-')[0] + '-' + time;
                            } else {
                              new_rows[rowIndex][columnKey] = '-' + time;
                            }
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
                          // console.log(new_rows);
                          window.ipc?.send('set-config', 'lessonsList.time', new_rows);
                          setRows(new_rows);
                        }}
                      >
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
                        value={getKeyValue(row, columnKey) ? dayjs('1970-1-1 ' + getKeyValue(row, columnKey).split('-')[0]) : null}
                        onChange={e => {
                          const time = e.format('HH:mm');
                          let new_rows = [...rows];
                          if (time && time !== 'Invalid Date') {
                            if (new_rows[rowIndex][columnKey] && new_rows[rowIndex][columnKey].split('-')[1]) {
                              new_rows[rowIndex][columnKey] = time + '-' + new_rows[rowIndex][columnKey].split('-')[1];
                            } else {
                              new_rows[rowIndex][columnKey] = time + '-';
                            }
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
                          // console.log(new_rows);
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
                        value={getKeyValue(row, columnKey) ? dayjs('1970-1-1 ' + getKeyValue(row, columnKey).split('-')[1]) : null}
                        onChange={e => {
                          const time = e.format('HH:mm');
                          let new_rows = [...rows];
                          if (time && time !== 'Invalid Date') {
                            if (new_rows[rowIndex][columnKey] && new_rows[rowIndex][columnKey].split('-')[0]) {
                              new_rows[rowIndex][columnKey] = new_rows[rowIndex][columnKey].split('-')[0] + '-' + time;
                            } else {
                              new_rows[rowIndex][columnKey] = '-' + time;
                            }
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
                          // console.log(new_rows);
                          window.ipc?.send('set-config', 'lessonsList.time', new_rows);
                          setRows(new_rows);
                        }}
                      />
                    </LocalizationProvider>
                  )}
                </div>
              );
            }}
          </List>{' '}
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
        className='text-lg bg-transparent focus-visible:!outline-0 w-[6ch]'
        defaultValue={time ? time : ''}
        onChange={onChange}
      ></input>
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
