import React, { useState, useEffect } from 'react';
import { Sidebar, NavPage } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { OverviewPage } from './pages/OverviewPage';
import { UploadDetectPage } from './pages/UploadDetectPage';
import { SpillDriftMapPage } from './pages/SpillDriftMapPage';
import { SuspectVesselsPage } from './pages/SuspectVesselsPage';
import { IncidentReportPage } from './pages/IncidentReportPage';
import { PastIncidentsPage } from './pages/PastIncidentsPage';
import { SettingsPage } from './pages/SettingsPage';
import { DocsPitchDeckPage } from './pages/DocsPitchDeckPage';
import { CURRENT_INCIDENT, SAMPLE_SCENES } from './data/mockData';
import { DetectionResult, SuspectVessel } from './types';
import { StorageService } from './services/storageService';

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavPage>('overview');
  const [currentIncident, setCurrentIncident] = useState<DetectionResult>(CURRENT_INCIDENT);
  const [selectedVessel, setSelectedVessel] = useState<SuspectVessel | null>(
    CURRENT_INCIDENT.candidateVessels[0] || null
  );
  const [pastIncidentsList, setPastIncidentsList] = useState(StorageService.getPastIncidents());

  // Load past incidents on mount
  useEffect(() => {
    setPastIncidentsList(StorageService.getPastIncidents());
  }, [currentIncident.id]);

  const handleSelectVesselByMmsi = (mmsi: string) => {
    const vessel = currentIncident.candidateVessels.find((v) => v.mmsi === mmsi) || null;
    setSelectedVessel(vessel);
  };

  const handleSelectIncidentById = (id: string) => {
    // 1. Check custom saved incidents
    const customList = StorageService.getCustomIncidents();
    const foundCustom = customList.find((c) => c.id === id);
    if (foundCustom) {
      setCurrentIncident(foundCustom);
      setSelectedVessel(foundCustom.candidateVessels[0] || null);
      setCurrentPage('spill-drift-map');
      return;
    }

    // 2. Check sample scenes
    const foundSample = SAMPLE_SCENES.find((s) => s.result.id === id);
    if (foundSample) {
      setCurrentIncident(foundSample.result);
      setSelectedVessel(foundSample.result.candidateVessels[0] || null);
    }
    setCurrentPage('spill-drift-map');
  };

  const handleNewDetectionLoaded = (newIncident: DetectionResult) => {
    setCurrentIncident(newIncident);
    setSelectedVessel(newIncident.candidateVessels[0] || null);
    setPastIncidentsList(StorageService.getPastIncidents());
    setCurrentPage('spill-drift-map');
  };

  const handleUpdateDetection = (updated: DetectionResult) => {
    setCurrentIncident(updated);
    if (updated.candidateVessels.length > 0 && !selectedVessel) {
      setSelectedVessel(updated.candidateVessels[0]);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={setCurrentPage}
        activeAlertCount={currentIncident.status === 'Confirmed' ? 1 : 0}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Telemetry & Header Bar */}
        <TopBar
          currentIncident={currentIncident}
          onNewScanClick={() => setCurrentPage('upload-detect')}
          onViewArchitectureClick={() => setCurrentPage('architecture-docs')}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 overflow-y-auto bg-slate-950/95 scrollbar-thin scrollbar-thumb-slate-800">
          {currentPage === 'overview' && (
            <OverviewPage
              currentIncident={currentIncident}
              pastIncidents={pastIncidentsList}
              onNavigate={setCurrentPage}
              onSelectVesselByMmsi={handleSelectVesselByMmsi}
            />
          )}

          {currentPage === 'upload-detect' && (
            <UploadDetectPage
              currentIncident={currentIncident}
              onSelectIncident={handleNewDetectionLoaded}
              onNavigateToMap={() => setCurrentPage('spill-drift-map')}
            />
          )}

          {currentPage === 'spill-drift-map' && (
            <SpillDriftMapPage
              detection={currentIncident}
              selectedVessel={selectedVessel}
              onSelectVessel={setSelectedVessel}
              onNavigateToVessels={() => setCurrentPage('suspect-vessels')}
              onUpdateDetection={handleUpdateDetection}
            />
          )}

          {currentPage === 'suspect-vessels' && (
            <SuspectVesselsPage
              detection={currentIncident}
              selectedVessel={selectedVessel}
              onSelectVessel={setSelectedVessel}
              onNavigateToMap={() => setCurrentPage('spill-drift-map')}
              onNavigateToReport={() => setCurrentPage('incident-report')}
              onUpdateDetection={handleUpdateDetection}
            />
          )}

          {currentPage === 'incident-report' && (
            <IncidentReportPage detection={currentIncident} />
          )}

          {currentPage === 'past-incidents' && (
            <PastIncidentsPage
              pastIncidents={pastIncidentsList}
              onSelectIncidentById={handleSelectIncidentById}
            />
          )}

          {currentPage === 'settings' && <SettingsPage />}

          {currentPage === 'architecture-docs' && <DocsPitchDeckPage />}
        </main>
      </div>
    </div>
  );
}
