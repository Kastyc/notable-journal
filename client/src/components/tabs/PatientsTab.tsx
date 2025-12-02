import { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';

interface Patient {
  id: string;
  username: string;
  email: string;
  totalLogs: number;
  activeMedications: number;
}

export default function PatientsTab() {
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const response = await apiClient.get<Patient[]>('/provider/patients');
      setPatients(response.data);
    } catch (error) {
      console.error('Failed to load patients:', error);
    }
  };

  return (
    <div id="provider-content" className="p-4 space-y-4">
      <div className="bg-surface rounded-2xl p-5 shadow-md">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span>👨‍⚕️</span>
          <span>Patient Overview</span>
        </h2>
      </div>

      <div id="patient-list" className="space-y-3">
        {patients.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-5xl mb-3">👥</div>
            <p>No patients registered yet.</p>
          </div>
        ) : (
          patients.map((patient) => (
            <div
              key={patient.id}
              className="bg-surface rounded-xl p-4 shadow-md border-l-4 border-primary cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="font-bold text-lg mb-3">{patient.username}</div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="bg-background rounded-lg p-2 text-center">
                  <div className="font-bold">{patient.totalLogs}</div>
                  <div className="text-xs text-gray-600">Entries</div>
                </div>
                <div className="bg-background rounded-lg p-2 text-center">
                  <div className="font-bold text-primary">N/A</div>
                  <div className="text-xs text-gray-600">Avg Mood</div>
                </div>
                <div className="bg-background rounded-lg p-2 text-center">
                  <div className="font-bold">{patient.activeMedications}</div>
                  <div className="text-xs text-gray-600">Medications</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
