import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
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
  // center slot — FAB placeholder (rendered separately)
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
    path: '/mapa',
    label: 'Mapa',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const fabRef = useRef<HTMLButtonElement>(null);
  const [fabPressed, setFabPressed] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number; id: number } | null>(null);
  const rippleCounter = useRef(0);

  // Ripple effect for nav items
  const triggerRipple = (e: React.MouseEvent, path: string) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    rippleCounter.current += 1;
    setRipple({ x, y, id: rippleCounter.current });
    setTimeout(() => setRipple(null), 500);
    navigate(path);
  };

  // Keep bottom padding synced with safe area
  const [safeBottom, setSafeBottom] = useState(0);
  useEffect(() => {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;bottom:0;height:env(safe-area-inset-bottom,0px);pointer-events:none;visibility:hidden;';
    document.body.appendChild(el);
    const obs = new ResizeObserver(() => setSafeBottom(el.offsetHeight));
    obs.observe(el);
    return () => { obs.disconnect(); document.body.removeChild(el); };
  }, []);

  const isCameraActive = location.pathname === '/nova-foto';

  return (
    <>
      {/* ── Liquid Glass pill container ── */}
      <div
        style={{
          position: 'fixed',
          bottom: `${safeBottom + 16}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '6px 8px',
          borderRadius: '100px',
          // Liquid glass background
          background: 'rgba(12, 18, 13, 0.55)',
          backdropFilter: 'blur(28px) saturate(160%)',
          WebkitBackdropFilter: 'blur(28px) saturate(160%)',
          border: '1px solid rgba(255, 255, 255, 0.10)',
          boxShadow: [
            // Outer glow — green tint
            '0 0 0 1px rgba(0,255,102,0.06)',
            // Top highlight — glass shine
            'inset 0 1px 0 rgba(255,255,255,0.12)',
            // Bottom inner shadow
            'inset 0 -1px 0 rgba(0,0,0,0.3)',
            // Drop shadow
            '0 8px 32px rgba(0,0,0,0.55)',
            '0 2px 8px rgba(0,0,0,0.4)',
          ].join(', '),
        }}
      >
        {/* Left items: Início, Projetos */}
        {navItems.slice(0, 2).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavBtn
              key={item.path}
              item={item}
              isActive={isActive}
              onClick={(e) => triggerRipple(e, item.path)}
            />
          );
        })}

        {/* FAB — camera button in the center */}
        <button
          ref={fabRef}
          onClick={() => navigate('/nova-foto')}
          onPointerDown={() => setFabPressed(true)}
          onPointerUp={() => setFabPressed(false)}
          onPointerLeave={() => setFabPressed(false)}
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: isCameraActive
              ? 'rgba(0,255,102,0.15)'
              : 'linear-gradient(145deg, #00ff66 0%, #00cc52 100%)',
            border: isCameraActive
              ? '1.5px solid rgba(0,255,102,0.5)'
              : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: isCameraActive ? 'var(--green)' : '#030303',
            cursor: 'pointer',
            margin: '0 4px',
            transition: 'all 0.18s cubic-bezier(0.34,1.56,0.64,1)',
            transform: fabPressed ? 'scale(0.88)' : isCameraActive ? 'scale(0.95)' : 'scale(1)',
            boxShadow: isCameraActive
              ? '0 0 16px rgba(0,255,102,0.3)'
              : [
                  '0 0 0 4px rgba(0,255,102,0.12)',
                  '0 0 20px rgba(0,255,102,0.45)',
                  'inset 0 1px 0 rgba(255,255,255,0.35)',
                  '0 4px 12px rgba(0,0,0,0.5)',
                ].join(', '),
          }}
          aria-label="Câmera"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transition: 'transform 0.18s ease', transform: fabPressed ? 'scale(0.85)' : 'scale(1)' }}
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </button>

        {/* Right items: Galeria, Mapa */}
        {navItems.slice(2).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavBtn
              key={item.path}
              item={item}
              isActive={isActive}
              onClick={(e) => triggerRipple(e, item.path)}
            />
          );
        })}
      </div>

      {/* Safe area fill at the very bottom edge */}
      {safeBottom > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: `${safeBottom}px`, background: 'transparent', zIndex: 99 }} />
      )}
    </>
  );
}

// ── Individual nav button ───────────────────────────────────────────────────
function NavBtn({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  const [pressed, setPressed] = useState(false);

  return (
    <button
      onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '3px',
        padding: '8px 12px',
        borderRadius: '50px',
        border: 'none',
        background: isActive
          ? 'rgba(0,255,102,0.12)'
          : pressed
          ? 'rgba(255,255,255,0.06)'
          : 'transparent',
        color: isActive ? 'var(--green)' : 'rgba(255,255,255,0.45)',
        cursor: 'pointer',
        transition: 'all 0.15s cubic-bezier(0.4,0,0.2,1)',
        transform: pressed ? 'scale(0.91)' : 'scale(1)',
        boxShadow: isActive
          ? 'inset 0 0 0 1px rgba(0,255,102,0.2), 0 0 12px rgba(0,255,102,0.08)'
          : 'none',
        minWidth: '56px',
        overflow: 'hidden',
      }}
      aria-label={item.label}
    >
      {/* Active top indicator dot */}
      {isActive && (
        <span
          style={{
            position: 'absolute',
            top: '4px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '18px',
            height: '2px',
            borderRadius: '1px',
            background: 'var(--green)',
            boxShadow: '0 0 6px rgba(0,255,102,0.6)',
          }}
        />
      )}

      {/* Icon */}
      <span
        style={{
          width: '22px',
          height: '22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.15s ease',
          transform: pressed ? 'scale(0.85) translateY(1px)' : 'scale(1)',
          marginTop: '4px',
        }}
      >
        {item.icon}
      </span>

      {/* Label */}
      <span
        style={{
          fontSize: '0.6rem',
          fontWeight: isActive ? 700 : 500,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          lineHeight: 1,
          transition: 'color 0.15s ease',
          whiteSpace: 'nowrap',
        }}
      >
        {item.label}
      </span>
    </button>
  );
}
