'use client';
import { Card, CardBody } from "@heroui/react";
export default function App() {
  return (
    <>
      <div className='flex gap-5 flex-col'>
        <Card>
          <CardBody className='block'>
            <span className='font-bold text-2xl'>
              作者：<span className='[box-shadow:inset_0_-8px_#60a5fa] border-b-2 border-blue-400'>Lukas</span>
            </span>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
