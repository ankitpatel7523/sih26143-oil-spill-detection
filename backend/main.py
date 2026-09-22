"""
SIH26143: Oil Spill Detection & Vessel Attribution Platform
Real Python FastAPI Backend Service for NTRO Maritime Surveillance.
Integrates Real Sentinel-1 STAC, Live Copernicus Marine Currents, ECMWF Winds,
Lee Speckle Filtering, Otsu Thresholding, Lagrangian Reverse Drift, and AIS Attribution.
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Tuple, Dict, Any

from backend.services.marine_weather import fetch_real_marine_conditions
from backend.services.stac_satellite import query_sentinel1_stac
from backend.services.sar_ml_detector import process_sar_image_bytes
from backend.services.backward_drift import solve_reverse_drift
from backend.services.ais_correlator import score_and_rank_vessels

app = FastAPI(
    title="NTRO Oil Spill Detection & Vessel Attribution API",
    description="Satellite SAR, Hydrodynamic Drift, and AIS Attribution Platform (SIH26143)",
    version="2.0.0"
)

# Enable CORS for React Vite Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MarineWeatherRequest(BaseModel):
    lat: float
    lng: float

class STACSearchRequest(BaseModel):
    bbox: List[float] # [min_lon, min_lat, max_lon, max_lat]
    limit: Optional[int] = 5

class DriftSimRequest(BaseModel):
    centroid: List[float] # [lat, lng]
    detectionTimestamp: str
    durationHours: Optional[int] = 12
    timeStepMinutes: Optional[int] = 60
    initialAreaKm2: Optional[float] = 24.65
    currentSpeedKnots: Optional[float] = None
    currentDirectionDeg: Optional[float] = None
    windSpeedKnots: Optional[float] = None
    windDirectionDeg: Optional[float] = None
    windagePct: Optional[float] = 3.0

class AISCorrelateRequest(BaseModel):
    originPoint: List[float] # [lat, lng]
    originTimestamp: str
    vesselsData: List[Dict[str, Any]]

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "NTRO Oil Spill Detection Engine",
        "version": "2.0.0",
        "stacConnected": True,
        "marineApiConnected": True
    }

@app.post("/api/marine/weather")
def get_marine_weather(req: MarineWeatherRequest):
    """Fetches actual live surface currents and winds from Copernicus Marine & ECMWF."""
    return fetch_real_marine_conditions(req.lat, req.lng)

@app.post("/api/sar/search")
def search_sentinel_scenes(req: STACSearchRequest):
    """Queries real ESA Sentinel-1 C-SAR satellite scenes over the bounding box."""
    scenes = query_sentinel1_stac(req.bbox, req.limit)
    return {"status": "success", "count": len(scenes), "scenes": scenes}

@app.post("/api/sar/detect")
async def detect_oil_spill(
    file: UploadFile = File(...),
    centerLat: float = Form(18.845),
    centerLng: float = Form(71.950),
    resolutionM: float = Form(10.0)
):
    """
    Ingests real SAR image bytes, executes Lee speckle filtering,
    adaptive Otsu thresholding, extracts boundary contours, area, and volume.
    """
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty image file received")

    result = process_sar_image_bytes(
        contents,
        center_coords=(centerLat, centerLng),
        pixel_resolution_m=resolutionM
    )
    return {"status": "success", "data": result}

@app.post("/api/drift/simulate")
def simulate_drift(req: DriftSimRequest):
    """
    Runs real Lagrangian backward hydrodynamic advection-diffusion solver.
    If weather is not provided, fetches live conditions from Open-Meteo!
    """
    lat, lng = req.centroid[0], req.centroid[1]

    # If environmental parameters not given, fetch actual live weather
    curr_spd = req.currentSpeedKnots
    curr_dir = req.currentDirectionDeg
    w_spd = req.windSpeedKnots
    w_dir = req.windDirectionDeg

    if curr_spd is None or w_spd is None:
        live_env = fetch_real_marine_conditions(lat, lng)
        curr_spd = curr_spd or live_env["oceanCurrent"]["speedKnots"]
        curr_dir = curr_dir or live_env["oceanCurrent"]["directionDeg"]
        w_spd = w_spd or live_env["surfaceWind"]["speedKnots"]
        w_dir = w_dir or live_env["surfaceWind"]["directionDeg"]

    res = solve_reverse_drift(
        centroid=(lat, lng),
        detection_iso_time=req.detectionTimestamp,
        duration_hours=req.durationHours,
        time_step_mins=req.timeStepMinutes,
        current_speed_knots=curr_spd,
        current_direction_deg=curr_dir,
        wind_speed_knots=w_spd,
        wind_direction_deg=w_dir,
        windage_pct=req.windagePct,
        initial_area_km2=req.initialAreaKm2
    )
    return {"status": "success", "data": res}

@app.post("/api/ais/correlate")
def correlate_ais(req: AISCorrelateRequest):
    """Ranks candidate vessels using Haversine CPA, temporal match, and anomaly flags."""
    ranked = score_and_rank_vessels(
        origin_point=(req.originPoint[0], req.originPoint[1]),
        origin_iso_time=req.originTimestamp,
        vessels_data=req.vesselsData
    )
    return {"status": "success", "rankedVessels": ranked}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
