import React, { useState } from 'react';
import { SpillMap } from '../components/map/SpillMap';
import { LayerToggle, MapLayerState } from '../components/map/LayerToggle';
import { DriftTimelineSlider } from '../components/map/DriftTimelineSlider';
import { DetectionResult, SuspectVessel } from '../types';
import {
  Compass,
  Layers,
  Wind,
  Waves,
  Ship,
  Anchor,
  Info,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Crosshair,
  RotateCcw
} from 'lucide-react';
import { ConfidenceBadge } from '../components/common/ConfidenceBadge';
import { simulateBackwardDrift, EnvironmentalConditions } from '../services/driftSimulationEngine';
import { generateRealisticVesselCorridor } from '../services/aisAttributionEngine';
import { StorageService } from '../services/storageService';

interface SpillDriftMapPageProps {
  detection: DetectionResult;
  selectedVessel: SuspectVessel | null;
  onSelectVessel: (vessel: SuspectVessel | null) => void;
  onNavigateToVessels: () => void;
  onUpdateDetection?: (updated: DetectionResult) => void;
}

export const SpillDriftMapPage: React.FC<SpillDriftMapPageProps> = ({
  detection,
  selectedVessel,
  onSelectVessel,
  onNavigateToVessels,
  onUpdateDetection
}) => {
  const [layers, setLayers] = useState<MapLayerState>({
    spillPolygon: true,
    driftTrajectory: true,
    driftParticles: true,
    originBuffer: true,
    aisTracks: true,
    sarRaster: true,
    currentVectors: true,
    windVectors: true
  });

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [isDropSpillMode, setIsDropSpillMode] = useState(false);

  const handleToggleLayer = (key: keyof MapLayerState) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Dynamic Environmental Physics recalculation
  const handleEnvironmentChange = (env: EnvironmentalConditions) => {
    const newDriftSim = simulateBackwardDrift({
      centroid: detection.spill.properties.centroid,
      detectionTimestamp: detection.timestamp,
      durationHours: detection.driftSimulation.driftDurationHours || 12,
      timeStepMinutes: detection.driftSimulation.timeStepMinutes || 60,
      initialAreaKm2: detection.spill.properties.areaKm2,
      environment: env
    });

    const updatedVessels = generateRealisticVesselCorridor(
      newDriftSim.estimatedOriginPoint,
      newDriftSim.originTimestamp
    );

    const updatedDetection: DetectionResult = {
      ...detection,
      driftSimulation: newDriftSim,
      candidateVessels: updatedVessels
    };

    if (onUpdateDetection) {
      onUpdateDetection(updatedDetection);
    }
    if (updatedVessels.length > 0) {
      onSelectVessel(updatedVessels[0]);
    }
    setCurrentStepIndex(0);
  };

  // Custom Spill Placement by clicking on Map
  const handleMapClickDropSpill = (lat: number, lng: number) => {
    const timestamp = new Date().toISOString();
    const areaKm2 = parseFloat((12 + Math.random() * 20).toFixed(2));
    const centroid: [number, number] = [parseFloat(lat.toFixed(4)), parseFloat(lng.toFixed(4))];

    const driftSim = simulateBackwardDrift({
      centroid,
      detectionTimestamp: timestamp,
      durationHours: 12,
      timeStepMinutes: 60,
      initialAreaKm2: areaKm2
    });

    const candidateVessels = generateRealisticVesselCorridor(
      driftSim.estimatedOriginPoint,
      driftSim.originTimestamp
    );

    const newDetection: DetectionResult = {
      id: `NTRO-CUSTOM-${Math.floor(1000 + Math.random() * 9000)}`,
      sceneId: `S1A_IW_GRDH_CUSTOM_${timestamp.replace(/[-:]/g, '').split('.')[0]}`,
      timestamp,
      status: "Confirmed",
      sarMetadata: {
        satellite: "Sentinel-1A",
        mode: "IW (Interferometric Wide)",
        polarization: "VV + VH",
        resolutionM: 10,
        acquisitionTime: timestamp,
        centerCoordinates: centroid,
      },
      mlMetrics: {
        iouScore: 0.892,
        f1Score: 0.935,
        lookAlikeProbability: 0.042,
        oilSpillProbability: 0.958,
        classificationLabel: "True Oil Spill",
      },
      spill: {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [centroid[1] - 0.02, centroid[0] - 0.01],
            [centroid[1] + 0.01, centroid[0] - 0.02],
            [centroid[1] + 0.03, centroid[0] + 0.01],
            [centroid[1] - 0.01, centroid[0] + 0.02],
            [centroid[1] - 0.02, centroid[0] - 0.01]
          ]]
        },
        properties: {
          id: `CUSTOM-SPILL-${Math.floor(1000 + Math.random() * 9000)}`,
          areaKm2,
          centroid,
          detectedAt: timestamp,
          confidenceScore: 0.958,
          sensor: "C-Band Synthetic Aperture Radar",
          orbitPass: "Descending (Simulated)",
          polarization: "VV Polarized",
          locationName: `Custom Coordinate Sector [${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E]`,
          seaStateBeaufort: 3,
          estimatedVolumeM3: Math.round(areaKm2 * 18),
          slickType: "Heavy Crude"
        }
      },
      driftSimulation: driftSim,
      candidateVessels,
      darkVesselDetected: false,
      darkVesselReason: "Positive correlation confirmed. Candidate tanker trajectory matches backward drift origin.",
      analystNotes: `Operator placed interactive custom spill at [${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E]. Backward drift solver backtracked spill origin across ${driftSim.driftDurationHours}h window.`
    };

    StorageService.addIncident(newDetection);
    if (onUpdateDetection) {
      onUpdateDetection(newDetection);
    }
    onSelectVessel(candidateVessels[0] || null);
    setIsDropSpillMode(false);
    setCurrentStepIndex(0);
  };

  const currentStep = detection.driftSimulation.steps[currentStepIndex] || detection.driftSimulation.steps[0];

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-slate-950 flex flex-col overflow-hidden">
      {/* Top Floating Status Overlay */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-3">
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Backward Drift Simulation & AIS Correlator
              </h2>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/20">
                Lagrangian Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Origin Estimate: <strong className="text-amber-300 font-mono">{detection.driftSimulation.estimatedOriginPoint[0].toFixed(3)}°N, {detection.driftSimulation.estimatedOriginPoint[1].toFixed(3)}°E</strong> (T - {detection.driftSimulation.driftDurationHours}h)
            </p>
          </div>
        </div>

        {/* Drop Spill Anywhere Toggle Button */}
        <button
          onClick={() => setIsDropSpillMode(!isDropSpillMode)}
          className={`px-3.5 py-2.5 rounded-xl text-xs font-bold backdrop-blur-md shadow-xl flex items-center gap-2 transition-all ${
            isDropSpillMode
              ? 'bg-rose-500 text-white shadow-rose-500/30 animate-pulse'
              : 'bg-slate-900/90 border border-slate-800 hover:bg-slate-800 text-slate-200'
          }`}
        >
          <Crosshair className="w-4 h-4 text-cyan-400" />
          <span>{isDropSpillMode ? 'Click Map to Place' : 'Drop Custom Spill'}</span>
        </button>

        <button
          onClick={() => setShowLayerPanel(!showLayerPanel)}
          className="bg-slate-900/90 border border-slate-800 hover:bg-slate-800 text-slate-200 px-3 py-2.5 rounded-xl text-xs font-medium backdrop-blur-md shadow-xl flex items-center gap-2 transition-colors"
        >
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>{showLayerPanel ? 'Hide Layers' : 'GIS Layers'}</span>
        </button>
      </div>

      {/* Floating Layer Toggle Panel (Top Left below title) */}
      {showLayerPanel && (
        <div className="absolute top-20 left-4 z-20">
          <LayerToggle layers={layers} onToggle={handleToggleLayer} />
        </div>
      )}

      {/* Floating Right Panel: Selected Suspect Vessel Telemetry */}
      {selectedVessel && (
        <div className="absolute top-4 right-4 z-20 w-80 bg-slate-900/95 border border-cyan-500/40 backdrop-blur-md rounded-xl p-4 shadow-2xl space-y-3">
          <div className="flex items-start justify-between pb-2 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                Forensic Suspect Focus
              </span>
              <h3 className="text-sm font-bold text-white font-mono">{selectedVessel.name}</h3>
              <p className="text-[11px] text-slate-400">MMSI: {selectedVessel.mmsi} • [{selectedVessel.flag}]</p>
            </div>
            <ConfidenceBadge score={selectedVessel.overallScore} size="sm" />
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Distance to Origin:</span>
              <strong className={selectedVessel.distanceAtEstimatedOriginKm < 5 ? "text-rose-400 font-mono" : "text-slate-200 font-mono"}>
                {selectedVessel.distanceAtEstimatedOriginKm.toFixed(1)} km
              </strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Time Delta at Origin:</span>
              <strong className="text-amber-300 font-mono">±{selectedVessel.timeDeltaAtOriginHours.toFixed(1)} h</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Vessel Type:</span>
              <span className="text-slate-200">{selectedVessel.vesselType}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>AIS Blackout:</span>
              <span className={selectedVessel.anomaliesDetected.hasAisGap ? "text-rose-400 font-mono font-bold" : "text-emerald-400 font-mono"}>
                {selectedVessel.anomaliesDetected.hasAisGap ? `YES (${selectedVessel.anomaliesDetected.gapDurationHours}h)` : 'None (Continuous)'}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-snug border-t border-slate-800/80 pt-2 italic">
            "{selectedVessel.justification.substring(0, 110)}..."
          </p>

          <button
            onClick={onNavigateToVessels}
            className="w-full py-2 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Open Forensic Score Dossier</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Fullscreen GIS Map */}
      <div className="flex-1 w-full h-full">
        <SpillMap
          detection={detection}
          layers={layers}
          currentStepIndex={currentStepIndex}
          selectedVessel={selectedVessel}
          onSelectVessel={onSelectVessel}
          onMapClickDropSpill={handleMapClickDropSpill}
          isDropSpillMode={isDropSpillMode}
        />
      </div>

      {/* Bottom Floating Timeline Slider */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl px-4">
        <DriftTimelineSlider
          steps={detection.driftSimulation.steps}
          currentStepIndex={currentStepIndex}
          onStepChange={setCurrentStepIndex}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onEnvironmentChange={handleEnvironmentChange}
        />
      </div>
    </div>
  );
};
