import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap, Marker } from 'leaflet';
import BottomNav from './BottomNav';
import { CapturedPhoto } from '../types';
import { getPhotos } from '../utils/db';
import { getProjects } from '../utils/projects';

// Inline leaflet CSS to avoid extra import config
const LEAFLET_CSS = `
.leaflet-container { background: #0a0f0a; font-family: inherit; }
.leaflet-tile-pane { filter: brightness(0.92) saturate(1.05); }
.leaflet-control-attribution { background: rgba(0,0,0,0.7) !important; color: rgba(255,255,255,0.4) !important; font-size: 9px !important; }
.leaflet-control-attribution a { color: rgba(255,255,255,0.4) !important; }
.leaflet-control-zoom a { background: rgba(10,14,11,0.95) !important; color: #00ff66 !important; border-color: rgba(0,255,102,0.2) !important; }
.leaflet-control-zoom a:hover { background: rgba(0,255,102,0.15) !important; }
.geofoto-popup .leaflet-popup-content-wrapper {
  background: rgba(10,14,11,0.97);
  border: 1px solid rgba(0,255,102,0.25);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.8), 0 0 20px rgba(0,255,102,0.08);
  padding: 0;
  overflow: hidden;
  min-width: 200px;
}
.geofoto-popup .leaflet-popup-content { margin: 0; }
.geofoto-popup .leaflet-popup-tip { background: rgba(10,14,11,0.97); }
.geofoto-popup .leaflet-popup-close-button { color: rgba(255,255,255,0.4) !important; font-size: 18px !important; top: 8px !important; right: 8px !important; }
.geofoto-marker {
  width: 36px; height: 36px; border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  background: var(--green, #00ff66);
  border: 2px solid rgba(0,255,102,0.4);
  box-shadow: 0 0 12px rgba(0,255,102,0.5), 0 2px 8px rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
}
.geofoto-marker-inner {
  width: 16px; height: 16px; border-radius: 50%;
  background: #030303;
  transform: rotate(45deg);
  overflow: hidden;
}
.geofoto-marker-inner img {
  width: 100%; height: 100%; object-fit: cover;
  transform: rotate(-45deg) scale(2);
}
`;

export default function MapView() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Marker[]>([]);

  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeFilter, setActiveFilter] = useState('all');
  const [projectNames, setProjectNames] = useState<Record<string, string>>({});

  // Track online status
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  // Load photos
  useEffect(() => {
    (async () => {
      const allPhotos = await getPhotos();
      setPhotos(allPhotos);
      const projects = getProjects();
      const names: Record<string, string> = {};
      projects.forEach((p) => { names[p.id] = p.name; });
      setProjectNames(names);
      setLoading(false);
    })();
  }, []);

  // Inject leaflet CSS once
  useEffect(() => {
    if (!document.getElementById('leaflet-css-cdn')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css-cdn';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    if (!document.getElementById('geofoto-map-css')) {
      const style = document.createElement('style');
      style.id = 'geofoto-map-css';
      style.textContent = LEAFLET_CSS;
      document.head.appendChild(style);
    }
  }, []);

  // Init map
  useEffect(() => {
    if (!isOnline || loading || !mapContainerRef.current || mapRef.current) return;

    import('leaflet').then((L) => {
      if (!mapContainerRef.current || mapRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [-14.235, -51.9253],
        zoom: 4,
        zoomControl: true,
      });

      // Satellite tile — Esri World Imagery (no API key needed)
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
          maxZoom: 19,
        }
      ).addTo(map);

      // Hybrid labels on top
      L.tileLayer(
        'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, opacity: 0.7 }
      ).addTo(map);

      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isOnline, loading]);

  // Add/update markers when photos or filter changes
  useEffect(() => {
    if (!mapRef.current || !isOnline) return;

    import('leaflet').then((L) => {
      if (!mapRef.current) return;

      // Remove old markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      const filtered = activeFilter === 'all'
        ? photos
        : photos.filter((p) => p.projectId === activeFilter);

      const withGps = filtered.filter((p) => p.lat !== null && p.lon !== null);

      withGps.forEach((photo) => {
        const thumbHtml = `<div class="geofoto-marker-inner"><img src="${photo.dataUrl}" /></div>`;
        const icon = L.divIcon({
          html: `<div class="geofoto-marker">${thumbHtml}</div>`,
          className: '',
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -40],
        });

        const date = new Date(photo.capturedAt).toLocaleString('pt-BR');
        const projectLabel = photo.projectName || 'Sem projeto';
        const coords = `${photo.lat?.toFixed(6)}, ${photo.lon?.toFixed(6)}`;
        const obsHtml = photo.observation
          ? `<div style="margin-top:8px;padding:6px 8px;background:rgba(255,255,255,0.04);border-radius:6px;border-left:2px solid rgba(0,255,102,0.4);font-size:0.72rem;color:rgba(255,255,255,0.55);font-family:monospace;line-height:1.4;">Obs: ${photo.observation}</div>`
          : '';

        const popupContent = `
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;">
            <img src="${photo.dataUrl}" style="width:100%;height:120px;object-fit:cover;display:block;" />
            <div style="padding:10px 12px 12px;">
              <div style="font-size:0.75rem;font-weight:700;color:#00ff66;margin-bottom:2px;">${projectLabel}</div>
              <div style="font-size:0.7rem;color:rgba(255,255,255,0.45);margin-bottom:4px;">${date}</div>
              <div style="font-size:0.65rem;color:rgba(255,255,255,0.3);font-family:monospace;">${coords}</div>
              ${obsHtml}
            </div>
          </div>
        `;

        const marker = L.marker([photo.lat!, photo.lon!], { icon })
          .addTo(mapRef.current!)
          .bindPopup(popupContent, { className: 'geofoto-popup', maxWidth: 240 });

        markersRef.current.push(marker);
      });

      // Fit bounds if there are markers
      if (withGps.length > 0) {
        const bounds = L.latLngBounds(withGps.map((p) => [p.lat!, p.lon!]));
        mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }
    });
  }, [photos, activeFilter, isOnline]);

  // Project filters
  const projectFilters = Array.from(new Set(photos.map((p) => p.projectId).filter(Boolean)));
  const photosWithGps = photos.filter((p) => p.lat !== null);

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            Mapa
          </h2>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {photosWithGps.length} ponto{photosWithGps.length !== 1 ? 's' : ''} GPS
        </span>
      </div>

      {/* Filter tabs */}
      {projectFilters.length > 0 && (
        <div style={{
          display: 'flex', gap: '8px', padding: '12px 16px',
          overflowX: 'auto', borderBottom: '1px solid var(--border)', scrollbarWidth: 'none',
        }}>
          <button
            onClick={() => setActiveFilter('all')}
            style={{
              padding: '6px 14px', borderRadius: '20px', border: '1px solid', fontSize: '0.8rem',
              fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
              background: activeFilter === 'all' ? 'rgba(0,255,102,0.12)' : 'transparent',
              borderColor: activeFilter === 'all' ? 'rgba(0,255,102,0.4)' : 'var(--border)',
              color: activeFilter === 'all' ? 'var(--green)' : 'var(--text-muted)',
            }}
          >
            Todos
          </button>
          {projectFilters.map((pid) => (
            <button key={pid} onClick={() => setActiveFilter(pid)} style={{
              padding: '6px 14px', borderRadius: '20px', border: '1px solid', fontSize: '0.8rem',
              fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
              background: activeFilter === pid ? 'rgba(0,255,102,0.12)' : 'transparent',
              borderColor: activeFilter === pid ? 'rgba(0,255,102,0.4)' : 'var(--border)',
              color: activeFilter === pid ? 'var(--green)' : 'var(--text-muted)',
            }}>
              {projectNames[pid] || pid.slice(0, 12)}
            </button>
          ))}
        </div>
      )}

      {/* Map / Offline / Empty */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: '300px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div className="spinner" />
          </div>
        ) : !isOnline ? (
          /* Offline State */
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: '16px', padding: '32px', textAlign: 'center',
          }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'rgba(255,211,0,0.08)',
              border: '1px solid rgba(255,211,0,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 1l22 22" />
                <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
                <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
                <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
                <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--amber)', marginBottom: '6px' }}>
                Sem conexão
              </div>
              <p style={{ fontSize: '0.85rem', maxWidth: '240px', color: 'var(--text-muted)' }}>
                O mapa de satélite requer internet. Conecte-se para visualizar os pontos GPS.
              </p>
            </div>
            <div style={{
              padding: '12px 16px', borderRadius: 'var(--radius-sm)',
              background: 'rgba(255,211,0,0.06)', border: '1px solid rgba(255,211,0,0.15)',
              fontSize: '0.8rem', color: 'var(--text-muted)',
            }}>
              📍 {photosWithGps.length} foto{photosWithGps.length !== 1 ? 's' : ''} com GPS aguardando
            </div>
          </div>
        ) : photosWithGps.length === 0 ? (
          /* No GPS photos */
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <h3>Nenhum ponto GPS</h3>
            <p>Capture fotos com GPS ativo para visualizá-las no mapa</p>
          </div>
        ) : (
          /* Map */
          <div ref={mapContainerRef} style={{ position: 'absolute', inset: 0 }} />
        )}
      </div>

      <BottomNav />
    </div>
  );
}
