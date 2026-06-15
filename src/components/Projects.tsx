import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
import BottomNav from './BottomNav';
import { Project } from '../types';
import { getProjects, saveProject, deleteProject } from '../utils/projects';
import { getPhotos } from '../utils/db';

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [photoCounts, setPhotoCounts] = useState<Record<string, number>>({});
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const loadData = async () => {
    const projs = getProjects();
    setProjects(projs);
    const photos = await getPhotos();
    const counts: Record<string, number> = {};
    photos.forEach((p) => {
      counts[p.projectId] = (counts[p.projectId] || 0) + 1;
    });
    setPhotoCounts(counts);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    saveProject(newName.trim());
    setNewName('');
    setShowModal(false);
    setCreating(false);
    loadData();
  };

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      deleteProject(id);
      setDeleteConfirm(null);
      loadData();
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handleDownloadZip = async (project: Project) => {
    setDownloading(project.id);
    try {
      const allPhotos = await getPhotos();
      const projectPhotos = allPhotos.filter((p) => p.projectId === project.id);
      if (projectPhotos.length === 0) return;

      const zip = new JSZip();
      const folder = zip.folder(project.name) ?? zip;

      projectPhotos.forEach((photo, idx) => {
        const base64 = photo.dataUrl.split(',')[1];
        const date = new Date(photo.capturedAt).toISOString().slice(0, 10);
        folder.file(`foto_${String(idx + 1).padStart(3, '0')}_${date}.jpg`, base64, { base64: true });
      });

      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name.replace(/\s+/g, '_')}_fotos.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error creating ZIP:', err);
    } finally {
      setDownloading(null);
    }
  };

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="page">

      {/* Header */}
      <div className="page-header">
        <h2>Projetos</h2>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '8px 14px',
            background: 'rgba(0,255,102,0.1)',
            border: '1px solid rgba(0,255,102,0.25)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--green)',
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            letterSpacing: '0.04em',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          NOVO PROJETO
        </button>
      </div>

      <div className="page-content">
        {projects.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <h3>Nenhum projeto criado</h3>
            <p>Crie um projeto para organizar suas fotografias de campo</p>
            <button
              className="btn-primary"
              onClick={() => setShowModal(true)}
              style={{ width: 'auto', marginTop: '8px' }}
            >
              Criar primeiro projeto
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {projects.map((project) => {
              const count = photoCounts[project.id] || 0;
              const isConfirming = deleteConfirm === project.id;
              const isDownloading = downloading === project.id;
              return (
                <div
                  key={project.id}
                  className="glass-card"
                  onClick={() => count > 0 && navigate(`/galeria?projeto=${project.id}`)}
                  style={{
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    cursor: count > 0 ? 'pointer' : 'default',
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0,229,255,0.08)',
                    border: '1px solid rgba(0,229,255,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      color: 'var(--text)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {project.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {formatDate(project.createdAt)}
                      {count > 0 && (
                        <span style={{ color: 'var(--cyan)', marginLeft: '8px' }}>Ver fotos →</span>
                      )}
                    </div>
                  </div>

                  {/* Count badge */}
                  <div style={{
                    padding: '3px 10px',
                    background: 'rgba(0,255,102,0.08)',
                    border: '1px solid rgba(0,255,102,0.15)',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--green)',
                    fontFamily: 'monospace',
                    flexShrink: 0,
                  }}>
                    {count}
                  </div>

                  {/* Download ZIP */}
                  {count > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDownloadZip(project); }}
                      disabled={isDownloading}
                      title="Baixar fotos em ZIP"
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-xs)',
                        background: 'rgba(0,229,255,0.08)',
                        border: '1px solid rgba(0,229,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        color: 'var(--cyan)',
                        opacity: isDownloading ? 0.5 : 1,
                      }}
                    >
                      {isDownloading ? (
                        <div className="spinner" style={{ width: '14px', height: '14px' }} />
                      ) : (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      )}
                    </button>
                  )}

                  {/* Delete */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-xs)',
                      background: isConfirming ? 'rgba(255,59,59,0.2)' : 'transparent',
                      border: isConfirming ? '1px solid rgba(255,59,59,0.4)' : '1px solid transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.2s',
                    }}
                  >
                    <svg
                      width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke={isConfirming ? 'var(--red)' : 'var(--text-muted)'}
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6" /><path d="M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                </div>
              );
            })}

            {deleteConfirm && (
              <div style={{
                padding: '10px 14px',
                background: 'rgba(255,59,59,0.08)',
                border: '1px solid rgba(255,59,59,0.2)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                color: 'var(--red)',
                textAlign: 'center',
              }}>
                Toque novamente para confirmar exclusão
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal-sheet">
            <h2 style={{ marginBottom: '6px' }}>Novo Projeto</h2>
            <p style={{ fontSize: '0.85rem', marginBottom: '20px' }}>
              Dê um nome para identificar este levantamento ou obra
            </p>
            <input
              type="text"
              placeholder="Ex: Inventário Florestal — Fazenda Aurora"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
              style={{ marginBottom: '16px' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn-secondary"
                onClick={() => { setShowModal(false); setNewName(''); }}
                style={{ flex: 1 }}
              >
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={handleCreate}
                disabled={!newName.trim() || creating}
                style={{ flex: 1 }}
              >
                {creating ? 'Criando...' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
