import React from 'react';
import { SuspectVessel } from '../../types';
import { ShieldAlert, AlertTriangle, Activity, Navigation, Radio, Info } from 'lucide-react';
import { ConfidenceBadge } from '../common/ConfidenceBadge';

interface VesselTrajectoryChartProps {
  vessel: SuspectVessel;
}

export const VesselTrajectoryChart: React.FC<VesselTrajectoryChartProps> = ({ vessel }) => {
  const maxSpeed = Math.max(...vessel.trackHistory.map((t) => t.speedKnots), 15);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
      {/* Vessel Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white font-mono">{vessel.name}</h3>
            <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300 border border-slate-700">
              MMSI: {vessel.mmsi}
            </span>
            <span className="text-xs text-slate-400 font-mono">Flag: {vessel.country}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Operator: <strong className="text-slate-200">{vessel.operator}</strong> • Call Sign: {vessel.callSign} • IMO: {vessel.imo}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] uppercase font-mono text-slate-400">Attribution Index</p>
            <ConfidenceBadge score={vessel.overallScore} size="lg" />
          </div>
        </div>
      </div>

      {/* Justification Box */}
      <div className="p-3.5 rounded-lg bg-rose-950/25 border border-rose-800/40 text-xs leading-relaxed text-rose-200 flex items-start gap-2.5">
        <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-rose-300 font-semibold uppercase tracking-wider block text-[11px] mb-0.5">
            Forensic Intelligence Assessment
          </strong>
          <span>{vessel.justification}</span>
        </div>
      </div>

      {/* Attribution Multi-Factor Scoring Breakdown */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-mono flex items-center justify-between">
          <span>Attribution Model Factor Decomposition</span>
          <span className="text-cyan-400 text-[11px]">Total: {vessel.overallScore.toFixed(1)} / 100</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">1. Spatial Proximity</span>
              <span className="font-mono text-white font-bold">{vessel.scores.proximityScore.toFixed(1)} / 35</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 rounded-full"
                style={{ width: `${(vessel.scores.proximityScore / 35) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Separation: {vessel.distanceAtEstimatedOriginKm.toFixed(1)} km</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">2. Temporal Fit</span>
              <span className="font-mono text-white font-bold">{vessel.scores.temporalScore.toFixed(1)} / 25</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-400 rounded-full"
                style={{ width: `${(vessel.scores.temporalScore / 25) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Offset: ±{vessel.timeDeltaAtOriginHours.toFixed(1)} h from origin</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">3. Vessel Type Risk</span>
              <span className="font-mono text-white font-bold">{vessel.scores.vesselTypeScore.toFixed(1)} / 20</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full"
                style={{ width: `${(vessel.scores.vesselTypeScore / 20) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">{vessel.vesselType}</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">4. Anomaly Flags</span>
              <span className="font-mono text-rose-400 font-bold">{vessel.scores.anomalyScore.toFixed(1)} / 20</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full"
                style={{ width: `${(vessel.scores.anomalyScore / 20) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">AIS blackouts + deceleration</p>
          </div>
        </div>
      </div>

      {/* Speed & Heading Timeline Profile */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Speed (Knots) & Heading (°T) Time Series</span>
          </h4>
          {vessel.anomaliesDetected.hasAisGap && (
            <span className="text-[11px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              AIS Signal Interruption Window: {vessel.anomaliesDetected.gapDurationHours}h
            </span>
          )}
        </div>

        <div className="p-4 bg-slate-950/90 rounded-lg border border-slate-800">
          {/* Custom SVG Bar / Line Profile */}
          <div className="relative h-44 w-full flex items-end gap-3 pt-6 pb-6 px-2">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 py-6">
              <div className="border-b border-dashed border-slate-400 text-[9px] font-mono text-slate-400">15 kts</div>
              <div className="border-b border-dashed border-slate-400 text-[9px] font-mono text-slate-400">10 kts</div>
              <div className="border-b border-dashed border-slate-400 text-[9px] font-mono text-slate-400">5 kts</div>
              <div className="border-b border-slate-600 text-[9px] font-mono text-slate-400">0 kts</div>
            </div>

            {/* Track Data Bars */}
            {vessel.trackHistory.map((point, idx) => {
              const heightPct = Math.min(100, Math.max(10, (point.speedKnots / maxSpeed) * 100));
              const isAnomalyPoint = point.speedKnots < 7.0 || point.status.includes('Gap');

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative z-10">
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center bg-slate-800 text-white text-[10px] p-2 rounded-md shadow-xl border border-slate-700 whitespace-nowrap z-30">
                    <span className="font-bold text-cyan-300">{point.timestamp.split('T')[1].substring(0, 5)} UTC</span>
                    <span>Speed: {point.speedKnots} kts</span>
                    <span>Heading: {point.headingDeg}°</span>
                    <span className="text-slate-400 text-[9px]">{point.status}</span>
                  </div>

                  {/* Speed Bar */}
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full max-w-[28px] rounded-t transition-all ${
                      isAnomalyPoint
                        ? 'bg-gradient-to-t from-rose-600 to-amber-400 animate-pulse'
                        : 'bg-gradient-to-t from-cyan-600 to-blue-400'
                    }`}
                  />

                  {/* Timestamp Label */}
                  <span className="text-[9px] font-mono text-slate-400 mt-2 rotate-[-30deg] origin-top-left">
                    {point.timestamp.split('T')[1].substring(0, 5)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-4 pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-cyan-400 rounded-sm" /> Normal Transit
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-sm" /> Deceleration / Discharge Anomaly
              </span>
            </div>
            <span>Coordinates: Lat {vessel.trackHistory[0].lat.toFixed(2)}°N to {vessel.trackHistory[vessel.trackHistory.length - 1].lat.toFixed(2)}°N</span>
          </div>
        </div>
      </div>
    </div>
  );
};
