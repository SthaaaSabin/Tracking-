export interface ServerEvent {
  id:        string
  name:      string
  timestamp: string
  visitorId: string
  userAgent: string
  referrer:  string
  meta?:     Record<string, unknown>
}

declare global {
  // eslint-disable-next-line no-var
  var __trackingEvents: ServerEvent[] | undefined
}
if (!global.__trackingEvents) {
  global.__trackingEvents = []
}

export const eventStore = global.__trackingEvents
