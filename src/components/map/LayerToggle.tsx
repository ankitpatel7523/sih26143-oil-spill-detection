import React from 'react';
import { Layers, Eye, EyeOff } from 'lucide-react';

export interface MapLayerState {
  sarRaster: boolean;
  spillPolygon: boolean;
  driftTrajectory: boolean;
  driftParticles: boolean;
  currentVectors: boolean;
  windVectors: boolean;
  aisTracks: boolean;
  originBuffer: boolean;
}

interface LayerToggleProps {
  layers: MapLayerState;
  onToggle: (layerKey: keyof MapLayerState) => void;
}

export const LayerToggle: React.FC<LayerToggleProps> = ({ layers, onToggle }) => {
  const layerItems: { key: keyof MapLayerState; label: string; colorDot: string }[] = [
    { key: 'spillPolygon', label: 'Detected Spill Polygon', colorDot: 'bg-rose-500' },
    { key: 'driftTrajectory', label: 'Reverse Drift Trajectory', colorDot: 'bg-amber-400' },
    { key: 'driftParticles', label: 'Monte Carlo Particles', colorDot: 'bg-yellow-300' },
    { key: 'originBuffer', label: '50km Spatiotemporal Buffer', colorDot: 'bg-red-400' },
    { key: 'aisTracks', label: 'AIS Vessel Trajectories', colorDot: 'bg-cyan-400' },
    { key: 'sarRaster', label: 'Sentinel-1 SAR Dampening Overlay', colorDot: 'bg-slate-300' },
    { key: 'currentVectors', label: 'OSCAR Ocean Current Field', colorDot: 'bg-blue-400' },
    { key: 'windVectors', label: 'ECMWF Surface Wind Vectors', colorDot: 'bg-emerald-400' }
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-md rounded-xl p-3.5 shadow-xl text-xs w-64 select-none">
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-1.5 font-semibold text-slate-200">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>GIS Map Layers</span>
        </div>
        <span className="text-[10px] font-mono text-slate-500">
          {Object.values(layers).filter(Boolean).length}/8 Active
        </span>
      </div>

      <div className="space-y-1.5">
        {layerItems.map((item) => {
          const isActive = layers[item.key];
          return (
            <button
              key={item.key}
              id={`toggle-layer-${item.key}`}
              onClick={() => onToggle(item.key)}
              className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-colors text-left ${
                isActive
                  ? 'bg-slate-800/80 text-slate-200'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${item.colorDot} ${isActive ? 'opacity-100' : 'opacity-40'}`} />
                <span className="text-[11px] truncate max-w-[170px]">{item.label}</span>
              </div>
              {isActive ? (
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-slate-600" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
