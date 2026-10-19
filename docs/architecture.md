# DJED Architecture Specification

## 1. System Overview

DJED is a unified, bronze-crafted social web platform architected around four core communication paradigms:
1. **WhatsApp-Style Messaging ("Whispers & Chambers")**: Low-latency 1-to-1 conversations and multi-member groups with WebSocket synchronization and persistent PostgreSQL history.
2. **Twitter/X-Style Public Discovery ("Sacred Inscriptions")**: Chronological feeds, rich media attachments, threaded replies, reposts, and five sacred Egyptian reactions.
3. **Facebook-Style Communities ("Guilds & Pillars")**: Curated domains for architecture, bronze craftsmanship, and scientific philosophy.
4. **Hall of Ma'at**: Role-based administrative oversight, zero IDOR protections, and transparent audit logging.

## 2. Component Hierarchy

```
[ Client Browser (React + Tailwind v4 + TypeScript) ]
           |                           |
     HTTPS REST API (/api/v1)      WSS (/ws)
           |                           |
[ Express Application Server & Realtime WebSocket Hub (Node.js) ]
           |
[ Data Access Layer & Drizzle ORM Repository ]
           |
[ Neon PostgreSQL (Production/Staging) / Embedded Persistent Journal (Local Dev) ]
```

## 3. Real-Time Protocol (`/ws`)
- **Handshake**: Authenticated via HTTP-only session cookie or session query token.
- **Rooms**:
  - `user:{userId}`: Private signal channel for notifications.
  - `conv:{convId}`: Group and 1-on-1 chat broadcasting.
- **Fallback**: Graceful polling and retry mechanisms when socket disconnects.
