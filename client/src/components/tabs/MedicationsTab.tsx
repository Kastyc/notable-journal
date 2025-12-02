import { useState, useEffect } from 'react';
import { Medication } from '../../types';
import { medicationsApi } from '../../api/medications';

export default function MedicationsTab() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'once',
    timeOfDay: '08:00',
  });

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      const data = await medicationsApi.getAll();
      setMedications(data);
    } catch (error) {
      console.error('Failed to load medications:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMed) {
        await medicationsApi.update(editingMed.id, formData);
      } else {
        await medicationsApi.create(formData);
      }
      setShowModal(false);
      setEditingMed(null);
      setFormData({ name: '', dosage: '', frequency: 'once', timeOfDay: '08:00' });
      loadMedications();
    } catch (error) {
      console.error('Failed to save medication:', error);
    }
  };

  const handleEdit = (med: Medication) => {
    setEditingMed(med);
    setFormData({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      timeOfDay: med.time_of_day,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this medication?')) {
      try {
        await medicationsApi.delete(id);
        loadMedications();
      } catch (error) {
        console.error('Failed to delete medication:', error);
      }
    }
  };

  return (
    <div id="medications-content" className="p-4 space-y-4">
      <div className="bg-surface rounded-2xl p-5 shadow-md">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span>💊</span>
            <span>My Medications</span>
          </h2>
          <button
            id="add-med-btn"
            onClick={() => {
              setEditingMed(null);
              setFormData({ name: '', dosage: '', frequency: 'once', timeOfDay: '08:00' });
              setShowModal(true);
            }}
            className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90"
          >
            ➕ Add
          </button>
        </div>
      </div>

      <div id="med-list" className="space-y-3">
        {medications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-5xl mb-3">💊</div>
            <p>No medications added yet. Click the + button to add your first medication.</p>
          </div>
        ) : (
          medications.map((med) => (
            <div
              key={med.id}
              className="bg-surface rounded-xl p-4 shadow-md border-l-4 border-primary"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-bold text-lg mb-1">{med.name}</div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>💊 {med.dosage}</div>
                    <div>⏰ {med.frequency} at {med.time_of_day}</div>
                    {med.prescribed_by && <div>👨‍⚕️ Prescribed by {med.prescribed_by}</div>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(med)}
                    className="w-9 h-9 bg-secondary text-white rounded-lg flex items-center justify-center hover:opacity-80"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(med.id)}
                    className="w-9 h-9 bg-red-500 text-white rounded-lg flex items-center justify-center hover:opacity-80"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div
          id={editingMed ? 'edit-med-modal' : 'add-med-modal'}
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
        >
          <div className="bg-surface rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{editingMed ? 'Edit' : 'Add'} Medication</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-3xl leading-none opacity-70 hover:opacity-100"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 font-semibold text-sm">Medication Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-secondary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Sertraline"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-sm">Dosage</label>
                <input
                  type="text"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-secondary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., 50mg"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-sm">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-secondary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="once">Once daily</option>
                  <option value="twice">Twice daily</option>
                  <option value="three">Three times daily</option>
                  <option value="asneeded">As needed</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 font-semibold text-sm">Time of Day</label>
                <input
                  type="time"
                  value={formData.timeOfDay}
                  onChange={(e) => setFormData({ ...formData, timeOfDay: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-secondary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-lg hover:opacity-90"
              >
                {editingMed ? 'Save Changes' : 'Add Medication'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
