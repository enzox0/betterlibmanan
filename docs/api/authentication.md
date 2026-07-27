# Authentication

BetterLibmanan uses a JWT-based dual-token authentication system with refresh token rotation for admin users. Public endpoints require no authentication.

## Token Lifecycle

| Token         | TTL                                | Description                                                 |
| ------------- | ---------------------------------- | ----------------------------------------------------------- |
| Access Token  | 15 minutes                         | Short-lived token used to authorize individual API requests |
| Refresh Token | 7 days hard cap, 30 min inactivity | Used to obtain a new token pair                             |

## Endpoints

### POST /api/auth/login

Authenticate an admin user and receive a token pair.

**Rate Limit**: 10 failed attempts per 15 minutes per IP.

**Request Body**:

```json
{
  "username": "admin",
  "password": "secure-password"
}
```

| Field      | Type   | Required | Constraints      |
| ---------- | ------ | -------- | ---------------- |
| `username` | string | Yes      | 1-32 characters  |
| `password` | string | Yes      | 1-128 characters |

**Success Response** `200 OK`:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "admin",
      "displayName": "Administrator",
      "email": "admin@libmanan.gov.ph",
      "role": "superadmin"
    }
  }
}
```

**Error Responses**:

`400 Bad Request`:

```json
{
  "success": false,
  "message": "Username is required",
  "errors": ["Username is required"]
}
```

`401 Unauthorized`:

```json
{ "success": false, "message": "Invalid credentials" }
```

`429 Too Many Requests`:

```json
{
  "success": false,
  "message": "Too many login attempts. Please try again later."
}
```

---

### POST /api/auth/refresh

Exchange a valid refresh token for a new access token and a new refresh token (rotation).

**Rate Limit**: 30 requests per 15 minutes per IP.

**Request Body**:

```json
{ "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

**Success Response** `200 OK`:

```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "accessToken": "...(new)",
    "refreshToken": "...(new)",
    "admin": { "_id": "...", "username": "admin", "role": "superadmin" }
  }
}
```

**Error Responses**:

`401 Unauthorized` -- Token invalid or revoked:

```json
{
  "success": false,
  "message": "Refresh token is no longer valid",
  "code": "REFRESH_FAILED"
}
```

`401 Unauthorized` -- Inactivity timeout:

```json
{
  "success": false,
  "message": "Session expired due to inactivity",
  "code": "INACTIVITY_TIMEOUT"
}
```

---

### POST /api/auth/logout

**Requires authentication.**

Revoke the current refresh token (logout from current device).

**Request Body**:

```json
{ "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

**Response** `200 OK`:

```json
{ "success": true, "message": "Logged out successfully" }
```

This endpoint returns `200 OK` even if the token is missing or already revoked (idempotent).

---

### POST /api/auth/logout-all

**Requires authentication.**

Revoke all refresh tokens for the authenticated admin (logout from all devices).

**Response** `200 OK`:

```json
{ "success": true, "message": "All sessions revoked" }
```

---

### GET /api/auth/me

**Requires authentication.**

Return the full profile of the authenticated admin.

**Response** `200 OK`:

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "admin",
    "displayName": "Administrator",
    "email": "admin@libmanan.gov.ph",
    "role": "superadmin",
    "isActive": true,
    "phone": "+63 912 345 6789",
    "department": "IT Department",
    "bio": "System administrator",
    "avatarUrl": "https://assets.example.com/avatars/admin.webp",
    "avatarKey": "avatars/admin-abc123.webp",
    "lastLoginAt": "2026-07-27T10:00:00.000Z",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### PATCH /api/auth/me

**Requires authentication.**

Update the authenticated admin's own profile. Role and `isActive` cannot be modified through this endpoint.

**Request Body** (all fields optional):

```json
{
  "displayName": "John Doe",
  "email": "john@libmanan.gov.ph",
  "phone": "+63 912 345 6789",
  "department": "IT Department",
  "bio": "Municipal IT Administrator"
}
```

| Field         | Type   | Constraints        |
| ------------- | ------ | ------------------ |
| `displayName` | string | 1-64 characters    |
| `email`       | string | Valid email format |
| `phone`       | string | Max 32 characters  |
| `department`  | string | Max 128 characters |
| `bio`         | string | Max 500 characters |

---

### POST /api/auth/me/avatar

**Requires authentication.**

Upload a new avatar image for the authenticated admin.

**Request Body**:

```json
{
  "filename": "avatar.jpg",
  "mimeType": "image/jpeg",
  "data": "base64-encoded-image-data"
}
```

**Response** `200 OK`:

```json
{
  "success": true,
  "data": {
    "url": "https://assets.example.com/avatars/admin-abc123.webp",
    "key": "avatars/admin-abc123.webp"
  }
}
```

---

### POST /api/auth/me/password

**Requires authentication.**

Change the authenticated admin's password.

**Request Body**:

```json
{
  "currentPassword": "old-password",
  "newPassword": "new-secure-password"
}
```

| Field             | Type   | Required | Constraints                |
| ----------------- | ------ | -------- | -------------------------- |
| `currentPassword` | string | Yes      | Must match stored password |
| `newPassword`     | string | Yes      | Min 8, max 128 characters  |

**Error Response** `401`:

```json
{ "success": false, "message": "Current password is incorrect" }
```

---

### GET /api/auth/me/activity

**Requires authentication.**

Return the last 20 audit log entries for the authenticated admin.

**Response** `200 OK`:

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "action": "LOGIN",
      "module": "Auth",
      "description": "Administrator (admin) logged in",
      "ipAddress": "203.0.113.1",
      "createdAt": "2026-07-27T10:00:00.000Z"
    }
  ]
}
```

---

## Using the Access Token

Include the access token in the `Authorization` header of every authenticated request:

```http
GET /api/auth/me HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

## Token Refresh Strategy

The recommended frontend pattern for transparent token rotation using an Axios interceptor:

```typescript
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retried) {
      error.config._retried = true;

      const refreshToken = localStorage.getItem("refreshToken");
      const response = await axios.post("/api/auth/refresh", { refreshToken });

      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", newRefreshToken);

      error.config.headers["Authorization"] = `Bearer ${accessToken}`;
      return axios.request(error.config);
    }
    return Promise.reject(error);
  },
);
```

## Security Notes

- Do not expose tokens in URL query parameters. Query strings are logged by proxies and servers.
- Use HTTPS in all non-development environments to prevent token interception in transit.
- Use `/logout-all` when suspicious activity is detected to revoke all sessions immediately.
- The backend enforces token reuse detection: if a revoked token is submitted, all sessions for that admin are immediately invalidated.
