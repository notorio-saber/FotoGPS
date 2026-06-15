import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BottomNav from './BottomNav';
import { CapturedPhoto } from '../types';
import { getPhotos, deletePhoto } from '../utils/db';
import { getProjects } from '../utils/projects';
import { generateKML, downloadKML } from '../utils/kml';

interface PhotoModalProps {
  photo: CapturedPhoto;
  onClose: () => void;
  onDelete: () => void;
}

function PhotoModal({ photo, onClose, onDelete }: PhotoModalProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = photo.dataUrl;
    const date = new Date(photo.capturedAt).toISOString().slice(0, 10);
    a.download = `geofoto_${date}_${photo.id}.jpg`;
    a.click();
  };

  const handleDownloadKML = () => {
    const kml = generateKML([photo], photo.projectName || 'Sem projeto');
    const date = new Date(photo.capturedAt).toISOString().slice(0, 10);
    downloadKML(kml, `ponto_${date}_${photo.id}.kml`);
  };

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete();
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.95)',
        zIndex: 300,
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Top bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <button className="btn-ghost" onClick={onClose} style={{ padding: '8px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {new Date(photo.capturedAt).toLocaleString('pt-BR')}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {photo.lat !== null && (
            <button
              className="btn-ghost"
              onClick={handleDownloadKML}
              title="Baixar ponto GPS em KML"
              style={{ color: 'var(--green)', padding: '8px' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </button>
          )}
          <button
            className="btn-ghost"
            onClick={handleDownload}
            style={{ color: 'var(--cyan)', padding: '8px' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
          <button
            className="btn-ghost"
            onClick={handleDelete}
            style={{ color: confirmDelete ? 'var(--red)' : 'var(--text-muted)', padding: '8px' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Image */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <img
          src={photo.dataUrl}
          alt="Foto capturada"
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        />
      </div>

      {/* Bottom info */}
      <div style={{ padding: '16px', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--green)', marginBottom: '4px' }}>
          {photo.projectName || 'Sem projeto'}
        </div>
        {photo.city && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {[photo.city, photo.state].filter(Boolean).join(' — ')}
          </div>
        )}
        {photo.lat !== null && (
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'monospace', marginTop: '4px' }}>
            {photo.lat?.toFixed(6)}, {photo.lon?.toFixed(6)}
          </div>
        )}
        {photo.observation && (
          <div style={{
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            marginTop: '8px',
            padding: '6px 10px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 'var(--radius-xs)',
            borderLeft: '2px solid rgba(0,255,102,0.3)',
            fontFamily: 'Courier New, monospace',
          }}>
            Obs: {photo.observation}
          </div>
        )}
        {confirmDelete && (
          <div style={{
            marginTop: '10px',
            padding: '8px 12px',
            background: 'rgba(255,59,59,0.1)',
            borderRadius: 'var(--radius-xs)',
            fontSize: '0.8rem',
            color: 'var(--red)',
            textAlign: 'center',
          }}>
            Toque novamente para confirmar exclusão
          </div>
        )}
      </div>
    </div>
  );
}

export default function Gallery() {
  const [searchParams] = useSearchParams();
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(() => searchParams.get('projeto') || 'all');
  const [selectedPhoto, setSelectedPhoto] = useState<CapturedPhoto | null>(null);
  const [projectNames, setProjectNames] = useState<Record<string, string>>({});

  const loadPhotos = async () => {
    setLoading(true);
    const allPhotos = await getPhotos();
    setPhotos(allPhotos);

    const projects = getProjects();
    const names: Record<string, string> = {};
    projects.forEach((p) => { names[p.id] = p.name; });
    setProjectNames(names);

    setLoading(false);
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  const handleDelete = async (photo: CapturedPhoto) => {
    await deletePhoto(photo.id);
    setSelectedPhoto(null);
    loadPhotos();
  };

  // Unique project IDs from photos
  const projectFilters = Array.from(
    new Set(photos.map((p) => p.projectId).filter(Boolean))
  );

  const filteredPhotos =
    activeFilter === 'all'
      ? photos
      : photos.filter((p) => p.projectId === activeFilter);

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <h2>Galeria</h2>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {photos.length} foto{photos.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Filter tabs */}
      {projectFilters.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '12px 16px',
          overflowX: 'auto',
          borderBottom: '1px solid var(--border)',
          scrollbarWidth: 'none',
        }}>
          <button
            onClick={() => setActiveFilter('all')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid',
              fontSize: '0.8rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              background: activeFilter === 'all' ? 'rgba(0,255,102,0.12)' : 'transparent',
              borderColor: activeFilter === 'all' ? 'rgba(0,255,102,0.4)' : 'var(--border)',
              color: activeFilter === 'all' ? 'var(--green)' : 'var(--text-muted)',
            }}
          >
            Todos
          </button>
          {projectFilters.map((pid) => (
            <button
              key={pid}
              onClick={() => setActiveFilter(pid)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid',
                fontSize: '0.8rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                background: activeFilter === pid ? 'rgba(0,255,102,0.12)' : 'transparent',
                borderColor: activeFilter === pid ? 'rgba(0,255,102,0.4)' : 'var(--border)',
                color: activeFilter === pid ? 'var(--green)' : 'var(--text-muted)',
              }}
            >
              {projectNames[pid] || pid.slice(0, 12)}
            </button>
          ))}
        </div>
      )}

      <div className="page-content">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
            <div className="spinner" />
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <h3>Nenhuma foto</h3>
            <p>
              {activeFilter === 'all'
                ? 'Capture sua primeira foto georreferenciada'
                : 'Nenhuma foto neste projeto'}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
          }}>
            {filteredPhotos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  position: 'relative',
                  aspectRatio: '4/3',
                  display: 'block',
                }}
              >
                <img
                  src={photo.dataUrl}
                  alt="Foto"
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
                {/* Overlay info */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '20px 8px 8px',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
                }}>
                  <div style={{
                    fontSize: '0.65rem',
                    color: 'white',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {new Date(photo.capturedAt).toLocaleDateString('pt-BR')}
                  </div>
                  <div style={{
                    fontSize: '0.6rem',
                    color: 'rgba(255,255,255,0.65)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {photo.projectName || 'Sem projeto'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onDelete={() => handleDelete(selectedPhoto)}
        />
      )}

      <BottomNav />
    </div>
  );
}
