'use client';
import { SettingsPage } from '@renderer/components/settings/SettingsGroup';
import { DataPrivacySettings, BackupSettings } from '@renderer/components/settings/PrivacySettings';

export default function App() {
  return (
    <SettingsPage>
      <DataPrivacySettings />
      <BackupSettings />
    </SettingsPage>
  );
}
