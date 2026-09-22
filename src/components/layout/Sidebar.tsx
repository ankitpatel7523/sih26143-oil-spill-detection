import React from 'react';
import {
  LayoutDashboard,
  UploadCloud,
  Compass,
  Ship,
  FileSpreadsheet,
  History,
  Settings,
  ShieldCheck,
  Code2,
  ChevronRight
} from 'lucide-react';

export type NavPage =
  | 'overview'
  | 'upload-detect'
  | 'spill-drift-map'
  | 'suspect-vessels'
  | 'incident-report'
  | 'past-incidents'
  | 'settings'
  | 'architecture-docs';

interface SidebarProps {
  currentPage: NavPage;
  onSelectPage: (page: NavPage) => void;
  activeAlertCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  activeAlertCount = 1
}) => {
  const navItems = [
    { id: 'overview' as NavPage, label: 'Overview', icon: LayoutDashboard },
    { id: 'upload-detect' as NavPage, label: 'Upload / Detect', icon: UploadCloud, badge: 'SAR ML' },
    { id: 'spill-drift-map' as NavPage, label: 'Spill & Drift Map', icon: Compass, badge: 'Live GIS' },
    { id: 'suspect-vessels' as NavPage, label: 'Suspect Vessels', icon: Ship, alertBadge: activeAlertCount },
    { id: 'incident-report' as NavPage, label: 'Incident Dossier', icon: FileSpreadsheet },
    { id: 'past-incidents' as NavPage, label: 'Past Incidents', icon: History },
    { id: 'settings' as NavPage, label: 'Settings & Feeds', icon: Settings },
    { id: 'architecture-docs' as NavPage, label: 'Architecture & SIH Pitch', icon: Code2 }
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-900/90 border-r border-slate-800/80 flex flex-col justify-between select-none z-30">
      <div>
        {/* Organization Brand Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-md shadow-cyan-500/20 text-white font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold tracking-tight text-white font-mono">
                NTRO SAT-AIS
              </h1>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.2 rounded font-mono">
                SIH26143
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[155px]">
              Oil Spill & Vessel Attribution
            </p>
          </div>
        </div>

        {/* Security & System Classification Banner */}
        <div className="mx-3 mt-3 px-2.5 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            LIVE SENSOR INGEST
          </span>
          <span className="text-amber-400/90 font-semibold">RESTRICTED</span>
        </div>

        {/* Navigation Items */}
        <nav className="mt-4 px-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => onSelectPage(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                      {item.badge}
                    </span>
                  )}
                  {item.alertBadge && item.alertBadge > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold">
                      {item.alertBadge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Info */}
      <div className="p-3 m-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
        <div className="flex items-center justify-between text-slate-400 text-[11px]">
          <span>Pipeline Status</span>
          <span className="text-emerald-400 font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Operational
          </span>
        </div>
        <div className="mt-2 text-[10px] text-slate-500 font-mono space-y-0.5">
          <p>U-Net Segmentation: <span className="text-slate-300">PyTorch v2.3</span></p>
          <p>Drift Solver: <span className="text-slate-300">OpenDrift 1.11</span></p>
          <p>AIS Buffer: <span className="text-slate-300">50km / ±12h</span></p>
        </div>
      </div>
    </aside>
  );
};
