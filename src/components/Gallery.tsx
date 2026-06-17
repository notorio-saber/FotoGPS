import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BottomNav from './BottomNav';
import { CapturedPhoto } from '../types';
import { getPhotos, deletePhoto } from '../utils/db';
import { getProjects } from '../utils/projects';
import { generateKML, downloadKML } from '../utils/kml';

// ── WhatsApp share helper ───────────────────────────────────────────────────
function buildWhatsAppText(photo: CapturedPhoto): string {
  const date = new Date(photo.capturedAt).toLocaleString('pt-BR');
  const project = photo.projectName || 'Sem projeto';
  const name = photo.photoName ? `*${photo.photoName}*\n` : '';
  const coordLine =
    photo.lat !== null
      ? `📍 *Coordenadas:* ${photo.lat.toFixed(6)}, ${photo.lon?.toFixed(6)}\n🗺️ https://maps.google.com/?q=${photo.lat},${photo.lon}`
      : '📍 Sem coordenadas GPS';
  const city = photo.city ? `\n🏙️ ${[photo.city, photo.state].filter(Boolean).join(' — ')}` : '';
  const obs = photo.observation ? `\n📝 ${photo.observation}` : '';

  return encodeURIComponent(
    `${name}📁 Projeto: ${project}\n🕐 ${date}${city}\n${coordLine}${obs}\n\n_Enviado via FotoGPS Ecoads_`
  );
}

// ── Action button ─────────────────────────────────────────────────────────────
function ActionBtn({
  onClick,
  title,
  color = 'rgba(255,255,255,0.5)',
  children,
}: {
  onClick: () => void;
  title: string;
  color?: string;
  children: React.ReactNode;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '5px',
        padding: '10px 14px',
        borderRadius: '12px',
        background: pressed ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
        color,
        cursor: 'pointer',
        transition: 'all 0.13s ease',
        transform: pressed ? 'scale(0.94)' : 'scale(1)',
        flex: 1,
      }}
    >
      {children}
    </button>
  );
}

// ── Photo detail modal ────────────────────────────────────────────────────────
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
    const name = photo.photoName || `geofoto_${date}_${photo.id}`;
    a.download = `${name}.jpg`;
    a.click();
  };

  const handleDownloadKML = () => {
    const kml = generateKML([photo], photo.projectName || 'Sem projeto');
    const date = new Date(photo.capturedAt).toISOString().slice(0, 10);
    downloadKML(kml, `ponto_${date}_${photo.id}.kml`);
  };

  const handleWhatsApp = async () => {
    const date = new Date(photo.capturedAt).toLocaleString('pt-BR');
    const project = photo.projectName || 'Sem projeto';
    const name = photo.photoName ? `*${photo.photoName}*\n` : '';
    const coordLine =
      photo.lat !== null
        ? `📍 *Coordenadas:* ${photo.lat.toFixed(6)}, ${photo.lon?.toFixed(6)}\n🗺️ https://maps.google.com/?q=${photo.lat},${photo.lon}`
        : '📍 Sem coordenadas GPS';
    const city = photo.city ? `\n🏙️ ${[photo.city, photo.state].filter(Boolean).join(' — ')}` : '';
    const obs = photo.observation ? `\n📝 ${photo.observation}` : '';
    const rawText = `${name}📁 Projeto: ${project}\n🕐 ${date}${city}\n${coordLine}${obs}\n\n_Enviado via FotoGPS Ecoads_`;

    if (navigator.share && navigator.canShare) {
      try {
        const response = await fetch(photo.dataUrl);
        const blob = await response.blob();
        const cleanName = (photo.photoName || 'foto').replace(/[^a-zA-Z0-9]/g, '_');
        const file = new File([blob], `${cleanName}.jpg`, { type: 'image/jpeg' });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: photo.photoName || 'Compartilhar Foto',
            text: rawText,
          });
          return;
        }
      } catch (err) {
        console.error('Erro ao compartilhar via Web Share API:', err);
      }
    }

    // Fallback: standard WhatsApp URL
    const text = encodeURIComponent(rawText);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
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
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 300,
        display: 'flex', flexDirection: 'column',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 12px',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
        flexShrink: 0,
      }}>
        <button
          onClick={onClose}
          style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div style={{ textAlign: 'center', flex: 1, padding: '0 8px' }}>
          {photo.photoName && (
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white', lineHeight: 1.2 }}>
              {photo.photoName}
            </div>
          )}
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: photo.photoName ? '2px' : 0 }}>
            {new Date(photo.capturedAt).toLocaleString('pt-BR')}
          </div>
        </div>

        {/* Delete */}
        <button
          onClick={handleDelete}
          style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: confirmDelete ? 'rgba(255,59,59,0.18)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${confirmDelete ? 'rgba(255,59,59,0.35)' : 'rgba(255,255,255,0.1)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: confirmDelete ? 'var(--red)' : 'rgba(255,255,255,0.45)',
            transition: 'all 0.2s',
          }}
          title={confirmDelete ? 'Confirmar exclusão' : 'Excluir foto'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6" /><path d="M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>
      </div>

      {/* ── Image ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '0 4px' }}>
        <img
          src={photo.dataUrl}
          alt={photo.photoName || 'Foto capturada'}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' }}
        />
      </div>

      {/* ── Bottom sheet ── */}
      <div style={{
        padding: '16px',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
        background: 'rgba(10,14,11,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
      }}>
        {/* Meta info */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)', flexShrink: 0 }} />
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--green)' }}>
              {photo.projectName || 'Sem projeto'}
            </div>
          </div>

          {photo.city && (
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginLeft: '12px' }}>
              {[photo.city, photo.state].filter(Boolean).join(' — ')}
            </div>
          )}

          {photo.lat !== null && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              marginTop: '6px', marginLeft: '12px',
              padding: '3px 8px', borderRadius: '20px',
              background: 'rgba(0,255,102,0.06)', border: '1px solid rgba(0,255,102,0.15)',
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span style={{ fontSize: '0.65rem', color: 'var(--green)', fontFamily: 'monospace' }}>
                {photo.lat.toFixed(6)}, {photo.lon?.toFixed(6)}
              </span>
            </div>
          )}

          {photo.observation && (
            <div style={{
              fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)',
              marginTop: '8px', padding: '6px 10px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 'var(--radius-xs)',
              borderLeft: '2px solid rgba(0,255,102,0.25)',
              fontFamily: 'Courier New, monospace', lineHeight: 1.4,
            }}>
              {photo.observation}
            </div>
          )}
        </div>

        {/* Action buttons row */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* WhatsApp */}
          {photo.lat !== null && (
            <ActionBtn onClick={handleWhatsApp} title="Compartilhar no WhatsApp" color="#25D366">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
              </svg>
              <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>WhatsApp</span>
            </ActionBtn>
          )}

          {/* KML download */}
          {photo.lat !== null && (
            <ActionBtn onClick={handleDownloadKML} title="Baixar ponto GPS em KML" color="var(--green)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.04em' }}>KML</span>
            </ActionBtn>
          )}

          {/* Download image */}
          <ActionBtn onClick={handleDownload} title="Baixar imagem" color="var(--cyan)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.04em' }}>Salvar</span>
          </ActionBtn>
        </div>

        {/* Confirm delete warning */}
        {confirmDelete && (
          <div style={{
            marginTop: '10px', padding: '8px 12px',
            background: 'rgba(255,59,59,0.08)', borderRadius: 'var(--radius-xs)',
            fontSize: '0.8rem', color: 'var(--red)', textAlign: 'center',
            border: '1px solid rgba(255,59,59,0.2)',
          }}>
            Toque novamente no ícone para confirmar exclusão
          </div>
        )}
      </div>
    </div>
  );
}

// ── Gallery page ──────────────────────────────────────────────────────────────
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

  useEffect(() => { loadPhotos(); }, []);

  const handleDelete = async (photo: CapturedPhoto) => {
    await deletePhoto(photo.id);
    setSelectedPhoto(null);
    loadPhotos();
  };

  const projectFilters = Array.from(new Set(photos.map((p) => p.projectId).filter(Boolean)));

  const filteredPhotos =
    activeFilter === 'all' ? photos : photos.filter((p) => p.projectId === activeFilter);

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
            <button
              key={pid}
              onClick={() => setActiveFilter(pid)}
              style={{
                padding: '6px 14px', borderRadius: '20px', border: '1px solid', fontSize: '0.8rem',
                fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
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
            <p>{activeFilter === 'all' ? 'Capture sua primeira foto georreferenciada' : 'Nenhuma foto neste projeto'}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {filteredPhotos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                style={{
                  background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                  borderRadius: 'var(--radius-sm)', overflow: 'hidden',
                  position: 'relative', aspectRatio: '4/3', display: 'block',
                }}
              >
                <img
                  src={photo.dataUrl}
                  alt={photo.photoName || 'Foto'}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                {/* Overlay info */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  padding: '20px 8px 8px',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
                }}>
                  <div style={{
                    fontSize: '0.65rem', color: 'white', fontWeight: 600,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {photo.photoName || new Date(photo.capturedAt).toLocaleDateString('pt-BR')}
                  </div>
                  <div style={{
                    fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {photo.projectName || 'Sem projeto'}
                  </div>
                </div>

                {/* GPS dot */}
                {photo.lat !== null && (
                  <div style={{
                    position: 'absolute', top: '6px', right: '6px',
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: 'var(--green)', boxShadow: '0 0 6px var(--green)',
                  }} />
                )}
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
