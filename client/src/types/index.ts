export interface User {
  id: string;
  username: string;
  email: string;
  userType: 'patient' | 'provider';
}

export interface Medication {
  id: string;
  user_id: string;
  name: string;
  dosage: string;
  frequency: 'once' | 'twice' | 'three' | 'asneeded';
  time_of_day: string;
  prescribed_by?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedicationLog {
  id: string;
  user_id: string;
  medication_id: string;
  taken: boolean;
  skipped: boolean;
  log_date: string;
  logged_at: string;
  medication_name?: string;
}

export interface DailyLog {
  id: string;
  user_id: string;
  mood?: string;
  mood_score?: number;
  symptoms?: string[];
  side_effects?: string[];
  notes?: string;
  log_date: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Stats {
  mood: {
    average: string;
    totalLogs: number;
  };
  adherence: {
    percentage: number;
    taken: number;
    total: number;
  };
  topSymptoms: Array<{ symptom: string; count: number }>;
}
