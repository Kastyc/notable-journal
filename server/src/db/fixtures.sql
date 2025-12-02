-- Test fixtures for MindTrack
-- Password for all test users: "Test123!"

-- Test patients
INSERT INTO users (id, username, email, password_hash, user_type) VALUES
  ('11111111-1111-1111-1111-111111111111', 'patient1', 'patient1@test.com', '$2b$10$YourHashedPasswordHere', 'patient'),
  ('22222222-2222-2222-2222-222222222222', 'patient2', 'patient2@test.com', '$2b$10$YourHashedPasswordHere', 'patient');

-- Test provider
INSERT INTO users (id, username, email, password_hash, user_type) VALUES
  ('33333333-3333-3333-3333-333333333333', 'dr_smith', 'dr.smith@test.com', '$2b$10$YourHashedPasswordHere', 'provider');

-- Test medications
INSERT INTO medications (id, user_id, name, dosage, frequency, time_of_day, prescribed_by) VALUES
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Sertraline', '50mg', 'once', '08:00:00', 'Dr. Smith'),
  ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Lorazepam', '1mg', 'asneeded', '20:00:00', 'Dr. Smith');

-- Test daily logs
INSERT INTO daily_logs (user_id, mood, mood_score, symptoms, side_effects, notes, log_date) VALUES
  ('11111111-1111-1111-1111-111111111111', 'good', 4, ARRAY['Anxiety'], ARRAY['Dry Mouth'], 'Feeling better today', CURRENT_DATE - INTERVAL '1 day'),
  ('11111111-1111-1111-1111-111111111111', 'great', 5, ARRAY[], ARRAY[], 'Great day!', CURRENT_DATE);

-- Test medication logs
INSERT INTO medication_logs (user_id, medication_id, taken, skipped, log_date) VALUES
  ('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', true, false, CURRENT_DATE),
  ('11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', false, true, CURRENT_DATE);

-- Provider-patient relationship
INSERT INTO provider_patients (provider_id, patient_id) VALUES
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111');
