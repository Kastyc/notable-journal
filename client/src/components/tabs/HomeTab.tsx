import { useState, useEffect } from 'react';
import { User, Medication, MedicationLog } from '../../types';
import { medicationsApi } from '../../api/medications';
import { reportsApi } from '../../api/reports';
import { format } from 'date-fns';

interface Props {
  user: User;
  onNavigate: (tab: string) => void;
}

export default function HomeTab({ user, onNavigate }: Props) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [todayLogs, setTodayLogs] = useState<MedicationLog[]>([]);
  const [stats, setStats] = useState({ streak: 0, adherence: 0, avgMood: '-' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [meds, logs, statsData] = await Promise.all([
        medicationsApi.getAll(),
        medicationsApi.getLogs(format(new Date(), 'yyyy-MM-dd'), format(new Date(), 'yyyy-MM-dd')),
        reportsApi.getStats(),
      ]);
      setMedications(meds);
      setTodayLogs(logs);
      setStats({
        streak: 0,
        adherence: statsData.adherence.percentage,
        avgMood: statsData.mood.average,
      });
    } catch (error) {
      console.error('Failed to load home data:', error);
    }
  };

  const handleMedicationAction = async (medId: string, taken: boolean) => {
    try {
      await medicationsApi.logMedication(medId, taken, format(new Date(), 'yyyy-MM-dd'));
      loadData();
    } catch (error) {
      console.error('Failed to log medication:', error);
    }
  };

  return (
    <div id="home-content" className="p-4 space-y-4">
      <div id="welcome-card" className="bg-surface rounded-2xl p-5 shadow-md text-center">
        <div id="welcome-user" className="text-xl font-bold mb-1">
          Welcome, {user.username}!
        </div>
        <div id="welcome-date" className="text-gray-600 text-sm">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </div>
      </div>

      <div id="stats-card" className="bg-surface rounded-2xl p-5 shadow-md">
        <div className="grid grid-cols-3 gap-3">
          <div id="stat-streak-box" className="bg-background rounded-xl p-3 text-center">
            <div id="home-streak" className="text-2xl font-bold text-primary">
              {stats.streak}
            </div>
            <div className="text-xs font-semibold text-gray-600">Day Streak</div>
          </div>
          <div id="stat-adherence-box" className="bg-background rounded-xl p-3 text-center">
            <div id="home-adherence" className="text-2xl font-bold text-primary">
              {stats.adherence}%
            </div>
            <div className="text-xs font-semibold text-gray-600">Adherence</div>
          </div>
          <div id="stat-mood-box" className="bg-background rounded-xl p-3 text-center">
            <div id="home-mood" className="text-2xl font-bold text-primary">
              {stats.avgMood}
            </div>
            <div className="text-xs font-semibold text-gray-600">Avg Mood</div>
          </div>
        </div>
      </div>

      <div id="schedule-card" className="bg-surface rounded-2xl p-5 shadow-md">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>📅</span>
          <span>Today's Schedule</span>
        </h2>
        <div id="schedule-list" className="space-y-3">
          {medications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📅</div>
              <p>No medications scheduled. Add medications in the Medications tab.</p>
            </div>
          ) : (
            medications.map((med) => {
              const log = todayLogs.find((l) => l.medication_id === med.id);
              const taken = log?.taken;
              const skipped = log?.skipped;

              return (
                <div
                  key={med.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border-l-4 ${
                    taken
                      ? 'border-green-500 opacity-70'
                      : skipped
                      ? 'border-orange-500 opacity-70'
                      : 'border-primary'
                  } bg-background`}
                >
                  <div className="font-bold text-sm min-w-[60px]">{med.time_of_day}</div>
                  <div className="flex-1">
                    <div className="font-semibold">{med.name}</div>
                    <div className="text-sm text-gray-600">{med.dosage}</div>
                  </div>
                  <div className="flex gap-2">
                    {!taken && !skipped ? (
                      <>
                        <button
                          onClick={() => handleMedicationAction(med.id, true)}
                          className="w-9 h-9 bg-green-500 text-white rounded-lg flex items-center justify-center text-lg hover:opacity-80"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => handleMedicationAction(med.id, false)}
                          className="w-9 h-9 bg-orange-500 text-white rounded-lg flex items-center justify-center text-lg hover:opacity-80"
                        >
                          ⊘
                        </button>
                      </>
                    ) : taken ? (
                      <div className="text-2xl">✅</div>
                    ) : (
                      <div className="text-2xl">⊘</div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <button
        id="quick-log-btn"
        onClick={() => onNavigate('log')}
        className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:opacity-90"
      >
        📝 Quick Log Entry
      </button>
    </div>
  );
}
