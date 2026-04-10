'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Constants & Types ────────────────────────────────────────────────────────
const ADMIN_KEY = 'demo123'

interface EventMeta {
  name?: string
  email?: string
  location?: string
  button?: string
  has_phone?: boolean
  lead_source?: string
  method?: string
  source?: string
  [key: string]: unknown
}

interface TrackedEvent {
  id: string
  name: string
  timestamp: string
  visitorId: string
  userAgent: string
  referrer: string
  meta?: EventMeta
}

interface EventsResponse {
  ok: boolean
  meta: {
    total: number
    uniqueVisitors: number
    counts: {
      PageView: number
      LearnMoreClick: number
      SupportInterest: number
      LeadSubmitted: number
    }
  }
  events: TrackedEvent[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays}d ago`
}

const EVENT_STYLES: Record<string, { color: string; bgLight: string; bgDark: string; label: string }> = {
  PageView:        { color: '#3b82f6', bgLight: '#eff6ff', bgDark: '#1e3a8a', label: 'Page View' },
  LearnMoreClick:  { color: '#10b981', bgLight: '#ecfdf5', bgDark: '#064e3b', label: 'Learn More' },
  SupportInterest: { color: '#8b5cf6', bgLight: '#f5f3ff', bgDark: '#4c1d95', label: 'Interest' },
  LeadSubmitted:   { color: '#f97316', bgLight: '#fff7ed', bgDark: '#7c2d12', label: 'Lead' },
}

const getEventStyle = (name: string) => EVENT_STYLES[name] || { color: '#64748b', bgLight: '#f8fafc', bgDark: '#0f172a', label: name }

// Shorten ID to something like v_8a3f
const formatVid = (vid: string) => {
  if (vid.startsWith('v_')) return vid.substring(0, 6)
  return vid.substring(0, 4)
}

// ─── CountUp Component ────────────────────────────────────────────────────────
function CountUp({ value }: { value: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    if (value === 0) {
      setCount(0)
      return
    }
    const duration = 1200 // ms
    const incrementTime = 30
    const step = Math.max(1, Math.ceil(value / (duration / incrementTime)))

    const timer = setInterval(() => {
      start += step
      if (start >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, incrementTime)
    
    return () => clearInterval(timer)
  }, [value])

  return <>{count.toLocaleString()}</>
}

// ─── StatCard Component ───────────────────────────────────────────────────────
function StatCard({ 
  label, value, icon, color, dark 
}: { 
  label: string; value: number; icon: React.ReactNode; color: string; dark: boolean 
}) {
  // Sparkline generator (fake random data slightly trending up)
  const sparklinePts = useMemo(() => {
    const pts = []
    let cur = 20
    for (let i = 0; i < 15; i++) {
      cur = Math.max(5, cur + (Math.random() * 10 - 3))
      pts.push(cur)
    }
    const max = Math.max(...pts)
    return pts.map((p, i) => `${i * (100 / 14)},${40 - (p / max) * 30}`).join(' ')
  }, [])

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: dark ? '0 10px 25px rgba(0,0,0,0.4)' : '0 10px 25px rgba(0,0,0,0.05)' }}
      className={`relative overflow-hidden rounded-2xl p-5 border transition-colors duration-300 ${
        dark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-100 shadow-sm'
      }`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 rounded-full`} style={{ background: color, transform: 'translate(30%, -30%)' }} />
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center`} style={{ background: `${color}${dark ? '30' : '15'}`, color }}>
            {icon}
          </div>
          <span className={`text-sm font-medium ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
        </div>
      </div>
      
      <div className="mt-4 flex items-end justify-between relative z-10">
        <h3 className={`text-3xl font-bold tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>
          <CountUp value={value} />
        </h3>
        
        {/* Subtle trend indicator */}
        <div className="w-16 h-8 opacity-60">
          <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
            <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={sparklinePts} />
          </svg>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [keyInput, setKeyInput] = useState('')
  const [keyError, setKeyError] = useState(false)
  
  const [data, setData] = useState<EventsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)
  
  const [darkToggle, setDarkToggle] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Use system preference initially
  useEffect(() => {
    setIsClient(true)
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkToggle(true)
    }
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/events?key=${ADMIN_KEY}`)
      if (res.ok) {
        const json: EventsResponse = await res.json()
        setData(json)
        setLastFetch(new Date())
      }
    } catch {
      console.error('Failed to fetch events')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) fetchData()
  }, [authed, fetchData])

  const handleLogin = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (keyInput.trim() === ADMIN_KEY) {
      setAuthed(true)
      setKeyError(false)
    } else {
      setKeyError(true)
    }
  }

  // ── Login View ──
  if (!authed) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-500 ${darkToggle ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full max-w-md p-8 rounded-3xl shadow-2xl border ${darkToggle ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
        >
          <div className="text-center mb-8">
            <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-5 ${darkToggle ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <h1 className={`text-2xl font-bold tracking-tight ${darkToggle ? 'text-white' : 'text-slate-900'}`}>Campaign Pulse</h1>
            <p className={`text-sm mt-2 ${darkToggle ? 'text-slate-400' : 'text-slate-500'}`}>Secure Analytics Dashboard</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="relative">
              <input
                type="password"
                value={keyInput}
                onChange={e => { setKeyInput(e.target.value); setKeyError(false) }}
                placeholder="Enter access key"
                className={`w-full px-5 py-4 rounded-xl outline-none transition-all ${
                  keyError 
                    ? 'border-red-500 focus:ring-red-500/20' 
                    : darkToggle ? 'border-slate-700 bg-slate-800 text-white focus:border-indigo-500 shadow-inner' : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                } border`}
              />
            </div>
            {keyError && <p className="text-red-500 text-xs mt-2 ml-1">Invalid access key.</p>}
            
            <button 
              type="submit"
              className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-medium py-4 rounded-xl transition-all shadow-md hover:shadow-lg focus:ring-4 focus:ring-indigo-500/30 flex justify-center items-center gap-2"
            >
              Authenticate <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  // ── Dashboard View ──
  const counts = data?.meta.counts
  const events = data?.events ?? []

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans ${darkToggle ? 'bg-slate-950 text-slate-300' : 'bg-slate-50 text-slate-600'}`}>
      
      {/* Navbar */}
      <nav className={`sticky top-0 z-50 backdrop-blur-md border-b ${darkToggle ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200 shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white shadow-md">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <span className={`font-semibold text-lg tracking-tight ${darkToggle ? 'text-white' : 'text-slate-900'}`}>Pulse<span className="opacity-50">Analytics</span></span>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setDarkToggle(!darkToggle)}
                className={`p-2 rounded-full transition-colors ${darkToggle ? 'bg-slate-800 hover:bg-slate-700 text-yellow-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
              >
                {darkToggle ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
              </button>
              
              <button
                onClick={fetchData}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all ${
                  loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md'
                } ${darkToggle ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {loading ? 'Refreshing' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className={`text-2xl font-bold tracking-tight ${darkToggle ? 'text-white' : 'text-slate-900'}`}>Dashboard Overview</h2>
            <p className="text-sm mt-1 opacity-70">
              {lastFetch ? `Live data automatically synced. Last updated at ${lastFetch.toLocaleTimeString()}` : 'Loading your secure analytics...'}
            </p>
          </div>
          
          {/* Distribution Bar */}
          {events.length > 0 && (
            <div className="w-full sm:w-64">
              <div className="flex justify-between text-xs mb-1.5 opacity-70 font-medium">
                <span>Event Distribution</span>
                <span>{data?.meta.total || 0} total</span>
              </div>
              <div className={`h-2 w-full flex rounded-full overflow-hidden ${darkToggle ? 'bg-slate-800' : 'bg-slate-200'}`}>
                {Object.entries(counts || {}).map(([key, val]) => {
                  if (!val || val === 0) return null
                  const percent = (val / (data?.meta.total || 1)) * 100
                  return <div key={key} style={{ width: `${percent}%`, backgroundColor: EVENT_STYLES[key]?.color }} title={`${key}: ${percent.toFixed(1)}%`} className="h-full transition-all duration-500 ease-out hover:opacity-80" />
                })}
              </div>
            </div>
          )}
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard dark={darkToggle} label="Unique Visitors" value={data?.meta.uniqueVisitors ?? 0} color="#6366f1" icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" /></svg>} />
          <StatCard dark={darkToggle} label="Page Views" value={counts?.PageView ?? 0} color="#3b82f6" icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>} />
          <StatCard dark={darkToggle} label="Learn More" value={counts?.LearnMoreClick ?? 0} color="#10b981" icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          <StatCard dark={darkToggle} label="Interest Clicks" value={counts?.SupportInterest ?? 0} color="#8b5cf6" icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>} />
          <StatCard dark={darkToggle} label="Leads Captured" value={counts?.LeadSubmitted ?? 0} color="#f97316" icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        </div>

        {/* Events Table */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          className={`rounded-2xl shadow-sm border overflow-hidden ${darkToggle ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
        >
          <div className={`px-6 py-5 border-b flex justify-between items-center ${darkToggle ? 'border-slate-800' : 'border-slate-100'}`}>
            <h3 className={`font-semibold text-lg ${darkToggle ? 'text-white' : 'text-slate-900'}`}>Event Feed</h3>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-500">Live</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`text-xs uppercase tracking-wider font-semibold ${darkToggle ? 'text-slate-500 bg-slate-900/50' : 'text-slate-500 bg-slate-50'}`}>
                  <th className="px-6 py-4 font-medium">Event Type</th>
                  <th className="px-6 py-4 font-medium">Time</th>
                  <th className="px-6 py-4 font-medium">Visitor</th>
                  <th className="px-6 py-4 font-medium">Source / Ref</th>
                  <th className="px-6 py-4 font-medium">Data</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <AnimatePresence>
                  {events.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">No events recorded. Activity will appear here in real-time.</td>
                    </tr>
                  )}
                  {events.map((ev, i) => {
                    const style = getEventStyle(ev.name)
                    const isNew = new Date().getTime() - new Date(ev.timestamp).getTime() < 5000

                    return (
                      <motion.tr 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        transition={{ delay: Math.min(i * 0.05, 0.5) }}
                        key={ev.id} 
                        className={`group border-b last:border-0 transition-colors duration-200 ${
                          darkToggle 
                            ? 'border-slate-800/50 hover:bg-slate-800/60' 
                            : 'border-slate-50 hover:bg-slate-50'
                        } ${isNew ? (darkToggle ? 'bg-indigo-900/20' : 'bg-indigo-50/50') : ''}`}
                      >
                        {/* Event Name */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${darkToggle ? 'border-transparent' : 'border-transparent'}`} style={{ backgroundColor: darkToggle ? style.bgDark : style.bgLight, color: darkToggle ? style.color : style.color }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: style.color }} />
                            {style.label}
                          </div>
                        </td>

                        {/* Relative Time */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="group/time relative inline-block cursor-help">
                            <span className={`font-medium ${darkToggle ? 'text-slate-300' : 'text-slate-600'}`}>{timeAgo(ev.timestamp)}</span>
                            {/* Tooltip */}
                            <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded opacity-0 group-hover/time:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none ${darkToggle ? 'bg-slate-700 text-white' : 'bg-slate-800 text-white'}`}>
                              {new Date(ev.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </td>

                        {/* Visitor ID Chip */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-xs font-mono px-2 py-1 rounded-md ${darkToggle ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                            {formatVid(ev.visitorId)}
                          </span>
                        </td>

                        {/* Referrer */}
                        <td className="px-6 py-4">
                          <div className="group/ref relative max-w-[150px]">
                            <span className={`block truncate text-xs ${ev.referrer === 'direct' ? 'italic opacity-60' : ''} ${darkToggle ? 'text-slate-300' : 'text-slate-600'}`}>
                              {ev.referrer.replace(/^https?:\/\//, '')}
                            </span>
                            {/* Tooltip */}
                            {ev.referrer !== 'direct' && (
                              <div className={`absolute bottom-full left-0 mb-2 p-2 text-xs rounded opacity-0 group-hover/ref:opacity-100 transition-opacity shadow-lg z-10 break-all w-64 pointer-events-none ${darkToggle ? 'bg-slate-700 text-white' : 'bg-slate-800 text-white'}`}>
                                {ev.referrer}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Metadata Tags */}
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {!ev.meta || Object.keys(ev.meta).length === 0 ? (
                              <span className="text-xs opacity-40 italic">—</span>
                            ) : (
                              <>
                                {/* Specifically style Lead data uniquely */}
                                {ev.name === 'LeadSubmitted' && ev.meta.name && (
                                  <div className="flex flex-col gap-1 w-full max-w-xs">
                                    <div className="flex items-center gap-2">
                                      <span className={`shrink-0 flex items-center justify-center w-5 h-5 rounded-full text-[10px] ${darkToggle ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600'}`}>
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                      </span>
                                      <span className="text-sm font-medium">{ev.meta.name as string}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className={`shrink-0 flex items-center justify-center w-5 h-5 rounded-full text-[10px] ${darkToggle ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600'}`}>
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                      </span>
                                      <span className="text-xs opacity-80">{ev.meta.email as string}</span>
                                    </div>
                                  </div>
                                )}

                                {/* Highlight Buttons */}
                                {ev.meta.button && (
                                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${darkToggle ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                                    <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                                    "{ev.meta.button as string}"
                                  </span>
                                )}

                                {/* Generic Tags (excluding ones already distinctly rendered) */}
                                {Object.entries(ev.meta).filter(([k]) => !['name', 'email', 'button', 'method'].includes(k)).map(([key, val]) => (
                                  <span key={key} className={`inline-block px-2 py-0.5 rounded text-[11px] ${darkToggle ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-white text-slate-500 border border-slate-200'}`}>
                                    <span className="opacity-60 mr-1">{key}:</span>
                                    <span className="font-medium">{String(val)}</span>
                                  </span>
                                ))}
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
        
        {/* Footer info */}
        <p className="text-center text-xs opacity-40 flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Events in this demo use in-memory storage and will clear upon server restart.
        </p>

      </main>
    </div>
  )
}
