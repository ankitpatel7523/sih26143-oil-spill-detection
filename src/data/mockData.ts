import { DetectionResult, PastIncident } from '../types';

// Realistic Sentinel-1 SAR acquisition in the Arabian Sea - International Tanker Route
export const CURRENT_INCIDENT: DetectionResult = {
  id: "NTRO-SAR-2026-0842",
  sceneId: "S1A_IW_GRDH_1SDV_20260920T024512_042890_051EE2_D4C1",
  timestamp: "2026-09-20T02:45:12Z",
  status: "Confirmed",
  sarMetadata: {
    satellite: "Sentinel-1A",
    mode: "IW (Interferometric Wide)",
    polarization: "VV + VH",
    resolutionM: 10,
    acquisitionTime: "2026-09-20T02:45:12Z",
    centerCoordinates: [18.845, 71.95]
  },
  mlMetrics: {
    iouScore: 0.884,
    f1Score: 0.932,
    lookAlikeProbability: 0.048,
    oilSpillProbability: 0.952,
    classificationLabel: "True Oil Spill"
  },
  spill: {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [[
        [71.932, 18.855],
        [71.955, 18.862],
        [71.982, 18.848],
        [71.995, 18.831],
        [71.975, 18.822],
        [71.948, 18.835],
        [71.932, 18.855]
      ]]
    },
    properties: {
      id: "SPILL-POLYGON-7195",
      areaKm2: 24.65,
      centroid: [18.842, 71.961],
      detectedAt: "2026-09-20T02:45:12Z",
      confidenceScore: 0.952,
      sensor: "C-Band Synthetic Aperture Radar",
      orbitPass: "Descending (Track 114)",
      polarization: "VV (Co-pol dampened by slick)",
      locationName: "Arabian Sea EEZ - 85 nm WNW Mumbai Coast",
      seaStateBeaufort: 3,
      estimatedVolumeM3: 420,
      slickType: "Bunker Fuel"
    }
  },
  driftSimulation: {
    simulationId: "OPENDRIFT-SIM-20260920-REV",
    model: "Lagrangian Advection-Diffusion (OpenDrift compatible)",
    driftDurationHours: 12,
    timeStepMinutes: 60,
    estimatedOriginPoint: [18.915, 71.720],
    originUncertaintyRadiusKm: 4.8,
    originTimestamp: "2026-09-19T17:15:00Z", // ~9.5 hours earlier
    steps: [
      {
        hoursAgo: 0,
        timestamp: "2026-09-20T02:45:00Z",
        centroid: [18.842, 71.961],
        polygon: [
          [18.855, 71.932], [18.862, 71.955], [18.848, 71.982],
          [18.831, 71.995], [18.822, 71.975], [18.835, 71.948]
        ],
        particles: [
          [18.843, 71.960], [18.845, 71.965], [18.839, 71.955], [18.848, 71.970],
          [18.835, 71.950], [18.850, 71.962], [18.838, 71.975]
        ],
        currentVector: { u: 0.28, v: -0.15, speedKnots: 0.62, directionDeg: 118 },
        windVector: { u: 3.2, v: -4.5, speedKnots: 10.7, directionDeg: 145 },
        diffusionRadiusKm: 5.2
      },
      {
        hoursAgo: 2,
        timestamp: "2026-09-20T00:45:00Z",
        centroid: [18.858, 71.912],
        polygon: [
          [18.870, 71.885], [18.876, 71.908], [18.863, 71.932],
          [18.848, 71.940], [18.840, 71.922], [18.852, 71.898]
        ],
        particles: [
          [18.859, 71.911], [18.861, 71.915], [18.854, 71.906], [18.864, 71.920]
        ],
        currentVector: { u: 0.26, v: -0.14, speedKnots: 0.58, directionDeg: 120 },
        windVector: { u: 3.0, v: -4.2, speedKnots: 10.1, directionDeg: 144 },
        diffusionRadiusKm: 4.4
      },
      {
        hoursAgo: 4,
        timestamp: "2026-09-19T22:45:00Z",
        centroid: [18.875, 71.860],
        polygon: [
          [18.885, 71.838], [18.891, 71.856], [18.879, 71.878],
          [18.865, 71.885], [18.858, 71.870], [18.869, 71.848]
        ],
        particles: [
          [18.876, 71.859], [18.878, 71.863], [18.872, 71.855]
        ],
        currentVector: { u: 0.25, v: -0.12, speedKnots: 0.54, directionDeg: 115 },
        windVector: { u: 2.8, v: -4.0, speedKnots: 9.5, directionDeg: 145 },
        diffusionRadiusKm: 3.6
      },
      {
        hoursAgo: 6,
        timestamp: "2026-09-19T20:45:00Z",
        centroid: [18.890, 71.810],
        polygon: [
          [18.898, 71.792], [18.904, 71.808], [18.893, 71.826],
          [18.880, 71.832], [18.875, 71.818], [18.884, 71.800]
        ],
        particles: [
          [18.891, 71.809], [18.892, 71.813], [18.888, 71.806]
        ],
        currentVector: { u: 0.24, v: -0.10, speedKnots: 0.51, directionDeg: 112 },
        windVector: { u: 2.7, v: -3.8, speedKnots: 9.1, directionDeg: 144 },
        diffusionRadiusKm: 2.9
      },
      {
        hoursAgo: 8,
        timestamp: "2026-09-19T18:45:00Z",
        centroid: [18.905, 71.758],
        polygon: [
          [18.912, 71.742], [18.916, 71.756], [18.907, 71.772],
          [18.896, 71.777], [18.892, 71.765], [18.900, 71.750]
        ],
        particles: [
          [18.906, 71.757], [18.907, 71.760], [18.903, 71.755]
        ],
        currentVector: { u: 0.22, v: -0.09, speedKnots: 0.47, directionDeg: 110 },
        windVector: { u: 2.5, v: -3.5, speedKnots: 8.4, directionDeg: 144 },
        diffusionRadiusKm: 2.2
      },
      {
        hoursAgo: 9.5,
        timestamp: "2026-09-19T17:15:00Z",
        centroid: [18.915, 71.720],
        polygon: [
          [18.920, 71.710], [18.923, 71.721], [18.917, 71.731],
          [18.909, 71.733], [18.906, 71.724], [18.912, 71.714]
        ],
        particles: [
          [18.915, 71.720], [18.916, 71.722], [18.914, 71.718]
        ],
        currentVector: { u: 0.20, v: -0.08, speedKnots: 0.43, directionDeg: 110 },
        windVector: { u: 2.4, v: -3.2, speedKnots: 7.8, directionDeg: 143 },
        diffusionRadiusKm: 1.5
      },
      {
        hoursAgo: 12,
        timestamp: "2026-09-19T14:45:00Z",
        centroid: [18.930, 71.670],
        polygon: [
          [18.933, 71.663], [18.935, 71.671], [18.931, 71.678],
          [18.925, 71.679], [18.923, 71.673], [18.927, 71.666]
        ],
        particles: [
          [18.930, 71.670]
        ],
        currentVector: { u: 0.18, v: -0.07, speedKnots: 0.39, directionDeg: 110 },
        windVector: { u: 2.2, v: -3.0, speedKnots: 7.2, directionDeg: 144 },
        diffusionRadiusKm: 1.0
      }
    ]
  },
  candidateVessels: [
    {
      mmsi: "354892000",
      imo: "9312014",
      name: "MT OCEAN GLORY",
      flag: "PA",
      country: "Panama",
      vesselType: "Crude Oil Tanker",
      dwt: 158200,
      overallScore: 94.2,
      rank: 1,
      distanceAtEstimatedOriginKm: 1.8,
      timeDeltaAtOriginHours: 0.4,
      scores: {
        proximityScore: 33.8, // out of 35
        temporalScore: 24.1, // out of 25
        vesselTypeScore: 20.0, // out of 20 (tanker max)
        anomalyScore: 16.3 // out of 20 (severe: speed drop + 2.1h AIS blackout)
      },
      anomaliesDetected: {
        hasAisGap: true,
        gapDurationHours: 2.1,
        gapStartTime: "2026-09-19T16:45:00Z",
        hasSpeedDrop: true,
        speedBeforeKnots: 13.8,
        speedDuringKnots: 3.4,
        nighttimeDischarge: true
      },
      justification: "CRITICAL SUSPECT: Suezmax crude tanker passed within 1.8 km of backward drift origin at 17:05 UTC. Vessel turned off AIS transponder for 2.1 hours and decelerated from 13.8 kts to 3.4 kts during dark hours, consistent with illegal tank-washing/bilge discharge.",
      operator: "Pacific Meridian Shipping Ltd",
      callSign: "3FEP8",
      trackHistory: [
        { timestamp: "2026-09-19T14:00:00Z", lat: 18.980, lng: 71.450, speedKnots: 13.9, headingDeg: 115, status: "Underway Using Engine" },
        { timestamp: "2026-09-19T15:00:00Z", lat: 18.960, lng: 71.550, speedKnots: 13.8, headingDeg: 114, status: "Underway Using Engine" },
        { timestamp: "2026-09-19T16:00:00Z", lat: 18.938, lng: 71.650, speedKnots: 13.6, headingDeg: 116, status: "Underway Using Engine" },
        { timestamp: "2026-09-19T16:45:00Z", lat: 18.922, lng: 71.705, speedKnots: 8.2, headingDeg: 118, status: "Speed Dropping" },
        // AIS GAP from 16:45 to 18:50 (estimated track at 17:15 is [18.916, 71.723] speed 3.4 kts)
        { timestamp: "2026-09-19T18:50:00Z", lat: 18.905, lng: 71.765, speedKnots: 6.5, headingDeg: 119, status: "AIS Resumed (Gap: 125 min)" },
        { timestamp: "2026-09-19T20:00:00Z", lat: 18.880, lng: 71.880, speedKnots: 13.4, headingDeg: 115, status: "Accelerating" },
        { timestamp: "2026-09-19T22:00:00Z", lat: 18.840, lng: 72.080, speedKnots: 13.7, headingDeg: 116, status: "Underway Using Engine" },
        { timestamp: "2026-09-20T02:45:00Z", lat: 18.730, lng: 72.580, speedKnots: 13.9, headingDeg: 115, status: "Underway Using Engine" }
      ]
    },
    {
      mmsi: "636019445",
      imo: "9488126",
      name: "MV CELTIC PIONEER",
      flag: "LR",
      country: "Liberia",
      vesselType: "Bulk Carrier",
      dwt: 76500,
      overallScore: 61.5,
      rank: 2,
      distanceAtEstimatedOriginKm: 8.4,
      timeDeltaAtOriginHours: 1.2,
      scores: {
        proximityScore: 22.5,
        temporalScore: 18.0,
        vesselTypeScore: 12.0,
        anomalyScore: 9.0
      },
      anomaliesDetected: {
        hasAisGap: false,
        hasSpeedDrop: true,
        speedBeforeKnots: 12.5,
        speedDuringKnots: 9.1,
        nighttimeDischarge: true
      },
      justification: "MODERATE PROXIMITY: Panamax bulk carrier passed within 8.4 km of drift origin. Speed decreased moderately (12.5 to 9.1 kts) for navigation corridor spacing. No AIS blackout recorded.",
      operator: "TransGlobal Maritime S.A.",
      callSign: "D5TX4",
      trackHistory: [
        { timestamp: "2026-09-19T14:00:00Z", lat: 19.040, lng: 71.480, speedKnots: 12.6, headingDeg: 118, status: "Underway" },
        { timestamp: "2026-09-19T16:00:00Z", lat: 18.990, lng: 71.660, speedKnots: 12.4, headingDeg: 117, status: "Underway" },
        { timestamp: "2026-09-19T18:00:00Z", lat: 18.940, lng: 71.840, speedKnots: 9.1, headingDeg: 118, status: "Speed Reduced" },
        { timestamp: "2026-09-19T20:00:00Z", lat: 18.890, lng: 72.020, speedKnots: 12.2, headingDeg: 116, status: "Underway" },
        { timestamp: "2026-09-20T02:45:00Z", lat: 18.720, lng: 72.640, speedKnots: 12.5, headingDeg: 117, status: "Underway" }
      ]
    },
    {
      mmsi: "413349000",
      imo: "9722340",
      name: "CONTSHIP AURORA",
      flag: "CN",
      country: "China",
      vesselType: "Container Ship",
      dwt: 52000,
      overallScore: 38.4,
      rank: 3,
      distanceAtEstimatedOriginKm: 19.2,
      timeDeltaAtOriginHours: 2.8,
      scores: {
        proximityScore: 12.4,
        temporalScore: 10.0,
        vesselTypeScore: 10.0,
        anomalyScore: 6.0
      },
      anomaliesDetected: {
        hasAisGap: false,
        hasSpeedDrop: false,
        nighttimeDischarge: false
      },
      justification: "LOW SUSPICION: Traversed commercial fairway 19.2 km north of estimated origin. Steady speed profile (18.4 kts); no trajectory anomalies or transponder interruptions.",
      operator: "Eastern Line Maritime",
      callSign: "BRTG8",
      trackHistory: [
        { timestamp: "2026-09-19T14:00:00Z", lat: 19.120, lng: 71.400, speedKnots: 18.6, headingDeg: 112, status: "Underway" },
        { timestamp: "2026-09-19T17:00:00Z", lat: 19.060, lng: 71.740, speedKnots: 18.4, headingDeg: 112, status: "Underway" },
        { timestamp: "2026-09-19T20:00:00Z", lat: 19.000, lng: 72.080, speedKnots: 18.5, headingDeg: 113, status: "Underway" }
      ]
    },
    {
      mmsi: "563048000",
      imo: "9644312",
      name: "SEA DOLPHIN IX",
      flag: "SG",
      country: "Singapore",
      vesselType: "Chemical Tanker",
      dwt: 19800,
      overallScore: 32.1,
      rank: 4,
      distanceAtEstimatedOriginKm: 28.5,
      timeDeltaAtOriginHours: 4.1,
      scores: {
        proximityScore: 8.1,
        temporalScore: 7.0,
        vesselTypeScore: 15.0,
        anomalyScore: 2.0
      },
      anomaliesDetected: {
        hasAisGap: false,
        hasSpeedDrop: false,
        nighttimeDischarge: false
      },
      justification: "UNLIKELY CANDIDATE: Small chemical tanker located 28.5 km southwest outside the high-probability drift envelope. Transit time precedes spill origin by >4 hours.",
      operator: "Apex Chemical Logistics",
      callSign: "9V882",
      trackHistory: [
        { timestamp: "2026-09-19T13:00:00Z", lat: 18.720, lng: 71.420, speedKnots: 11.2, headingDeg: 110, status: "Underway" },
        { timestamp: "2026-09-19T17:00:00Z", lat: 18.680, lng: 71.710, speedKnots: 11.0, headingDeg: 111, status: "Underway" }
      ]
    }
  ],
  darkVesselDetected: false,
  darkVesselReason: "Positive correlation confirmed. AIS record exists with verified transponder gap matching origin spacetime.",
  analystNotes: "NTRO SAR Tasking Priority 1: S1A descending pass over Sector 4-B identified slick of 24.65 km² with characteristic high-contrast C-band radar backscatter dampening (-18.4 dB vs -8.2 dB background sea). Backward advection-diffusion modeling powered by OSCAR surface currents (0.62 kts ESE) and ECMWF wind field (10.7 kts NW) backtracked spill centroid to [18.915°N, 71.720°E] at 17:15 UTC. Suezmax crude tanker MT OCEAN GLORY (MMSI 354892000) was within 1.8 km with a 125-minute AIS blackout. Recommend formal notification to Indian Coast Guard (ICG) Maritime Rescue Co-ordination Centre (MRCC) Mumbai for maritime interception and forensic oil-fingerprint sampling."
};

// Preset sample scenes for instant interactive demonstration
export const SAMPLE_SCENES = [
  {
    id: "scene-s1-arabian-sea",
    name: "Sentinel-1A: Arabian Sea Tanker Highway",
    region: "Indian EEZ (Offshore Mumbai / Uran)",
    date: "2026-09-20 02:45 UTC",
    satellite: "Sentinel-1A C-SAR",
    size: "42.8 MB (GRDH)",
    previewImg: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
    description: "Descending orbit pass capturing 24.65 km² bunker slick. Strong AIS correlation with Suezmax tanker MT OCEAN GLORY.",
    result: CURRENT_INCIDENT
  },
  {
    id: "scene-s1-gulf-kutch",
    name: "Sentinel-1B: Gulf of Kutch Port Approaches",
    region: "Gujarat Maritime Channel (Mundra / Vadinar)",
    date: "2026-08-14 11:20 UTC",
    satellite: "Sentinel-1B C-SAR",
    size: "38.2 MB (GRDH)",
    previewImg: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80",
    description: "Tidal channel spill of 14.1 km² near crude oil discharge terminal. Backward drift indicates ebb-tide discharge from bulk carrier.",
    result: {
      ...CURRENT_INCIDENT,
      id: "NTRO-SAR-2026-0791",
      sceneId: "S1B_IW_GRDH_1SDV_20260814T112000_038102_047EAA_F102",
      timestamp: "2026-08-14T11:20:00Z",
      spill: {
        ...CURRENT_INCIDENT.spill,
        properties: {
          ...CURRENT_INCIDENT.spill.properties,
          areaKm2: 14.1,
          locationName: "Gulf of Kutch Maritime Approach",
          confidenceScore: 0.912,
          estimatedVolumeM3: 210,
          slickType: "Heavy Crude"
        }
      }
    }
  },
  {
    id: "scene-s1-dark-vessel",
    name: "Sentinel-1A: Andaman Sea Dark Vessel Incident",
    region: "Malacca Strait Western Approach",
    date: "2026-07-02 04:10 UTC",
    satellite: "Sentinel-1A C-SAR",
    size: "45.0 MB (GRDH)",
    previewImg: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    description: "Critical Intelligence Alert: 31.8 km² slick detected with NO broadcasted AIS signatures within 45 km radius. Suspected dark ship evasion.",
    result: {
      ...CURRENT_INCIDENT,
      id: "NTRO-SAR-2026-0648",
      sceneId: "S1A_IW_GRDH_1SDV_20260702T041015_035129_041BC1_8801",
      timestamp: "2026-07-02T04:10:15Z",
      darkVesselDetected: true,
      darkVesselReason: "CRITICAL INTELLIGENCE ALERT: No AIS transponder was active in the spatio-temporal drift envelope (50 km / ±8h). Spatial SAR ship-detection filter detected a 240m radar-reflective metallic signature without corresponding AIS MMSI broadcast. Vessel operated intentionally in dark-vessel evasion mode.",
      candidateVessels: []
    }
  },
  {
    id: "scene-s1-lookalike-algae",
    name: "Sentinel-1B: Bay of Bengal Algae Bloom (Look-Alike)",
    region: "Bay of Bengal (Visakhapatnam Shelf)",
    date: "2026-06-18 09:30 UTC",
    satellite: "Sentinel-1B C-SAR",
    size: "39.5 MB (GRDH)",
    previewImg: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=800&q=80",
    description: "False Alarm Demonstration: Dark surface feature generated by biological phytoplankton surface surfactants. CNN Classifier successfully flags biogenic slick.",
    result: {
      ...CURRENT_INCIDENT,
      id: "NTRO-SAR-2026-0511",
      sceneId: "S1B_IW_GRDH_1SDV_20260618T093012_032890_03BEE2_1142",
      timestamp: "2026-06-18T09:30:12Z",
      status: "False Alarm",
      mlMetrics: {
        iouScore: 0.812,
        f1Score: 0.840,
        lookAlikeProbability: 0.892,
        oilSpillProbability: 0.108,
        classificationLabel: "Biogenic Slick (Algae)"
      },
      analystNotes: "CLASSIFICATION FILTER: Low backscatter pattern exhibits diffuse boundaries and spiraling eddies characteristic of natural biogenic surfactants from phytoplankton bloom. Confirmed as non-petroleum look-alike by ResNet-50 classifier."
    }
  }
];

export const PAST_INCIDENTS: PastIncident[] = [
  {
    id: "NTRO-SAR-2026-0842",
    date: "2026-09-20",
    locationName: "Arabian Sea EEZ (85 nm W Mumbai)",
    coordinates: [18.842, 71.961],
    spillAreaKm2: 24.65,
    volumeEstM3: 420,
    primarySuspectMmsi: "354892000",
    primarySuspectName: "MT OCEAN GLORY",
    attributionConfidence: 94.2,
    status: "Confirmed",
    satellite: "Sentinel-1A"
  },
  {
    id: "NTRO-SAR-2026-0791",
    date: "2026-08-14",
    locationName: "Gulf of Kutch Coastal Channel",
    coordinates: [22.482, 69.412],
    spillAreaKm2: 14.10,
    volumeEstM3: 210,
    primarySuspectMmsi: "636019445",
    primarySuspectName: "MV CELTIC PIONEER",
    attributionConfidence: 87.5,
    status: "Prosecuted / Actioned",
    satellite: "Sentinel-1B"
  },
  {
    id: "NTRO-SAR-2026-0740",
    date: "2026-07-28",
    locationName: "Lakshadweep Maritime Passage",
    coordinates: [10.550, 72.820],
    spillAreaKm2: 8.75,
    volumeEstM3: 130,
    primarySuspectMmsi: "413349000",
    primarySuspectName: "CONTSHIP AURORA",
    attributionConfidence: 78.4,
    status: "Confirmed",
    satellite: "Sentinel-1A"
  },
  {
    id: "NTRO-SAR-2026-0648",
    date: "2026-07-02",
    locationName: "Andaman Sea Western Gateway",
    coordinates: [11.820, 92.450],
    spillAreaKm2: 31.80,
    volumeEstM3: 650,
    primarySuspectMmsi: undefined,
    primarySuspectName: "Unidentified Dark Vessel (No AIS)",
    attributionConfidence: 89.0,
    status: "Under Review",
    satellite: "Sentinel-1A"
  },
  {
    id: "NTRO-SAR-2026-0511",
    date: "2026-06-18",
    locationName: "Bay of Bengal Shelf",
    coordinates: [17.650, 83.420],
    spillAreaKm2: 18.20,
    volumeEstM3: 0,
    primarySuspectMmsi: undefined,
    primarySuspectName: "Biogenic Surfactant / Algae",
    attributionConfidence: 10.8,
    status: "False Alarm",
    satellite: "Sentinel-1B"
  },
  {
    id: "NTRO-SAR-2026-0422",
    date: "2026-05-11",
    locationName: "Gulf of Mannar Biological Reserve",
    coordinates: [9.120, 79.250],
    spillAreaKm2: 5.40,
    volumeEstM3: 85,
    primarySuspectMmsi: "563048000",
    primarySuspectName: "SEA DOLPHIN IX",
    attributionConfidence: 82.0,
    status: "Prosecuted / Actioned",
    satellite: "Sentinel-1A"
  },
  {
    id: "NTRO-SAR-2026-0315",
    date: "2026-04-03",
    locationName: "Goa Offshore Shipping Corridor",
    coordinates: [15.350, 73.450],
    spillAreaKm2: 12.30,
    volumeEstM3: 190,
    primarySuspectMmsi: "354112000",
    primarySuspectName: "STAR PACIFIC V",
    attributionConfidence: 91.5,
    status: "Confirmed",
    satellite: "Sentinel-1B"
  }
];
