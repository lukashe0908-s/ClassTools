'use client';
import React from 'react';
import Link from 'next/link';
import { Card, CardBody, Tabs, Tab, Button, Code, Image, Chip } from '@heroui/react';

export default function App() {
  return (
    <>
      {/* <div className='flex justify-center gap-3 py-2 flex-shrink-0 flex-wrap'>
        <Link href='/home'>
          <Button color='primary' className='font-bold'>
            Home
          </Button>
        </Link>
      </div> */}

      <Card>
        <CardBody>
          <div>
            <span>Powerful AI Ability</span>
            <Chip className='bg-yellow-300 text-yellow-900'>Beta</Chip>
          </div>
        </CardBody>
      </Card>
      <br />
      <div className='flex w-full flex-col'>
        <Tabs aria-label='Options'>
          <Tab key='photos' title='Test Photos'>
            <Card>
              <CardBody>
                <Image
                  height={300}
                  width={300}
                  shadow='lg'
                  src='https://wsrv.nl/?url=https://gravatar.com/avatar/16f2b466ed821bfb1175c7a4bd9fa06f%3Fs=256&output=webp'
                  referrerPolicy='no-referrer'
                />
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </div>
    </>
  );
}
