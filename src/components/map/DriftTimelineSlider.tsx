import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Rewind,
  Wind,
  Waves,
  Clock,
  Sliders,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import { DriftStep } from '../../types';
import { EnvironmentalConditions } from '../../services/driftSimulationEngine';

interface DriftTimelineSliderProps {
  steps: DriftStep[];
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onEnvironmentChange?: (env: EnvironmentalConditions) => void;
  currentEnvironment?: EnvironmentalConditions;
}

export const DriftTimelineSlider: React.FC<DriftTimelineSliderProps> = ({
  steps,
  currentStepIndex,
  onStepChange,
  isPlaying,
  onTogglePlay,
  onEnvironmentChange,
  currentEnvironment
}) => {
  const currentStep = steps[currentStepIndex] || steps[0];
  const [showPhysicsTuning, setShowPhysicsTuning] = useState(false);

  // Local state for environmental sliders
  const [windSpeed, setWindSpeed] = useState(currentEnvironment?.windSpeedKnots ?? currentStep.windVector.speedKnots);
  const [windDir, setWindDir] = useState(currentEnvironment?.windDirectionDeg ?? currentStep.windVector.directionDeg);
  const [currSpeed, setCurrSpeed] = useState(currentEnvironment?.currentSpeedKnots ?? currentStep.currentVector.speedKnots);
  const [currDir, setCurrDir] = useState(currentEnvironment?.currentDirectionDeg ?? currentStep.currentVector.directionDeg);
  const [windage, setWindage] = useState(currentEnvironment?.windageFactor ?? 3.0);

  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        onStepChange((currentStepIndex + 1) % steps.length);
      }, 1200);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, steps.length, onStepChange, currentStepIndex]);

  const handleApplyPhysics = () => {
    if (onEnvironmentChange) {
      onEnvironmentChange({
        windSpeedKnots: windSpeed,
        windDirectionDeg: windDir,
        currentSpeedKnots: currSpeed,
        currentDirectionDeg: currDir,
        windageFactor: windage,
        diffusionCoeffM2s: 10.0
      });
    }
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800/90 backdrop-blur-md rounded-xl p-3 shadow-2xl text-xs w-full max-w-2xl select-none space-y-2">
      {/* Top row: Status, Time offset, Hydrodynamic Vector metrics */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-mono text-cyan-300 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
            <Clock className="w-3.5 h-3.5" />
            T - {currentStep.hoursAgo}h
          </span>
          <span className="text-[11px] font-mono text-slate-300">
            {currentStep.timestamp.replace("T", " ").replace("Z", " UTC")}
          </span>
        </div>

        {/* Environmental conditions at this simulated hour */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1">
            <Waves className="w-3.5 h-3.5 text-blue-400" />
            <span>Curr: {currentStep.currentVector.speedKnots} kts @ {currentStep.currentVector.directionDeg}°</span>
          </div>
          <div className="flex items-center gap-1">
            <Wind className="w-3.5 h-3.5 text-emerald-400" />
            <span>Wind: {currentStep.windVector.speedKnots} kts @ {currentStep.windVector.directionDeg}°</span>
          </div>

          <button
            onClick={() => setShowPhysicsTuning(!showPhysicsTuning)}
            className="flex items-center gap-1 text-[10px] text-cyan-400 bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded transition-colors"
          >
            <Sliders className="w-3 h-3" />
            <span>Tune Physics</span>
            {showPhysicsTuning ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Collapsible Dynamic Physics Tuning Panel */}
      {showPhysicsTuning && (
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold font-mono text-white">Dynamic Environmental Forcing (Real Lagrangian Solver)</span>
            <button
              onClick={handleApplyPhysics}
              className="px-2.5 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[10px] flex items-center gap-1 shadow-md shadow-cyan-500/20"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Recalculate Drift Live</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px] font-mono">
            <div>
              <div className="flex justify-between text-slate-400 mb-0.5">
                <span>Wind Speed</span>
                <span className="text-emerald-400">{windSpeed} kts</span>
              </div>
              <input
                type="range"
                min="0"
                max="35"
                step="0.5"
                value={windSpeed}
                onChange={(e) => setWindSpeed(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded accent-emerald-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-0.5">
                <span>Wind Heading</span>
                <span className="text-emerald-400">{windDir}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="5"
                value={windDir}
                onChange={(e) => setWindDir(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-800 rounded accent-emerald-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-0.5">
                <span>Current Velocity</span>
                <span className="text-blue-400">{currSpeed} kts</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.05"
                value={currSpeed}
                onChange={(e) => setCurrSpeed(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded accent-blue-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-0.5">
                <span>Current Heading</span>
                <span className="text-blue-400">{currDir}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="5"
                value={currDir}
                onChange={(e) => setCurrDir(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-800 rounded accent-blue-400 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Slider & Track */}
      <div className="px-1 py-1">
        <input
          type="range"
          min="0"
          max={steps.length - 1}
          value={currentStepIndex}
          onChange={(e) => onStepChange(parseInt(e.target.value, 10))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
          <span>Detection (T-0h)</span>
          <span>-4h</span>
          <span className="text-amber-400 font-bold">Estimated Origin</span>
          <span>Max Buffer (T-{steps[steps.length - 1]?.hoursAgo}h)</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onStepChange(0)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Reset to Satellite Detection (T=0)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onStepChange(Math.max(0, currentStepIndex - 1))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Step backward in time"
          >
            <Rewind className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onTogglePlay}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold text-xs transition-colors ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Play Reverse Drift
              </>
            )}
          </button>
          <button
            onClick={() => onStepChange(Math.min(steps.length - 1, currentStepIndex + 1))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Step forward in time"
          >
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="text-[11px] text-slate-400 font-mono">
          Centroid: <span className="text-cyan-300">{currentStep.centroid[0].toFixed(3)}°N, {currentStep.centroid[1].toFixed(3)}°E</span>
        </div>
      </div>
    </div>
  );
};
