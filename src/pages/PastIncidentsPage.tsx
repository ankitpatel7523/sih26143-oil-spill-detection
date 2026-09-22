import React, { useState } from 'react';
import { PastIncident, DetectionResult } from '../types';
import {
  History,
  TrendingUp,
  PieChart,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Search,
  Filter,
  BarChart3
} from 'lucide-react';
import { ConfidenceBadge } from '../components/common/ConfidenceBadge';

interface PastIncidentsPageProps {
  pastIncidents: PastIncident[];
  onSelectIncidentById: (id: string) => void;
}

export const PastIncidentsPage: React.FC<PastIncidentsPageProps> = ({
  pastIncidents,
  onSelectIncidentById
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = pastIncidents.filter((inc) => {
    if (statusFilter !== 'all' && inc.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        inc.id.toLowerCase().includes(q) ||
        inc.locationName.toLowerCase().includes(q) ||
        (inc.primarySuspectName && inc.primarySuspectName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalVolume = pastIncidents.reduce((sum, i) => sum + i.volumeEstM3, 0);
  const confirmedCount = pastIncidents.filter(i => i.status === 'Confirmed' || i.status === 'Prosecuted / Actioned').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Historical Incidents Archive & Intelligence Analytics</span>
            <span className="text-xs font-mono font-normal bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded">
              Spatial Registry
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Historical SAR satellite detections, attribution confidence audits, and coastal enforcement outcomes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Search by ID, vessel, or region..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent focus:outline-none text-xs w-56 text-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Analytics Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Trend Metric 1: Monthly Incidents Chart */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Monthly Incident Frequency (2026)</span>
            </span>
            <span className="text-[10px] font-mono text-cyan-400">Total: {pastIncidents.length}</span>
          </div>

          <div className="h-28 flex items-end justify-between gap-2 pt-4 px-2">
            {[
              { month: 'Apr', count: 1, height: 25 },
              { month: 'May', count: 1, height: 25 },
              { month: 'Jun', count: 1, height: 25, isFalse: true },
              { month: 'Jul', count: 2, height: 50 },
              { month: 'Aug', count: 1, height: 25 },
              { month: 'Sep', count: 1, height: 25, isLatest: true }
            ].map((col, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                <span className="text-[10px] font-mono text-slate-400 mb-1">{col.count}</span>
                <div
                  style={{ height: `${col.height}%` }}
                  className={`w-full max-w-[24px] rounded-t ${
                    col.isLatest
                      ? 'bg-rose-500'
                      : col.isFalse
                      ? 'bg-slate-600'
                      : 'bg-cyan-500'
                  }`}
                />
                <span className="text-[10px] font-mono text-slate-400 mt-1">{col.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trend Metric 2: Flagged Vessel Types */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-amber-400" />
              <span>Attributed Vessel Categories</span>
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 text-[11px] mb-0.5">
                <span>Crude Oil Tankers (High Risk)</span>
                <span className="font-mono font-bold text-rose-400">57%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '57%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 text-[11px] mb-0.5">
                <span>Bulk Carriers / Cargo</span>
                <span className="font-mono font-bold text-amber-400">28%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '28%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 text-[11px] mb-0.5">
                <span>Dark Vessels (AIS Disabled)</span>
                <span className="font-mono font-bold text-purple-400">15%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '15%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Trend Metric 3: Regional Hotspots */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Maritime Surveillance Hotspots</span>
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300 font-mono">
              <div className="flex justify-between p-1.5 rounded bg-slate-950 border border-slate-800">
                <span>Arabian Sea Tanker Lane</span>
                <span className="text-cyan-400 font-bold">4 Incidents</span>
              </div>
              <div className="flex justify-between p-1.5 rounded bg-slate-950 border border-slate-800">
                <span>Gulf of Kutch Ports</span>
                <span className="text-amber-400 font-bold">2 Incidents</span>
              </div>
              <div className="flex justify-between p-1.5 rounded bg-slate-950 border border-slate-800">
                <span>Andaman / Malacca West</span>
                <span className="text-rose-400 font-bold">1 Dark Ship</span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[10px] text-slate-500 font-mono">
            Cumulative discharge estimate: <strong className="text-white">{totalVolume.toLocaleString()} m³</strong>
          </div>
        </div>
      </div>

      {/* Table of Past Incidents */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Incident Records ({filtered.length})
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Prosecuted / Actioned">Prosecuted / Actioned</option>
              <option value="Under Review">Under Review</option>
              <option value="False Alarm">False Alarm</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Incident ID</th>
                <th className="py-3 px-4">Detection Date</th>
                <th className="py-3 px-4">Location & Coordinates</th>
                <th className="py-3 px-4">Area & Volume</th>
                <th className="py-3 px-4">Primary Suspect Vessel</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.map((inc) => (
                <tr
                  key={inc.id}
                  onClick={() => onSelectIncidentById(inc.id)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-mono font-bold text-cyan-300">
                    {inc.id}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {inc.date}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{inc.locationName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {inc.coordinates[0].toFixed(2)}°N, {inc.coordinates[1].toFixed(2)}°E • {inc.satellite}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className="text-white font-bold">{inc.spillAreaKm2} km²</span>
                    <span className="text-slate-400 text-[11px] block">{inc.volumeEstM3} m³</span>
                  </td>
                  <td className="py-3 px-4">
                    {inc.primarySuspectName ? (
                      <div>
                        <div className="font-semibold text-slate-100">{inc.primarySuspectName}</div>
                        {inc.primarySuspectMmsi && (
                          <span className="text-[10px] font-mono text-slate-400">MMSI: {inc.primarySuspectMmsi}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-500 font-mono">None (False Alarm)</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <ConfidenceBadge score={inc.attributionConfidence} size="sm" />
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        inc.status === 'Confirmed'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : inc.status === 'Prosecuted / Actioned'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : inc.status === 'Under Review'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-700/40 text-slate-400 border border-slate-600/30'
                      }`}
                    >
                      {inc.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectIncidentById(inc.id);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 font-semibold text-[11px] transition-colors"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
