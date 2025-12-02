import { User } from '../../types';

interface Props {
  user: User;
  onLogout: () => void;
}

export default function ProfileTab({ user, onLogout }: Props) {
  return (
    <div id="profile-content" className="p-4 space-y-4">
      <div id="profile-info-card" className="bg-surface rounded-2xl p-5 shadow-md">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>👤</span>
          <span>Profile</span>
        </h2>
        <div id="profile-details" className="space-y-3">
          <div>
            <div className="text-sm text-gray-600 font-semibold">Username</div>
            <div className="text-lg">{user.username}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 font-semibold">Email</div>
            <div className="text-lg">{user.email}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 font-semibold">Account Type</div>
            <div className="text-lg capitalize">{user.userType}</div>
          </div>
        </div>
      </div>

      <div id="settings-card" className="bg-surface rounded-2xl p-5 shadow-md">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>⚙️</span>
          <span>Settings</span>
        </h2>
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
          <strong className="flex items-center gap-2 mb-2">
            <span>🔔</span>
            <span>Reminder Settings</span>
          </strong>
          <p className="text-sm text-gray-700">
            Medication reminders are managed per medication in the Medications tab. Daily log reminders are sent at 8 PM.
          </p>
        </div>
      </div>

      <div id="support-card" className="bg-surface rounded-2xl p-5 shadow-md">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>📞</span>
          <span>Support & Safety</span>
        </h2>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-4">
          <strong className="flex items-center gap-2 mb-2">
            <span>⚠️</span>
            <span>Emergency Warning</span>
          </strong>
          <p className="text-sm text-gray-700">
            If you're experiencing thoughts of self-harm or suicide, please contact emergency services immediately or call the National Suicide Prevention Lifeline at 988.
          </p>
        </div>
        <p className="text-sm">
          <strong>Contact Support:</strong>
          <br />
          <span id="support-email-display">support@mindtrack.com</span>
        </p>
      </div>

      <button
        id="logout-btn"
        onClick={onLogout}
        className="w-full bg-red-500 text-white py-4 rounded-xl font-bold shadow-lg hover:opacity-90"
      >
        Sign Out
      </button>
    </div>
  );
}
