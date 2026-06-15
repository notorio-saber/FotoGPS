import { useAuth } from '../context/AuthContext';

export default function BlockedScreen() {
  const { signOut, profile } = useAuth();

  return (
    <div style={{
      minHeight: '100svh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 20px',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '340px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>

        {/* Icon */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'rgba(255,59,59,0.1)',
          border: '1.5px solid rgba(255,59,59,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ff3b3b" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <div>
          <h2 style={{ color: 'var(--red)', marginBottom: '8px' }}>Acesso Bloqueado</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {profile?.nome ? `${profile.nome}, sua` : 'Sua'} conta está bloqueada.
            Entre em contato com a equipe EcoAds para regularizar sua licença.
          </p>
        </div>

        <div className="glass-card" style={{ width: '100%', padding: '16px 20px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Suporte EcoAds</p>
          <a
            href="mailto:contato@ecoads.com.br"
            style={{
              color: 'var(--cyan)',
              fontSize: '0.95rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            contato@ecoads.com.br
          </a>
        </div>

        <button
          onClick={signOut}
          className="btn-danger"
          style={{ width: '100%', padding: '14px' }}
        >
          Sair da conta
        </button>

      </div>
    </div>
  );
}
