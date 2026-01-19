'use client';
import React, { ReactNode } from 'react';
import { Card, CardBody, CardHeader, Divider } from '@heroui/react';

export function SettingsGroup({
  title,
  description,
  children,
  icon,
}: {
  title?: string | ReactNode;
  description?: string | ReactNode;
  children?: string | React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <Card className='w-full shadow-sm border border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-100 dark:bg-neutral-950'>
      {title ? (
        <>
          <CardHeader className='flex gap-3 px-6 py-4'>
            <div className='flex items-center gap-3'>
              {icon && <div className='shrink-0'>{icon}</div>}
              <div className='flex flex-col'>
                <h3 className='text-lg font-semibold whitespace-pre-line'>{title}</h3>
                {description && <p className='text-sm text-content3-foreground whitespace-pre-wrap'>{description}</p>}
              </div>
            </div>
          </CardHeader>
          <Divider className='mx-6' />
        </>
      ) : (
        ''
      )}
      <CardBody className='px-6 py-5'>
        <div className='space-y-4'>{children}</div>
      </CardBody>
    </Card>
  );
}

export function SettingsItem({
  title,
  description,
  children,
  disabled = false,
  justifyBetween = true,
  alignCenter = true,
}: {
  title?: string | ReactNode;
  description?: string | ReactNode;
  children?: string | React.ReactNode;
  disabled?: boolean;
  justifyBetween?: boolean;
  alignCenter?: boolean;
}) {
  return (
    <div
      className={`flex ${alignCenter ? 'items-center' : ''} ${
        justifyBetween ? 'justify-between' : 'justify-baseline'
      } py-3 ${disabled ? 'opacity-50' : ''}`}>
      {(title || description) && (
        <div className='pr-4'>
          <div className='font-medium  whitespace-pre-line'>{title}</div>
          {description && (
            <div className='text-sm text-content3-foreground mt-1 whitespace-pre-wrap'>{description}</div>
          )}
        </div>
      )}
      <div className='shrink'>{children}</div>
    </div>
  );
}

export function SettingsSection({ children, className = '' }) {
  return <div className={`space-y-6 ${className}`}>{children}</div>;
}

export function SettingsPage({
  title,
  description,
  children,
  className = '',
  titleClassName = 'mb-4',
}: {
  title?: string | ReactNode;
  description?: string | ReactNode;
  children?: string | React.ReactNode;
  className?: string;
  titleClassName?: string;
}) {
  return (
    <div className={'max-w-4xl mx-auto py-6 px-4 ' + className}>
      {(title || description) && (
        <div className={titleClassName}>
          <h1 className='text-3xl font-bold mb-2'>{title}</h1>
          <p className='text-content3-foreground'>{description}</p>
        </div>
      )}

      <SettingsSection>{children}</SettingsSection>
    </div>
  );
}
