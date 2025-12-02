import { useState, useEffect } from 'react';
import { reportsApi } from '../../api/reports';
import { logsApi } from '../../api/logs';
import { medicationsApi } from '../../api/medications';
import { format, subDays } from 'date-fns';
import jsPDF from 'jspdf';

type DateRange = 'week' | 'month' | '3months';

export default function ReportsTab() {
  const [dateRange, setDateRange] = useState<DateRange>('week');
  const [stats, setStats] = useState({ mood: { average: '0', totalLogs: 0 }, adherence: { percentage: 0 } });
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    loadStats();
  }, [dateRange]);

  const loadStats = async () => {
    try {
      const days = dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 90;
      const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
      const data = await reportsApi.getStats(startDate);
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleExportPDF = async () => {
    try {
      const days = dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 90;
      const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
      const [logs, medLogs] = await Promise.all([
        logsApi.getAll(startDate),
        medicationsApi.getLogs(startDate),
      ]);

      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('MindTrack Health Report', 20, 20);
      doc.setFontSize(12);
      doc.text(`Period: ${dateRange}`, 20, 30);
      doc.text(`Generated: ${format(new Date(), 'PPpp')}`, 20, 40);
      doc.text(`Total Entries: ${logs.length + medLogs.length}`, 20, 50);
      doc.text(`Average Mood: ${stats.mood.average}/5`, 20, 60);
      doc.text(`Adherence: ${stats.adherence.percentage}%`, 20, 70);

      doc.save(`mindtrack-report-${dateRange}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export report');
    }
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const result = await reportsApi.share(dateRange);
      alert(`Share link created! Expires: ${format(new Date(result.expiresAt), 'PPpp')}\n\n${result.shareUrl}`);
    } catch (error) {
      console.error('Failed to share report:', error);
      alert('Failed to create share link');
    } finally {
      setSharing(false);
    }
  };

  return (
    <div id="reports-content" className="p-4 space-y-4">
      <div id="date-range-card" className="bg-surface rounded-2xl p-5 shadow-md">
        <div className="flex gap-2">
          {[
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
            { value: '3months', label: '3 Months' },
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => setDateRange(range.value as DateRange)}
              className={`flex-1 py-3 rounded-lg border-2 font-semibold text-sm transition-all ${
                dateRange === range.value
                  ? 'bg-primary border-primary text-white scale-105'
                  : 'border-gray-300 hover:border-primary'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div id="mood-chart-card" className="bg-surface rounded-2xl p-5 shadow-md">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>📊</span>
          <span>Mood Trends</span>
        </h2>
        <div className="bg-background rounded-xl p-4 h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📈</div>
            <p>Average Mood: {stats.mood.average}/5</p>
            <p className="text-sm">Total Logs: {stats.mood.totalLogs}</p>
          </div>
        </div>
      </div>

      <div id="adherence-chart-card" className="bg-surface rounded-2xl p-5 shadow-md">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>💊</span>
          <span>Medication Adherence</span>
        </h2>
        <div className="bg-background rounded-xl p-4 h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-5xl font-bold text-primary mb-2">{stats.adherence.percentage}%</div>
            <p>Adherence Rate</p>
          </div>
        </div>
      </div>

      <div id="export-card" className="bg-surface rounded-2xl p-5 shadow-md">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>📄</span>
          <span>Export & Share</span>
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            id="export-pdf-btn"
            onClick={handleExportPDF}
            className="bg-secondary text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90"
          >
            <span>📄</span>
            <span>Export PDF</span>
          </button>
          <button
            id="share-doctor-btn"
            onClick={handleShare}
            disabled={sharing}
            className="bg-secondary text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
          >
            <span>👨‍⚕️</span>
            <span>{sharing ? 'Sharing...' : 'Share with Doctor'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
