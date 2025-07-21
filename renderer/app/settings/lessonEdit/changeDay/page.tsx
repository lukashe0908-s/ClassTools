'use client';
import { Card, CardBody } from '@heroui/react';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
const MonacoEditor = dynamic(() => import('react-monaco-editor').then(mod => mod.default), {
  ssr: false,
});
import * as lodash from 'lodash';
import { getConfigSync } from '../../../../components/p_function';

export default function App() {
  const [updateTime, setUpdateTime] = useState(0);
  useEffect(() => {
    const handler = lodash.throttle(e => {
      console.log(e);
      setUpdateTime(Date.now());
    }, 500);
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('resize', handler);
    };
  }, []);
  const [value, setValue] = useState('// 格式： 要换的日期 - 替换成的日期\n// 正则匹配，请确保行数不要太多\n\n');
  useEffect(() => {
    (async () => {
      const foo = (await getConfigSync('lessonsList.changeDay')) as string;
      foo && setValue(foo);
    })();
  }, []);
  return (
    <>
      <div className='h-full'>
        <MonacoEditor
          className='w-full h-full'
          language='javascript'
          theme='vs-dark'
          value={value}
          onChange={e => {
            setValue(e);
            window.ipc && window.ipc.send('set-config', 'lessonsList.changeDay', e);
          }}
          editorDidMount={(editor, monaco) => {
            editor.setPosition({ lineNumber: 4, column: 0 });
            editor.focus();
          }}
          key={updateTime}
        />
      </div>
    </>
  );
}
