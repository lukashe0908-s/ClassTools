import { SettingsSection } from '@renderer/components/settings/SettingsGroup';
import {
  WindowSettings,
  AppearanceSettings,
  SystemSettings,
  InterfaceSettings,
} from '@renderer/components/settings/DisplaySettings';

export default function App() {
  return (
    <div className='min-h-screen'>
      <div className='max-w-4xl mx-auto py-6 px-4'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold mb-2'>常规</h1>
          <p className='text-neutral-600 dark:text-neutral-300'>管理应用的显示和行为设置</p>
        </div>

        <SettingsSection>
          <WindowSettings />
          <AppearanceSettings />
          <SystemSettings />
          <InterfaceSettings />
        </SettingsSection>
      </div>
    </div>
  );
}
