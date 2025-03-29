'use client';
import React from 'react';
import Link from 'next/link';
import { Card, CardBody, Tabs, Tab, Button, Code, Image, Chip } from "@heroui/react";

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
          <Tab key='photos' title='Text to Image'>
            <Card>
              <CardBody>
                <Image
                  height={300}
                  width={300}
                  shadow='lg'
                  src='https://p.misee.dns.army/https://worker-lively-bonus-e4f6.fhngkwng.workers.dev/?prompt=anime'
                  referrerPolicy='no-referrer'
                />
              </CardBody>
            </Card>
          </Tab>
          <Tab key='music' title='Chat'>
            <Card>
              <CardBody>
                Developing... <br />
                (OpenChat 3.5)
                <Code className='text-wrap'>https://llm-app-steep-mode-90f3.fhngkwng.workers.dev/?prompt=请回答PI的值</Code>
              </CardBody>
            </Card>
          </Tab>
          <Tab key='videos' title='Translate'>
            <Card>
              <CardBody>Developing...</CardBody>
            </Card>
          </Tab>
        </Tabs>
      </div>
    </>
  );
}
