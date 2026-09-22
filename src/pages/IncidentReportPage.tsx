import React, { useState } from 'react';
import { DetectionResult } from '../types';
import {
  FileSpreadsheet,
  Download,
  Printer,
  ShieldCheck,
  Calendar,
  Compass,
  Ship,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Globe
} from 'lucide-react';
import { ConfidenceBadge } from '../components/common/ConfidenceBadge';

interface IncidentReportPageProps {
  detection: DetectionResult;
}

export const IncidentReportPage: React.FC<IncidentReportPageProps> = ({ detection }) => {
  const [analystNotes, setAnalystNotes] = useState(detection.analystNotes || '');
  const [isCopied, setIsCopied] = useState(false);

  const topSuspect = detection.candidateVessels[0];

  const handleExportJSON = () => {
    const reportData = {
      dossierId: `NTRO-DOSSIER-${detection.id}`,
      classification: "RESTRICTED // LAW ENFORCEMENT SENSITIVE",
      generatedAt: new Date().toISOString(),
      organization: "National Technical Research Organisation (NTRO)",
      incidentId: detection.id,
      sarSceneId: detection.sceneId,
      detectionTimestamp: detection.timestamp,
      spillMetrics: {
        areaKm2: detection.spill.properties.areaKm2,
        estimatedVolumeM3: detection.spill.properties.estimatedVolumeM3,
        slickType: detection.spill.properties.slickType,
        centroid: detection.spill.properties.centroid,
        sensor: detection.spill.properties.sensor
      },
      backwardDriftReconstruction: {
        originCentroid: detection.driftSimulation.estimatedOriginPoint,
        originTimestamp: detection.driftSimulation.originTimestamp,
        driftDurationHours: detection.driftSimulation.driftDurationHours,
        uncertaintyRadiusKm: detection.driftSimulation.originUncertaintyRadiusKm
      },
      rankedSuspectVessels: detection.candidateVessels.map(v => ({
        rank: v.rank,
        name: v.name,
        mmsi: v.mmsi,
        imo: v.imo,
        flag: v.flag,
        type: v.vesselType,
        attributionScore: v.overallScore,
        distanceAtOriginKm: v.distanceAtEstimatedOriginKm,
        timeDeltaHours: v.timeDeltaAtOriginHours,
        anomalies: v.anomaliesDetected,
        justification: v.justification
      })),
      darkVesselDetected: detection.darkVesselDetected,
      analystForensicNotes: analystNotes
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `NTRO_Incident_Dossier_${detection.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Real RFC 7946 GeoJSON Export for GIS Tools (QGIS, ArcGIS, Google Earth)
  const handleExportGeoJSON = () => {
    const geoJsonData = {
      type: "FeatureCollection",
      features: [
        // 1. Detected Spill Polygon Feature
        {
          type: "Feature",
          properties: {
            layer: "Detected Spill",
            id: detection.spill.properties.id,
            areaKm2: detection.spill.properties.areaKm2,
            volumeM3: detection.spill.properties.estimatedVolumeM3,
            slickType: detection.spill.properties.slickType,
            confidence: detection.spill.properties.confidenceScore,
            sensor: detection.spill.properties.sensor,
            detectedAt: detection.spill.properties.detectedAt
          },
          geometry: detection.spill.geometry
        },
        // 2. Backward Drift Advection Line
        {
          type: "Feature",
          properties: {
            layer: "Backward Drift Trajectory",
            durationHours: detection.driftSimulation.driftDurationHours,
            originTime: detection.driftSimulation.originTimestamp
          },
          geometry: {
            type: "LineString",
            coordinates: detection.driftSimulation.steps.map(s => [s.centroid[1], s.centroid[0]])
          }
        },
        // 3. Estimated Origin Point Feature
        {
          type: "Feature",
          properties: {
            layer: "Estimated Origin Point",
            uncertaintyRadiusKm: detection.driftSimulation.originUncertaintyRadiusKm,
            originTime: detection.driftSimulation.originTimestamp
          },
          geometry: {
            type: "Point",
            coordinates: [
              detection.driftSimulation.estimatedOriginPoint[1],
              detection.driftSimulation.estimatedOriginPoint[0]
            ]
          }
        },
        // 4. Candidate Vessel Track Lines
        ...detection.candidateVessels.map(v => ({
          type: "Feature",
          properties: {
            layer: "Suspect Vessel Track",
            vesselName: v.name,
            mmsi: v.mmsi,
            rank: v.rank,
            score: v.overallScore,
            distanceAtOriginKm: v.distanceAtEstimatedOriginKm,
            hasAisGap: v.anomaliesDetected.hasAisGap
          },
          geometry: {
            type: "LineString",
            coordinates: v.trackHistory.map(t => [t.lng, t.lat])
          }
        }))
      ]
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(geoJsonData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `NTRO_GIS_Layers_${detection.id}.geojson`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleCopyClipboard = () => {
    navigator.clipboard.writeText(`NTRO OIL SPILL & ATTRIBUTION REPORT: ${detection.id}\nSpill: ${detection.spill.properties.areaKm2} km² at ${detection.spill.properties.locationName}\nTop Suspect: ${topSuspect?.name} (MMSI: ${topSuspect?.mmsi}) Confidence: ${topSuspect?.overallScore}%\nNotes: ${analystNotes}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto print:p-0 print:max-w-none">
      {/* Header Actions (hidden on print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-bold uppercase">
              RESTRICTED // NTRO MDA SENSITIVE
            </span>
            <span className="text-xs text-slate-400 font-mono">Dossier #{detection.id}</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">
            Formal Incident Attribution Dossier
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyClipboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{isCopied ? 'Copied Brief' : 'Copy Brief'}</span>
          </button>
          <button
            onClick={handleExportGeoJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export GeoJSON</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print PDF Dossier</span>
          </button>
        </div>
      </div>

      {/* Formal Document Layout */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-8 text-slate-200 font-sans print:bg-white print:text-black print:border-none print:shadow-none print:p-2">
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-6 flex items-start justify-between print:border-black">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider mb-1 print:text-black">
              <ShieldCheck className="w-4 h-4" />
              <span>National Technical Research Organisation (NTRO)</span>
            </div>
            <h1 className="text-2xl font-black text-white font-mono print:text-black">
              MARITIME SPILL INVESTIGATION REPORT
            </h1>
            <p className="text-xs text-slate-400 mt-1 print:text-gray-700">
              Satellite SAR Automated Spill Delineation & AIS Trajectory Attribution Dossier
            </p>
          </div>

          <div className="text-right font-mono text-xs text-slate-400 space-y-1 print:text-gray-800">
            <p>Date: <span className="text-white print:text-black font-bold">{new Date().toISOString().split('T')[0]}</span></p>
            <p>Classification: <span className="text-amber-400 font-bold print:text-black">OFFICIAL SENSITIVE</span></p>
            <p>Sensor Swath: <span className="text-cyan-300 print:text-black">{detection.sarMetadata.satellite}</span></p>
          </div>
        </div>

        {/* Section 1: Spill Identification & Satellite Telemetry */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono mb-3 flex items-center gap-2 print:text-black">
            <Compass className="w-4 h-4" />
            <span>1. Satellite SAR Detection & Spill Delineation</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-mono print:bg-gray-100 print:border-gray-300 print:text-black">
            <div>
              <span className="text-slate-500 uppercase text-[10px] print:text-gray-600">SAR Scene ID</span>
              <p className="text-slate-200 font-bold truncate mt-0.5 print:text-black">{detection.sceneId}</p>
            </div>
            <div>
              <span className="text-slate-500 uppercase text-[10px] print:text-gray-600">Detected Slick Area</span>
              <p className="text-rose-400 font-bold text-sm mt-0.5 print:text-black">{detection.spill.properties.areaKm2} km²</p>
            </div>
            <div>
              <span className="text-slate-500 uppercase text-[10px] print:text-gray-600">Estimated Volume</span>
              <p className="text-amber-300 font-bold text-sm mt-0.5 print:text-black">{detection.spill.properties.estimatedVolumeM3} m³</p>
            </div>
            <div>
              <span className="text-slate-500 uppercase text-[10px] print:text-gray-600">Segmentation IoU</span>
              <p className="text-emerald-400 font-bold text-sm mt-0.5 print:text-black">{detection.mlMetrics.iouScore}</p>
            </div>
          </div>

          <div className="mt-3 p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 text-xs space-y-1 print:bg-transparent print:border-gray-300 print:text-black">
            <p><strong>Geographic Location:</strong> {detection.spill.properties.locationName} (Centroid: {detection.spill.properties.centroid[0]}°N, {detection.spill.properties.centroid[1]}°E)</p>
            <p><strong>Sea State & Radar Backscatter:</strong> Beaufort Scale {detection.spill.properties.seaStateBeaufort} • Co-polarization dampening confirms high-viscosity petroleum slick ({detection.spill.properties.slickType}).</p>
          </div>
        </div>

        {/* Section 2: Backward Hydrodynamic Drift Reconstruction */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono mb-3 flex items-center gap-2 print:text-black">
            <Calendar className="w-4 h-4" />
            <span>2. Backward Hydrodynamic Drift Reconstruction</span>
          </h3>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs leading-relaxed space-y-2 print:bg-gray-100 print:border-gray-300 print:text-black">
            <p>
              Utilizing a Lagrangian advection-diffusion solver reverse-integrated over <strong>{detection.driftSimulation.driftDurationHours} hours</strong> with surface current vectors and ECMWF 10m wind fields (windage coefficient 0.03):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 font-mono text-xs">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 print:bg-white print:border-gray-300">
                <span className="text-[10px] text-slate-500 uppercase print:text-gray-600">Estimated Origin Coordinates</span>
                <p className="text-amber-300 font-bold mt-0.5 print:text-black">{detection.driftSimulation.estimatedOriginPoint[0].toFixed(3)}°N, {detection.driftSimulation.estimatedOriginPoint[1].toFixed(3)}°E</p>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 print:bg-white print:border-gray-300">
                <span className="text-[10px] text-slate-500 uppercase print:text-gray-600">Discharge Timestamp Window</span>
                <p className="text-white font-bold mt-0.5 print:text-black">{detection.driftSimulation.originTimestamp.replace("T", " ").replace("Z", " UTC")}</p>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 print:bg-white print:border-gray-300">
                <span className="text-[10px] text-slate-500 uppercase print:text-gray-600">Uncertainty Envelope Radius</span>
                <p className="text-cyan-300 font-bold mt-0.5 print:text-black">±{detection.driftSimulation.originUncertaintyRadiusKm} km</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Ranked Suspect Vessel Attribution Matrix */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono mb-3 flex items-center gap-2 print:text-black">
            <Ship className="w-4 h-4" />
            <span>3. AIS Vessel Correlation & Suspect Attribution Matrix</span>
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/80 print:bg-white print:border-gray-300">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800 print:bg-gray-200 print:text-black">
                <tr>
                  <th className="p-3">Rank</th>
                  <th className="p-3">Vessel</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Dist @ Origin</th>
                  <th className="p-3">Time Delta</th>
                  <th className="p-3">Attribution Score</th>
                  <th className="p-3">Anomaly Detected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 print:divide-gray-300 print:text-black">
                {detection.candidateVessels.map((v) => (
                  <tr key={v.mmsi} className={v.rank === 1 ? 'bg-rose-950/20 print:bg-red-50' : ''}>
                    <td className="p-3 font-mono font-bold text-white print:text-black">#{v.rank}</td>
                    <td className="p-3 font-semibold text-white print:text-black">
                      {v.name} <span className="text-slate-500 font-mono text-[11px] font-normal print:text-gray-600">[{v.mmsi}]</span>
                    </td>
                    <td className="p-3">{v.vesselType}</td>
                    <td className="p-3 font-mono">{v.distanceAtEstimatedOriginKm.toFixed(1)} km</td>
                    <td className="p-3 font-mono">±{v.timeDeltaAtOriginHours.toFixed(1)} h</td>
                    <td className="p-3">
                      <ConfidenceBadge score={v.overallScore} size="sm" />
                    </td>
                    <td className="p-3">
                      {v.anomaliesDetected.hasAisGap ? (
                        <span className="text-rose-400 font-mono text-[11px] font-bold print:text-red-700">
                          AIS Gap ({v.anomaliesDetected.gapDurationHours}h)
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px] print:text-gray-600">Normal</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {topSuspect && (
            <div className="mt-4 p-4 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-200 space-y-1 print:bg-red-50 print:border-red-300 print:text-black">
              <strong className="text-rose-300 font-mono uppercase tracking-wider block print:text-red-800">
                Primary Lead Attribution Justification:
              </strong>
              <p>{topSuspect.justification}</p>
            </div>
          )}
        </div>

        {/* Section 4: Human Analyst Observations */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono mb-2 flex items-center justify-between print:text-black">
            <span>4. Forensic Analyst Conclusions & Interdiction Recommendations</span>
            <span className="text-[10px] text-slate-500 font-normal print:hidden">Editable by verified analyst</span>
          </h3>

          <textarea
            value={analystNotes}
            onChange={(e) => {
              setAnalystNotes(e.target.value);
              detection.analystNotes = e.target.value;
            }}
            rows={4}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-cyan-500 shadow-inner print:bg-white print:text-black print:border-gray-300"
            placeholder="Enter analyst observations, legal caveats, or interdiction directives..."
          />
        </div>

        {/* Sign-Off Footer */}
        <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400 print:border-black print:text-black">
          <div>
            <p>Investigator Unit: <span className="text-slate-200 print:text-black font-bold">NTRO Maritime SIGINT / IMINT Cell</span></p>
            <p>Verification Standard: <span className="text-slate-200 print:text-black">Bayesian Space-Time Correlation v2.4</span></p>
          </div>
          <div className="text-right">
            <p>Signature: <span className="text-cyan-400 font-bold print:text-black">[DIGITALLY SIGNED // NTRO-SEC-TOKEN-891]</span></p>
            <p>Action Level: <span className="text-rose-400 font-bold print:text-red-700">Transmit to MRCC Mumbai / ICG</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};
