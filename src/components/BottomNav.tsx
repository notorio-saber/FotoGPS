import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const navLeft = [
  {
    path: '/dashboard',
    label: 'Início',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    path: '/projetos',
    label: 'Projetos',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

const navRight = [
  {
    path: '/galeria',
    label: 'Galeria',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
  {
    path: '/configuracoes',
    label: 'Config',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

const speedDial = [
  {
    path: '/nova-foto',
    label: 'Nova Foto',
    color: '#00ff66',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
  },
  {
    path: '/projetos',
    label: 'Novo Projeto',
    color: '#00e5ff',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        <line x1="12" y1="11" x2="12" y2="17" />
        <line x1="9" y1="14" x2="15" y2="14" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleNav = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)',
            zIndex: 94,
          }}
        />
      )}

      {/* Speed dial items */}
      {speedDial.map((item, i) => {
        const offset = 88 + i * 72;
        return (
          <div
            key={item.path}
            style={{
              position: 'fixed',
              bottom: open
                ? `calc(${offset}px + env(safe-area-inset-bottom, 0px))`
                : `calc(32px + env(safe-area-inset-bottom, 0px))`,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 96,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: open
                ? `bottom 0.28s cubic-bezier(0.34,1.56,0.64,1) ${i * 55}ms, opacity 0.2s ease ${i * 55}ms`
                : 'bottom 0.2s ease, opacity 0.15s ease',
              opacity: open ? 1 : 0,
              pointerEvents: open ? 'auto' : 'none',
            }}
          >
            {/* Label pill */}
            <span style={{
              background: 'rgba(10,14,11,0.96)',
              border: `1px solid ${item.color}40`,
              borderRadius: '20px',
              padding: '6px 14px',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: item.color,
              whiteSpace: 'nowrap' as const,
              boxShadow: `0 4px 16px rgba(0,0,0,0.4)`,
            }}>{item.label}</span>

            {/* Action button */}
            <button
              onClick={() => handleNav(item.path)}
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: `${item.color}18`,
                border: `1.5px solid ${item.color}55`,
                color: item.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 20px ${item.color}30`,
                flexShrink: 0,
              }}
            >
              {item.icon}
            </button>
          </div>
        );
      })}

      {/* Nav bar */}
      <nav className="bottom-nav">
        {navLeft.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              className={`bottom-nav-item${isActive ? ' active' : ''}`}
              onClick={() => handleNav(item.path)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Center FAB slot */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '72px' }}>
          <button
            onClick={() => setOpen((v) => !v)}
            style={{
              position: 'absolute',
              bottom: '8px',
              width: '58px',
              height: '58px',
              borderRadius: '50%',
              background: open ? 'rgba(10,14,11,0.98)' : 'var(--green)',
              border: open ? '2px solid var(--green)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: open
                ? '0 0 0 4px rgba(0,255,102,0.15)'
                : '0 0 0 4px rgba(0,255,102,0.2), 0 4px 24px rgba(0,255,102,0.45)',
              transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
              zIndex: 97,
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke={open ? 'var(--green)' : '#030303'}
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{ transition: 'transform 0.25s ease', transform: open ? 'rotate(45deg)' : 'rotate(0deg)' }}
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {navRight.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              className={`bottom-nav-item${isActive ? ' active' : ''}`}
              onClick={() => handleNav(item.path)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
