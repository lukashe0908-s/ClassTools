'use client';
import { SettingsSection } from '../../../components/settings/SettingsGroup';
import { AboutSettings } from '../../../components/settings/AboutSettings';

export default function App() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">关于</h1>
          <p className="text-gray-600">查看应用信息和开发者详情</p>
        </div>
        
        <SettingsSection>
          <AboutSettings />
        </SettingsSection>
      </div>
    </div>
  );
}
