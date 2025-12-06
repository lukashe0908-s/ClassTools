'use client';
import React, { ReactNode } from 'react';
import { Card, CardBody, CardHeader, Divider } from '@heroui/react';

interface SettingsGroupProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function SettingsGroup({ title, description, children, icon }: SettingsGroupProps) {
  return (
    <Card className='w-full shadow-sm border border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-100 dark:bg-neutral-950'>
      {title ? (
        <>
          <CardHeader className='flex gap-3 px-6 py-4'>
            <div className='flex items-center gap-3'>
              {icon && <div className='shrink'>{icon}</div>}
              <div className='flex flex-col'>
                <h3 className='text-lg font-semibold whitespace-pre-line'>{title}</h3>
                {description && (
                  <p className='text-sm text-neutral-600 dark:text-neutral-300 whitespace-pre-wrap'>{description}</p>
                )}
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

interface SettingsItemProps {
  title?: string;
  description?: string | ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
  alignRight?: boolean;
  alignCenter?: boolean;
}

export function SettingsItem({
  title,
  description,
  children,
  disabled = false,
  alignRight = true,
  alignCenter = true,
}: SettingsItemProps) {
  return (
    <div
      className={`flex ${alignCenter ? 'items-center' : ''} ${
        alignRight ? 'justify-between' : 'justify-baseline'
      } py-3 ${disabled ? 'opacity-50' : ''}`}>
      {title ? (
        <div className='pr-4'>
          <div className='font-medium  whitespace-pre-line'>{title}</div>
          {description && <div className='text-sm text-neutral-600 dark:text-neutral-300 mt-1 whitespace-pre-wrap'>{description}</div>}
        </div>
      ) : (
        ''
      )}
      <div className='shrink'>{children}</div>
    </div>
  );
}

interface SettingsSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function SettingsSection({ children, className = '' }: SettingsSectionProps) {
  return <div className={`space-y-6 ${className}`}>{children}</div>;
}
