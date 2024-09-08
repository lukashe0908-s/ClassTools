'use client';
import { Card, CardBody } from '@nextui-org/react';
export default function App() {
  return (
    <>
      <div className='flex gap-5 flex-col'>
        <Card>
          <CardBody className='block'>
            <span className='font-bold text-2xl'>作者：Lukas</span>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
