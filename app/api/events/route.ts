import { NextRequest, NextResponse } from 'next/server'
import { eventStore } from '../../../lib/eventStore'

// ─── Secret key — change this in production ───────────────────────────────────
//     Access via: /api/events?key=demo123
const SECRET_KEY = process.env.ADMIN_SECRET ?? 'demo123'

// ─── GET /api/events?key=<secret> ────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (key !== SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Sort newest → oldest
  const sorted = [...eventStore].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  // ── Counts ──────────────────────────────────────────────────────────────────
  const counts = {
    PageView:       eventStore.filter(e => e.name === 'PageView').length,
    LearnMoreClick: eventStore.filter(e => e.name === 'LearnMoreClick').length,
    SupportInterest: eventStore.filter(e => e.name === 'SupportInterest').length,
    LeadSubmitted:  eventStore.filter(e => e.name === 'LeadSubmitted').length,
  }

  // ── Unique visitors ──────────────────────────────────────────────────────────
  const uniqueVisitors = new Set(eventStore.map(e => e.visitorId)).size

  return NextResponse.json({
    ok: true,
    meta: {
      total: eventStore.length,
      uniqueVisitors,
      counts,
    },
    events: sorted,
  })
}
