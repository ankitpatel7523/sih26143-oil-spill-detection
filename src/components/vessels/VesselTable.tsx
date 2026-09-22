import React, { useState } from 'react';
import { SuspectVessel } from '../../types';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { AlertTriangle, ShieldAlert, ArrowUpDown, Anchor, Clock, Compass } from 'lucide-react';

interface VesselTableProps {
  vessels: SuspectVessel[];
  selectedVessel: SuspectVessel | null;
  onSelectVessel: (vessel: SuspectVessel) => void;
}

export const VesselTable: React.FC<VesselTableProps> = ({
  vessels,
  selectedVessel,
  onSelectVessel
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'distance' | 'time'>('score');

  const filteredVessels = vessels
    .filter((v) => {
      if (filterType === 'all') return true;
      if (filterType === 'tanker') return v.vesselType.toLowerCase().includes('tanker');
      if (filterType === 'cargo') return v.vesselType.toLowerCase().includes('bulk') || v.vesselType.toLowerCase().includes('container');
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'score') return b.overallScore - a.overallScore;
      if (sortBy === 'distance') return a.distanceAtEstimatedOriginKm - b.distanceAtEstimatedOriginKm;
      if (sortBy === 'time') return a.timeDeltaAtOriginHours - b.timeDeltaAtOriginHours;
      return 0;
    });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header with filters and sort controls */}
      <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Anchor className="w-4 h-4 text-cyan-400" />
            <span>Candidate Vessel Attribution Table</span>
            <span className="text-xs font-mono font-normal text-slate-400">
              ({filteredVessels.length} vessels in buffer)
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ranked by multi-factor Bayesian correlation: Proximity + Temporal + Type Risk + Anomaly Score
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {/* Filter Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Vessel Types</option>
            <option value="tanker">Tankers Only (High Risk)</option>
            <option value="cargo">Cargo / Bulk Carriers</option>
          </select>

          {/* Sort By */}
          <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 p-0.5">
            <button
              onClick={() => setSortBy('score')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                sortBy === 'score' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Attribution %
            </button>
            <button
              onClick={() => setSortBy('distance')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                sortBy === 'distance' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Distance
            </button>
            <button
              onClick={() => setSortBy('time')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                sortBy === 'time' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Time Gap
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Rank</th>
              <th className="py-3 px-4">Vessel Identification</th>
              <th className="py-3 px-4">Type & DWT</th>
              <th className="py-3 px-4">Attribution Score</th>
              <th className="py-3 px-4">Distance to Origin</th>
              <th className="py-3 px-4">Time Delta</th>
              <th className="py-3 px-4">Detected Anomalies</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredVessels.map((vessel) => {
              const isSelected = selectedVessel?.mmsi === vessel.mmsi;
              const isTop = vessel.rank === 1;

              return (
                <tr
                  key={vessel.mmsi}
                  id={`vessel-row-${vessel.mmsi}`}
                  onClick={() => onSelectVessel(vessel)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-cyan-950/40 border-l-4 border-l-cyan-400'
                      : isTop
                      ? 'bg-rose-950/20 hover:bg-rose-950/30'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  <td className="py-3 px-4 font-mono font-bold">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                        isTop
                          ? 'bg-rose-500 text-white'
                          : vessel.rank === 2
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      #{vessel.rank}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <span>{vessel.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">[{vessel.flag}]</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      MMSI: {vessel.mmsi} • IMO: {vessel.imo}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-slate-200">{vessel.vesselType}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {vessel.dwt.toLocaleString()} DWT
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <ConfidenceBadge score={vessel.overallScore} />
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className={vessel.distanceAtEstimatedOriginKm < 5 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                      {vessel.distanceAtEstimatedOriginKm.toFixed(1)} km
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className={vessel.timeDeltaAtOriginHours < 1 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                      ±{vessel.timeDeltaAtOriginHours.toFixed(1)} h
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {vessel.anomaliesDetected.hasAisGap && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold">
                          <AlertTriangle className="w-3 h-3" />
                          AIS Gap ({vessel.anomaliesDetected.gapDurationHours}h)
                        </span>
                      )}
                      {vessel.anomaliesDetected.hasSpeedDrop && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono">
                          Speed Drop ({vessel.anomaliesDetected.speedBeforeKnots}→{vessel.anomaliesDetected.speedDuringKnots}kts)
                        </span>
                      )}
                      {vessel.anomaliesDetected.nighttimeDischarge && (
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono">
                          Night Window
                        </span>
                      )}
                      {!vessel.anomaliesDetected.hasAisGap && !vessel.anomaliesDetected.hasSpeedDrop && (
                        <span className="text-[11px] text-slate-500">None</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectVessel(vessel);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 font-medium text-[11px] transition-colors"
                    >
                      {isSelected ? 'Viewing' : 'Inspect'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
