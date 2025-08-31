'use client';
import { SettingsSection } from '../../../components/settings/SettingsGroup';
import { DataPrivacySettings, BackupSettings } from '../../../components/settings/PrivacySettings';

export default function App() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">隐私与数据</h1>
          <p className="text-gray-600">管理您的隐私设置和数据备份选项</p>
        </div>
        
        <SettingsSection>
          <DataPrivacySettings />
          <BackupSettings />
        </SettingsSection>
      </div>
    </div>
  );
}
