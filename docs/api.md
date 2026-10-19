# DJED API v1 Contract Documentation

Base URL: `/api/v1`

## Authentication (`/auth`)
- `POST /auth/register`: Register user with unique username, email, and password. Returns session token and sets HTTP-only cookie.
- `POST /auth/login`: Authenticate with username or email and password.
- `POST /auth/logout`: Revoke active session and clear cookie.
- `GET /auth/me`: Retrieve currently authenticated user.
- `POST /auth/switch-account`: Test persona switcher (Imhotep, Hypatia, Tariq, Amira).
- `DELETE /auth/account`: Right to erasure (GDPR) — permanently purges account and related sessions.

## Feed & Inscriptions (`/posts`)
- `GET /posts`: List posts with optional filters (`filter=all|following`, `communityId=...`).
- `GET /posts/:id`: Retrieve single post by ID.
- `POST /posts`: Create post (supports content, communityId, media attachments, replies, reposts).
- `DELETE /posts/:id`: Delete post (author or admin only).
- `POST /posts/:id/react`: Toggle reaction (`like`, `flame`, `eye_of_horus`, `ankh`, `djed`).
- `GET /posts/:id/comments`: List threaded comments on post.
- `POST /posts/:id/comments`: Add comment to post.

## Social Relationships (`/users`)
- `GET /users/:username`: Retrieve user profile.
- `PATCH /users/profile`: Update authenticated user profile fields.
- `POST /users/:id/follow`: Bond with user.
- `POST /users/:id/unfollow`: Sever bond with user.
- `POST /users/:id/block`: Block user (filters posts and prevents messaging).
- `POST /users/:id/unblock`: Remove block.

## Messaging (`/conversations`)
- `GET /conversations`: List user conversations with last message preview and unread counts.
- `POST /conversations`: Create direct or group conversation.
- `GET /conversations/:id/messages`: Retrieve conversation history (membership authorized).
- `POST /conversations/:id/messages`: Send message and trigger real-time WebSocket broadcast.

## Communities (`/communities`)
- `GET /communities`: List public and protected guilds.
- `GET /communities/:slug`: Retrieve community details.
- `POST /communities`: Charter new guild.

## Administration & Hall of Ma'at (`/admin`)
- `GET /admin/reports`: List pending safety reports (admin/moderator only).
- `POST /admin/reports/:id/status`: Resolve or dismiss report with audit entry.
- `GET /admin/audit-logs`: View immutable administrative audit trail.

## Health (`/health`)
- `GET /health`: Safe platform readiness and database connectivity report.
