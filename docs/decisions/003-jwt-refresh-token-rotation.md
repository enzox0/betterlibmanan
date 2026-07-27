# ADR-003: JWT with Refresh Token Rotation

**Status**: Accepted  
**Date**: 2026-07-27  
**Decision Makers**: BetterLibmanan Team

## Context

BetterLibmanan needs authentication for its admin dashboard. The system must:

- Authenticate admin users securely
- Keep sessions alive for working admins (avoid constant re-login)
- Invalidate sessions promptly when admins are inactive or logout
- Protect against token theft and replay attacks
- Support logout from specific devices or all devices

## Decision

Implement **JWT-based dual-token authentication with refresh token rotation**, sliding-window inactivity timeout, and reuse detection.

### Token Strategy

| Token         | TTL               | Storage                | Purpose                                     |
| ------------- | ----------------- | ---------------------- | ------------------------------------------- |
| Access Token  | 15 minutes        | Memory / localStorage  | Short-lived API authorization               |
| Refresh Token | 7 days (hard cap) | localStorage + MongoDB | Long-lived, used to issue new access tokens |

### Refresh Token Rotation

On every `/api/auth/refresh` call:

1. Old refresh token is **immediately revoked** in MongoDB
2. A brand new refresh token is **issued and stored**
3. New access + refresh token pair is returned

This means a stolen refresh token can only be used **once**. If the attacker uses it, the legitimate user's next refresh attempt will detect the revocation and trigger a reuse alert.

### Inactivity Window

A **30-minute sliding window** inactivity timeout is enforced on the server. Each refresh call updates `lastUsedAt` on the token document. If a refresh is attempted after 30 minutes of inactivity, it is rejected with `INACTIVITY_TIMEOUT`.

Active users calling refresh within 30 minutes are never kicked out, even if they use the service for hours.

### Reuse Detection

If a **revoked** refresh token is submitted:

1. All active tokens for that admin are **immediately revoked** (full session wipe)
2. A `warn` log is written
3. The request is rejected with `401`

This limits blast radius if a token is stolen: the attacker can use it once, but this immediately kills all sessions, forcing the legitimate user to notice.

### Absolute Expiry

Even with active rotation, refresh tokens have a **hard 7-day maximum lifetime** from the date of issuance. This is a safety net preventing indefinitely-lived sessions.

## Consequences

### Positive

- **Short-lived access tokens** (15 min) limit exposure if intercepted -- no revocation list needed
- **Refresh token rotation** prevents replay attacks and detects compromised tokens
- **Reuse detection** provides a security signal (attacker activity triggers session wipe)
- **Inactivity timeout** closes sessions for idle admins without annoying active ones
- **Explicit revocation** via `/logout` and `/logout-all` gives admins session control
- **Stateless access token** validation -- no DB lookup needed for each request

### Negative

- **Refresh token state in DB**: The server must persist refresh tokens in MongoDB (additional storage, query overhead)
- **Client complexity**: Frontend must implement refresh interceptors to transparently handle token rotation
- **localStorage security**: Tokens in localStorage are vulnerable to XSS -- mitigated by strict CSP headers
- **30-minute inactivity may frustrate some users** -- configurable via `SESSION_INACTIVITY_TIMEOUT_MINUTES`

## Alternatives Considered

### Single Long-Lived JWT

**Rejected because**:

- No way to revoke sessions without invalidating all tokens
- If token is stolen, attacker has full access until expiry
- JWTs with 7-day TTL are impractical to revoke

### Session Cookies with Server-Side Store

**Considered**: Use HTTP-only cookies with session IDs stored in Redis.

**Not chosen because**:

- Requires Redis as a mandatory dependency for auth
- More complex cross-origin setup (cookies require `SameSite` and `Secure` configuration)
- Less flexible for eventual mobile/API consumer scenarios
- The admin dashboard is a first-party SPA -- JWT in localStorage is acceptable

### OAuth2 / OpenID Connect (External Provider)

**Not chosen because**:

- Overkill for an internal admin dashboard
- Adds external provider dependency (Google, Auth0, etc.)
- Government LGU context may restrict use of external identity providers
- No requirement for social login or SSO

## References

- [OWASP JWT Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [Refresh Token Rotation Pattern](https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation)
