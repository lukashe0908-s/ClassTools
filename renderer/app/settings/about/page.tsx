'use client';
import { SettingsPage } from '@renderer/components/settings/SettingsGroup';
import { AboutSettings } from '@renderer/components/settings/AboutSettings';

export default function App() {
  return (
    <SettingsPage>
      <AboutSettings />
    </SettingsPage>
  );
}
