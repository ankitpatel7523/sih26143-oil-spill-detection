# NTRO Maritime Surveillance — Satellite SAR Oil Spill Detection & Vessel Attribution System

[![SIH Problem Statement](https://img.shields.io/badge/SIH%202026-PS%20ID%3A%20SIH26143-blue?style=for-the-badge)](https://www.sih.gov.in/)
[![Organization](https://img.shields.io/badge/Organization-NTRO-red?style=for-the-badge)](https://ntro.gov.in/)
[![Tech Stack](https://img.shields.io/badge/Stack-Python%20%7C%20FastAPI%20%7C%20React%2019%20%7C%20Leaflet%20GIS-emerald?style=for-the-badge)](#)

> **Problem Statement (SIH26143):** Leveraging satellite imagery to determine Oil spills at sea along with AIS data correlations to identify vessels responsible for the spill.  
> **Organisation:** National Technical Research Organisation (NTRO)  
> **Domain:** Synthetic Aperture Radar (SAR), Lagrangian Hydrodynamics, Spatiotemporal AIS Attribution.

---

## 🏗️ Architecture & Operational Flow

```
                      ┌───────────────────────────────────────────────┐
                      │   ESA Sentinel-1 C-Band SAR Satellite Pass    │
                      └───────────────────────┬───────────────────────┘
                                              │
                     ┌────────────────────────┴────────────────────────┐
                     ▼                                                 ▼
        ┌─────────────────────────┐                       ┌─────────────────────────┐
        │ CFAR Ship Target Engine │                       │  Lee Speckle Filter &   │
        │  (Extracts metal ships) │                       │ Otsu Dark Spot Detector │
        └────────────┬────────────┘                       └────────────┬────────────┘
                     │                                                 │
                     │                                    ┌────────────▼────────────┐
                     │                                    │  Lagrangian Hydrodynamic│
                     │                                    │  Reverse Drift Solver   │
                     │                                    │ (Copernicus + ECMWF)    │
                     │                                    └────────────┬────────────┘
                     │                                                 │
                     ▼                                                 ▼
        ┌─────────────────────────┐                       ┌─────────────────────────┐
        │ AIS Historical Database │                       │ Estimated Spill Origin  │
        │  (132 Pings in Buffer)  │                       │   Point & Time Window   │
        └────────────┬────────────┘                       └────────────┬────────────┘
                     │                                                 │
                     └────────────────────────┬────────────────────────┘
                                              ▼
                      ┌───────────────────────────────────────────────┐
                      │    AI Multi-Factor Attribution Classifier     │
                      │  • Closest Point of Approach (Haversine CPA)  │
                      │  • AIS Transponder Blackout Detection (>35m)  │
                      │  • Speed Drop Anomaly (14 kts -> 3 kts)       │
                      └───────────────────────┬───────────────────────┘
                                              ▼
                      ┌───────────────────────────────────────────────┐
                      │   Official Legal Dossier & Ranked Suspects    │
                      │   Rank #1: MT OCEAN GLORY (Confidence: 94.2%) │
                      └───────────────────────────────────────────────┘
```

---

## 📁 Repository Structure

```
├── backend/                       # Python FastAPI Backend & ML Services
│   ├── main.py                    # REST API endpoints & CORS middleware
│   ├── run_ml_model.py            # Standalone ML inference script
│   ├── requirements.txt           # Python backend dependencies
│   ├── generate_real_sar_dataset.py
│   ├── generate_real_ais_dataset.py
│   └── services/
│       ├── sar_ml_detector.py     # Lee speckle filter, Otsu, dB calibration
│       ├── backward_drift.py      # Lagrangian advection-diffusion solver
│       ├── ais_correlator.py      # Haversine CPA & anomaly attribution
│       ├── marine_weather.py      # Live Copernicus & ECMWF via Open-Meteo
│       └── stac_satellite.py      # AWS Earth Search ESA Sentinel-1 STAC API
│
├── src/                           # React 19 Frontend Application
│   ├── components/
│   │   ├── layout/                # TopBar, Sidebar navigation
│   │   ├── map/                   # Leaflet GIS, OpenSeaMap, Bathymetry
│   │   ├── vessels/               # VesselTable, Trajectory & Anomaly charts
│   │   └── common/                # Badges, control sliders, cards
│   ├── pages/
│   │   ├── OverviewPage.tsx       # System overview & active alerts
│   │   ├── UploadDetectPage.tsx   # Automated satellite feed & SAR CV engine
│   │   ├── SpillDriftMapPage.tsx  # Interactive map with dynamic layers
│   │   ├── SuspectVesselsPage.tsx # Ranked suspect vessels & AIS charts
│   │   ├── IncidentReportPage.tsx # Court-admissible dossier & GeoJSON export
│   │   └── SettingsPage.tsx       # API keys, preferences, telemetry
│   ├── services/
│   │   ├── liveApiService.ts      # Client integration with STAC & Weather
│   │   ├── sarDetectionEngine.ts  # Client-side CV & Gemini Vision
│   │   ├── driftSimulationEngine.ts
│   │   └── aisAttributionEngine.ts
│   └── types/                     # TypeScript data interfaces
│
├── public/
│   ├── sample_sar/                # Calibrated Sentinel-1 radar rasters
│   │   ├── sentinel1_arabian_sea_spill.png
│   │   ├── sentinel1_gulf_of_kutch_spill.png
│   │   └── sentinel1_bay_of_bengal_algae.png
│   └── sample_ais/                # Real commercial AIS tracking records
│       └── arabian_sea_tanker_corridor_ais.csv
│
├── data/                          # Data store for rasters and AIS CSVs
├── start_system.bat               # 1-Click launcher for both servers
├── vercel.json                    # Vercel deployment configuration
├── requirements.txt               # Root Python requirements
├── package.json                   # Node.js dependencies and scripts
└── .env.example                   # Environment variables template
```

---

## 🚀 Quick Start Guide (For Team Members)

### Prerequisites
* **Node.js**: v18 or later
* **Python**: 3.10 or later
* **Git**: Installed on your system

### 1-Click Startup (Windows)
Simply double-click `start_system.bat` in the project root.  
It automatically starts the Python backend (`:8000`), the React frontend (`:3000`), and opens your browser!

---

### Manual Setup

#### Step 1: Clone Repository
```bash
git clone https://github.com/<your-username>/sih26143-oil-spill-detection.git
cd sih26143-oil-spill-detection
```

#### Step 2: Backend Setup
```bash
# Optional: create a virtual environment
python -m venv venv
venv\Scripts\activate     # Windows
# source venv/bin/activate # Linux/Mac

# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server
npm run api
# Or directly: python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
Backend API will be live at: `http://127.0.0.1:8000` (Docs at `/docs`).

#### Step 3: Frontend Setup (New Terminal)
```bash
# Install frontend dependencies
npm install

# Start Vite dev server
npm run dev
```
Web dashboard will be live at: `http://localhost:3000`.

---

## 🌐 Deploying to Vercel (Frontend)

1. Push your repository to **GitHub**.
2. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Select your GitHub repository.
4. Framework Preset: **Vite**.
5. Build Command: `node node_modules/vite/bin/vite.js build` (handled automatically via `vercel.json`).
6. Output Directory: `dist`.
7. Environment Variables:
   * Set `VITE_API_URL` to your hosted Python backend URL (e.g. deployed on Render, Railway, or Fly.io).
8. Click **Deploy**!

---

## 📡 Free & Public External APIs Used

| Service | Endpoint | Authentication | Purpose |
|---|---|---|---|
| **Open-Meteo Marine** | `marine-api.open-meteo.com` | **Free, No Key** | Live Copernicus surface currents & wave heights |
| **Open-Meteo Forecast**| `api.open-meteo.com` | **Free, No Key** | ECMWF 10m atmospheric winds |
| **AWS Earth Search STAC** | `earth-search.aws.element84.com/v1/search` | **Free, No Key** | Real ESA Sentinel-1 C-SAR orbit passes |
| **OpenSeaMap** | `tiles.openseamap.org/seamark/{z}/{x}/{y}.png` | **Free, No Key** | International marine seamarks & navigation buoys |
| **Esri Ocean GIS** | `server.arcgisonline.com/...` | **Free, No Key** | High-resolution oceanic bathymetry & depth contours |

---

## 🤝 Team Contribution Guidelines

1. Always create a branch before adding new features:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Test code before committing:
   ```bash
   npm run lint     # TypeScript check
   npm run build    # Vite build check
   ```
3. Commit with clear messages:
   ```bash
   git commit -m "feat(drift): add hydrodynamic windage tuning"
   ```
4. Push and create a Pull Request to `main`.
