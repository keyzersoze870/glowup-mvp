'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const sf = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif`
const BLUE = '#0A84FF'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogle = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleMagicLink = async () => {
    if (!email.trim()) return
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    })
    if (error) setError(error.message)
    else setSent(true)
    setLoading(false)
  }

  return (
    <main style={{ height:'100svh', background:'#000', fontFamily:sf, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'0 24px' }}>

      <div style={{ width:'100%', maxWidth:360 }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <h1 style={{ fontSize:28, fontWeight:700, color:'#fff', letterSpacing:-0.8, marginBottom:8 }}>GlowApp</h1>
          <p style={{ fontSize:14, color:'rgba(255,255,255,0.4)', letterSpacing:-0.2 }}>
            Connecte-toi pour suivre ta progression
          </p>
        </div>

        {sent ? (
          <div style={{ textAlign:'center', padding:'24px', background:'rgba(10,132,255,0.08)', border:'0.5px solid rgba(10,132,255,0.2)', borderRadius:16 }}>
            <div style={{ fontSize:32, marginBottom:12 }}>📧</div>
            <h2 style={{ fontSize:18, fontWeight:700, color:'#fff', marginBottom:8, letterSpacing:-0.5 }}>Vérifie tes emails</h2>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.5)', lineHeight:1.5 }}>
              On a envoyé un lien de connexion à <span style={{ color:BLUE }}>{email}</span>. Clique dessus pour te connecter.
            </p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

            {/* Google */}
            <button onClick={handleGoogle} disabled={loading}
              style={{ width:'100%', padding:'14px', background:'#fff', border:'none', borderRadius:14, color:'#000', fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:sf, letterSpacing:-0.3, display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.31z"/>
              </svg>
              Continuer avec Google
            </button>

            {/* Séparateur */}
            <div style={{ display:'flex', alignItems:'center', gap:12, margin:'4px 0' }}>
              <div style={{ flex:1, height:'0.5px', background:'rgba(255,255,255,0.1)' }} />
              <span style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>ou</span>
              <div style={{ flex:1, height:'0.5px', background:'rgba(255,255,255,0.1)' }} />
            </div>

            {/* Email */}
            <input
              type="email"
              placeholder="ton@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleMagicLink()}
              style={{ width:'100%', padding:'14px 16px', background:'rgba(255,255,255,0.06)', border:`0.5px solid ${email ? BLUE : 'rgba(255,255,255,0.12)'}`, borderRadius:14, color:'#fff', fontSize:16, fontFamily:sf, outline:'none', letterSpacing:-0.2, transition:'border-color 0.2s' }}
            />

            <button onClick={handleMagicLink} disabled={!email.trim() || loading}
              style={{ width:'100%', padding:'14px', background: email.trim() ? BLUE : 'rgba(255,255,255,0.08)', border:'none', borderRadius:14, color: email.trim() ? '#fff' : 'rgba(255,255,255,0.3)', fontSize:15, fontWeight:600, cursor: email.trim() ? 'pointer' : 'default', fontFamily:sf, letterSpacing:-0.3, transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              {loading ? <span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite' }} /> : null}
              Envoyer le lien de connexion
            </button>

            {error && <p style={{ fontSize:12, color:'#FF453A', textAlign:'center' }}>{error}</p>}

            {/* Nouveau utilisateur */}
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)', textAlign:'center', marginTop:8, lineHeight:1.5 }}>
              Pas encore de compte ?{' '}
              <button onClick={() => router.push('/onboarding')}
                style={{ background:'none', border:'none', color:BLUE, fontSize:12, cursor:'pointer', fontFamily:sf, fontWeight:500 }}>
                Calcule ton score gratuitement
              </button>
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        input::placeholder { color: rgba(255,255,255,0.2); }
        * { box-sizing:border-box; margin:0; padding:0; }
      `}</style>
    </main>
  )
}