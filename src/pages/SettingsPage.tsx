import React, { useState, useEffect } from 'react';
import {
  Settings,
  Sliders,
  Database,
  Satellite,
  Radio,
  Save,
  CheckCircle2,
  Cpu,
  Shield,
  Key,
  Users,
  Eye,
  EyeOff
} from 'lucide-react';
import { StorageService, SystemSettings } from '../services/storageService';

export const SettingsPage: React.FC = () => {
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Settings State
  const [copernicusUser, setCopernicusUser] = useState('ntro_mda_operator');
  const [aisSource, setAisSource] = useState<'aisstream' | 'noaa' | 'coastguard' | 'custom_csv'>('aisstream');
  const [driftWindowHours, setDriftWindowHours] = useState(12);
  const [bufferRadiusKm, setBufferRadiusKm] = useState(50);
  const [windageFactor, setWindageFactor] = useState(3.0);
  const [iouThreshold, setIouThreshold] = useState(0.80);
  const [oceanDataSource, setOceanDataSource] = useState<'oscar' | 'hycom' | 'copernicus_marine' | 'incois'>('oscar');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [autoAlertCoastGuard, setAutoAlertCoastGuard] = useState(true);

  // Load from StorageService on mount
  useEffect(() => {
    const s = StorageService.getSettings();
    setCopernicusUser(s.copernicusUser);
    setAisSource(s.aisSource);
    setDriftWindowHours(s.driftWindowHours);
    setBufferRadiusKm(s.bufferRadiusKm);
    setWindageFactor(s.windageFactor);
    setIouThreshold(s.iouThreshold);
    setOceanDataSource(s.oceanDataSource);
    setGeminiApiKey(s.geminiApiKey || '');
    setAutoAlertCoastGuard(s.autoAlertCoastGuard);
  }, []);

  const handleSave = () => {
    const updated: SystemSettings = {
      copernicusUser,
      aisSource,
      driftWindowHours,
      bufferRadiusKm,
      windageFactor,
      diffusionCoeffM2s: 10.0,
      iouThreshold,
      oceanDataSource,
      geminiApiKey,
      autoAlertCoastGuard
    };

    StorageService.saveSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>System Settings & Operational Sensor Configuration</span>
            <span className="text-xs font-mono font-normal bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded">
              Admin
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure Copernicus Sentinel-1 API, live AIS streams, hydrodynamic drift physics, and ML inference cutoffs
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
        >
          {savedSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-950" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? 'Settings Saved' : 'Save Configuration'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Operational parameters successfully saved and synchronized across the detection and drift engines.</span>
        </div>
      )}

      {/* Grid: 4 Main Settings Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Data Ingestion & API Feeds */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2 pb-2 border-b border-slate-800">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>1. Satellite & AIS Data Sources</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-mono mb-1">Copernicus Hub Account</label>
              <input
                type="text"
                value={copernicusUser}
                onChange={(e) => setCopernicusUser(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-mono mb-1">AIS Stream Protocol</label>
              <select
                value={aisSource}
                onChange={(e) => setAisSource(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-mono"
              >
                <option value="aisstream">AISStream.io (Live WebSocket Feed)</option>
                <option value="noaa">NOAA MarineCadastre (Historical Archive)</option>
                <option value="coastguard">Indian Coast Guard AIS Ingest (Restricted)</option>
                <option value="custom_csv">Custom AIS CSV Upload Mode</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-mono mb-1">Ocean Hydrodynamics Source</label>
              <select
                value={oceanDataSource}
                onChange={(e) => setOceanDataSource(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-mono"
              >
                <option value="oscar">OSCAR 1/3° Surface Currents (NASA/JPL)</option>
                <option value="hycom">HYCOM 1/12° Global High-Resolution Ocean Model</option>
                <option value="incois">INCOIS Coastal Current Forecast (Indian EEZ)</option>
                <option value="copernicus_marine">Copernicus Marine Service (CMEMS)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Hydrodynamic Drift Simulation Parameters */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2 pb-2 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>2. Backward Drift Physics Parameters</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-mono mb-1">
                <span className="text-slate-400">Backward Simulation Time Window:</span>
                <span className="text-cyan-300 font-bold">{driftWindowHours} hours</span>
              </div>
              <input
                type="range"
                min="4"
                max="24"
                step="1"
                value={driftWindowHours}
                onChange={(e) => setDriftWindowHours(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400"
              />
              <span className="text-[10px] text-slate-500 font-mono">Max reverse advection window prior to SAR capture</span>
            </div>

            <div>
              <div className="flex justify-between font-mono mb-1">
                <span className="text-slate-400">Spatio-Temporal AIS Buffer Radius:</span>
                <span className="text-cyan-300 font-bold">{bufferRadiusKm} km</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="5"
                value={bufferRadiusKm}
                onChange={(e) => setBufferRadiusKm(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400"
              />
              <span className="text-[10px] text-slate-500 font-mono">Search radius around reverse drift origin centroid</span>
            </div>

            <div>
              <div className="flex justify-between font-mono mb-1">
                <span className="text-slate-400">Surface Windage Leeway Factor:</span>
                <span className="text-amber-300 font-bold">{windageFactor.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.1"
                value={windageFactor}
                onChange={(e) => setWindageFactor(parseFloat(e.target.value))}
                className="w-full accent-amber-400"
              />
              <span className="text-[10px] text-slate-500 font-mono">Standard maritime petroleum leeway ratio (typically 2.8% - 3.4%)</span>
            </div>
          </div>
        </div>

        {/* Section 3: Machine Learning Model Benchmarks & Gemini AI */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2 pb-2 border-b border-slate-800">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>3. ML Detection Cutoffs & Gemini AI Key</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-mono mb-1">
                <span className="text-slate-400">U-Net IoU Acceptance Threshold:</span>
                <span className="text-emerald-400 font-bold">{iouThreshold.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.60"
                max="0.95"
                step="0.05"
                value={iouThreshold}
                onChange={(e) => setIouThreshold(parseFloat(e.target.value))}
                className="w-full accent-emerald-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-mono mb-1 flex items-center justify-between">
                <span>Google Gemini API Key (Multimodal Vision)</span>
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="text-cyan-400 text-[10px] hover:underline flex items-center gap-1"
                >
                  {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showApiKey ? 'Hide' : 'Show'}</span>
                </button>
              </label>
              <input
                type={showApiKey ? "text" : "password"}
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="AIzaSy... (Enables live AI SAR forensic analysis)"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-mono text-[11px]"
              />
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                Optional: If omitted, embedded client-side computer vision heuristics operate 100% offline.
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Model 1: U-Net Segmentation</span>
                <span className="text-white">ResNet-34 Backbone (IoU 0.884)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Model 2: Look-Alike Classifier</span>
                <span className="text-white">Gemini 2.5 Flash / ResNet-50</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Operational Access & Dispatch Control */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2 pb-2 border-b border-slate-800">
            <Users className="w-4 h-4 text-purple-400" />
            <span>4. Operational Dispatch & Interdiction</span>
          </h3>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <div>
                <p className="font-semibold text-white">Automated Coast Guard Dispatch</p>
                <p className="text-[10px] text-slate-400">Push high-confidence alerts (&gt;90%) to MRCC</p>
              </div>
              <input
                type="checkbox"
                checked={autoAlertCoastGuard}
                onChange={(e) => setAutoAlertCoastGuard(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <div>
                <p className="font-semibold text-white">Commander Maritime Cell (Admin)</p>
                <p className="text-[10px] text-slate-400">Full override & MRCC dispatch authority</p>
              </div>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded">Active Session</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
