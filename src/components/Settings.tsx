import { useState, useRef } from 'react';
import BottomNav from './BottomNav';
import { useAuth } from '../context/AuthContext';
import { OverlaySettings } from '../types';
import { getSettings, saveSettings } from '../utils/settings';

export default function Settings() {
  const { profile, signOut } = useAuth();
  const [settings, setSettings] = useState<OverlaySettings>(getSettings());
  const [avatarError, setAvatarError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (key: keyof OverlaySettings, value: unknown) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveSettings(next);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const next = { ...settings, logoDataUrl: dataUrl, showLogo: true };
      setSettings(next);
      saveSettings(next);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    update('logoDataUrl', '');
    update('showLogo', false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggles: Array<{ key: keyof OverlaySettings; label: string; desc?: string }> = [
    { key: 'showDate', label: 'Data', desc: 'DD/MM/AAAA' },
    { key: 'showTime', label: 'Hora', desc: 'HH:MM:SS' },
    { key: 'showCoords', label: 'Coordenadas GPS' },
    { key: 'showAccuracy', label: 'Precisão GPS', desc: 'em metros' },
    { key: 'showAltitude', label: 'Altitude', desc: 'em metros' },
    { key: 'showCity', label: 'Município / Estado' },
    { key: 'showProject', label: 'Nome do Projeto' },
  ];

  const licenseStatus = profile?.licenseStatus || 'trial';
  const firstName = profile?.nome?.split(' ')[0] || 'Usuário';

  return (
    <div className="page">
      <div className="page-header">
        <h2>Configurações</h2>
      </div>

      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* === OVERLAY SECTION === */}
        <div>
          <div className="section-title">Informações no Overlay</div>
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            {toggles.map((t, idx) => (
              <div
                key={t.key}
                className="toggle-row"
                style={{ borderBottom: idx < toggles.length - 1 ? '1px solid var(--border)' : 'none' }}
              >
                <div>
                  <span className="toggle-label">{t.label}</span>
                  {t.desc && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                      {t.desc}
                    </div>
                  )}
                </div>
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
          </div>
        </div>

        {/* Logo */}
        <div>
          <div className="section-title">Logo da Empresa</div>
          <div className="glass-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {settings.logoDataUrl ? (
                <div style={{
                  width: '56px',
                  height: '40px',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border)',
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: 'rgba(255,255,255,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <img
                    src={settings.logoDataUrl}
                    alt="Logo"
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </div>
              ) : (
                <div style={{
                  width: '56px',
                  height: '40px',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px dashed var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text)', marginBottom: '4px' }}>
                  {settings.logoDataUrl ? 'Logo carregada' : 'Nenhuma logo'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Aparece no canto da foto
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                {settings.logoDataUrl && (
                  <button
                    className="btn-ghost"
                    onClick={removeLogo}
                    style={{ color: 'var(--red)', padding: '8px', fontSize: '0.75rem' }}
                  >
                    Remover
                  </button>
                )}
                <button
                  className="btn-secondary"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                >
                  {settings.logoDataUrl ? 'Trocar' : 'Carregar'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Coord format */}
        <div>
          <div className="section-title">Formato das Coordenadas</div>
          <div className="glass-card" style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {([
                { val: 'decimal', label: 'Decimal', example: '-23.550520' },
                { val: 'dms', label: 'DMS', example: '23°33\'01"S' },
              ] as const).map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => update('coordFormat', opt.val)}
                  style={{
                    flex: 1,
                    padding: '12px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid',
                    background: settings.coordFormat === opt.val ? 'rgba(0,255,102,0.08)' : 'transparent',
                    borderColor: settings.coordFormat === opt.val ? 'rgba(0,255,102,0.35)' : 'var(--border)',
                    color: settings.coordFormat === opt.val ? 'var(--green)' : 'var(--text-muted)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{opt.label}</div>
                  <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', marginTop: '3px', opacity: 0.7 }}>
                    {opt.example}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Font size */}
        <div>
          <div className="section-title">Tamanho do Texto</div>
          <div className="glass-card" style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {([
                { val: 'small', label: 'Pequeno' },
                { val: 'medium', label: 'Médio' },
                { val: 'large', label: 'Grande' },
              ] as const).map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => update('fontSize', opt.val)}
                  style={{
                    flex: 1,
                    padding: '10px 6px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid',
                    background: settings.fontSize === opt.val ? 'rgba(0,255,102,0.08)' : 'transparent',
                    borderColor: settings.fontSize === opt.val ? 'rgba(0,255,102,0.35)' : 'var(--border)',
                    color: settings.fontSize === opt.val ? 'var(--green)' : 'var(--text-muted)',
                    fontSize: '0.8rem',
                    fontWeight: settings.fontSize === opt.val ? 700 : 400,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Overlay position */}
        <div>
          <div className="section-title">Posição do Overlay</div>
          <div className="glass-card" style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {([
                { val: 'bottom', label: 'Inferior' },
                { val: 'top', label: 'Superior' },
              ] as const).map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => update('position', opt.val)}
                  style={{
                    flex: 1,
                    padding: '10px 6px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid',
                    background: settings.position === opt.val ? 'rgba(0,255,102,0.08)' : 'transparent',
                    borderColor: settings.position === opt.val ? 'rgba(0,255,102,0.35)' : 'var(--border)',
                    color: settings.position === opt.val ? 'var(--green)' : 'var(--text-muted)',
                    fontSize: '0.875rem',
                    fontWeight: settings.position === opt.val ? 700 : 400,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="divider" />

        {/* === CONTA SECTION === */}
        <div>
          <div className="section-title">Conta</div>
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid rgba(0,255,102,0.3)',
                flexShrink: 0,
                background: 'rgba(0,255,102,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {profile?.photoURL && !avatarError ? (
                  <img
                    src={profile.photoURL}
                    alt="Avatar"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--green)' }}>
                    {firstName[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '2px' }}>
                  {profile?.nome || '—'}
                </div>
                <div style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {profile?.email || '—'}
                </div>
              </div>
              <span className={`badge badge-${licenseStatus === 'active' ? 'active' : licenseStatus === 'blocked' ? 'blocked' : 'trial'}`}>
                {licenseStatus === 'active' ? 'ATIVO' : licenseStatus === 'blocked' ? 'BLOQUEADO' : 'TRIAL'}
              </span>
            </div>

            <div style={{
              padding: '10px 12px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 'var(--radius-xs)',
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fotos capturadas</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--green)' }}>
                {profile?.photoCount ?? 0}
              </span>
            </div>

            <button
              className="btn-danger"
              onClick={signOut}
              style={{ width: '100%' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sair da conta
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
            GeoFoto v1.0 • EcoAds Tecnologia Florestal
          </div>
        </div>

      </div>

      <BottomNav />
    </div>
  );
}
