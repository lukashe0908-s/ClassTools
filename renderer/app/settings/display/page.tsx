import { SettingsPage } from '@renderer/components/settings/SettingsGroup';
import {
  WindowSettings,
  AppearanceSettings,
  UpgradeSettings,
  InterfaceSettings,
} from '@renderer/components/settings/DisplaySettings';

export default function App() {
  return (
    <SettingsPage>
      <WindowSettings />
      <AppearanceSettings />
      <UpgradeSettings />
      <InterfaceSettings />
    </SettingsPage>
  );
}
