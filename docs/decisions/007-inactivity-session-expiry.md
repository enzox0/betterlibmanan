# ADR-007: Inactivity-Based Session Expiry

**Status**: Accepted  
**Date**: 2026-07-27  
**Decision Makers**: BetterLibmanan Team

## Context

After implementing JWT refresh token rotation (ADR-003), we needed to decide the expiry policy for admin sessions.

Two approaches:

1. **Fixed expiry**: Refresh token expires N days after issuance regardless of activity
2. **Sliding window (inactivity)**: Session remains valid as long as the admin is active; expires after N minutes of no activity

### Security Considerations

- Admins managing government content have elevated privileges
- A session left open on an unattended computer should eventually expire
- But legitimate admins working all day should not be forced to re-login constantly

### UX Considerations

- Admins may take breaks (lunch, meetings) -- 30 minutes is a reasonable inactivity window
- If session expires during active work, the admin loses their context
- The frontend should silently handle token refresh so active users never see a forced re-login

## Decision

Implement a **sliding window inactivity timeout** on the server:

- **Hard cap**: Refresh tokens expire 7 days after issuance, regardless of activity
- **Inactivity window**: Refresh tokens expire after **30 minutes of no refresh activity** (configurable via `SESSION_INACTIVITY_TIMEOUT_MINUTES`)
- **Sliding**: Each successful `/api/auth/refresh` call resets the inactivity window

### Implementation

The `RefreshToken` MongoDB document tracks:

```typescript
{
  token: string,          // hashed or raw token value
  adminId: ObjectId,      // which admin owns this session
  expiresAt: Date,        // hard expiry (7 days from issuance)
  lastUsedAt: Date,       // updated on each /refresh call
  isRevoked: boolean,     // explicit revocation flag
  userAgent: string,      // device identification
  ipAddress: string,      // IP at issuance
}
```

On each refresh request:

```typescript
const timeSinceLastUse = now.getTime() - storedToken.lastUsedAt.getTime();
if (timeSinceLastUse > INACTIVITY_TIMEOUT_MS) {
  storedToken.isRevoked = true;
  await storedToken.save();
  throw { statusCode: 401, code: "INACTIVITY_TIMEOUT", message: "..." };
}
```

### Frontend Refresh Strategy

The frontend should:

1. Call `/api/auth/refresh` before each API request if the access token is about to expire
2. Also call `/api/auth/refresh` when the user becomes active after a period of inactivity (visibility change event)

```typescript
// Proactive refresh on tab focus
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    checkAndRefreshToken();
  }
});
```

## Consequences

### Positive

- **Security**: Unattended sessions close automatically after 30 minutes
- **UX for active users**: Active admins are never disrupted (sliding window means they stay logged in)
- **Configurable**: `SESSION_INACTIVITY_TIMEOUT_MINUTES` can be adjusted without code changes
- **Observable**: The `lastUsedAt` field provides a history of session activity
- **Error-coded**: Frontend can distinguish `INACTIVITY_TIMEOUT` from other 401 errors and show an appropriate message

### Negative

- **Session lost on inactivity**: Admins who step away for >30 minutes must re-login (intended behavior)
- **State loss risk**: If an admin is filling a long form and doesn't interact for 30 minutes, their session expires and they may lose unsaved work
  - **Mitigation**: Frontend could implement auto-save for forms and/or a "your session is about to expire" warning
- **Clock synchronization dependency**: Inactivity check uses server time; large clock skew between server and client could cause unexpected behavior (not a significant risk for server-to-server timestamps)

## Alternatives Considered

### Fixed 7-Day Expiry (No Inactivity Window)

**Considered**: Simpler -- refresh token just has a fixed TTL.

**Rejected because**:

- A session opened on Friday could be exploited all weekend without anyone noticing
- Government admin accounts need stronger security guarantees
- Doesn't match expected security practices for elevated-privilege accounts

### Fixed 30-Minute Expiry (No Sliding)

**Considered**: Refresh token expires 30 minutes after issuance.

**Rejected because**:

- Would force re-login every 30 minutes, even for active users
- Extremely disruptive for admins managing content across multiple modules

### Never Expire (Until Explicit Logout)

**Not considered as valid**:

- Security non-starter for administrative accounts

## Related Decisions

- [ADR-003: JWT with Refresh Token Rotation](./003-jwt-refresh-token-rotation.md)
