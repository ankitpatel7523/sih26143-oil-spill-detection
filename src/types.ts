export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface SpillPolygon {
  type: "Feature";
  geometry: {
    type: "Polygon";
    coordinates: number[][][]; // [ [ [lng, lat], ... ] ]
  };
  properties: {
    id: string;
    areaKm2: number;
    centroid: [number, number]; // [lat, lng]
    detectedAt: string;
    confidenceScore: number;
    sensor: string;
    orbitPass: string;
    polarization: string;
    locationName: string;
    seaStateBeaufort: number;
    estimatedVolumeM3: number;
    slickType: "Heavy Crude" | "Bunker Fuel" | "Refined Oil" | "Emulsion" | "Biogenic Algae / False Positive" | string;
  };
}

export interface DriftStep {
  hoursAgo: number;
  timestamp: string;
  centroid: [number, number]; // [lat, lng]
  polygon: [number, number][]; // [lat, lng][] boundary for this time step
  particles: [number, number][]; // Monte Carlo particle locations
  currentVector: { u: number; v: number; speedKnots: number; directionDeg: number };
  windVector: { u: number; v: number; speedKnots: number; directionDeg: number };
  diffusionRadiusKm: number;
}

export interface AISTrackPoint {
  timestamp: string;
  lat: number;
  lng: number;
  speedKnots: number;
  headingDeg: number;
  status: string;
}

export interface SuspectVessel {
  mmsi: string;
  imo: string;
  name: string;
  flag: string;
  country: string;
  vesselType: "Crude Oil Tanker" | "Chemical Tanker" | "Bulk Carrier" | "Container Ship" | "Offshore Supply";
  dwt: number; // Deadweight tonnage
  overallScore: number; // 0 to 100
  rank: number;
  distanceAtEstimatedOriginKm: number;
  timeDeltaAtOriginHours: number;
  scores: {
    proximityScore: number; // 0-35
    temporalScore: number; // 0-25
    vesselTypeScore: number; // 0-20
    anomalyScore: number; // 0-20 (speed drops + AIS gaps)
  };
  anomaliesDetected: {
    hasAisGap: boolean;
    gapDurationHours?: number;
    gapStartTime?: string;
    hasSpeedDrop: boolean;
    speedBeforeKnots?: number;
    speedDuringKnots?: number;
    nighttimeDischarge: boolean;
  };
  justification: string;
  trackHistory: AISTrackPoint[];
  operator: string;
  callSign: string;
}

export interface DetectionResult {
  id: string;
  sceneId: string;
  timestamp: string;
  status: "Confirmed" | "False Alarm" | "Under Review" | "Prosecuted / Actioned" | string;
  sarMetadata: {
    satellite: "Sentinel-1A" | "Sentinel-1B" | "NISAR (Simulated)" | string;
    mode: "IW (Interferometric Wide)" | string;
    polarization: "VV + VH" | string;
    resolutionM: number;
    acquisitionTime: string;
    centerCoordinates: [number, number];
  };
  mlMetrics: {
    iouScore: number;
    f1Score: number;
    lookAlikeProbability: number;
    oilSpillProbability: number;
    classificationLabel: "True Oil Spill" | "Biogenic Slick (Algae)" | "Low-Wind Area" | "Rain Cell" | string;
  };
  spill: SpillPolygon;
  driftSimulation: {
    simulationId: string;
    model: "Lagrangian Advection-Diffusion (OpenDrift compatible)";
    driftDurationHours: number;
    timeStepMinutes: number;
    estimatedOriginPoint: [number, number];
    originUncertaintyRadiusKm: number;
    originTimestamp: string;
    steps: DriftStep[];
  };
  candidateVessels: SuspectVessel[];
  darkVesselDetected: boolean;
  darkVesselReason?: string;
  analystNotes?: string;
}

export interface PastIncident {
  id: string;
  date: string;
  locationName: string;
  coordinates: [number, number];
  spillAreaKm2: number;
  volumeEstM3: number;
  primarySuspectMmsi?: string;
  primarySuspectName?: string;
  attributionConfidence: number;
  status: "Confirmed" | "False Alarm" | "Prosecuted / Actioned" | "Under Review";
  satellite: string;
}
