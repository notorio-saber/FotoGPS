import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BottomNav from './BottomNav';
import { getProjects } from '../utils/projects';
import { getPhotos } from '../utils/db';

export default function Dashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [photoCount, setPhotoCount] = useState(0);
  const [projectCount, setProjectCount] = useState(0);
  const [avatarError, setAvatarError] = useState(false);
  const [recentPhotos, setRecentPhotos] = useState<string[]>([]);

  useEffect(() => {
    const projects = getProjects();
    setProjectCount(projects.length);

    getPhotos().then((photos) => {
      setPhotoCount(photos.length);
      // grab up to 3 recent thumbnails
      setRecentPhotos(photos.slice(0, 3).map((p) => p.dataUrl));
    });
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const firstName = profile?.nome?.split(' ')[0] || 'Usuário';
  const licenseStatus = profile?.licenseStatus || 'trial';

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>

      {/* Header */}
      <div style={{
        padding: '20px 16px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'rgba(0,255,102,0.15)', border: '1.5px solid rgba(0,255,102,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0,
          }}>
            {profile?.photoURL && !avatarError ? (
              <img src={profile.photoURL} alt={profile.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setAvatarError(true)} />
            ) : (
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--green)' }}>
                {firstName[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--green)' }}>GeoFoto</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>EcoAds</div>
          </div>
        </div>

        <span className={`badge badge-${licenseStatus === 'active' ? 'active' : licenseStatus === 'blocked' ? 'blocked' : 'trial'}`}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />
          {licenseStatus === 'active' ? 'ATIVO' : licenseStatus === 'blocked' ? 'BLOQUEADO' : 'TRIAL'}
        </span>
      </div>

      {/* Content */}
      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Greeting */}
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2px' }}>{getGreeting()},</p>
          <h1 style={{ fontSize: '1.75rem' }}>{firstName}</h1>
        </div>

        {/* Stats Row — clickable */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {/* Fotos card */}
          <button
            onClick={() => navigate('/galeria')}
            style={{
              flex: 1, background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              borderRadius: 'var(--radius)', textAlign: 'left',
              transition: 'transform 0.15s ease',
            }}
            onPointerDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
            onPointerUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onPointerLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <div className="glass-card stat-card" style={{
              position: 'relative', overflow: 'hidden',
              transition: 'border-color 0.2s',
              border: '1px solid rgba(0,255,102,0.1)',
            }}>
              {/* mini thumbnails strip */}
              {recentPhotos.length > 0 && (
                <div style={{
                  position: 'absolute', top: 0, right: 0, bottom: 0,
                  width: '56px', display: 'flex', flexDirection: 'column', overflow: 'hidden',
                  opacity: 0.25,
                }}>
                  {recentPhotos.map((url, i) => (
                    <img key={i} src={url} alt="" style={{ flex: 1, width: '100%', objectFit: 'cover', display: 'block' }} />
                  ))}
                </div>
              )}
              <div className="stat-value">{photoCount}</div>
              <div className="stat-label">Fotos</div>
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.65rem', color: 'rgba(0,255,102,0.6)', fontWeight: 600 }}>Ver galeria</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(0,255,102,0.6)" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          </button>

          {/* Projetos card */}
          <button
            onClick={() => navigate('/projetos')}
            style={{
              flex: 1, background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              borderRadius: 'var(--radius)', textAlign: 'left',
              transition: 'transform 0.15s ease',
            }}
            onPointerDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
            onPointerUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onPointerLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <div className="glass-card stat-card" style={{
              border: '1px solid rgba(0,229,255,0.1)',
            }}>
              <div className="stat-value" style={{ color: 'var(--cyan)' }}>{projectCount}</div>
              <div className="stat-label">Projetos</div>
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.65rem', color: 'rgba(0,229,255,0.6)', fontWeight: 600 }}>Ver projetos</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,0.6)" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* Info card */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <div className="section-title" style={{ marginBottom: '12px' }}>Armazenamento</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
              <line x1="6" y1="6" x2="6.01" y2="6" />
              <line x1="6" y1="18" x2="6.01" y2="18" />
            </svg>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text)' }}>Fotos salvas localmente</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>IndexedDB — nunca enviadas ao servidor</div>
            </div>
          </div>
        </div>

      </div>

      <BottomNav />
    </div>
  );
}
