/**
 * Storage Service for SIH26143 Maritime Oil Spill Detection & Attribution System
 * Manages operational settings, custom uploaded detection incidents, and analyst forensic dossiers.
 */

import { DetectionResult, PastIncident } from '../types';
import { CURRENT_INCIDENT, PAST_INCIDENTS } from '../data/mockData';

export interface SystemSettings {
  copernicusUser: string;
  aisSource: 'aisstream' | 'noaa' | 'coastguard' | 'custom_csv';
  driftWindowHours: number;
  bufferRadiusKm: number;
  windageFactor: number; // percentage, e.g. 3.0 = 3% of 10m wind
  diffusionCoeffM2s: number; // e.g. 10.0 m^2/s
  iouThreshold: number; // e.g. 0.75
  oceanDataSource: 'oscar' | 'hycom' | 'copernicus_marine' | 'incois';
  geminiApiKey?: string;
  autoAlertCoastGuard: boolean;
}

const SETTINGS_KEY = 'ntro_sat_ais_settings_v1';
const CUSTOM_INCIDENTS_KEY = 'ntro_sat_ais_custom_incidents_v1';
const PAST_INCIDENTS_KEY = 'ntro_sat_ais_past_incidents_v1';

export const DEFAULT_SETTINGS: SystemSettings = {
  copernicusUser: 'ntro_mda_surveillance',
  aisSource: 'aisstream',
  driftWindowHours: 12,
  bufferRadiusKm: 50,
  windageFactor: 3.0,
  diffusionCoeffM2s: 10.0,
  iouThreshold: 0.80,
  oceanDataSource: 'oscar',
  geminiApiKey: typeof process !== 'undefined' ? (process.env.GEMINI_API_KEY || '') : '',
  autoAlertCoastGuard: true,
};

export const StorageService = {
  getSettings(): SystemSettings {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Error reading settings from localStorage', e);
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: SystemSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings to localStorage', e);
    }
  },

  getPastIncidents(): PastIncident[] {
    try {
      const stored = localStorage.getItem(PAST_INCIDENTS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading past incidents', e);
    }
    return PAST_INCIDENTS;
  },

  savePastIncidents(incidents: PastIncident[]): void {
    try {
      localStorage.setItem(PAST_INCIDENTS_KEY, JSON.stringify(incidents));
    } catch (e) {
      console.error('Error saving past incidents', e);
    }
  },

  addIncident(incident: DetectionResult): void {
    try {
      // 1. Save to custom incidents
      const custom = this.getCustomIncidents();
      const updatedCustom = [incident, ...custom.filter(i => i.id !== incident.id)];
      localStorage.setItem(CUSTOM_INCIDENTS_KEY, JSON.stringify(updatedCustom));

      // 2. Add to past incidents list for archival
      const past = this.getPastIncidents();
      const newPastRecord: PastIncident = {
        id: incident.id,
        date: incident.timestamp.split('T')[0],
        locationName: incident.spill.properties.locationName,
        coordinates: incident.spill.properties.centroid,
        spillAreaKm2: incident.spill.properties.areaKm2,
        volumeEstM3: incident.spill.properties.estimatedVolumeM3,
        primarySuspectMmsi: incident.candidateVessels[0]?.mmsi,
        primarySuspectName: incident.candidateVessels[0]?.name || (incident.darkVesselDetected ? 'Unidentified Dark Vessel' : 'Unknown'),
        attributionConfidence: incident.candidateVessels[0]?.overallScore || 0,
        status: incident.status as any,
        satellite: incident.sarMetadata.satellite,
      };
      this.savePastIncidents([newPastRecord, ...past.filter(p => p.id !== incident.id)]);
    } catch (e) {
      console.error('Error adding incident to storage', e);
    }
  },

  getCustomIncidents(): DetectionResult[] {
    try {
      const stored = localStorage.getItem(CUSTOM_INCIDENTS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading custom incidents', e);
    }
    return [];
  },
};
