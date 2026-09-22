import React, { useState, useEffect } from 'react';
import {
  Satellite,
  Bell,
  Radio,
  PlusCircle,
  Database,
  Layers,
  Sparkles
} from 'lucide-react';
import { DetectionResult } from '../../types';

interface TopBarProps {
  currentIncident: DetectionResult;
  onNewScanClick: () => void;
  onViewArchitectureClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentIncident,
  onNewScanClick,
  onViewArchitectureClick
}) => {
  const [currentTime, setCurrentTime] = useState(new Date().toUTCString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toUTCString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between z-20">
      {/* Left: Active Incident Context */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
          </span>
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            {currentIncident.id}
          </span>
        </div>

        <div className="h-4 w-px bg-slate-800 hidden sm:block" />

        <div className="hidden md:flex items-center gap-2 text-xs text-slate-300">
          <Satellite className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono text-cyan-300">
            {currentIncident.sarMetadata.satellite} ({currentIncident.sarMetadata.mode})
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 truncate max-w-xs">
            {currentIncident.spill.properties.locationName}
          </span>
          <span className="text-slate-500">•</span>
          <span className="font-mono text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
            {currentIncident.spill.properties.areaKm2} km²
          </span>
        </div>
      </div>

      {/* Right: Live Telemetry, UTC Clock, Actions */}
      <div className="flex items-center gap-3">
        {/* Real-time UTC Clock */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] font-mono text-slate-400">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>UTC: {currentTime.replace("GMT", "")}</span>
        </div>

        {/* SIH Documentation & Architecture Shortcut */}
        <button
          id="btn-view-architecture"
          onClick={onViewArchitectureClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
          title="Open SIH26143 Architecture & PPT Pitch Deck"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Pitch & Architecture</span>
        </button>

        {/* Trigger New Scan Button */}
        <button
          id="btn-topbar-new-scan"
          onClick={onNewScanClick}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New SAR Scan</span>
        </button>
      </div>
    </header>
  );
};
