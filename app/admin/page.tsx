'use client'

import { useState, useEffect, useCallback } from 'react'

// ─── Secret key — must match ADMIN_SECRET env var (or default 'demo123') ──────
const ADMIN_KEY = 'demo123'

interface EventMeta {
  name?:  string
  email?: string
  [key: string]: unknown
}

interface TrackedEvent {
  id:        string
  name:      string
  timestamp: string
  visitorId: string
  userAgent: string
  referrer:  string
  meta?:     EventMeta
}

interface EventsResponse {
  ok:   boolean
  meta: {
    total:          number
    uniqueVisitors: number
    counts: {
      PageView:        number
      LearnMoreClick:  number
      SupportInterest: number
      LeadSubmitted:   number
    }
  }
  events: TrackedEvent[]
}

// ─── Colour pill for each event name ─────────────────────────────────────────
const EVENT_PILL: Record<string, { bg: string; text: string; dot: string }> = {
  PageView:        { bg: 'rgba(30,74,143,0.08)',  text: '#1e4a8f', dot: '#1e4a8f' },
  LearnMoreClick:  { bg: 'rgba(180,139,46,0.10)', text: '#8a6800', dot: '#c9a227' },
  SupportInterest: { bg: 'rgba(22,163,74,0.08)',  text: '#15803d', dot: '#22c55e' },
  LeadSubmitted:   { bg: 'rgba(124,58,237,0.08)', text: '#6d28d9', dot: '#8b5cf6' },
}
const DEFAULT_PILL = { bg: 'rgba(100,100,100,0.08)', text: '#555', dot: '#999' }

function getPill(name: string) {
  return EVENT_PILL[name] ?? DEFAULT_PILL
}

function fmtDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString([], {
    month:  'short',
    day:    'numeric',
    hour:   '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({
  label, value, accent, icon,
}: { label: string; value: number; accent: string; icon: React.ReactNode }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #f0ede8',
      borderRadius: 16,
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      boxShadow: '0 2px 12px rgba(9,24,48,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          width: 34, height: 34, borderRadius: 9,
          background: accent + '18',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: accent, flexShrink: 0,
        }}>
          {icon}
        </span>
        <span style={{ fontSize: 13, color: '#78716c', fontWeight: 500 }}>{label}</span>
      </div>
      <p style={{ fontSize: 36, fontWeight: 700, color: '#0c1a30', margin: 0, lineHeight: 1.1 }}>
        {value.toLocaleString()}
      </p>
    </div>
  )
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed,    setAuthed]    = useState(false)
  const [keyInput,  setKeyInput]  = useState('')
  const [keyError,  setKeyError]  = useState(false)
  const [data,      setData]      = useState<EventsResponse | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)
  const [fetchErr,  setFetchErr]  = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setFetchErr(null)
    try {
      const res = await fetch(`/api/events?key=${ADMIN_KEY}`)
      if (!res.ok) { setFetchErr('Failed to fetch events.'); return }
      const json: EventsResponse = await res.json()
      setData(json)
      setLastFetch(new Date())
    } catch {
      setFetchErr('Network error — check your connection.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleLogin = () => {
    if (keyInput.trim() === ADMIN_KEY) {
      setAuthed(true)
      setKeyError(false)
    } else {
      setKeyError(true)
    }
  }

  useEffect(() => {
    if (authed) fetchData()
  }, [authed, fetchData])

  // ── Login Screen ─────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0c1a30 0%, #1e3a5f 60%, #0c1a30 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        <div style={{
          background: '#fff', borderRadius: 20, padding: '40px 36px',
          width: '100%', maxWidth: 380,
          boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
        }}>
          {/* Logo mark */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: '#0c1a30', margin: '0 auto 12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="22" height="22" fill="none" stroke="#e8dfc8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p style={{ fontSize: 20, fontWeight: 700, color: '#0c1a30', margin: 0 }}>
              Campaign Analytics
            </p>
            <p style={{ fontSize: 13, color: '#78716c', marginTop: 4 }}>
              Enter your admin key to continue
            </p>
          </div>

          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#44403c', marginBottom: 6 }}>
            Admin Key
          </label>
          <input
            id="admin-key-input"
            type="password"
            value={keyInput}
            onChange={e => { setKeyInput(e.target.value); setKeyError(false) }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Enter secret key"
            style={{
              width: '100%', padding: '11px 14px', borderRadius: 10,
              border: keyError ? '1.5px solid #ef4444' : '1.5px solid #e7e5e0',
              fontSize: 15, outline: 'none', boxSizing: 'border-box',
              color: '#0c1a30', background: '#fafaf9',
              transition: 'border 0.2s',
            }}
          />
          {keyError && (
            <p style={{ color: '#ef4444', fontSize: 12, marginTop: 6 }}>
              Incorrect key. Try <code style={{ background: '#fef2f2', padding: '1px 4px', borderRadius: 4 }}>demo123</code>
            </p>
          )}
          <button
            id="admin-login-btn"
            onClick={handleLogin}
            style={{
              width: '100%', marginTop: 16, padding: '12px 0',
              background: '#0c1a30', color: '#fff', borderRadius: 10,
              fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1e3a5f')}
            onMouseLeave={e => (e.currentTarget.style.background = '#0c1a30')}
          >
            View Dashboard →
          </button>
          <p style={{ textAlign: 'center', fontSize: 11, color: '#a8a29e', marginTop: 16 }}>
            Hargrove for Senate — Internal Analytics
          </p>
        </div>
      </div>
    )
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────────
  const counts   = data?.meta.counts
  const events   = data?.events ?? []
  const total    = data?.meta.total ?? 0
  const visitors = data?.meta.uniqueVisitors ?? 0

  return (
    <div style={{ minHeight: '100vh', background: '#f7f5f0', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Header ── */}
      <header style={{
        background: '#0c1a30',
        padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 58, position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: '#1e3a5f', border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" fill="none" stroke="#e8dfc8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <p style={{ color: '#e8dfc8', fontSize: 14, fontWeight: 700, margin: 0, lineHeight: 1 }}>
              Campaign Analytics
            </p>
            <p style={{ color: '#8fadbf', fontSize: 10, margin: '2px 0 0', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Hargrove for Senate · District 14
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {lastFetch && (
            <span style={{ color: '#8fadbf', fontSize: 11 }}>
              Updated {lastFetch.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
          <button
            id="admin-refresh-btn"
            onClick={fetchData}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: loading ? '#1e3a5f' : '#2d5a8e',
              color: '#e8dfc8', border: 'none', borderRadius: 8,
              padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s', opacity: loading ? 0.7 : 1,
            }}
          >
            <svg
              width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {fetchErr && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
            padding: '12px 16px', color: '#ef4444', fontSize: 14, marginBottom: 24,
          }}>
            ⚠ {fetchErr}
          </div>
        )}

        {/* ── Stat Grid ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}>
          {/* Unique Visitors */}
          <StatCard
            label="Unique Visitors"
            value={visitors}
            accent="#0c1a30"
            icon={
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
              </svg>
            }
          />
          {/* Page Views */}
          <StatCard
            label="Page Views"
            value={counts?.PageView ?? 0}
            accent="#1e4a8f"
            icon={
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
          />
          {/* Learn More Clicks */}
          <StatCard
            label="Learn More Clicks"
            value={counts?.LearnMoreClick ?? 0}
            accent="#8a6800"
            icon={
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          {/* I'm Interested */}
          <StatCard
            label="I'm Interested Clicks"
            value={counts?.SupportInterest ?? 0}
            accent="#15803d"
            icon={
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            }
          />
          {/* Form Submissions */}
          <StatCard
            label="Form Submissions"
            value={counts?.LeadSubmitted ?? 0}
            accent="#6d28d9"
            icon={
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          {/* Total Events */}
          <StatCard
            label="Total Events"
            value={total}
            accent="#475569"
            icon={
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
          />
        </div>

        {/* ── Event Table ── */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          border: '1px solid #f0ede8',
          boxShadow: '0 2px 12px rgba(9,24,48,0.05)',
          overflow: 'hidden',
        }}>
          {/* Table header */}
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid #f0ede8',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0c1a30' }}>
                Recent Events
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#a8a29e' }}>
                {events.length} event{events.length !== 1 ? 's' : ''} · newest first
              </p>
            </div>
            {loading && (
              <span style={{ fontSize: 12, color: '#a8a29e', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  style={{ animation: 'spin 1s linear infinite' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Loading…
              </span>
            )}
          </div>

          {events.length === 0 && !loading ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: '#a8a29e', fontSize: 14 }}>
              No events recorded yet. Visit the landing page to generate some!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#faf9f7' }}>
                    {['Event', 'Timestamp', 'Visitor ID', 'Referrer', 'Metadata'].map(h => (
                      <th key={h} style={{
                        padding: '10px 16px', textAlign: 'left',
                        fontWeight: 600, color: '#78716c', fontSize: 11,
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                        borderBottom: '1px solid #f0ede8',
                        whiteSpace: 'nowrap',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev, i) => {
                    const pill = getPill(ev.name)
                    const isLast = i === events.length - 1
                    return (
                      <tr key={ev.id}
                        style={{ borderBottom: isLast ? 'none' : '1px solid #faf8f5' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#faf9f7')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        {/* Event name pill */}
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            background: pill.bg, color: pill.text,
                            padding: '3px 10px', borderRadius: 999,
                            fontSize: 12, fontWeight: 600,
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: pill.dot, flexShrink: 0 }} />
                            {ev.name}
                          </span>
                        </td>
                        {/* Timestamp */}
                        <td style={{ padding: '12px 16px', color: '#57534e', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                          {fmtDate(ev.timestamp)}
                        </td>
                        {/* Visitor ID */}
                        <td style={{ padding: '12px 16px' }}>
                          <code style={{
                            fontSize: 11, background: '#f4f4f4',
                            padding: '2px 7px', borderRadius: 5, color: '#57534e',
                            whiteSpace: 'nowrap',
                          }}>
                            {ev.visitorId}
                          </code>
                        </td>
                        {/* Referrer */}
                        <td style={{ padding: '12px 16px', color: '#78716c', maxWidth: 160 }}>
                          <span style={{
                            display: 'block', overflow: 'hidden',
                            textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150,
                          }} title={ev.referrer}>
                            {ev.referrer === 'direct' ? (
                              <span style={{ color: '#a8a29e', fontStyle: 'italic' }}>direct</span>
                            ) : ev.referrer}
                          </span>
                        </td>
                        {/* Metadata */}
                        <td style={{ padding: '12px 16px', maxWidth: 220 }}>
                          {ev.meta && Object.keys(ev.meta).length > 0 ? (
                            <span style={{
                              fontSize: 11, color: '#78716c', fontFamily: 'monospace',
                              display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }} title={JSON.stringify(ev.meta, null, 2)}>
                              {JSON.stringify(ev.meta)}
                            </span>
                          ) : (
                            <span style={{ color: '#d4d0ca', fontSize: 11 }}>—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer note */}
        <p style={{ textAlign: 'center', fontSize: 11, color: '#a8a29e', marginTop: 24 }}>
          ⚠ In-memory storage: data resets on server restart or redeploy.{' '}
          Consider <strong>Vercel KV</strong> or <strong>Supabase</strong> for persistent storage.
        </p>
      </main>

      {/* Spin keyframe */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
