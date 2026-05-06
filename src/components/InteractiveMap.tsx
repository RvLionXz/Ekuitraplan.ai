"use client";

import { useEffect, useMemo, useRef } from "react";
import Map, { Marker, Source, Layer, NavigationControl, MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapPin } from "lucide-react";

interface MapProps {
  itinerary: any;
  hoveredItem: any;
  onHoverItem: (item: any) => void;
}

export default function InteractiveMap({ itinerary, hoveredItem, onHoverItem }: MapProps) {
  const mapRef = useRef<MapRef>(null);

  // Default coordinate (Bali as fallback)
  const defaultCenter = { lng: 115.1889, lat: -8.4095 };

  // Generate marker data from itinerary
  const markers = useMemo(() => {
    if (!itinerary?.itinerary) return [];

    let allMarkers: any[] = [];
    itinerary.itinerary.forEach((day: any) => {
      day.activities.forEach((act: any, idx: number) => {
        // Fallback to dummy coordinates if not provided by BE
        // We simulate a path by adding small offsets to the center
        const lat = act.latitude || (defaultCenter.lat + (Math.random() - 0.5) * 0.2);
        const lng = act.longitude || (defaultCenter.lng + (Math.random() - 0.5) * 0.2);

        allMarkers.push({
          id: `${day.day}-${idx}`,
          name: act.activity,
          location: act.location,
          description: act.description,
          day: day.day,
          lat,
          lng,
          image: '/images/generic-eco.png'
        });
      });
    });

    return allMarkers;
  }, [itinerary]);

  // Create route line data
  const routeData = useMemo(() => {
    if (markers.length < 2) return null;

    return {
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "LineString" as const,
        coordinates: markers.map(m => [m.lng, m.lat])
      }
    };
  }, [markers]);

  // Fit bounds when markers change
  useEffect(() => {
    if (markers.length > 0 && mapRef.current) {
      const lats = markers.map(m => m.lat);
      const lngs = markers.map(m => m.lng);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);

      mapRef.current.fitBounds(
        [[minLng, minLat], [maxLng, maxLat]],
        { padding: 100, duration: 2000 }
      );
    }
  }, [markers]);

  // Fly to hovered item
  useEffect(() => {
    if (hoveredItem && mapRef.current) {
      const target = markers.find(m => m.name === hoveredItem.name);
      if (target) {
        mapRef.current.flyTo({
          center: [target.lng, target.lat],
          zoom: 14,
          duration: 1500
        });
      }
    }
  }, [hoveredItem, markers]);

  const mapStyle = process.env.NEXT_PUBLIC_MAP_API_KEY 
    ? `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${process.env.NEXT_PUBLIC_MAP_API_KEY}`
    : "https://demotiles.maplibre.org/style.json";

  return (
    <div className="w-full h-full relative group">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: defaultCenter.lng,
          latitude: defaultCenter.lat,
          zoom: 10
        }}
        mapStyle={mapStyle}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-right" />

        {/* Route Layer */}
        {routeData && (
          <Source id="route" type="geojson" data={routeData}>
            <Layer
              id="route-line"
              type="line"
              paint={{
                "line-color": "#E96443", // secondary color
                "line-width": 4,
                "line-opacity": 0.6,
                "line-dasharray": [2, 1]
              }}
            />
          </Source>
        )}

        {/* Markers */}
        {markers.map((m, i) => (
          <Marker
            key={m.id}
            longitude={m.lng}
            latitude={m.lat}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              onHoverItem({
                type: 'activity',
                name: m.name,
                image: m.image,
                location: m.location,
                label: `Hari ${m.day}`
              });
            }}
          >
            <div 
              className={`
                flex flex-col items-center cursor-pointer transition-all duration-300
                ${hoveredItem?.name === m.name ? 'scale-125 z-50' : 'scale-100 z-10'}
              `}
              onMouseEnter={() => onHoverItem({
                type: 'activity',
                name: m.name,
                image: m.image,
                location: m.location,
                label: `Hari ${m.day}`
              })}
            >
              <div className={`
                px-3 py-1.5 rounded-2xl font-black text-[10px] shadow-2xl border-2 flex items-center gap-1.5
                ${hoveredItem?.name === m.name 
                  ? 'bg-primary text-white border-white' 
                  : 'bg-white text-primary border-primary/20'}
              `}>
                <span className="opacity-70">{m.day}</span>
                <span>{m.name}</span>
              </div>
              <div className={`
                w-0.5 h-4 bg-primary transition-all
                ${hoveredItem?.name === m.name ? 'opacity-100' : 'opacity-40'}
              `} />
              <div className={`
                w-2 h-2 rounded-full border-2 border-white shadow-lg transition-all
                ${hoveredItem?.name === m.name ? 'bg-secondary scale-150' : 'bg-primary'}
              `} />
            </div>
          </Marker>
        ))}
      </Map>

      {/* Aesthetic Overlay */}
      <div className="absolute inset-0 pointer-events-none border-[20px] border-white/5 rounded-[40px] z-20" />
    </div>
  );
}
