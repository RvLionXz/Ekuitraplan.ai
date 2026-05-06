import { useState, useCallback } from "react";

interface MapLocation {
  latitude: number;
  longitude: number;
  name?: string;
}

interface UseMapReturn {
  center: MapLocation;
  zoom: number;
  setCenter: (location: MapLocation) => void;
  setZoom: (level: number) => void;
  flyTo: (location: MapLocation, level?: number) => void;
}

export function useMap(defaultCenter: MapLocation = { latitude: -8.4095, longitude: 115.1889 }, defaultZoom = 10): UseMapReturn {
  const [center, setCenterState] = useState<MapLocation>(defaultCenter);
  const [zoom, setZoomState] = useState(defaultZoom);

  const setCenter = useCallback((location: MapLocation) => {
    setCenterState(location);
  }, []);

  const setZoom = useCallback((level: number) => {
    setZoomState(level);
  }, []);

  const flyTo = useCallback((location: MapLocation, level?: number) => {
    setCenterState(location);
    if (level !== undefined) {
      setZoomState(level);
    }
  }, []);

  return {
    center,
    zoom,
    setCenter,
    setZoom,
    flyTo,
  };
}