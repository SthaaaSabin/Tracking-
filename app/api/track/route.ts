import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// ═══════════════════════════════════════════════════════════════════════════════
//  /api/track  —  Receives events from the frontend and stores them server-side.
//
//  STORAGE NOTE:
//    Currently uses an in-memory array (global variable).
//    ⚠️  Data is RESET on every server restart or Vercel redeploy.
//    For persistent storage, replace this with Vercel KV or Supabase:
//
//    Vercel KV example:
//      import { kv } from '@vercel/kv'
//      const existing = await kv.get<ServerEvent[]>('events') ?? []
//      await kv.set('events', [...existing, event])
//
//    Supabase example:
//      import { createClient } from '@supabase/supabase-js'
//      await supabase.from('events').insert(event)
// ═══════════════════════════════════════════════════════════════════════════════

export interface ServerEvent {
  id:        string
  name:      string
  timestamp: string
  visitorId: string
  userAgent: string
  referrer:  string
  meta?:     Record<string, unknown>
}

// In-memory store — shared across requests in the same Node.js process.
// This will reset on redeploy. See note above for persistent alternatives.
declare global {
  // eslint-disable-next-line no-var
  var __trackingEvents: ServerEvent[] | undefined
}
if (!global.__trackingEvents) {
  global.__trackingEvents = []
}
export const eventStore = global.__trackingEvents

// ─── Helper: read or create a visitor-ID cookie ──────────────────────────────
function getVisitorId(request: NextRequest): { visitorId: string; isNew: boolean } {
  const existing = request.cookies.get('vid')?.value
  if (existing) return { visitorId: existing, isNew: false }
  const id = `v_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`
  return { visitorId: id, isNew: true }
}

// ─── POST /api/track ──────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { name, timestamp, meta } = body as {
      name:       string
      timestamp?: string
      meta?:      Record<string, unknown>
    }

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Missing event name' }, { status: 400 })
    }

    const { visitorId, isNew } = getVisitorId(request)

    const event: ServerEvent = {
      id:        crypto.randomUUID(),
      name:      name.trim(),
      timestamp: timestamp ?? new Date().toISOString(),
      visitorId,
      userAgent: request.headers.get('user-agent') ?? 'unknown',
      referrer:  request.headers.get('referer') ?? request.headers.get('referrer') ?? 'direct',
      meta:      meta ?? {},
    }

    eventStore.push(event)

    // Build the response — set cookie if it's a new visitor
    const response = NextResponse.json({ ok: true, eventId: event.id })
    if (isNew) {
      response.cookies.set({
        name:     'vid',
        value:    visitorId,
        httpOnly: false,           // allow JS to read for display purposes
        maxAge:   60 * 60 * 24 * 365,  // 1 year
        path:     '/',
        sameSite: 'lax',
      })
    }
    return response

  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
