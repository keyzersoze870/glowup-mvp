'use client'
import { useRouter, usePathname } from 'next/navigation'

const sf = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif`
const BLUE = '#0A84FF'

const TABS = [
  { path: '/dashboard', icon: '◎', label: 'Score' },
  { path: '/today',     icon: '⚡', label: "Aujourd'hui" },
  { path: '/share',     icon: '⬆', label: 'Partager' },
]

export default function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.92)',
      backdropFilter: 'blur(20px)',
      borderTop: '0.5px solid rgba(255,255,255,0.08)',
      display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {TABS.map(tab => {
        const active = pathname === tab.path
        return (
          <button key={tab.path} onClick={() => router.push(tab.path)}
            style={{
              flex: 1, padding: '10px 0 12px',
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              fontFamily: sf, transition: 'opacity 0.15s',
            }}>
            <span style={{ fontSize: 20, opacity: active ? 1 : 0.35, filter: active ? `drop-shadow(0 0 4px ${BLUE})` : 'none', transition: 'all 0.15s' }}>
              {tab.icon}
            </span>
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, color: active ? BLUE : 'rgba(255,255,255,0.35)', letterSpacing: -0.1, transition: 'all 0.15s' }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
