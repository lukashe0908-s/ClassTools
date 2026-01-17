'use client';
import { SearchXIcon, HouseIcon, ArrowLeftIcon } from 'lucide-react';
import { Button } from '@heroui/react';

export default function NotFound() {
  return (
    <>
      <title>Not Found</title>
      <div className='min-h-screen flex items-center justify-center px-4'>
        <main className='flex flex-col items-center max-w-xl'>
          <SearchXIcon className='text-[3rem] mb-4 w-[1em] h-[1em] text-primary-600'></SearchXIcon>
          <h1 className='text-[3rem] font-semibold mb-3 leading-[1.1] tracking-[-0.15rem]'>404 Not Found</h1>
          <p className='text-left mb-9 leading-6 whitespace-pre-line'>
            {`The requested URL was not found on this server.\nThat's all we know.`}
          </p>
          <div className='flex justify-center gap-3 flex-wrap'>
            <Button
              onPress={() => {
                location.href = '/home';
              }}
              radius='full'
              size='lg'
              variant='solid'
              color='primary'
              className='text-lg'>
              <HouseIcon className='w-[1em] h-[1em]'></HouseIcon>
              Home
            </Button>
            <Button
              onPress={() => history.back()}
              radius='full'
              size='lg'
              variant='light'
              color='primary'
              className='border-3 text-lg'>
              <ArrowLeftIcon className='w-[1em] h-[1em]'></ArrowLeftIcon>
              Back
            </Button>
          </div>
        </main>
      </div>
    </>
  );
}
