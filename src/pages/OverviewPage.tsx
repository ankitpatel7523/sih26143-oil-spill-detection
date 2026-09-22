import React from 'react';
import { MetricCard } from '../components/common/MetricCard';
import { ConfidenceBadge } from '../components/common/ConfidenceBadge';
import {
  AlertOctagon,
  Scan,
  Droplets,
  Ship,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Compass,
  PlusCircle,
  Clock,
  Radio
} from 'lucide-react';
import { DetectionResult, PastIncident } from '../types';
import { NavPage } from '../components/layout/Sidebar';

interface OverviewPageProps {
  currentIncident: DetectionResult;
  pastIncidents: PastIncident[];
  onNavigate: (page: NavPage) => void;
  onSelectVesselByMmsi: (mmsi: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  currentIncident,
  pastIncidents,
  onNavigate,
  onSelectVesselByMmsi
}) => {
  const confirmedSpillsCount = pastIncidents.filter(i => i.status === 'Confirmed' || i.status === 'Prosecuted / Actioned').length;
  const topSuspects = currentIncident.candidateVessels.slice(0, 4);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Maritime Situational Awareness Dashboard</span>
            <span className="text-xs font-mono font-normal bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded">
              EEZ Surveillance
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time automated Sentinel-1 SAR ingestion, hydro-drift modeling, and AIS correlation for NTRO
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-overview-new-scan"
            onClick={() => onNavigate('upload-detect')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New SAR Scan</span>
          </button>
        </div>
      </div>

      {/* Top Row: 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          id="metric-active-alerts"
          title="Active Alerts"
          value="1 Critical"
          change="+1 in 24h"
          isPositive={false}
          icon={AlertOctagon}
          color="rose"
          onClick={() => onNavigate('spill-drift-map')}
        />
        <MetricCard
          id="metric-scenes-scanned"
          title="Scenes Scanned"
          value="142"
          change="+18 this week"
          isPositive={true}
          icon={Scan}
          color="blue"
          onClick={() => onNavigate('upload-detect')}
        />
        <MetricCard
          id="metric-confirmed-spills"
          title="Confirmed Spills"
          value={confirmedSpillsCount}
          change="+2 vs last mo"
          isPositive={false}
          icon={Droplets}
          color="amber"
          onClick={() => onNavigate('past-incidents')}
        />
        <MetricCard
          id="metric-vessels-flagged"
          title="Vessels Flagged"
          value="7"
          change="3 Prosecuted"
          isPositive={true}
          icon={Ship}
          color="emerald"
          onClick={() => onNavigate('suspect-vessels')}
        />
      </div>

      {/* Main Split: Left Panel (Latest Detection Mini-Map Preview) & Right Panel (Top Suspects) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel (7 cols): Latest Detection Mini-Map Preview */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  Latest Detection: {currentIncident.id}
                </h3>
              </div>
              <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                {currentIncident.spill.properties.areaKm2} km² Area
              </span>
            </div>

            {/* Clickable Mini-Map Visual Thumbnail */}
            <div
              onClick={() => onNavigate('spill-drift-map')}
              className="group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-[16/9] cursor-pointer hover:border-cyan-500/50 transition-all shadow-inner"
            >
              {/* Stylized Maritime Radar Grid Preview */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

              {/* SAR Scene Representation */}
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="relative w-full h-full border border-cyan-500/30 rounded-lg bg-slate-900/60 p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Sentinel-1A IW Swath</span>
                    <span>18.842°N, 71.961°E</span>
                  </div>

                  {/* Visual Polygon & Drift Path SVG */}
                  <div className="relative w-full h-28 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 300 100">
                      {/* Backward drift line */}
                      <path
                        d="M 60 40 Q 120 45 180 55 T 240 65"
                        fill="none"
                        stroke="#fbbf24"
                        strokeWidth="2.5"
                        strokeDasharray="4 4"
                      />
                      {/* Origin point */}
                      <circle cx="60" cy="40" r="6" fill="#d97706" stroke="#ffffff" strokeWidth="2" />
                      <text x="50" y="25" fill="#f59e0b" fontSize="10" fontFamily="monospace" fontWeight="bold">
                        T - 9.5h Origin
                      </text>

                      {/* Spill polygon */}
                      <polygon
                        points="230,55 260,50 275,68 250,78 225,70"
                        fill="#881337"
                        stroke="#f43f5e"
                        strokeWidth="2"
                      />
                      <text x="220" y="90" fill="#f43f5e" fontSize="10" fontFamily="monospace" fontWeight="bold">
                        Detected Slick (24.65 km²)
                      </text>

                      {/* Top vessel trajectory intersection */}
                      <path
                        d="M 20 80 L 60 40 L 110 30 L 280 15"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2"
                      />
                      <circle cx="62" cy="40" r="4" fill="#38bdf8" />
                      <text x="75" y="42" fill="#38bdf8" fontSize="9" fontFamily="monospace">
                        MT OCEAN GLORY (AIS Gap)
                      </text>
                    </svg>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-800/80 pt-2">
                    <span className="flex items-center gap-1 text-amber-400">
                      <Clock className="w-3 h-3" />
                      Backward Drift: 12h Simulated (OpenDrift)
                    </span>
                    <span className="text-cyan-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Click to open Interactive Map <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Hover overlay hint */}
              <div className="absolute inset-0 bg-cyan-950/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-cyan-500 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-xl">
                  <Compass className="w-4 h-4" /> Open Full GIS Drift Workspace
                </span>
              </div>
            </div>

            {/* Quick Context Stats */}
            <div className="grid grid-cols-3 gap-3 mt-4 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase">Detection Time</p>
                <p className="font-semibold text-slate-200 mt-0.5">{currentIncident.timestamp.replace("T", " ").replace("Z", " UTC")}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase">Estimated Volume</p>
                <p className="font-semibold text-amber-400 mt-0.5">{currentIncident.spill.properties.estimatedVolumeM3} m³ (Bunker)</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase">ML Model Confidence</p>
                <p className="font-semibold text-emerald-400 mt-0.5">{(currentIncident.mlMetrics.oilSpillProbability * 100).toFixed(1)}% (IoU 0.88)</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 truncate max-w-sm">
              Location: <strong>{currentIncident.spill.properties.locationName}</strong>
            </span>
            <button
              onClick={() => onNavigate('spill-drift-map')}
              className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
            >
              Full Screen Map <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Panel (5 cols): "Top suspect vessels" quick list */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Ship className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  Top Suspect Vessels
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                Ranked by AIS Engine
              </span>
            </div>

            <div className="space-y-3">
              {topSuspects.map((vessel) => {
                const isTop = vessel.rank === 1;
                return (
                  <div
                    key={vessel.mmsi}
                    onClick={() => {
                      onSelectVesselByMmsi(vessel.mmsi);
                      onNavigate('suspect-vessels');
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isTop
                        ? 'bg-gradient-to-r from-rose-950/40 to-slate-900 border-rose-500/40 hover:border-rose-500'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                              isTop ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            #{vessel.rank}
                          </span>
                          <span className="font-bold text-xs text-white tracking-tight">
                            {vessel.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">[{vessel.flag}]</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {vessel.vesselType} • {vessel.dwt.toLocaleString()} DWT
                        </p>
                      </div>

                      <div className="text-right">
                        <ConfidenceBadge score={vessel.overallScore} size="sm" />
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Dist: <strong className={vessel.distanceAtEstimatedOriginKm < 5 ? 'text-rose-400' : 'text-slate-300'}>{vessel.distanceAtEstimatedOriginKm.toFixed(1)} km</strong></span>
                      <span>Time: ±{vessel.timeDeltaAtOriginHours.toFixed(1)}h</span>
                      {vessel.anomaliesDetected.hasAisGap && (
                        <span className="text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20 text-[10px]">
                          AIS GAP ({vessel.anomaliesDetected.gapDurationHours}h)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <button
              onClick={() => onNavigate('suspect-vessels')}
              className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <span>View Full Attribution Table & Velocity Profiles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Intelligence Operational Notes Bar */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3 text-xs text-slate-300">
        <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-white">NTRO Investigative Protocol: </span>
          Attribution scores combine Euclidean distance from the reverse-advected origin, temporal alignment, historical deadweight discharge risk, and AIS transponder interruptions. Output serves as prioritized investigative leads for MRCC/Coast Guard interdiction.
        </div>
      </div>
    </div>
  );
};
