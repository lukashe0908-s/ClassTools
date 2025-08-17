'use client';
import { Card, CardBody } from "@heroui/react";
import { SubjectAbbreviations } from "../../../../components/settings/lessonsList";

export default function App() {
  return (
    <>
      <div className='px-4 py-6'>
        <Card>
          <CardBody>
            <SubjectAbbreviations />
          </CardBody>
        </Card>
      </div>
    </>
  );
}
