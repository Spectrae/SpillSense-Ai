'use client';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

interface MapInterfaceProps {
  onWktGenerated: (wkt: string) => void;
}

export default function MapInterface({ onWktGenerated }: MapInterfaceProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const drawnItems = useRef<L.FeatureGroup | null>(null);

  // CRITICAL FIX: Direct mutable ref assignment to bypass React Strict Mode sync issues
  const onWktGeneratedRef = useRef(onWktGenerated);
  onWktGeneratedRef.current = onWktGenerated; 

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainer.current || mapInstance.current) return;

    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const map = L.map(mapContainer.current).setView([19.00, 72.75], 9);
    mapInstance.current = map;

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Esri &mdash; Source: Esri, i-cubed, USDA, USGS'
    }).addTo(map);

    const features = new L.FeatureGroup();
    map.addLayer(features);
    drawnItems.current = features;

    require('leaflet-draw');

    const drawControl = new (L.Control as any).Draw({
      edit: { featureGroup: features, remove: true },
      draw: { polygon: true, rectangle: true, circle: false, marker: false, circlemarker: false, polyline: false }
    });
    map.addControl(drawControl);

    map.on((L as any).Draw.Event.CREATED, (e: any) => {
      features.clearLayers();
      const layer = e.layer;
      const latlngs = layer.getLatLngs()[0] as L.LatLng[];

      const uniqueLats = new Set(latlngs.map(p => p.lat.toFixed(4)));
      const uniqueLngs = new Set(latlngs.map(p => p.lng.toFixed(4)));

      if (uniqueLats.size < 2 || uniqueLngs.size < 2) {
        alert('⚠️ Invalid Geometry: You drew a flat line or point. Please enclose an area.');
        return;
      }

      let coordinates = latlngs.map(pt => `${pt.lng.toFixed(4)} ${pt.lat.toFixed(4)}`);
      coordinates.push(`${latlngs[0].lng.toFixed(4)} ${latlngs[0].lat.toFixed(4)}`); 
      const wktString = `POLYGON((${coordinates.join(', ')}))`;

      features.addLayer(layer);
      onWktGeneratedRef.current(wktString);
    });

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []); 

  return <div ref={mapContainer} className="w-full h-full min-h-[500px] rounded-lg border border-[#2d2d2d] z-0" />;
}