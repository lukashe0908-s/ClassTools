'use client';
import { SettingsSection } from '@renderer/components/settings/SettingsGroup';
import { AboutSettings } from '@renderer/components/settings/AboutSettings';

export default function App() {
  return (
    <div className='min-h-screen'>
      <div className='max-w-4xl mx-auto py-6 px-4'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold mb-2'>关于</h1>
          <p className='text-content3-foreground'>查看应用信息和开发者详情</p>
        </div>

        <SettingsSection>
          <AboutSettings />
        </SettingsSection>
      </div>
    </div>
  );
}
