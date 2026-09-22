import React, { useRef } from 'react';
import { SuspectVessel, DetectionResult } from '../types';
import { VesselTable } from '../components/vessels/VesselTable';
import { VesselTrajectoryChart } from '../components/vessels/VesselTrajectoryChart';
import {
  Ship,
  Compass,
  AlertTriangle,
  ShieldAlert,
  Radio,
  FileSpreadsheet,
  ExternalLink,
  ChevronRight,
  Upload,
  Download,
  Database
} from 'lucide-react';
import { parseAISCsv, scoreVessel } from '../services/aisAttributionEngine';

interface SuspectVesselsPageProps {
  detection: DetectionResult;
  selectedVessel: SuspectVessel | null;
  onSelectVessel: (vessel: SuspectVessel) => void;
  onNavigateToMap: () => void;
  onNavigateToReport: () => void;
  onUpdateDetection?: (updated: DetectionResult) => void;
}

export const SuspectVesselsPage: React.FC<SuspectVesselsPageProps> = ({
  detection,
  selectedVessel,
  onSelectVessel,
  onNavigateToMap,
  onNavigateToReport,
  onUpdateDetection
}) => {
  const activeVessel = selectedVessel || detection.candidateVessels[0];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const originPoint = detection.driftSimulation.estimatedOriginPoint;
  const originTime = detection.driftSimulation.originTimestamp;

  const processAisText = (csvText: string) => {
    const rawRecords = parseAISCsv(csvText);

    if (rawRecords.length === 0) {
      alert("Could not parse valid AIS tracks from the uploaded CSV. Ensure headers include MMSI, Lat, Lon, and Timestamp.");
      return;
    }

    // Group records by MMSI
    const groups = new Map<string, typeof rawRecords>();
    rawRecords.forEach((r) => {
      if (!groups.has(r.mmsi)) groups.set(r.mmsi, []);
      groups.get(r.mmsi)!.push(r);
    });

    // Score each vessel against current origin point
    const scoredVessels: SuspectVessel[] = [];
    groups.forEach((pts, mmsi) => {
      pts.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      const vesselInfo = {
        mmsi,
        name: pts[0].vesselName || `Vessel ${mmsi}`,
        vesselType: (pts[0].vesselType as any) || "Bulk Carrier",
        dwt: pts[0].dwt || 65000,
        flag: pts[0].flag || "PA",
        country: "International",
        operator: "Commercial Fleet Operator",
        callSign: pts[0].callSign || "CALL9",
        imo: pts[0].imo || "9123456",
        trackHistory: pts.map((p) => ({
          timestamp: p.timestamp,
          lat: p.lat,
          lng: p.lng,
          speedKnots: p.sogKnots,
          headingDeg: p.cogDeg,
          status: p.sogKnots < 5.0 ? "Speed Dropping" : "Underway",
        })),
      };

      const scored = scoreVessel(vesselInfo, originPoint, originTime);
      scoredVessels.push(scored);
    });

    scoredVessels.sort((a, b) => b.overallScore - a.overallScore);
    scoredVessels.forEach((v, idx) => {
      v.rank = idx + 1;
    });

    const updatedDetection = {
      ...detection,
      candidateVessels: scoredVessels,
    };

    if (onUpdateDetection) {
      onUpdateDetection(updatedDetection);
    }
    if (scoredVessels.length > 0) {
      onSelectVessel(scoredVessels[0]);
    }
  };

  // Handle custom AIS CSV upload
  const handleAisCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target?.result as string;
      processAisText(csvText);
      alert(`Successfully parsed ${file.name} across maritime vessels!`);
    };
    reader.readAsText(file);
  };

  // 1-Click Load Real Arabian Sea AIS Dataset
  const handleLoadRealAisDataset = async () => {
    try {
      const res = await fetch('/sample_ais/arabian_sea_tanker_corridor_ais.csv');
      if (res.ok) {
        const text = await res.text();
        processAisText(text);
        alert("Real Arabian Sea Tanker Corridor AIS Dataset loaded (132 tracking pings across commercial ships)!");
      }
    } catch (e) {
      console.error("Failed to load sample AIS CSV:", e);
    }
  };

  // Export Suspects CSV
  const handleExportCSV = () => {
    const headers = [
      "Rank",
      "Vessel Name",
      "MMSI",
      "IMO",
      "Vessel Type",
      "Flag",
      "Overall Attribution Score (%)",
      "Distance at Origin (km)",
      "Time Delta (hours)",
      "AIS Blackout Detected",
      "Speed Drop Detected",
      "Justification"
    ];

    const rows = detection.candidateVessels.map(v => [
      v.rank,
      `"${v.name}"`,
      v.mmsi,
      v.imo,
      `"${v.vesselType}"`,
      v.flag,
      v.overallScore,
      v.distanceAtEstimatedOriginKm,
      v.timeDeltaAtOriginHours,
      v.anomaliesDetected.hasAisGap ? "YES" : "NO",
      v.anomaliesDetected.hasSpeedDrop ? "YES" : "NO",
      `"${v.justification.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NTRO_Suspect_Vessels_${detection.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Hidden File Input for AIS CSV */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAisCsvUpload}
        accept=".csv, text/csv"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>AIS Spatiotemporal Correlation & Vessel Attribution</span>
            <span className="text-xs font-mono font-normal bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded">
              Ranked Suspects
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Querying AIS marine records within 50 km buffer around backward drift origin [{originPoint[0].toFixed(3)}°N, {originPoint[1].toFixed(3)}°E]
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleLoadRealAisDataset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-950/70 hover:bg-cyan-900 text-xs font-semibold text-cyan-300 border border-cyan-700/60 shadow-sm transition-colors"
            title="Load real 132-ping Arabian Sea Tanker Corridor AIS CSV"
          >
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Load Real AIS (132 Pings)</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
          >
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Upload AIS CSV</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onNavigateToMap}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>View GIS Map</span>
          </button>
          <button
            onClick={onNavigateToReport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Generate NTRO Report</span>
          </button>
        </div>
      </div>

      {/* Dark Vessel Alert (if applicable) */}
      {detection.darkVesselDetected && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-600/60 shadow-xl flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5 animate-pulse" />
          <div>
            <h4 className="text-sm font-bold text-rose-200 font-mono">
              CRITICAL INTELLIGENCE: UNIDENTIFIED DARK VESSEL EVASION DETECTED
            </h4>
            <p className="text-xs text-rose-300/90 mt-1 leading-relaxed">
              {detection.darkVesselReason}
            </p>
            <div className="mt-2 text-[11px] font-mono text-rose-400 bg-rose-900/40 px-2.5 py-1 rounded inline-block">
              Action: Satellite optical tasking (Sentinel-2 / PlanetScope) & aerial coastal patrol cross-verification recommended.
            </div>
          </div>
        </div>
      )}

      {/* Selected Vessel Deep Dive: Trajectory & Anomaly Chart */}
      {activeVessel && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400">
              Active Forensic Focus: Rank #{activeVessel.rank} — {activeVessel.name}
            </span>
            <span className="text-xs text-cyan-400 font-mono">
              Click any vessel below to switch focus
            </span>
          </div>
          <VesselTrajectoryChart vessel={activeVessel} />
        </div>
      )}

      {/* Attribution Table with Sorting and Filter Controls */}
      <div>
        <VesselTable
          vessels={detection.candidateVessels}
          selectedVessel={activeVessel}
          onSelectVessel={onSelectVessel}
        />
      </div>

      {/* NTRO Investigative Guidelines Callout */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 leading-relaxed">
        <h5 className="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          <span>Legal & Intelligence Evidentiary Standards (MARPOL Annex I)</span>
        </h5>
        <p>
          AIS broadcasts can experience atmospheric attenuation or intentional transponder tampering (spoofing / disabling). The attribution confidence index is designed for operational lead generation and maritime interdiction tasking. Physical oily water separator (OWS) logbook inspection, bilge valve seal verification, and GC-MS hydrocarbon fingerprinting are mandatory for definitive legal prosecution under MARPOL Annex I.
        </p>
      </div>
    </div>
  );
};
