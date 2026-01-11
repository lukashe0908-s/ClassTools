'use client';
import { SettingsSection } from '@renderer/components/settings/SettingsGroup';
import { DataPrivacySettings, BackupSettings } from '@renderer/components/settings/PrivacySettings';

export default function App() {
  return (
    <div className='min-h-screen'>
      <div className='max-w-4xl mx-auto py-6 px-4'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold mb-2'>隐私与数据</h1>
          <p className='text-neutral-600 dark:text-neutral-300'>管理您的隐私设置和数据备份选项</p>
        </div>

        <SettingsSection>
          <DataPrivacySettings />
          <BackupSettings />
        </SettingsSection>
      </div>
    </div>
  );
}
