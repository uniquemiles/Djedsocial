# DJED Security & Threat Model

## 1. Zero Secret Leakage Policy
- No secrets, tokens, private keys, or credentials exist in client bundles, Git commits, or `.env.example`.
- Frontend source code only interacts with the server through authenticated `/api/v1` routes and secure cookies.

## 2. Password Hashing & Key Derivation
- Passwords are salted with 16 random bytes and hashed using PBKDF2-SHA512 with 100,000 iterations (or Argon2id).
- Password verification executes via constant-time comparison (`crypto.timingSafeEqual`) to mitigate side-channel timing attacks.

## 3. Session Security
- Sessions are stored in the server datastore with expiration timestamps.
- Cookies are configured with `HttpOnly`, `SameSite=Lax` (or `Strict` in production), and `Secure` over HTTPS.
- Active sessions can be individually or globally revoked.

## 4. Authorization & IDOR Mitigation
- Every mutating endpoint strictly verifies resource ownership:
  - Users can only delete their own posts, comments, or account (unless holding authorized admin/moderator roles).
  - Conversation messages can only be read, sent, or listened to by verified members of that specific chamber.
- In-memory rate limiting throttles authentication attempts and content creation.

## 5. Account Erasure & Data Sovereignty
- In compliance with privacy standards and GDPR, users can trigger complete account erasure from the Sanctuary Settings, expunging their sessions, posts, comments, and relationship edges.
