import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18" />
        <circle cx="8.5" cy="6" r="1.5" fill="#00e5ff" stroke="none" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    title: 'Foto com tudo dentro',
    desc: 'Coordenadas, endereço, data, hora e nome do projeto aparecem direto na imagem — sem precisar editar nada depois',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00ff66" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        <line x1="12" y1="11" x2="12" y2="17" />
        <line x1="9" y1="14" x2="15" y2="14" />
      </svg>
    ),
    title: 'Organize por projetos',
    desc: 'Separe as fotos por obra, inventário ou área. Acesse, filtre e baixe por projeto quando quiser',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffd300" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="8" rx="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" />
        <line x1="6" y1="18" x2="6.01" y2="18" />
      </svg>
    ),
    title: 'Suas fotos só suas',
    desc: 'Tudo fica no próprio celular — nunca enviamos suas imagens para nenhum servidor',
  },
];

export default function Login() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const e = err as { code?: string };
      if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') {
        setError('Erro ao entrar com Google. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100svh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden',
      paddingTop: 'env(safe-area-inset-top, 0px)',
    }}>

      {/* Ambient glow */}
      <div style={{
        position: 'fixed',
        top: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle at 50% 30%, rgba(0,255,102,0.07) 0%, transparent 65%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Ring decoration */}
      <div style={{
        position: 'fixed',
        top: '-80px', left: '50%',
        transform: 'translateX(-50%)',
        width: '520px', height: '520px',
        borderRadius: '50%',
        border: '1px solid rgba(0,255,102,0.06)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <div style={{
        position: 'fixed',
        top: '-20px', left: '50%',
        transform: 'translateX(-50%)',
        width: '380px', height: '380px',
        borderRadius: '50%',
        border: '1px solid rgba(0,255,102,0.05)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Navbar */}
      <header style={{
        position: 'relative', zIndex: 1,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        {/* EcoAds logo oficial */}
        <img
          src="/ecoads-logo.png"
          alt="EcoAds"
          style={{ height: '28px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
        />

        <span style={{
          fontSize: '0.65rem', fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase' as const,
          color: 'rgba(0,255,102,0.5)',
          border: '1px solid rgba(0,255,102,0.2)',
          borderRadius: '20px',
          padding: '3px 10px',
        }}>Produto EcoAds</span>
      </header>

      {/* Hero */}
      <section style={{
        position: 'relative', zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center' as const,
        padding: '48px 24px 40px',
        gap: '20px',
      }}>
        {/* App icon */}
        <div style={{
          width: '88px', height: '88px',
          borderRadius: '24px',
          background: 'rgba(0,255,102,0.08)',
          border: '1.5px solid rgba(0,255,102,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 48px rgba(0,255,102,0.15), inset 0 1px 0 rgba(0,255,102,0.1)',
        }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="20" r="9" stroke="#00ff66" strokeWidth="2" />
            <circle cx="24" cy="20" r="3.5" fill="#00ff66" />
            <path d="M24 30 L24 40" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" />
            <path d="M19 36 L24 40 L29 36" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="24" cy="20" r="14" stroke="rgba(0,255,102,0.15)" strokeWidth="1" />
            <circle cx="24" cy="20" r="19" stroke="rgba(0,255,102,0.07)" strokeWidth="1" />
          </svg>
        </div>

        {/* Product name */}
        <div>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 800,
            background: 'linear-gradient(150deg, #ffffff 30%, #00ff66 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.04em',
            lineHeight: 1,
            marginBottom: '12px',
          }}>
            GeoFoto
          </h1>
          <p style={{
            fontSize: '1.05rem',
            color: 'rgba(255,255,255,0.75)',
            fontWeight: 500,
            lineHeight: 1.45,
            maxWidth: '280px',
            margin: '0 auto',
          }}>
            A ferramenta definitiva de documentação fotográfica para o setor florestal.
          </p>
        </div>

        {/* Value prop pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '8px', justifyContent: 'center' }}>
          <span style={{
            padding: '5px 13px',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: 600,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.55)',
            letterSpacing: '0.02em',
          }}>Interface limpa</span>
          <span style={{
            padding: '5px 13px',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: 700,
            background: 'rgba(0,255,102,0.12)',
            border: '1px solid rgba(0,255,102,0.3)',
            color: '#00ff66',
            letterSpacing: '0.02em',
          }}>Sem anúncios, para sempre</span>
        </div>
      </section>

      {/* Divider */}
      <div style={{
        position: 'relative', zIndex: 1,
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(0,255,102,0.12), transparent)',
        margin: '0 20px',
      }} />

      {/* Features */}
      <section style={{
        position: 'relative', zIndex: 1,
        padding: '32px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <p style={{
          fontSize: '0.65rem', fontWeight: 700,
          letterSpacing: '0.14em', textTransform: 'uppercase' as const,
          color: 'rgba(255,255,255,0.3)',
          marginBottom: '4px',
          paddingLeft: '4px',
        }}>Funcionalidades</p>

        {features.map((f) => (
          <div key={f.title} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            padding: '14px 16px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '14px',
          }}>
            <div style={{
              width: '40px', height: '40px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>{f.icon}</div>
            <div>
              <div style={{
                fontSize: '0.9rem', fontWeight: 700,
                color: 'rgba(255,255,255,0.85)',
                marginBottom: '3px',
              }}>{f.title}</div>
              <div style={{
                fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.4)',
                lineHeight: 1.45,
              }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section style={{
        position: 'relative', zIndex: 1,
        padding: '0 20px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        alignItems: 'center',
      }}>
        {error && (
          <div style={{
            width: '100%',
            padding: '11px 16px',
            background: 'rgba(255,59,59,0.08)',
            border: '1px solid rgba(255,59,59,0.22)',
            borderRadius: '10px',
            fontSize: '0.83rem',
            color: 'var(--red)',
            textAlign: 'center' as const,
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px 20px',
            background: loading ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '16px',
            color: 'var(--text)',
            font: '600 1rem Inter, sans-serif',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.65 : 1,
            transition: 'all 0.2s ease',
          }}
        >
          {loading ? (
            <>
              <div className="spinner" />
              Entrando...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M19.4 10.23c0-.68-.06-1.36-.17-2.02H10v3.82h5.27c-.22 1.2-.9 2.22-1.93 2.9v2.41h3.13c1.83-1.68 2.89-4.16 2.89-7.11z" fill="#4285F4" />
                <path d="M10 20c2.64 0 4.86-.87 6.48-2.36l-3.13-2.41c-.87.58-1.98.92-3.35.92-2.57 0-4.75-1.73-5.53-4.06H1.26v2.5C2.87 17.72 6.18 20 10 20z" fill="#34A853" />
                <path d="M4.47 12.09A5.99 5.99 0 0 1 4.16 10c0-.72.13-1.41.31-2.09V5.41H1.26A10 10 0 0 0 0 10c0 1.62.39 3.15 1.07 4.5l3.4-2.41z" fill="#FBBC04" />
                <path d="M10 3.96c1.45 0 2.75.5 3.77 1.48l2.82-2.82C14.86.98 12.64 0 10 0 6.18 0 2.87 2.28 1.26 5.5l3.4 2.41C5.25 5.7 7.43 3.96 10 3.96z" fill="#EA4335" />
              </svg>
              Entrar com Google
            </>
          )}
        </button>

        <p style={{
          fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.25)',
          textAlign: 'center' as const,
          lineHeight: 1.5,
        }}>
          Gratuito para começar · Sem cartão de crédito
        </p>
      </section>

      {/* Footer */}
      <footer style={{
        position: 'relative', zIndex: 1,
        marginTop: 'auto',
        padding: '20px 20px calc(20px + env(safe-area-inset-bottom, 0px))',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
      }}>
        <img
          src="/ecoads-logo.png"
          alt="EcoAds"
          style={{ height: '18px', objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.25 }}
        />
        <span style={{
          fontSize: '0.72rem',
          color: 'rgba(255,255,255,0.2)',
          letterSpacing: '0.02em',
        }}>
          Tecnologia para o setor florestal
        </span>
      </footer>

    </div>
  );
}
