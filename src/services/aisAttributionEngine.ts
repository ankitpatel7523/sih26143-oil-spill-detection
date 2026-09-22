/**
 * AIS Spatiotemporal Correlation & Vessel Attribution Engine
 * Correlates maritime transponder records with reverse hydrodynamic drift origin point,
 * computes multi-factor forensic scores, and detects transponder blackout / deceleration anomalies.
 * Organization: National Technical Research Organisation (NTRO) - SIH26143
 */

import { SuspectVessel, AISTrackPoint } from '../types';

export interface AISRawRecord {
  mmsi: string;
  timestamp: string; // ISO or 'YYYY-MM-DD HH:mm:ss'
  lat: number;
  lng: number;
  sogKnots: number; // Speed Over Ground
  cogDeg: number; // Course Over Ground
  headingDeg?: number;
  vesselName?: string;
  imo?: string;
  callSign?: string;
  vesselType?: string;
  dwt?: number;
  flag?: string;
}

/**
 * Calculates Great-Circle distance between two coordinates in kilometers using Haversine formula
 */
export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371.0; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180.0;
  const dLon = ((lon2 - lon1) * Math.PI) / 180.0;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180.0) *
      Math.cos((lat2 * Math.PI) / 180.0) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Parses user-uploaded AIS CSV file (supports MarineCadastre, Spire, AISHub format)
 */
export function parseAISCsv(csvText: string): AISRawRecord[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].toLowerCase().split(',').map((h) => h.trim().replace(/['"]/g, ''));
  const mmsiIdx = headers.findIndex((h) => h.includes('mmsi'));
  const timeIdx = headers.findIndex((h) => h.includes('time') || h.includes('date'));
  const latIdx = headers.findIndex((h) => h === 'lat' || h.includes('latitude'));
  const lonIdx = headers.findIndex((h) => h === 'lon' || h === 'lng' || h.includes('longitude'));
  const sogIdx = headers.findIndex((h) => h === 'sog' || h.includes('speed'));
  const cogIdx = headers.findIndex((h) => h === 'cog' || h.includes('course'));
  const nameIdx = headers.findIndex((h) => h.includes('name') || h.includes('vessel'));
  const typeIdx = headers.findIndex((h) => h.includes('type') || h.includes('cargo'));
  const imoIdx = headers.findIndex((h) => h.includes('imo'));

  const records: AISRawRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map((c) => c.trim().replace(/['"]/g, ''));
    if (row.length < 4) continue;

    const mmsi = mmsiIdx >= 0 ? row[mmsiIdx] : `V-${i}`;
    const rawTime = timeIdx >= 0 ? row[timeIdx] : new Date().toISOString();
    const lat = latIdx >= 0 ? parseFloat(row[latIdx]) : NaN;
    const lng = lonIdx >= 0 ? parseFloat(row[lonIdx]) : NaN;
    const sog = sogIdx >= 0 ? parseFloat(row[sogIdx]) || 12.0 : 12.0;
    const cog = cogIdx >= 0 ? parseFloat(row[cogIdx]) || 90.0 : 90.0;

    if (!isNaN(lat) && !isNaN(lng)) {
      records.push({
        mmsi,
        timestamp: new Date(rawTime).toISOString(),
        lat,
        lng,
        sogKnots: sog,
        cogDeg: cog,
        vesselName: nameIdx >= 0 ? row[nameIdx] : `Vessel ${mmsi}`,
        vesselType: typeIdx >= 0 ? row[typeIdx] : 'Commercial Vessel',
        imo: imoIdx >= 0 ? row[imoIdx] : undefined,
      });
    }
  }

  return records;
}

/**
 * Computes attribution score for a vessel based on proximity, temporal fit, vessel risk type, and anomalies
 */
export function scoreVessel(
  vesselInfo: {
    mmsi: string;
    name: string;
    vesselType: SuspectVessel['vesselType'];
    dwt: number;
    flag: string;
    country: string;
    operator: string;
    callSign: string;
    imo: string;
    trackHistory: AISTrackPoint[];
  },
  originPoint: [number, number],
  originTimestamp: string
): SuspectVessel {
  const originTime = new Date(originTimestamp).getTime();

  // Find closest point of approach (CPA) to estimated origin
  let minDistanceKm = Infinity;
  let closestTrackPoint = vesselInfo.trackHistory[0];
  let timeDeltaHoursAtClosest = 0;

  vesselInfo.trackHistory.forEach((pt) => {
    const dist = haversineDistanceKm(originPoint[0], originPoint[1], pt.lat, pt.lng);
    if (dist < minDistanceKm) {
      minDistanceKm = dist;
      closestTrackPoint = pt;
      const ptTime = new Date(pt.timestamp).getTime();
      timeDeltaHoursAtClosest = Math.abs(ptTime - originTime) / (3600 * 1000);
    }
  });

  // 1. Spatial Proximity Score (0 - 35 points)
  // Exponential decay with distance: within 2 km gives ~33-35 pts; 10 km gives ~15 pts; >35 km gives <2 pts
  const proximityScore = Math.max(0, Math.min(35, 35 * Math.exp(-minDistanceKm / 12.0)));

  // 2. Temporal Fit Score (0 - 25 points)
  // Decays with time offset from estimated origin time (within 1 hour gives ~20-25 pts)
  const temporalScore = Math.max(0, Math.min(25, 25 * Math.max(0, 1 - timeDeltaHoursAtClosest / 5.0)));

  // 3. Vessel Type Risk Matrix Score (0 - 20 points)
  let vesselTypeScore = 6.0;
  if (vesselInfo.vesselType === 'Crude Oil Tanker') vesselTypeScore = 20.0;
  else if (vesselInfo.vesselType === 'Chemical Tanker') vesselTypeScore = 17.5;
  else if (vesselInfo.vesselType === 'Offshore Supply') vesselTypeScore = 15.0;
  else if (vesselInfo.vesselType === 'Bulk Carrier') vesselTypeScore = 12.0;
  else if (vesselInfo.vesselType === 'Container Ship') vesselTypeScore = 8.0;

  // 4. Behavioral Anomaly Detection Engine (0 - 20 points)
  let hasAisGap = false;
  let gapDurationHours = 0;
  let gapStartTime: string | undefined;
  let hasSpeedDrop = false;
  let speedBeforeKnots = 0;
  let speedDuringKnots = 0;

  // Check for AIS blackout gaps (> 30 minutes between consecutive reports)
  for (let i = 0; i < vesselInfo.trackHistory.length - 1; i++) {
    const t1 = new Date(vesselInfo.trackHistory[i].timestamp).getTime();
    const t2 = new Date(vesselInfo.trackHistory[i + 1].timestamp).getTime();
    const gapMinutes = (t2 - t1) / (60 * 1000);

    if (gapMinutes > 35) {
      hasAisGap = true;
      gapDurationHours = parseFloat((gapMinutes / 60).toFixed(1));
      gapStartTime = vesselInfo.trackHistory[i].timestamp;
      break;
    }
  }

  // Check for speed drops (transit speed vs speed near origin)
  const speeds = vesselInfo.trackHistory.map((t) => t.speedKnots);
  const maxSpeed = Math.max(...speeds);
  const minSpeedNearOrigin = closestTrackPoint?.speedKnots ?? 12.0;

  if (maxSpeed >= 11.0 && minSpeedNearOrigin <= 6.5) {
    hasSpeedDrop = true;
    speedBeforeKnots = parseFloat(maxSpeed.toFixed(1));
    speedDuringKnots = parseFloat(minSpeedNearOrigin.toFixed(1));
  }

  // Check for nighttime discharge (origin timestamp in hours 19:00 - 05:00 UTC)
  const originHourUtc = new Date(originTimestamp).getUTCHours();
  const nighttimeDischarge = originHourUtc >= 18 || originHourUtc <= 5;

  let anomalyScore = 0;
  if (hasAisGap) anomalyScore += 10.0;
  if (hasSpeedDrop) anomalyScore += 7.0;
  if (nighttimeDischarge && minDistanceKm < 15) anomalyScore += 3.0;
  anomalyScore = Math.min(20, anomalyScore);

  const overallScore = parseFloat((proximityScore + temporalScore + vesselTypeScore + anomalyScore).toFixed(1));

  // Generate automated forensic rationale
  let justification = '';
  if (overallScore >= 80) {
    justification = `PRIMARY CRITICAL SUSPECT: High-risk ${vesselInfo.vesselType} intercepted within ${minDistanceKm.toFixed(1)} km of backward drift origin at estimated discharge time. ${hasAisGap ? `Vessel intentionally disabled AIS transponder for ${gapDurationHours} hours. ` : ''}${hasSpeedDrop ? `Drastic speed reduction from ${speedBeforeKnots} kts to ${speedDuringKnots} kts during passage confirms active discharge profile.` : ''}`;
  } else if (overallScore >= 50) {
    justification = `ELEVATED INTEREST: ${vesselInfo.vesselType} transited within ${minDistanceKm.toFixed(1)} km of origin corridor. ${hasSpeedDrop ? 'Speed anomalies observed during nocturnal transit.' : 'Trajectory aligns with regional shipping corridor.'}`;
  } else {
    justification = `LOW SUSPICION: Commercial vessel maintained steady transit (${closestTrackPoint.speedKnots} kts) with constant AIS broadcast; passed ${minDistanceKm.toFixed(1)} km outside primary dispersion cone.`;
  }

  return {
    ...vesselInfo,
    overallScore,
    rank: 1, // Will be reassigned after sorting
    distanceAtEstimatedOriginKm: parseFloat(minDistanceKm.toFixed(1)),
    timeDeltaAtOriginHours: parseFloat(timeDeltaHoursAtClosest.toFixed(1)),
    scores: {
      proximityScore: parseFloat(proximityScore.toFixed(1)),
      temporalScore: parseFloat(temporalScore.toFixed(1)),
      vesselTypeScore: parseFloat(vesselTypeScore.toFixed(1)),
      anomalyScore: parseFloat(anomalyScore.toFixed(1)),
    },
    anomaliesDetected: {
      hasAisGap,
      gapDurationHours: hasAisGap ? gapDurationHours : undefined,
      gapStartTime,
      hasSpeedDrop,
      speedBeforeKnots: hasSpeedDrop ? speedBeforeKnots : undefined,
      speedDuringKnots: hasSpeedDrop ? speedDuringKnots : undefined,
      nighttimeDischarge,
    },
    justification,
  };
}

/**
 * Generates realistic maritime traffic corridors for any chosen ocean coordinates (Arabian Sea, Bay of Bengal, etc.)
 */
export function generateRealisticVesselCorridor(
  originPoint: [number, number],
  originTimestamp: string
): SuspectVessel[] {
  const [oLat, oLng] = originPoint;
  const oTime = new Date(originTimestamp).getTime();

  // Helper to generate timestamps
  const timeOffset = (hours: number) => new Date(oTime + hours * 3600 * 1000).toISOString();

  // 1. Primary Suspect: Crude Tanker with speed drop & AIS gap
  const suspect1 = scoreVessel(
    {
      mmsi: "354892000",
      imo: "9312014",
      name: "MT OCEAN GLORY",
      flag: "PA",
      country: "Panama",
      vesselType: "Crude Oil Tanker",
      dwt: 158200,
      operator: "Pacific Meridian Shipping Ltd",
      callSign: "3FEP8",
      trackHistory: [
        { timestamp: timeOffset(-4), lat: oLat + 0.08, lng: oLng - 0.35, speedKnots: 13.9, headingDeg: 115, status: "Underway Using Engine" },
        { timestamp: timeOffset(-2), lat: oLat + 0.04, lng: oLng - 0.18, speedKnots: 13.7, headingDeg: 114, status: "Underway Using Engine" },
        { timestamp: timeOffset(-0.5), lat: oLat + 0.01, lng: oLng - 0.03, speedKnots: 4.2, headingDeg: 118, status: "Speed Dropping (Discharge)" },
        // Coinciding AIS Gap of 2.1h
        { timestamp: timeOffset(1.6), lat: oLat - 0.02, lng: oLng + 0.12, speedKnots: 6.8, headingDeg: 119, status: "AIS Resumed (Gap: 125m)" },
        { timestamp: timeOffset(3.5), lat: oLat - 0.07, lng: oLng + 0.32, speedKnots: 13.5, headingDeg: 116, status: "Accelerating" },
        { timestamp: timeOffset(7), lat: oLat - 0.18, lng: oLng + 0.72, speedKnots: 13.8, headingDeg: 115, status: "Underway Using Engine" },
      ],
    },
    originPoint,
    originTimestamp
  );

  // 2. Secondary Suspect: Bulk Carrier passing within 8 km
  const suspect2 = scoreVessel(
    {
      mmsi: "636019445",
      imo: "9488126",
      name: "MV CELTIC PIONEER",
      flag: "LR",
      country: "Liberia",
      vesselType: "Bulk Carrier",
      dwt: 76500,
      operator: "TransGlobal Maritime S.A.",
      callSign: "D5TX4",
      trackHistory: [
        { timestamp: timeOffset(-3.5), lat: oLat + 0.15, lng: oLng - 0.28, speedKnots: 12.6, headingDeg: 118, status: "Underway" },
        { timestamp: timeOffset(-1), lat: oLat + 0.07, lng: oLng - 0.06, speedKnots: 12.4, headingDeg: 117, status: "Underway" },
        { timestamp: timeOffset(1.2), lat: oLat + 0.02, lng: oLng + 0.14, speedKnots: 9.8, headingDeg: 118, status: "Speed Reduced" },
        { timestamp: timeOffset(4), lat: oLat - 0.05, lng: oLng + 0.36, speedKnots: 12.2, headingDeg: 116, status: "Underway" },
      ],
    },
    originPoint,
    originTimestamp
  );

  // 3. Innocent Container Ship in regular transit
  const suspect3 = scoreVessel(
    {
      mmsi: "413349000",
      imo: "9722340",
      name: "CONTSHIP AURORA",
      flag: "CN",
      country: "China",
      vesselType: "Container Ship",
      dwt: 52000,
      operator: "Eastern Line Maritime",
      callSign: "BRTG8",
      trackHistory: [
        { timestamp: timeOffset(-3), lat: oLat + 0.25, lng: oLng - 0.35, speedKnots: 18.6, headingDeg: 112, status: "Underway" },
        { timestamp: timeOffset(0), lat: oLat + 0.16, lng: oLng + 0.02, speedKnots: 18.4, headingDeg: 112, status: "Underway" },
        { timestamp: timeOffset(3), lat: oLat + 0.08, lng: oLng + 0.38, speedKnots: 18.5, headingDeg: 113, status: "Underway" },
      ],
    },
    originPoint,
    originTimestamp
  );

  // 4. Distant Chemical Tanker
  const suspect4 = scoreVessel(
    {
      mmsi: "563048000",
      imo: "9644312",
      name: "SEA DOLPHIN IX",
      flag: "SG",
      country: "Singapore",
      vesselType: "Chemical Tanker",
      dwt: 19800,
      operator: "Apex Chemical Logistics",
      callSign: "9V882",
      trackHistory: [
        { timestamp: timeOffset(-4), lat: oLat - 0.22, lng: oLng - 0.30, speedKnots: 11.2, headingDeg: 110, status: "Underway" },
        { timestamp: timeOffset(-0.5), lat: oLat - 0.25, lng: oLng + 0.02, speedKnots: 11.0, headingDeg: 111, status: "Underway" },
        { timestamp: timeOffset(3.5), lat: oLat - 0.28, lng: oLng + 0.38, speedKnots: 11.1, headingDeg: 110, status: "Underway" },
      ],
    },
    originPoint,
    originTimestamp
  );

  // Sort by overall score descending and assign rank
  const ranked = [suspect1, suspect2, suspect3, suspect4].sort((a, b) => b.overallScore - a.overallScore);
  ranked.forEach((v, idx) => {
    v.rank = idx + 1;
  });

  return ranked;
}
