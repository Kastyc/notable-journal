import { useState } from 'react';
import { logsApi } from '../../api/logs';
import { format } from 'date-fns';

const MOODS = [
  { value: 'very-bad', score: 1, emoji: '😞', label: 'Very Bad' },
  { value: 'bad', score: 2, emoji: '😟', label: 'Bad' },
  { value: 'okay', score: 3, emoji: '😐', label: 'Okay' },
  { value: 'good', score: 4, emoji: '🙂', label: 'Good' },
  { value: 'great', score: 5, emoji: '😊', label: 'Great' },
];

const SYMPTOMS = [
  'Anxiety', 'Depression', 'Insomnia', 'Fatigue', 'Headache', 'Nausea',
  'Loss of Appetite', 'Irritability', 'Difficulty Concentrating', 'Racing Thoughts',
  'Low Energy', 'Restlessness',
];

const SIDE_EFFECTS = [
  'Drowsiness', 'Dry Mouth', 'Nausea', 'Dizziness', 'Weight Changes', 'Sleep Issues',
  'Digestive Issues', 'Tremors', 'Increased Anxiety', 'Sweating', 'Blurred Vision', 'Headache',
];

export default function LogTab() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<string>>(new Set());
  const [selectedSideEffects, setSelectedSideEffects] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleSymptom = (symptom: string) => {
    const newSet = new Set(selectedSymptoms);
    if (newSet.has(symptom)) {
      newSet.delete(symptom);
    } else {
      newSet.add(symptom);
    }
    setSelectedSymptoms(newSet);
  };

  const toggleSideEffect = (effect: string) => {
    const newSet = new Set(selectedSideEffects);
    if (newSet.has(effect)) {
      newSet.delete(effect);
    } else {
      newSet.add(effect);
    }
    setSelectedSideEffects(newSet);
  };

  const handleSave = async () => {
    if (!selectedMood && selectedSymptoms.size === 0 && selectedSideEffects.size === 0) {
      return;
    }

    setSaving(true);
    try {
      const moodData = MOODS.find((m) => m.value === selectedMood);
      await logsApi.create({
        mood: selectedMood || undefined,
        moodScore: moodData?.score,
        symptoms: Array.from(selectedSymptoms),
        sideEffects: Array.from(selectedSideEffects),
        notes: notes.trim() || undefined,
        logDate: format(new Date(), 'yyyy-MM-dd'),
      });

      setSelectedMood(null);
      setSelectedSymptoms(new Set());
      setSelectedSideEffects(new Set());
      setNotes('');
      alert('✅ Log saved successfully!');
    } catch (error) {
      console.error('Failed to save log:', error);
      alert('Failed to save log. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const canSave = selectedMood || selectedSymptoms.size > 0 || selectedSideEffects.size > 0;

  return (
    <div id="log-content" className="p-4 space-y-4">
      <div id="mood-card" className="bg-surface rounded-2xl p-5 shadow-md">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>😊</span>
          <span>How are you feeling?</span>
        </h2>
        <div id="mood-grid" className="grid grid-cols-5 gap-2">
          {MOODS.map((mood) => (
            <button
              key={mood.value}
              onClick={() => setSelectedMood(mood.value)}
              className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                selectedMood === mood.value
                  ? 'bg-primary border-primary text-white scale-105'
                  : 'border-gray-300 hover:border-primary'
              }`}
            >
              <div className="text-3xl">{mood.emoji}</div>
              <div className="text-xs font-semibold">{mood.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div id="symptoms-card" className="bg-surface rounded-2xl p-5 shadow-md">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>🩺</span>
          <span>Symptoms Today</span>
        </h2>
        <div id="symptom-checklist" className="grid grid-cols-2 gap-2">
          {SYMPTOMS.map((symptom) => (
            <button
              key={symptom}
              onClick={() => toggleSymptom(symptom)}
              className={`p-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                selectedSymptoms.has(symptom)
                  ? 'bg-primary bg-opacity-20 border-primary'
                  : 'border-gray-300 hover:border-primary'
              }`}
            >
              {symptom}
            </button>
          ))}
        </div>
      </div>

      <div id="side-effects-card" className="bg-surface rounded-2xl p-5 shadow-md">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>⚠️</span>
          <span>Side Effects</span>
        </h2>
        <div id="side-effects-list" className="grid grid-cols-2 gap-2">
          {SIDE_EFFECTS.map((effect) => (
            <button
              key={effect}
              onClick={() => toggleSideEffect(effect)}
              className={`p-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                selectedSideEffects.has(effect)
                  ? 'bg-secondary bg-opacity-20 border-secondary'
                  : 'border-gray-300 hover:border-secondary'
              }`}
            >
              {effect}
            </button>
          ))}
        </div>
      </div>

      <div id="notes-card" className="bg-surface rounded-2xl p-5 shadow-md">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>📝</span>
          <span>Notes & Thoughts</span>
        </h2>
        <textarea
          id="log-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-4 py-3 border-2 border-secondary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-vertical min-h-[100px]"
          placeholder="Write any notes, questions, or thoughts..."
        />
      </div>

      <button
        id="save-log-btn"
        onClick={handleSave}
        disabled={!canSave || saving}
        className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? 'Saving...' : "Save Today's Log"}
      </button>
    </div>
  );
}
