import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

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
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(0,255,102,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%',
        maxWidth: '380px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '32px',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* Logo / Badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '22px',
            background: 'rgba(0,255,102,0.1)',
            border: '1.5px solid rgba(0,255,102,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 40px rgba(0,255,102,0.15)',
          }}>
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <circle cx="22" cy="18" r="8" stroke="#00ff66" strokeWidth="2" />
              <circle cx="22" cy="18" r="3" fill="#00ff66" />
              <path d="M8 36c0-7.732 6.268-14 14-14s14 6.268 14 14" stroke="#00ff66" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
              <path d="M22 30 L22 38" stroke="#00e5ff" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M18 34 L22 38 L26 34" stroke="#00e5ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--green)',
              marginBottom: '8px',
            }}>
              EcoAds • Tecnologia Florestal
            </div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #fff 40%, var(--green))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.03em',
              marginBottom: '0',
            }}>
              GeoFoto
            </h1>
          </div>
        </div>

        {/* Tagline */}
        <div style={{ textAlign: 'center', maxWidth: '300px' }}>
          <p style={{
            fontSize: '1.05rem',
            color: 'var(--text)',
            fontWeight: 500,
            lineHeight: 1.4,
            marginBottom: '8px',
          }}>
            Documentação técnica de campo
          </p>
          <p style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            lineHeight: 1.55,
          }}>
            Fotografias georreferenciadas para inventários, laudos e licenciamentos ambientais
          </p>
        </div>

        {/* Feature bullets */}
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          {[
            'GPS de alta precisão com endereço reverso',
            'Sobreposição técnica nas fotos (data, hora, coords)',
            'Armazenamento local seguro e offline',
          ].map((feat) => (
            <div key={feat} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              background: 'rgba(0,255,102,0.04)',
              border: '1px solid rgba(0,255,102,0.1)',
              borderRadius: 'var(--radius-sm)',
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                <path d="M2 7L5.5 10.5L12 3.5" stroke="#00ff66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{feat}</span>
            </div>
          ))}
        </div>

        {/* Sign in button */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {error && (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(255,59,59,0.1)',
              border: '1px solid rgba(255,59,59,0.25)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              color: 'var(--red)',
              textAlign: 'center',
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
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 'var(--radius)',
              color: 'var(--text)',
              font: '600 1rem Inter, sans-serif',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s ease',
            }}
          >
            {loading ? (
              <div className="spinner" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M19.4 10.23c0-.68-.06-1.36-.17-2.02H10v3.82h5.27c-.22 1.2-.9 2.22-1.93 2.9v2.41h3.13c1.83-1.68 2.89-4.16 2.89-7.11z" fill="#4285F4" />
                <path d="M10 20c2.64 0 4.86-.87 6.48-2.36l-3.13-2.41c-.87.58-1.98.92-3.35.92-2.57 0-4.75-1.73-5.53-4.06H1.26v2.5C2.87 17.72 6.18 20 10 20z" fill="#34A853" />
                <path d="M4.47 12.09A5.99 5.99 0 0 1 4.16 10c0-.72.13-1.41.31-2.09V5.41H1.26A10 10 0 0 0 0 10c0 1.62.39 3.15 1.07 4.5l3.4-2.41z" fill="#FBBC04" />
                <path d="M10 3.96c1.45 0 2.75.5 3.77 1.48l2.82-2.82C14.86.98 12.64 0 10 0 6.18 0 2.87 2.28 1.26 5.5l3.4 2.41C5.25 5.7 7.43 3.96 10 3.96z" fill="#EA4335" />
              </svg>
            )}
            {loading ? 'Entrando...' : 'Entrar com Google'}
          </button>
        </div>

        {/* Footer */}
        <p style={{
          fontSize: '0.72rem',
          color: 'var(--text-dim)',
          textAlign: 'center',
          letterSpacing: '0.02em',
        }}>
          Um produto EcoAds • Tecnologia para o setor florestal
        </p>
      </div>
    </div>
  );
}
