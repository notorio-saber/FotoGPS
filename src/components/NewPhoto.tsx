import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { GeoState, OverlaySettings } from '../types';
import { startGeoWatch } from '../utils/geo';
import { renderPhotoWithOverlayAsync } from '../utils/canvas';
import { savePhoto, getPhotos, getAppKV } from '../utils/db';
import { getSettings, saveSettings } from '../utils/settings';
import { getProjects } from '../utils/projects';

function GpsIndicator({ geo }: { geo: GeoState }) {
  if (geo.loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <div className="spinner" style={{ width: '12px', height: '12px', borderWidth: '1.5px' }} />
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>GPS...</span>
      </div>
    );
  }
  if (geo.lat === null) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--red)' }} />
        <span style={{ fontSize: '0.7rem', color: 'var(--red)' }}>Sem GPS</span>
      </div>
    );
  }
  const acc = geo.accuracy || 999;
  const color = acc < 10 ? 'var(--green)' : acc < 30 ? 'var(--amber)' : 'var(--red)';
  const label = `±${Math.round(acc)}m`;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 6px ${color}`,
      }} />
      <span style={{ fontSize: '0.7rem', color, fontFamily: 'monospace' }}>{label}</span>
    </div>
  );
}

function LiveOverlay({ geo, projectName, settings }: {
  geo: GeoState;
  projectName: string;
  settings: OverlaySettings;
}) {
  const lines: Array<{ text: string; isTitle?: boolean }> = [];

  if (settings.showProject && projectName) {
    lines.push({ text: `Projeto: ${projectName}`, isTitle: true });
  }

  const now = new Date();
  if (settings.showDate) {
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    lines.push({ text: `Data: ${d}/${m}/${y}` });
  }
  if (settings.showTime) {
    const h = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    lines.push({ text: `Hora: ${h}:${min}:${s}` });
  }
  if (settings.showCoords) {
    if (geo.lat !== null && geo.lon !== null) {
      lines.push({ text: `Lat: ${geo.lat.toFixed(6)}` });
      lines.push({ text: `Lon: ${geo.lon.toFixed(6)}` });
    } else {
      lines.push({ text: 'Lat: --  Lon: --' });
    }
  }
  if (settings.showAccuracy && geo.accuracy !== null) {
    lines.push({ text: `Precisão: ${Math.round(geo.accuracy)} m` });
  }
  if (settings.showAltitude && geo.altitude !== null) {
    lines.push({ text: `Altitude: ${Math.round(geo.altitude)} m` });
  }
  if (settings.showCity && (geo.city || geo.state)) {
    const loc = [geo.city, geo.state].filter(Boolean).join(' — ');
    if (loc) lines.push({ text: loc });
  }

  if (lines.length === 0) return null;

  const fontSize = settings.fontSize === 'small' ? 10 : settings.fontSize === 'large' ? 14 : 12;

  return (
    <div style={{
      position: 'absolute',
      [settings.position === 'top' ? 'top' : 'bottom']: 0,
      left: 0,
      right: 0,
      background: 'rgba(3,3,3,0.80)',
      borderLeft: '3px solid var(--green)',
      padding: '10px 12px',
      pointerEvents: 'none',
    }}>
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            fontFamily: 'Courier New, monospace',
            fontSize: `${fontSize}px`,
            lineHeight: 1.6,
            color: line.isTitle ? 'var(--green)' : 'white',
            fontWeight: line.isTitle ? 700 : 400,
          }}
        >
          {line.text}
        </div>
      ))}
    </div>
  );
}

function SettingsDrawer({
  settings,
  onUpdate,
  onClose,
}: {
  settings: OverlaySettings;
  onUpdate: (s: OverlaySettings) => void;
  onClose: () => void;
}) {
  const toggles: Array<{ key: keyof OverlaySettings; label: string }> = [
    { key: 'showProject', label: 'Projeto' },
    { key: 'showDate', label: 'Data' },
    { key: 'showTime', label: 'Hora' },
    { key: 'showCoords', label: 'Coordenadas' },
    { key: 'showAccuracy', label: 'Precisão GPS' },
    { key: 'showAltitude', label: 'Altitude' },
    { key: 'showCity', label: 'Município' },
  ];

  const update = (key: keyof OverlaySettings, value: unknown) => {
    const next = { ...settings, [key]: value };
    saveSettings(next);
    onUpdate(next);
  };

  return (
    <div style={{
      position: 'absolute',
      top: '56px',
      right: 0,
      width: '260px',
      background: 'rgba(10,10,10,0.97)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      zIndex: 50,
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    }}>
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Overlay
        </span>
        <button className="btn-ghost" onClick={onClose} style={{ padding: '4px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {toggles.map((t) => (
        <div key={t.key} className="toggle-row">
          <span className="toggle-label">{t.label}</span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings[t.key] as boolean}
              onChange={(e) => update(t.key, e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
        </div>
      ))}

      {/* Position */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
        <div className="label-upper" style={{ marginBottom: '8px' }}>Posição</div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['bottom', 'top'] as const).map((pos) => (
            <button
              key={pos}
              onClick={() => update('position', pos)}
              style={{
                flex: 1,
                padding: '6px',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: settings.position === pos ? 'rgba(0,255,102,0.12)' : 'transparent',
                borderColor: settings.position === pos ? 'rgba(0,255,102,0.4)' : 'var(--border)',
                color: settings.position === pos ? 'var(--green)' : 'var(--text-muted)',
              }}
            >
              {pos === 'bottom' ? 'Inferior' : 'Superior'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function NewPhoto() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [geo, setGeo] = useState<GeoState>({
    lat: null, lon: null, accuracy: null, altitude: null,
    city: '', state: '', loading: true,
  });
  const [settings, setSettings] = useState<OverlaySettings>(getSettings());
  const [projects, setProjects] = useState(getProjects());
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    return localStorage.getItem('geofoto-last-project') || '';
  });
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [flash, setFlash] = useState(false);
  const [lastPhotoUrl, setLastPhotoUrl] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  // Time ticker for live overlay
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Load last photo thumbnail
  useEffect(() => {
    getPhotos().then((photos) => {
      if (photos.length > 0) setLastPhotoUrl(photos[0].dataUrl);
    });
  }, []);

  // Load projects
  useEffect(() => {
    const projs = getProjects();
    setProjects(projs);
    if (!selectedProjectId && projs.length > 0) {
      setSelectedProjectId(projs[0].id);
    }
  }, []);

  // Check multiple cameras
  useEffect(() => {
    navigator.mediaDevices?.enumerateDevices().then((devices) => {
      const videoCams = devices.filter((d) => d.kind === 'videoinput');
      setHasMultipleCameras(videoCams.length > 1);
    }).catch(() => {});
  }, []);

  // Camera stream
  const startCamera = useCallback(async (facing: 'environment' | 'user') => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Câmera não suportada neste dispositivo ou navegador.');
      return;
    }
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraError('');
    } catch (err: unknown) {
      const e = err as { name?: string };
      if (e.name === 'NotAllowedError') {
        setCameraError('Permissão de câmera negada. Permita o acesso nas configurações do navegador.');
      } else if (e.name === 'NotFoundError') {
        setCameraError('Nenhuma câmera encontrada neste dispositivo.');
      } else {
        setCameraError('Erro ao acessar câmera. Tente novamente.');
      }
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [facingMode, startCamera]);

  // GPS watch
  useEffect(() => {
    const stop = startGeoWatch(setGeo);
    return stop;
  }, []);

  const flipCamera = () => {
    setFacingMode((prev) => prev === 'environment' ? 'user' : 'environment');
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleCapture = async () => {
    if (!videoRef.current || capturing) return;

    const projectName = projects.find((p) => p.id === selectedProjectId)?.name || 'Sem projeto';

    setCapturing(true);
    setFlash(true);
    setTimeout(() => setFlash(false), 200);

    try {
      // Load logo from IndexedDB so it's always available even after navigation
      let logoDataUrl = settings.logoDataUrl || '';
      if (settings.showLogo && !logoDataUrl) {
        logoDataUrl = (await getAppKV('logo')) || '';
      }
      const settingsWithLogo = { ...settings, logoDataUrl };

      const dataUrl = await renderPhotoWithOverlayAsync(
        videoRef.current,
        geo,
        projectName,
        settingsWithLogo
      );

      const id = await savePhoto({
        projectId: selectedProjectId,
        projectName,
        dataUrl,
        capturedAt: Date.now(),
        lat: geo.lat,
        lon: geo.lon,
        city: geo.city,
        state: geo.state,
      });

      setLastPhotoUrl(dataUrl);

      // Update Firestore photo count
      if (user) {
        try {
          await updateDoc(doc(db, 'users', user.uid), {
            photoCount: increment(1),
          });
        } catch (_) {
          // Non-critical
        }
      }

      showToast(`Foto salva! #${id}`);
    } catch (err) {
      console.error('Capture error:', err);
      showToast('Erro ao salvar foto');
    } finally {
      setCapturing(false);
    }
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#000',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Flash effect */}
      {flash && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'white',
          zIndex: 200,
          opacity: 0.8,
          pointerEvents: 'none',
          transition: 'opacity 0.2s',
        }} />
      )}

      {/* Camera view */}
      {cameraError ? (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          padding: '24px',
          textAlign: 'center',
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <line x1="1" y1="1" x2="23" y2="23" stroke="var(--red)" />
          </svg>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '280px' }}>
            {cameraError}
          </p>
          <button className="btn-secondary" onClick={() => startCamera(facingMode)}>
            Tentar novamente
          </button>
        </div>
      ) : (
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      )}

      {/* Live overlay preview */}
      {!cameraError && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }}>
          <LiveOverlay geo={geo} projectName={selectedProject?.name || ''} settings={settings} />
        </div>
      )}

      {/* TOP BAR */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingTop: 'env(safe-area-inset-top, 0px)',
        background: 'linear-gradient(rgba(0,0,0,0.6), transparent)',
        zIndex: 20,
      }}>
      <div style={{
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        gap: '8px',
      }}>
        {/* Back */}
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        {/* Project selector */}
        <button
          onClick={() => { setShowProjectPicker(!showProjectPicker); setShowSettings(false); }}
          style={{
            flex: 1,
            height: '38px',
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '20px',
            color: 'white',
            fontSize: '0.8rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '0 12px',
            maxWidth: '200px',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {selectedProject?.name || 'Sem projeto'}
          </span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* GPS + Settings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <GpsIndicator geo={geo} />
          <button
            onClick={() => { setShowSettings(!showSettings); setShowProjectPicker(false); }}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: showSettings ? 'rgba(0,255,102,0.2)' : 'rgba(0,0,0,0.4)',
              border: `1px solid ${showSettings ? 'rgba(0,255,102,0.4)' : 'rgba(255,255,255,0.1)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={showSettings ? 'var(--green)' : 'white'} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </div>
      </div>

      {/* Project picker dropdown */}
      {showProjectPicker && (
        <div style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 62px)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '280px',
          background: 'rgba(10,10,10,0.97)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          zIndex: 50,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
        }}>
          {projects.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Nenhum projeto criado
            </div>
          ) : (
            projects.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedProjectId(p.id);
                  localStorage.setItem('geofoto-last-project', p.id);
                  setShowProjectPicker(false);
                }}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: selectedProjectId === p.id ? 'rgba(0,255,102,0.08)' : 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--border)',
                  color: selectedProjectId === p.id ? 'var(--green)' : 'var(--text)',
                  fontSize: '0.9rem',
                  fontWeight: selectedProjectId === p.id ? 700 : 400,
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                {selectedProjectId === p.id && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
                {p.name}
              </button>
            ))
          )}
        </div>
      )}

      {/* Settings drawer */}
      {showSettings && (
        <div style={{ position: 'absolute', top: 'env(safe-area-inset-top, 0px)', right: 0, zIndex: 50, padding: '0 8px' }}>
          <SettingsDrawer
            settings={settings}
            onUpdate={setSettings}
            onClose={() => setShowSettings(false)}
          />
        </div>
      )}

      {/* BOTTOM BAR */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
        zIndex: 20,
      }}>
      <div style={{
        height: '120px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px 16px',
      }}>
        {/* Last photo thumbnail */}
        <button
          onClick={() => navigate('/galeria')}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '2px solid rgba(255,255,255,0.2)',
            background: 'rgba(0,0,0,0.4)',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {lastPhotoUrl ? (
            <img src={lastPhotoUrl} alt="Última foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          )}
        </button>

        {/* Capture button */}
        <button
          onClick={handleCapture}
          disabled={capturing || !!cameraError}
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: capturing ? 'rgba(255,255,255,0.7)' : 'white',
            border: '4px solid var(--green)',
            boxShadow: `0 0 0 4px rgba(0,255,102,0.2), 0 0 24px rgba(0,255,102,0.4)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.15s ease',
            transform: capturing ? 'scale(0.92)' : 'scale(1)',
            opacity: cameraError ? 0.4 : 1,
          }}
        >
          {capturing ? (
            <div className="spinner" style={{ width: '28px', height: '28px', borderColor: 'rgba(0,0,0,0.2)', borderTopColor: 'var(--green)' }} />
          ) : (
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(0,0,0,0.07)' }} />
          )}
        </button>

        {/* Camera flip */}
        <button
          onClick={flipCamera}
          disabled={!hasMultipleCameras}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            opacity: hasMultipleCameras ? 1 : 0.3,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 4v6h6" />
            <path d="M23 20v-6h-6" />
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
          </svg>
        </button>
      </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast" style={{ bottom: 'calc(130px + env(safe-area-inset-bottom, 0px))' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          {toast}
        </div>
      )}

      {/* Click away to close dropdowns */}
      {(showProjectPicker || showSettings) && (
        <div
          style={{ position: 'absolute', inset: 0, zIndex: 40 }}
          onClick={() => { setShowProjectPicker(false); setShowSettings(false); }}
        />
      )}
    </div>
  );
}
