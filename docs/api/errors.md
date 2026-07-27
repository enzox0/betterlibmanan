# Error Handling

All BetterLibmanan API endpoints return errors in a consistent JSON format.

## Error Response Format

```json
{
  "success": false,
  "message": "Human-readable error description",
  "errors": ["Optional array of field-level validation errors"],
  "code": "OPTIONAL_MACHINE_READABLE_CODE",
  "reason": "optional_upstream_reason"
}
```

| Field     | Type     | Always Present | Description                                   |
| --------- | -------- | -------------- | --------------------------------------------- |
| `success` | boolean  | Yes            | Always `false` for errors                     |
| `message` | string   | Yes            | Human-readable description                    |
| `errors`  | string[] | No             | Validation error details                      |
| `code`    | string   | No             | Machine-readable error code                   |
| `reason`  | string   | No             | Upstream/downstream reason (e.g., R2 storage) |

## HTTP Status Codes

### 400 Bad Request

The request payload failed validation.

```json
{
  "success": false,
  "message": "Username is required",
  "errors": ["Username is required", "Password must be at least 8 characters"]
}
```

**Common causes**:

- Missing required field
- Field value too long or too short
- Invalid format (email, URL, etc.)
- Invalid JSON body

---

### 401 Unauthorized

The request is not authenticated.

**Missing token**:

```json
{
  "success": false,
  "message": "Not authenticated"
}
```

**Invalid credentials**:

```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**Expired/revoked token**:

```json
{
  "success": false,
  "message": "Refresh token is no longer valid",
  "code": "REFRESH_FAILED"
}
```

**Session inactivity timeout**:

```json
{
  "success": false,
  "message": "Session expired due to inactivity",
  "code": "INACTIVITY_TIMEOUT"
}
```

---

### 403 Forbidden

Authenticated, but the action is not permitted for this role.

```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

---

### 404 Not Found

The requested resource does not exist.

```json
{
  "success": false,
  "message": "Resource not found"
}
```

**Also returned for**:

- Unknown API routes
- Asset files that do not exist in the frontend build

---

### 409 Conflict

The request conflicts with existing data.

```json
{
  "success": false,
  "message": "Email already in use"
}
```

**Common causes**:

- Duplicate username or email
- Attempting to create a resource that already exists (singleton records)

---

### 429 Too Many Requests

Rate limit exceeded.

```json
{
  "success": false,
  "message": "Too many login attempts. Please try again later."
}
```

Response headers include:

- `RateLimit-Limit`: The request limit
- `RateLimit-Remaining`: Requests remaining in current window
- `RateLimit-Reset`: Time until the rate limit resets (seconds)

---

### 500 Internal Server Error

An unexpected server-side error occurred.

**Development** (full error message):

```json
{
  "success": false,
  "message": "Cannot read properties of undefined (reading 'id')"
}
```

**Production** (sanitized message):

```json
{
  "success": false,
  "message": "Internal server error"
}
```

> In production, the actual error is logged to the server log and not exposed to the client to prevent information leakage.

---

### 502 Bad Gateway

An upstream service (R2 storage) returned an error.

```json
{
  "success": false,
  "message": "Upstream service returned an error",
  "reason": "upstream_error"
}
```

**`reason` values**:

| Reason           | Description                               |
| ---------------- | ----------------------------------------- |
| `upstream_error` | Upstream service returned a 4xx/5xx error |

---

### 503 Service Unavailable

The server is starting up and the frontend is not yet available.

```json
"Service starting, please retry shortly."
```

(Plain text, not JSON -- occurs when the SPA build is not yet available)

---

### 504 Gateway Timeout

An upstream service request timed out.

```json
{
  "success": false,
  "message": "Request to upstream timed out",
  "reason": "upstream_timeout"
}
```

---

## Error Codes Reference

Machine-readable codes returned in the `code` field:

| Code                       | HTTP Status | Description                                   |
| -------------------------- | ----------- | --------------------------------------------- |
| `REFRESH_FAILED`           | 401         | Refresh token invalid or revoked              |
| `INACTIVITY_TIMEOUT`       | 401         | Session expired due to inactivity             |
| `TOKEN_REUSE`              | 401         | Potential token theft -- all sessions revoked |
| `VALIDATION_ERROR`         | 400         | Request body failed Zod validation            |
| `DUPLICATE_EMAIL`          | 409         | Email already registered                      |
| `DUPLICATE_USERNAME`       | 409         | Username already taken                        |
| `INSUFFICIENT_PERMISSIONS` | 403         | Role does not allow this action               |

---

## Handling Errors in the Frontend

### Axios Error Interceptor

```typescript
import axios, { AxiosError } from "axios";

axios.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ success: false; message: string; code?: string }>) => {
    const code = error.response?.data?.code;
    const message = error.response?.data?.message;
    const status = error.response?.status;

    if (status === 401 && code === "INACTIVITY_TIMEOUT") {
      // Redirect to login with "session expired" message
      window.location.href = "/admin/login?reason=inactivity";
      return;
    }

    if (status === 429) {
      // Show rate limit notification
      toast.error("Too many requests. Please wait before trying again.");
      return Promise.reject(error);
    }

    // Generic error
    toast.error(message || "An unexpected error occurred.");
    return Promise.reject(error);
  },
);
```

### React Query Error Handling

```typescript
const { data, error } = useQuery({
  queryKey: ['tourism'],
  queryFn: () => api.get('/tourism').then(r => r.data.data),
  retry: (failureCount, error) => {
    // Don't retry 401, 403, 404
    const status = (error as AxiosError).response?.status;
    if (status && [401, 403, 404].includes(status)) return false;
    return failureCount < 3;
  }
});

if (error) {
  const status = (error as AxiosError).response?.status;
  if (status === 404) return <NotFound />;
  return <ErrorBoundary message={error.message} />;
}
```

---

## Error Logging

All 4xx and 5xx errors are logged by the backend with:

- Error message and stack trace
- Request path and method
- HTTP status code
- `reason` field (for upstream errors)
- Client IP and user agent

Errors trigger email notifications (via the worker health monitor) if the `/health` endpoint is affected.
