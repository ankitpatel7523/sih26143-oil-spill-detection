"""
Real AIS Vessel Correlation & Anomaly Attribution Service
Computes Great-Circle Haversine distances, Closest Point of Approach (CPA),
transponder blackout gaps, and vessel attribution scores.
"""

import math
from datetime import datetime, timedelta
from typing import Dict, Any, List, Tuple

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates Great-Circle distance in kilometers between two points."""
    r = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(d_lon / 2) ** 2)
    return 2.0 * r * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

def score_and_rank_vessels(
    origin_point: Tuple[float, float],
    origin_iso_time: str,
    vessels_data: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Ranks suspect vessels based on spatial proximity, temporal alignment,
    vessel risk type, and behavioral anomalies (AIS blackouts + deceleration).
    """
    origin_dt = datetime.fromisoformat(origin_iso_time.replace("Z", "+00:00"))
    origin_lat, origin_lng = origin_point

    scored_vessels = []

    for v in vessels_data:
        tracks = v.get("trackHistory", [])
        if not tracks:
            continue

        # 1. Closest Point of Approach (CPA) to estimated origin
        min_dist_km = float('inf')
        closest_pt = tracks[0]
        time_delta_h = 0.0

        for pt in tracks:
            d = haversine_km(origin_lat, origin_lng, pt["lat"], pt["lng"])
            if d < min_dist_km:
                min_dist_km = d
                closest_pt = pt
                pt_dt = datetime.fromisoformat(pt["timestamp"].replace("Z", "+00:00"))
                time_delta_h = abs((pt_dt - origin_dt).total_seconds()) / 3600.0

        # Proximity Score (0 - 35 pts)
        proximity_score = round(max(0.0, min(35.0, 35.0 * math.exp(-min_dist_km / 12.0))), 1)

        # Temporal Score (0 - 25 pts)
        temporal_score = round(max(0.0, min(25.0, 25.0 * max(0.0, 1.0 - time_delta_h / 5.0))), 1)

        # Vessel Type Risk (0 - 20 pts)
        v_type = v.get("vesselType", "Commercial Vessel")
        type_score = 6.0
        if "Crude" in v_type or "Tanker" in v_type:
            type_score = 20.0
        elif "Chemical" in v_type:
            type_score = 17.5
        elif "Bulk" in v_type:
            type_score = 12.0
        elif "Container" in v_type:
            type_score = 8.0

        # Anomaly Detection (0 - 20 pts)
        has_gap = False
        gap_duration_h = 0.0
        for i in range(len(tracks) - 1):
            t1 = datetime.fromisoformat(tracks[i]["timestamp"].replace("Z", "+00:00"))
            t2 = datetime.fromisoformat(tracks[i + 1]["timestamp"].replace("Z", "+00:00"))
            gap_m = (t2 - t1).total_seconds() / 60.0
            if gap_m > 35.0:
                has_gap = True
                gap_duration_h = round(gap_m / 60.0, 1)
                break

        # Speed Drop Anomaly
        speeds = [t["speedKnots"] for t in tracks]
        max_speed = max(speeds) if speeds else 12.0
        cpa_speed = closest_pt.get("speedKnots", 12.0)
        has_speed_drop = (max_speed >= 11.0 and cpa_speed <= 6.5)

        anomaly_score = 0.0
        if has_gap:
            anomaly_score += 10.0
        if has_speed_drop:
            anomaly_score += 7.0
        if min_dist_km < 15.0 and (origin_dt.hour >= 18 or origin_dt.hour <= 5):
            anomaly_score += 3.0 # Nighttime discharge bonus
        anomaly_score = min(20.0, anomaly_score)

        overall = round(proximity_score + temporal_score + type_score + anomaly_score, 1)

        if overall >= 80.0:
            justification = (f"PRIMARY CRITICAL SUSPECT: High-risk {v_type} passed within {min_dist_km:.1f} km "
                             f"of backward drift origin. {f'Turned off AIS transponder for {gap_duration_h} hours. ' if has_gap else ''}"
                             f"{f'Decelerated from {max_speed:.1f} to {cpa_speed:.1f} kts matching active discharge profile.' if has_speed_drop else ''}")
        elif overall >= 50.0:
            justification = f"ELEVATED INTEREST: {v_type} transited within {min_dist_km:.1f} km of drift origin corridor."
        else:
            justification = f"LOW SUSPICION: Transited commercial channel {min_dist_km:.1f} km outside dispersion envelope with steady broadcast."

        scored_vessels.append({
            "mmsi": v.get("mmsi"),
            "imo": v.get("imo", "9123456"),
            "name": v.get("name"),
            "flag": v.get("flag", "PA"),
            "country": v.get("country", "Panama"),
            "vesselType": v_type,
            "dwt": v.get("dwt", 85000),
            "overallScore": overall,
            "distanceAtEstimatedOriginKm": round(min_dist_km, 1),
            "timeDeltaAtOriginHours": round(time_delta_h, 1),
            "scores": {
                "proximityScore": proximity_score,
                "temporalScore": temporal_score,
                "vesselTypeScore": type_score,
                "anomalyScore": anomaly_score
            },
            "anomaliesDetected": {
                "hasAisGap": has_gap,
                "gapDurationHours": gap_duration_h if has_gap else None,
                "hasSpeedDrop": has_speed_drop,
                "speedBeforeKnots": max_speed if has_speed_drop else None,
                "speedDuringKnots": cpa_speed if has_speed_drop else None,
                "nighttimeDischarge": (origin_dt.hour >= 18 or origin_dt.hour <= 5)
            },
            "justification": justification,
            "operator": v.get("operator", "Commercial Shipping S.A."),
            "callSign": v.get("callSign", "3EFA4"),
            "trackHistory": tracks
        })

    # Sort descending by score
    scored_vessels.sort(key=lambda x: x["overallScore"], reverse=True)
    for idx, v in enumerate(scored_vessels):
        v["rank"] = idx + 1

    return scored_vessels
