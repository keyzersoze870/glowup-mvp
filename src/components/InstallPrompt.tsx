'use client'
import { useEffect, useState } from 'react'

const sf = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif`
const BLUE = '#0A84FF'

function isStandalone() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true
}

function isIOS() {
  if (typeof window === 'undefined') return false
  return /iPad|iPhone|iPod/.test(window.navigator.userAgent)
}

function isInAppBrowser() {
  if (typeof window === 'undefined') return false
  const ua = window.navigator.userAgent || ''
  // Détecte TikTok, Instagram, Facebook, Snapchat WebViews
  return /TikTok|musical_ly|BytedanceWebview|Instagram|FBAN|FBAV|Snapchat/i.test(ua)
}

function isNonSafariIOS() {
  if (typeof window === 'undefined' || !isIOS()) return false
  const ua = window.navigator.userAgent || ''
  // Sur iOS, Chrome/Firefox/Edge utilisent WebKit mais n'ont pas le bouton Partager → "Sur l'écran d'accueil"
  return /CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua)
}

export default function InstallPrompt({ onDismiss }: { onDismiss: () => void }) {
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other')
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [installing, setInstalling] = useState(false)
  const [inApp, setInApp] = useState(false)
  const [needsSafari, setNeedsSafari] = useState(false)

  useEffect(() => {
    if (isIOS()) setPlatform('ios')
    else if (/Android/.test(navigator.userAgent)) setPlatform('android')
    setInApp(isInAppBrowser())
    setNeedsSafari(isNonSafariIOS())

    // Capture l'événement natif Android pour proposer un vrai bouton d'installation
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleDismiss = () => {
    localStorage.setItem('glowup_install_prompt_seen', '1')
    onDismiss()
  }

  const handleAndroidInstall = async () => {
    if (!deferredPrompt) { handleDismiss(); return }
    setInstalling(true)
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    handleDismiss()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'flex-end',
    }}>
      <div style={{
        width: '100%', background: '#0A0A0A', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '28px 24px calc(24px + env(safe-area-inset-bottom))',
        fontFamily: sf, border: '0.5px solid rgba(255,255,255,0.1)', borderBottom: 'none',
      }}>
        <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, margin: '0 auto 20px' }} />

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, background: BLUE,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', fontSize: 28, fontWeight: 800, color: '#fff',
          }}>G</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: -0.5, marginBottom: 6 }}>
            {inApp || needsSafari ? "Une dernière étape" : "Garde ton score à portée de main"}
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, letterSpacing: -0.1, maxWidth: 280, margin: '0 auto' }}>
            {inApp
              ? "Pour installer GlowApp, ouvre d'abord ce lien dans ton navigateur principal."
              : needsSafari
              ? "Sur iPhone, l'installation ne fonctionne que depuis Safari. Ouvre ce lien dans Safari pour continuer."
              : "Installe GlowApp sur ton écran d'accueil pour suivre ton évolution chaque jour, comme une vraie app."}
          </p>
        </div>

        {inApp ? (
          <div style={{ background: 'rgba(255,159,10,0.08)', border: '0.5px solid rgba(255,159,10,0.2)', borderRadius: 16, padding: 18, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, background: 'rgba(255,159,10,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20,
              }}>⋯</div>
              <p style={{ fontSize: 14, color: '#fff', letterSpacing: -0.1, lineHeight: 1.4 }}>
                Touche les <span style={{ fontWeight: 700, color: '#FF9F0A' }}>trois points</span> en haut à droite, puis <span style={{ fontWeight: 700, color: '#FF9F0A' }}>"Ouvrir dans le navigateur"</span>
              </p>
            </div>
          </div>
        ) : needsSafari ? (
          <div style={{ background: 'rgba(255,159,10,0.08)', border: '0.5px solid rgba(255,159,10,0.2)', borderRadius: 16, padding: 18, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, background: 'rgba(255,159,10,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20,
              }}>⋯</div>
              <p style={{ fontSize: 14, color: '#fff', letterSpacing: -0.1, lineHeight: 1.4 }}>
                Touche les <span style={{ fontWeight: 700, color: '#FF9F0A' }}>trois points</span> en bas, puis <span style={{ fontWeight: 700, color: '#FF9F0A' }}>"Ouvrir dans Safari"</span>
              </p>
            </div>
          </div>
        ) : platform === 'ios' && (
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 18, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, background: 'rgba(10,132,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                fontSize: 20, animation: 'bounce-up 1.4s ease-in-out infinite',
              }}>⬆️</div>
              <p style={{ fontSize: 14, color: '#fff', letterSpacing: -0.1, lineHeight: 1.4 }}>
                Touche l'icône <span style={{ fontWeight: 700, color: BLUE }}>Partager</span> tout en bas de l'écran Safari
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, background: 'rgba(10,132,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18,
              }}>➕</div>
              <p style={{ fontSize: 14, color: '#fff', letterSpacing: -0.1, lineHeight: 1.4 }}>
                Choisis <span style={{ fontWeight: 700, color: BLUE }}>"Sur l'écran d'accueil"</span> dans le menu qui s'ouvre
              </p>
            </div>
          </div>
        )}

        {!inApp && platform === 'android' && deferredPrompt && (
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginBottom: 14, lineHeight: 1.5 }}>
            Touche le bouton ci-dessous, Chrome te proposera d'installer l'app directement.
          </p>
        )}

        {!inApp && platform === 'android' && !deferredPrompt && (
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 24, height: 24, borderRadius: 8, background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>1</div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', letterSpacing: -0.1 }}>
                Touche le menu <span style={{ fontWeight: 700 }}>⋮</span> en haut à droite
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 24, height: 24, borderRadius: 8, background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>2</div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', letterSpacing: -0.1 }}>
                Sélectionne <span style={{ fontWeight: 700 }}>"Installer l'application"</span>
              </p>
            </div>
          </div>
        )}

        {!inApp && platform === 'android' && deferredPrompt ? (
          <button onClick={handleAndroidInstall} disabled={installing} style={{
            width: '100%', padding: 14, background: BLUE, border: 'none', borderRadius: 14,
            color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: sf,
            letterSpacing: -0.3, marginBottom: 8, opacity: installing ? 0.6 : 1,
          }}>
            {installing ? 'Installation...' : 'Installer l\'application'}
          </button>
        ) : (
          <button onClick={handleDismiss} style={{
            width: '100%', padding: 14, background: BLUE, border: 'none', borderRadius: 14,
            color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: sf,
            letterSpacing: -0.3, marginBottom: 8,
          }}>
            {inApp ? "J'ai compris" : "C'est noté"}
          </button>
        )}
        <button onClick={handleDismiss} style={{
          width: '100%', padding: 10, background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.3)', fontSize: 13, cursor: 'pointer', fontFamily: sf,
        }}>
          Plus tard
        </button>
      </div>

      <style>{`
        @keyframes bounce-up {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(-4px); opacity: 0.7; }
        }
      `}</style>
    </div>
  )
}

export { isStandalone }
