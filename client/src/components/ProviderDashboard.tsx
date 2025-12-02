import { useState } from 'react';
import { User } from '../types';
import PatientsTab from './tabs/PatientsTab';
import ProfileTab from './tabs/ProfileTab';

interface Props {
  user: User;
  onLogout: () => void;
}

type Tab = 'provider' | 'profile';

export default function ProviderDashboard({ user, onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('provider');

  return (
    <div id="main-app" className="flex flex-col h-screen max-w-2xl mx-auto bg-white shadow-2xl">
      <header id="header" className="bg-gradient-to-r from-primary via-purple-500 to-secondary p-6 text-center">
        <h1 id="app-title" className="text-3xl font-bold text-white mb-1">
          MindTrack
        </h1>
        <p id="tagline" className="text-white text-sm italic opacity-95">
          Your Mental Health Journey
        </p>
      </header>

      <div className="flex-1 overflow-y-auto pb-20">
        {activeTab === 'provider' && <PatientsTab />}
        {activeTab === 'profile' && <ProfileTab user={user} onLogout={onLogout} />}
      </div>

      <nav id="bottom-nav" className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-surface border-t shadow-lg">
        <div id="provider-nav" className="flex">
          {[
            { id: 'provider', icon: '👨‍⚕️', label: 'Patients' },
            { id: 'profile', icon: '👤', label: 'Profile' },
          ].map((tab) => (
            <button
              key={tab.id}
              data-tab={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`nav-item flex-1 py-3 flex flex-col items-center gap-1 transition-all ${
                activeTab === tab.id ? 'text-primary' : 'text-gray-600'
              }`}
            >
              <div className={`nav-icon text-2xl ${activeTab === tab.id ? 'scale-110' : ''}`}>
                {tab.icon}
              </div>
              <div className="text-xs font-semibold">{tab.label}</div>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
