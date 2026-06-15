import React, { useEffect, useState } from 'react';

type Platform = 'android' | 'ios' | 'none';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const STORAGE_KEY = 'geofoto-install-dismissed';

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  const isStandalone =
    (window.navigator as any).standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches;
  if (isStandalone) return 'none';
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'none';
}

export default function InstallPrompt() {
  const [platform, setPlatform] = useState<Platform>('none');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;

    const p = detectPlatform();
    setPlatform(p);

    if (p === 'android') {
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setVisible(true);
      };
      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
    }

    if (p === 'ios') {
      // Pequeno delay para não aparecer imediatamente ao logar
      const t = setTimeout(() => setVisible(true), 1800);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, '1');
  };

  const installAndroid = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') localStorage.setItem(STORAGE_KEY, '1');
    setDeferredPrompt(null);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        {/* Ícone do app */}
        <div style={styles.iconWrap}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="14" fill="#00ff66" fillOpacity="0.12" stroke="#00ff66" strokeOpacity="0.3" strokeWidth="1"/>
            <circle cx="24" cy="24" r="10" stroke="#00ff66" strokeWidth="1.5" fill="none"/>
            <circle cx="24" cy="24" r="5" stroke="#00e5ff" strokeWidth="1" fill="none"/>
            <circle cx="24" cy="24" r="2" fill="#00ff66"/>
          </svg>
        </div>

        <p style={styles.badge}>GeoFoto — EcoAds</p>
        <h2 style={styles.title}>Instale o aplicativo</h2>

        {platform === 'android' && (
          <>
            <p style={styles.desc}>
              Adicione o GeoFoto à tela inicial para acesso rápido em campo, mesmo offline.
            </p>
            <button style={styles.btnPrimary} onClick={installAndroid}>
              Instalar agora
            </button>
          </>
        )}

        {platform === 'ios' && (
          <>
            <p style={styles.desc}>
              Para instalar o GeoFoto na tela inicial do seu iPhone ou iPad:
            </p>
            <div style={styles.steps}>
              <div style={styles.step}>
                <span style={styles.stepNum}>1</span>
                <span>Toque no botão <strong style={{ color: '#00e5ff' }}>Compartilhar</strong> <span style={styles.icon}>⎙</span> na barra inferior do Safari</span>
              </div>
              <div style={styles.step}>
                <span style={styles.stepNum}>2</span>
                <span>Role as opções e toque em <strong style={{ color: '#00e5ff' }}>Adicionar à Tela de Início</strong></span>
              </div>
              <div style={styles.step}>
                <span style={styles.stepNum}>3</span>
                <span>Confirme tocando em <strong style={{ color: '#00ff66' }}>Adicionar</strong> no canto superior direito</span>
              </div>
            </div>
          </>
        )}

        <button style={styles.btnSecondary} onClick={dismiss}>
          {platform === 'ios' ? 'Entendi, fazer depois' : 'Agora não'}
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.75)',
    backdropFilter: 'blur(8px)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    padding: '0 16px 24px',
  },
  modal: {
    background: 'rgba(10,14,11,0.98)',
    border: '1px solid rgba(0,255,102,0.15)',
    borderRadius: '24px',
    padding: '28px 24px 24px',
    width: '100%',
    maxWidth: '420px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 -8px 40px rgba(0,255,102,0.08)',
  },
  iconWrap: {
    marginBottom: '4px',
  },
  badge: {
    fontSize: '0.68rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.15em',
    color: '#00ff66',
    fontWeight: 600,
    margin: 0,
  },
  title: {
    fontSize: '1.35rem',
    fontWeight: 700,
    color: '#e8ede9',
    margin: 0,
    textAlign: 'center' as const,
  },
  desc: {
    fontSize: '0.92rem',
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center' as const,
    lineHeight: 1.6,
    margin: 0,
  },
  steps: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
    marginTop: '4px',
  },
  step: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '12px 14px',
    fontSize: '0.88rem',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 1.5,
  },
  stepNum: {
    minWidth: '22px',
    height: '22px',
    borderRadius: '50%',
    background: 'rgba(0,255,102,0.12)',
    border: '1px solid rgba(0,255,102,0.3)',
    color: '#00ff66',
    fontSize: '0.75rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: '1.1em',
  },
  btnPrimary: {
    width: '100%',
    padding: '15px',
    borderRadius: '14px',
    border: 'none',
    background: '#00ff66',
    color: '#030303',
    fontWeight: 800,
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '4px',
  },
  btnSecondary: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.35)',
    fontSize: '0.85rem',
    cursor: 'pointer',
    padding: '8px',
  },
};
