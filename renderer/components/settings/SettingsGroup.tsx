'use client';
import React, { ReactNode } from 'react';
import { Card, Separator } from '@heroui/react';

export function SettingsGroup({
  title,
  description,
  children,
  icon,
  className,
}: {
  title?: string | ReactNode;
  description?: string | ReactNode;
  children?: string | React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className='w-full shadow-sm border border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-100 dark:bg-neutral-950 px-0'>
      {title ? (
        <>
          <Card.Header className='flex gap-3 px-6 py-2'>
            <div className='flex items-center gap-3'>
              {icon && <div className='shrink-0'>{icon}</div>}
              <div className='flex flex-col'>
                <h3 className='text-lg font-semibold whitespace-pre-line'>{title}</h3>
                {description && <p className='text-sm text-content3-foreground whitespace-pre-wrap'>{description}</p>}
              </div>
            </div>
          </Card.Header>
          <Separator />
        </>
      ) : (
        ''
      )}
      <Card.Content className={'p-6 overflow-auto ' + className}>{children}</Card.Content>
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
      className={`flex flex-wrap py-3 ${alignCenter ? 'md:items-center' : ''} ${
        justifyBetween ? 'justify-between' : 'justify-baseline'
      } ${disabled ? 'opacity-50' : ''}`}>
      {(title || description) && (
        <div className='pb-4 md:pr-4'>
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
    <div className={'max-w-4xl mx-auto p-3 ' + className}>
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
