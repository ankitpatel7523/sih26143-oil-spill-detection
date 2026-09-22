import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { DetectionResult, SuspectVessel } from '../../types';
import { MapLayerState } from './LayerToggle';

export type BasemapType = 'dark' | 'satellite' | 'ocean' | 'streets';

interface SpillMapProps {
  detection: DetectionResult;
  layers: MapLayerState;
  currentStepIndex: number;
  selectedVessel: SuspectVessel | null;
  onSelectVessel: (vessel: SuspectVessel | null) => void;
  onMapClickDropSpill?: (lat: number, lng: number) => void;
  isDropSpillMode?: boolean;
}

export const SpillMap: React.FC<SpillMapProps> = ({
  detection,
  layers,
  currentStepIndex,
  selectedVessel,
  onSelectVessel,
  onMapClickDropSpill,
  isDropSpillMode = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const seamarkLayerRef = useRef<L.TileLayer | null>(null);

  const [basemap, setBasemap] = useState<BasemapType>('dark');
  const [showSeamarks, setShowSeamarks] = useState<boolean>(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialCenter: [number, number] = detection.spill.properties.centroid;
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 10,
      zoomControl: false,
      attributionControl: false
    });

    const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Real OpenSeaMap Nautical Chart Seamarks (Buoys, Channels, Beacons)
    const seamarkLayer = L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
      maxZoom: 18,
      opacity: 0.85
    }).addTo(map);
    seamarkLayerRef.current = seamarkLayer;

    L.control.zoom({ position: 'topright' }).addTo(map);
    L.control.scale({ position: 'bottomleft', imperial: false }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Basemap Tiles
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    let maxZoom = 19;
    let subdomains: string | string[] = 'abcd';

    if (basemap === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      maxZoom = 18;
      subdomains = 'abc';
    } else if (basemap === 'ocean') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}';
      maxZoom = 16;
      subdomains = 'abc';
    } else if (basemap === 'streets') {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      maxZoom = 19;
      subdomains = 'abc';
    }

    const newTileLayer = L.tileLayer(url, { maxZoom, subdomains }).addTo(map);
    newTileLayer.bringToBack();
    tileLayerRef.current = newTileLayer;
  }, [basemap]);

  // Toggle OpenSeaMap Seamarks
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (showSeamarks) {
      if (!seamarkLayerRef.current) {
        seamarkLayerRef.current = L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
          maxZoom: 18,
          opacity: 0.85
        }).addTo(map);
      }
    } else {
      if (seamarkLayerRef.current) {
        map.removeLayer(seamarkLayerRef.current);
        seamarkLayerRef.current = null;
      }
    }
  }, [showSeamarks]);

  // Center on detection changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const newCenter = detection.spill.properties.centroid;
    map.flyTo(newCenter, map.getZoom() < 8 ? 10 : map.getZoom(), { duration: 1.0 });
  }, [detection.id]);

  // Handle Drop Spill Click Mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      if (isDropSpillMode && onMapClickDropSpill) {
        onMapClickDropSpill(e.latlng.lat, e.latlng.lng);
      }
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [isDropSpillMode, onMapClickDropSpill]);

  // Update GIS Layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    const currentDriftStep = detection.driftSimulation.steps[currentStepIndex] || detection.driftSimulation.steps[0];
    const centroid = detection.spill.properties.centroid;

    // 1. SAR Footprint Overlay
    if (layers.sarRaster) {
      const latOffset = 0.25;
      const lngOffset = 0.40;
      const sarBounds: L.LatLngBoundsExpression = [
        [centroid[0] - latOffset, centroid[1] - lngOffset],
        [centroid[0] + latOffset, centroid[1] + lngOffset]
      ];
      const sarRect = L.rectangle(sarBounds, {
        color: '#38bdf8',
        weight: 1,
        dashArray: '4, 4',
        fillColor: '#0369a1',
        fillOpacity: 0.12
      });
      sarRect.bindTooltip(`Sentinel-1A SAR Scene Extent (${detection.sarMetadata.mode})`, { sticky: true });
      group.addLayer(sarRect);
    }

    // 2. 50km Spatiotemporal Origin Buffer Circle
    if (layers.originBuffer) {
      const originPoint = detection.driftSimulation.estimatedOriginPoint;
      const bufferCircle = L.circle(originPoint, {
        radius: 50000, // 50 km buffer
        color: '#f43f5e',
        weight: 1.5,
        dashArray: '6, 6',
        fillColor: '#f43f5e',
        fillOpacity: 0.05
      });
      bufferCircle.bindTooltip("50 km Spatio-Temporal Attribution Buffer", { sticky: true });
      group.addLayer(bufferCircle);
    }

    // 3. Backward Drift Trajectory Line
    if (layers.driftTrajectory) {
      const pathPoints = detection.driftSimulation.steps.map(s => s.centroid);
      const trajectoryLine = L.polyline(pathPoints, {
        color: '#fbbf24',
        weight: 3,
        dashArray: '5, 5',
        opacity: 0.95
      });
      trajectoryLine.bindTooltip(`Backward Drift Advection Path (${detection.driftSimulation.driftDurationHours}h)`, { sticky: true });
      group.addLayer(trajectoryLine);

      // Step Nodes
      detection.driftSimulation.steps.forEach((step, idx) => {
        const isCurrent = idx === currentStepIndex;
        const stepMarker = L.circleMarker(step.centroid, {
          radius: isCurrent ? 7 : 4,
          color: isCurrent ? '#38bdf8' : '#fbbf24',
          fillColor: isCurrent ? '#0284c7' : '#d97706',
          fillOpacity: 1,
          weight: 2
        });
        stepMarker.bindTooltip(`T-${step.hoursAgo}h (${step.timestamp.split('T')[1].substring(0, 5)} UTC)`);
        group.addLayer(stepMarker);
      });
    }

    // 4. Monte Carlo Dispersion Particles
    if (layers.driftParticles && currentDriftStep.particles) {
      currentDriftStep.particles.forEach((pt) => {
        const particleMarker = L.circleMarker(pt, {
          radius: 2.5,
          color: '#fef08a',
          fillColor: '#fde047',
          fillOpacity: 0.75,
          weight: 0.5
        });
        group.addLayer(particleMarker);
      });
    }

    // 5. Active Spill Polygon at current time step
    if (layers.spillPolygon) {
      const polygonCoords = currentDriftStep.polygon;
      const spillPoly = L.polygon(polygonCoords, {
        color: '#f43f5e',
        weight: 2.5,
        fillColor: '#881337',
        fillOpacity: 0.7
      });

      const popupContent = `
        <div style="font-family: monospace; color: #0f172a; padding: 4px; min-width: 200px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
            <strong style="color: #991b1b; font-size: 13px;">${detection.spill.properties.id}</strong>
            <span style="background: #fee2e2; color: #991b1b; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">${(detection.spill.properties.confidenceScore * 100).toFixed(1)}% Confidence</span>
          </div>
          <div style="font-size: 11px; line-height: 1.6; color: #334155;">
            <div><strong>Area:</strong> ${detection.spill.properties.areaKm2} km²</div>
            <div><strong>Estimated Volume:</strong> ${detection.spill.properties.estimatedVolumeM3} m³ (${detection.spill.properties.slickType})</div>
            <div><strong>Detected At:</strong> ${detection.spill.properties.detectedAt}</div>
            <div><strong>Location:</strong> ${detection.spill.properties.locationName}</div>
            <div style="margin-top: 4px; font-size: 10px; color: #0284c7; background: #e0f2fe; padding: 4px 6px; border-radius: 4px;">
              Lagrangian backward model indicates discharge origin at T - ${detection.driftSimulation.driftDurationHours}h.
            </div>
          </div>
        </div>
      `;
      spillPoly.bindPopup(popupContent);
      group.addLayer(spillPoly);

      // Centroid Marker
      const centroidMarker = L.circleMarker(currentDriftStep.centroid, {
        radius: 6,
        color: '#ffffff',
        fillColor: '#e11d48',
        fillOpacity: 1,
        weight: 2
      });
      group.addLayer(centroidMarker);
    }

    // 6. Estimated Origin Marker (Anchor icon)
    const originCoords = detection.driftSimulation.estimatedOriginPoint;
    const originIcon = L.divIcon({
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(245, 158, 11, 0.4); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="background: #d97706; color: white; width: 22px; height: 22px; border-radius: 50%; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
            ⚓
          </div>
        </div>
      `,
      className: 'custom-origin-icon',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    const originMarker = L.marker(originCoords, { icon: originIcon });
    originMarker.bindTooltip(
      `<strong>Estimated Spill Origin Point</strong><br/>${originCoords[0].toFixed(3)}°N, ${originCoords[1].toFixed(3)}°E<br/>Time: ${detection.driftSimulation.originTimestamp}`,
      { permanent: false }
    );
    group.addLayer(originMarker);

    // 7. Ocean Current Streamlines (OSCAR)
    if (layers.currentVectors) {
      const cSpeed = currentDriftStep.currentVector.speedKnots;
      const cDir = currentDriftStep.currentVector.directionDeg;
      // Generate a grid of current arrows around the scene
      const gridLatSpan = 0.4;
      const gridLngSpan = 0.6;
      for (let dLat = -gridLatSpan; dLat <= gridLatSpan; dLat += 0.2) {
        for (let dLng = -gridLngSpan; dLng <= gridLngSpan; dLng += 0.25) {
          const ptLat = centroid[0] + dLat;
          const ptLng = centroid[1] + dLng;
          const arrowHtml = `
            <div style="transform: rotate(${cDir}deg); display: flex; align-items: center; justify-content: center;">
              <span style="color: #60a5fa; font-size: 16px; text-shadow: 0 0 3px rgba(0,0,0,0.8);">➔</span>
            </div>
          `;
          const arrowIcon = L.divIcon({
            html: arrowHtml,
            className: 'current-vector-arrow',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });
          const arrowMarker = L.marker([ptLat, ptLng], { icon: arrowIcon });
          arrowMarker.bindTooltip(`Ocean Current: ${cSpeed} kts @ ${cDir}° (OSCAR)`);
          group.addLayer(arrowMarker);
        }
      }
    }

    // 8. Wind Vectors (ECMWF)
    if (layers.windVectors) {
      const wSpeed = currentDriftStep.windVector.speedKnots;
      const wDir = currentDriftStep.windVector.directionDeg;
      const gridLatSpan = 0.35;
      const gridLngSpan = 0.55;
      for (let dLat = -gridLatSpan; dLat <= gridLatSpan; dLat += 0.22) {
        for (let dLng = -gridLngSpan; dLng <= gridLngSpan; dLng += 0.28) {
          const ptLat = centroid[0] + dLat + 0.05;
          const ptLng = centroid[1] + dLng + 0.05;
          const windHtml = `
            <div style="transform: rotate(${wDir}deg); display: flex; align-items: center; justify-content: center;">
              <span style="color: #34d399; font-size: 18px; text-shadow: 0 0 3px rgba(0,0,0,0.8);">➢</span>
            </div>
          `;
          const windIcon = L.divIcon({
            html: windHtml,
            className: 'wind-vector-arrow',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });
          const windMarker = L.marker([ptLat, ptLng], { icon: windIcon });
          windMarker.bindTooltip(`Surface Wind: ${wSpeed} kts @ ${wDir}° (ECMWF)`);
          group.addLayer(windMarker);
        }
      }
    }

    // 9. AIS Candidate Tracks
    if (layers.aisTracks && detection.candidateVessels) {
      detection.candidateVessels.forEach((vessel) => {
        const isSelected = selectedVessel?.mmsi === vessel.mmsi;
        const isTopSuspect = vessel.rank === 1;

        const trackCoords = vessel.trackHistory.map(t => [t.lat, t.lng] as [number, number]);
        const trackColor = isSelected
          ? '#38bdf8'
          : isTopSuspect
          ? '#f43f5e'
          : '#94a3b8';

        const polyline = L.polyline(trackCoords, {
          color: trackColor,
          weight: isSelected || isTopSuspect ? 3.5 : 2,
          opacity: isSelected ? 1 : isTopSuspect ? 0.9 : 0.6,
          dashArray: vessel.anomaliesDetected.hasAisGap ? '6, 4' : undefined
        });

        polyline.on('click', () => onSelectVessel(vessel));
        polyline.bindTooltip(
          `<strong>${vessel.name}</strong> (${vessel.vesselType})<br/>Score: ${vessel.overallScore}% • MMSI: ${vessel.mmsi}<br/>Closest distance: ${vessel.distanceAtEstimatedOriginKm} km`
        );
        group.addLayer(polyline);

        // Vessel Latest Position Marker
        const lastPos = vessel.trackHistory[vessel.trackHistory.length - 1];
        const vesselMarker = L.circleMarker([lastPos.lat, lastPos.lng], {
          radius: isTopSuspect ? 7 : 5,
          color: '#ffffff',
          fillColor: trackColor,
          fillOpacity: 1,
          weight: 1.5
        });

        vesselMarker.on('click', () => onSelectVessel(vessel));
        vesselMarker.bindTooltip(`${vessel.name} [MMSI: ${vessel.mmsi}]`);
        group.addLayer(vesselMarker);

        // If vessel has an AIS blackout gap, mark the gap point
        if (vessel.anomaliesDetected.hasAisGap) {
          const gapPt = vessel.trackHistory.find(t => t.status.includes('Gap') || t.status.includes('Dropping')) || vessel.trackHistory[1];
          const gapMarker = L.circleMarker([gapPt.lat, gapPt.lng], {
            radius: 8,
            color: '#ef4444',
            fillColor: '#7f1d1d',
            fillOpacity: 0.9,
            weight: 2
          });
          gapMarker.bindTooltip(`⚠️ AIS Blackout: ${vessel.name}<br/>Duration: ${vessel.anomaliesDetected.gapDurationHours}h (Coincides with spill origin)`);
          group.addLayer(gapMarker);
        }
      });
    }

  }, [detection, layers, currentStepIndex, selectedVessel, onSelectVessel]);

  return (
    <div className={`relative w-full h-full min-h-[500px] overflow-hidden bg-slate-950 ${isDropSpillMode ? 'cursor-crosshair' : ''}`}>
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Drop Spill Mode Banner */}
      {isDropSpillMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-rose-600/90 text-white font-mono text-xs px-4 py-2 rounded-xl shadow-2xl border border-rose-400 flex items-center gap-2 animate-bounce">
          <span>🎯 Click anywhere on the maritime map to drop a new spill & run simulation!</span>
        </div>
      )}

      {/* Basemap & Nautical Switcher */}
      <div className="absolute bottom-12 right-3 z-20 bg-slate-900/90 border border-slate-800 backdrop-blur-md p-1 rounded-lg text-xs font-mono flex items-center gap-1 shadow-xl">
        <button
          onClick={() => setBasemap('dark')}
          className={`px-2 py-1 rounded transition-colors ${basemap === 'dark' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
          title="Dark CartoDB Maritime Basemap"
        >
          Dark
        </button>
        <button
          onClick={() => setBasemap('satellite')}
          className={`px-2 py-1 rounded transition-colors ${basemap === 'satellite' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
          title="Esri World Satellite Imagery"
        >
          Satellite
        </button>
        <button
          onClick={() => setBasemap('ocean')}
          className={`px-2 py-1 rounded transition-colors ${basemap === 'ocean' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
          title="Esri Ocean Bathymetry & Continental Shelf"
        >
          Bathymetry
        </button>
        <button
          onClick={() => setBasemap('streets')}
          className={`px-2 py-1 rounded transition-colors ${basemap === 'streets' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
          title="Nautical Coastline Streets"
        >
          Coastline
        </button>
        <div className="h-4 w-px bg-slate-800 mx-0.5" />
        <button
          onClick={() => setShowSeamarks(!showSeamarks)}
          className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${showSeamarks ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold' : 'text-slate-500 hover:text-slate-300'}`}
          title="Toggle OpenSeaMap International Navigational Seamarks & Buoys"
        >
          <span>⚓ Seamarks</span>
        </button>
      </div>

      {/* Map Attribution and Legend */}
      <div className="absolute bottom-3 right-3 z-20 bg-slate-900/90 border border-slate-800 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-mono text-slate-400 flex items-center gap-3">
        <span>SAR: Sentinel-1A C-SAR</span>
        <span>•</span>
        <span>Currents: OSCAR 1/3°</span>
        <span>•</span>
        <span>AIS: Real-time Spatiotemporal</span>
      </div>
    </div>
  );
};
