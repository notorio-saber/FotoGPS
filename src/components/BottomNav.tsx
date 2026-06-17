import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_H = 64;
const FAB_R = 29;      // 58px diameter
const NOTCH_W = 33;    // half-width of notch opening at nav top
const NOTCH_DEPTH = 12; // how deep the arc dips into the nav
// Arc radius derived from notch geometry: R = (w² + d²) / (2d)
const ARC_R = Math.round((NOTCH_W ** 2 + NOTCH_DEPTH ** 2) / (2 * NOTCH_DEPTH));

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
  const [navW, setNavW] = useState(window.innerWidth);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onResize = () => setNavW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const cx = navW / 2;

  // Nav background: rectangle with a gentle concave arc at the top center
  const navPath = [
    `M0,${NAV_H}`,
    `L0,0`,
    `L${cx - NOTCH_W},0`,
    `A${ARC_R},${ARC_R} 0 0,1 ${cx + NOTCH_W},0`,
    `L${navW},0`,
    `L${navW},${NAV_H}`,
    'Z',
  ].join(' ');

  const handleNav = (path: string) => navigate(path);

  return (
    <>
      {/* FAB — camera, fully inside the nav, centered */}
      <button
        onClick={() => navigate('/nova-foto')}
        style={{
          position: 'fixed',
          // center at visual nav mid-height: (NAV_H/2) from nav top = (NAV_H/2 - FAB_R) from nav bottom
          bottom: `calc(${NAV_H / 2 - FAB_R}px + env(safe-area-inset-bottom, 0px))`,
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${FAB_R * 2}px`,
          height: `${FAB_R * 2}px`,
          borderRadius: '50%',
          background: 'var(--green)',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 0 4px rgba(0,255,102,0.18), 0 2px 16px rgba(0,255,102,0.5)',
          zIndex: 102,
          color: '#030303',
          cursor: 'pointer',
          transition: 'transform 0.12s ease, box-shadow 0.12s ease',
        }}
        onPointerDown={(e) => (e.currentTarget.style.transform = 'translateX(-50%) scale(0.93)')}
        onPointerUp={(e) => (e.currentTarget.style.transform = 'translateX(-50%) scale(1)')}
        onPointerLeave={(e) => (e.currentTarget.style.transform = 'translateX(-50%) scale(1)')}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      </button>

      {/* Nav container */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }}>

        {/* SVG — nav shape with notch + borders */}
        <svg
          width={navW}
          height={NAV_H}
          viewBox={`0 0 ${navW} ${NAV_H}`}
          style={{ display: 'block' }}
        >
          {/* Background fill */}
          <path d={navPath} fill="rgba(10,14,11,0.97)" />

          {/* Border: flat left segment */}
          <line
            x1="0" y1="0.5"
            x2={cx - NOTCH_W} y2="0.5"
            stroke="rgba(255,255,255,0.07)" strokeWidth="1"
          />
          {/* Border: flat right segment */}
          <line
            x1={cx + NOTCH_W} y1="0.5"
            x2={navW} y2="0.5"
            stroke="rgba(255,255,255,0.07)" strokeWidth="1"
          />
          {/* Border: the notch arc — green glow highlight */}
          <path
            d={`M${cx - NOTCH_W},0.5 A${ARC_R},${ARC_R} 0 0,1 ${cx + NOTCH_W},0.5`}
            fill="none"
            stroke="rgba(0,255,102,0.28)"
            strokeWidth="1.5"
          />
          {/* Inner glow at notch — subtler, wider */}
          <path
            d={`M${cx - NOTCH_W + 4},2 A${ARC_R},${ARC_R} 0 0,1 ${cx + NOTCH_W - 4},2`}
            fill="none"
            stroke="rgba(0,255,102,0.10)"
            strokeWidth="3"
          />
        </svg>

        {/* Nav items overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: `${NAV_H}px`,
          display: 'flex',
          alignItems: 'center',
        }}>
          {/* Left half */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
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
          </div>

          {/* Center spacer (FAB area) */}
          <div style={{ width: `${NOTCH_W * 2 + 12}px`, flexShrink: 0 }} />

          {/* Right half */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
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
          </div>
        </div>

        {/* Safe area fill */}
        <div style={{
          height: 'env(safe-area-inset-bottom, 0px)',
          background: 'rgba(10,14,11,0.97)',
        }} />
      </div>
    </>
  );
}
