# API Endpoints Reference

Complete reference for all REST API endpoints in BetterLibmanan.

**Base URL**: `/api`
**Authentication**: Bearer token in `Authorization` header (for protected endpoints)

Legend:

- `[Auth]` = Requires admin authentication (any role)
- `[Superadmin]` = Requires superadmin role

---

## System

### `GET /health`

System health check.

**Response** `200 OK`:

```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2026-07-27T12:00:00.000Z",
  "environment": "production",
  "server": { "uptime": 1234, "memory": {...}, "version": "v18.0.0" },
  "frontend": { "ready": true, "indexHtml": true, "assetsDir": true }
}
```

### `GET /api`

API root -- confirms API is reachable.

**Response** `200 OK`:

```json
{ "success": true, "message": "API ready", "version": "1.0.0" }
```

---

## Authentication -- `/api/auth`

See [Authentication Guide](./authentication.md) for full details.

| Method  | Path                    | Auth   | Description           |
| ------- | ----------------------- | ------ | --------------------- |
| `POST`  | `/api/auth/login`       | No     | Admin login           |
| `POST`  | `/api/auth/refresh`     | No     | Refresh access token  |
| `POST`  | `/api/auth/logout`      | [Auth] | Logout current device |
| `POST`  | `/api/auth/logout-all`  | [Auth] | Logout all devices    |
| `GET`   | `/api/auth/me`          | [Auth] | Get own profile       |
| `PATCH` | `/api/auth/me`          | [Auth] | Update own profile    |
| `POST`  | `/api/auth/me/avatar`   | [Auth] | Upload avatar         |
| `POST`  | `/api/auth/me/password` | [Auth] | Change password       |
| `GET`   | `/api/auth/me/activity` | [Auth] | Get recent activity   |

---

## Accounts -- `/api/accounts`

Superadmin access only.

| Method   | Path                           | Auth         | Description             |
| -------- | ------------------------------ | ------------ | ----------------------- |
| `GET`    | `/api/accounts`                | [Superadmin] | List all admin accounts |
| `POST`   | `/api/accounts`                | [Superadmin] | Create admin account    |
| `GET`    | `/api/accounts/:id`            | [Superadmin] | Get admin account by ID |
| `PATCH`  | `/api/accounts/:id`            | [Superadmin] | Update admin account    |
| `DELETE` | `/api/accounts/:id`            | [Superadmin] | Delete admin account    |
| `POST`   | `/api/accounts/:id/activate`   | [Superadmin] | Activate account        |
| `POST`   | `/api/accounts/:id/deactivate` | [Superadmin] | Deactivate account      |

---

## Audit Logs -- `/api/audit`

Superadmin access only.

| Method | Path             | Auth         | Description            |
| ------ | ---------------- | ------------ | ---------------------- |
| `GET`  | `/api/audit`     | [Superadmin] | Query audit logs       |
| `GET`  | `/api/audit/:id` | [Superadmin] | Get single audit entry |

**Query Parameters** for `GET /api/audit`:

| Parameter | Type     | Description                            |
| --------- | -------- | -------------------------------------- |
| `page`    | number   | Page number                            |
| `limit`   | number   | Results per page                       |
| `adminId` | string   | Filter by admin                        |
| `action`  | string   | Filter by action (LOGIN, UPDATE, etc.) |
| `module`  | string   | Filter by module                       |
| `from`    | ISO date | Start date filter                      |
| `to`      | ISO date | End date filter                        |

---

## Users (Public) -- `/api/users`

Public user registration and authentication.

| Method   | Path                  | Auth         | Description            |
| -------- | --------------------- | ------------ | ---------------------- |
| `POST`   | `/api/users/register` | No           | Register new user      |
| `POST`   | `/api/users/login`    | No           | User login             |
| `GET`    | `/api/users/me`       | (user)       | Get own profile        |
| `PATCH`  | `/api/users/me`       | (user)       | Update own profile     |
| `GET`    | `/api/users`          | [Superadmin] | List all users (admin) |
| `DELETE` | `/api/users/:id`      | [Superadmin] | Delete user (admin)    |

---

## Admin Registrations -- `/api/admin-registrations`

| Method | Path                                   | Auth         | Description                 |
| ------ | -------------------------------------- | ------------ | --------------------------- |
| `POST` | `/api/admin-registrations`             | No           | Submit registration request |
| `GET`  | `/api/admin-registrations`             | [Superadmin] | List pending requests       |
| `POST` | `/api/admin-registrations/:id/approve` | [Superadmin] | Approve request             |
| `POST` | `/api/admin-registrations/:id/reject`  | [Superadmin] | Reject request              |

---

## Tourism -- `/api/tourism`

| Method   | Path                      | Auth         | Description              |
| -------- | ------------------------- | ------------ | ------------------------ |
| `GET`    | `/api/tourism`            | No           | List tourism attractions |
| `GET`    | `/api/tourism/:id`        | No           | Get single attraction    |
| `POST`   | `/api/tourism`            | [Superadmin] | Create attraction        |
| `PATCH`  | `/api/tourism/:id`        | [Superadmin] | Update attraction        |
| `DELETE` | `/api/tourism/:id`        | [Superadmin] | Delete attraction        |
| `POST`   | `/api/tourism/:id/upload` | [Superadmin] | Upload attraction image  |

---

## Leadership -- `/api/leadership`

| Method   | Path                         | Auth         | Description            |
| -------- | ---------------------------- | ------------ | ---------------------- |
| `GET`    | `/api/leadership`            | No           | List officials         |
| `GET`    | `/api/leadership/:id`        | No           | Get official by ID     |
| `POST`   | `/api/leadership`            | [Superadmin] | Create official        |
| `PATCH`  | `/api/leadership/:id`        | [Superadmin] | Update official        |
| `DELETE` | `/api/leadership/:id`        | [Superadmin] | Delete official        |
| `POST`   | `/api/leadership/:id/avatar` | [Superadmin] | Upload official avatar |
| `POST`   | `/api/leadership/reorder`    | [Superadmin] | Reorder display order  |

---

## Government -- `/api/government`

| Method   | Path                        | Auth         | Description             |
| -------- | --------------------------- | ------------ | ----------------------- |
| `GET`    | `/api/government/executive` | No           | Get executive branch    |
| `GET`    | `/api/government/offices`   | No           | List government offices |
| `GET`    | `/api/government/barangays` | No           | List barangays          |
| `POST`   | `/api/government/*`         | [Superadmin] | Create/update (admin)   |
| `PATCH`  | `/api/government/*`         | [Superadmin] | Update (admin)          |
| `DELETE` | `/api/government/*`         | [Superadmin] | Delete (admin)          |

---

## Legislative -- `/api/legislative`

| Method   | Path                           | Auth         | Description                   |
| -------- | ------------------------------ | ------------ | ----------------------------- |
| `GET`    | `/api/legislative/ordinances`  | No           | List ordinances               |
| `GET`    | `/api/legislative/resolutions` | No           | List resolutions              |
| `GET`    | `/api/legislative/process`     | No           | Get legislative process steps |
| `GET`    | `/api/legislative/about`       | No           | Get about section             |
| `POST`   | `/api/legislative/*`           | [Superadmin] | Create (admin)                |
| `PATCH`  | `/api/legislative/*`           | [Superadmin] | Update (admin)                |
| `DELETE` | `/api/legislative/*`           | [Superadmin] | Delete (admin)                |

---

## Services -- `/api/services`

| Method   | Path                        | Auth         | Description             |
| -------- | --------------------------- | ------------ | ----------------------- |
| `GET`    | `/api/services`             | No           | List service categories |
| `GET`    | `/api/services/:id`         | No           | Get service by ID       |
| `GET`    | `/api/services/categories`  | No           | List categories only    |
| `GET`    | `/api/services/life-events` | No           | List life event guides  |
| `POST`   | `/api/services`             | [Superadmin] | Create service          |
| `PATCH`  | `/api/services/:id`         | [Superadmin] | Update service          |
| `DELETE` | `/api/services/:id`         | [Superadmin] | Delete service          |

---

## Transparency -- `/api/transparency`

| Method   | Path                    | Auth         | Description               |
| -------- | ----------------------- | ------------ | ------------------------- |
| `GET`    | `/api/transparency`     | No           | List transparency records |
| `GET`    | `/api/transparency/:id` | No           | Get single record         |
| `POST`   | `/api/transparency`     | [Superadmin] | Create record             |
| `PATCH`  | `/api/transparency/:id` | [Superadmin] | Update record             |
| `DELETE` | `/api/transparency/:id` | [Superadmin] | Delete record             |

---

## Statistics -- `/api/statistics`

| Method   | Path                           | Auth         | Description              |
| -------- | ------------------------------ | ------------ | ------------------------ |
| `GET`    | `/api/statistics`              | No           | Get municipal statistics |
| `GET`    | `/api/statistics/demographics` | No           | Population data          |
| `GET`    | `/api/statistics/barangays`    | No           | Per-barangay statistics  |
| `POST`   | `/api/statistics`              | [Superadmin] | Create/update statistics |
| `PATCH`  | `/api/statistics/:id`          | [Superadmin] | Update statistic         |
| `DELETE` | `/api/statistics/:id`          | [Superadmin] | Delete statistic         |

---

## Freedom Wall -- `/api/freedom-wall`

Anonymous public community posts.

| Method   | Path                        | Auth         | Description              |
| -------- | --------------------------- | ------------ | ------------------------ |
| `GET`    | `/api/freedom-wall`         | No           | List posts               |
| `POST`   | `/api/freedom-wall`         | No           | Create anonymous post    |
| `DELETE` | `/api/freedom-wall/:id`     | [Superadmin] | Delete post (moderation) |
| `POST`   | `/api/freedom-wall/:id/pin` | [Superadmin] | Pin post                 |

---

## Community -- `/api/community`

| Method   | Path                            | Auth         | Description        |
| -------- | ------------------------------- | ------------ | ------------------ |
| `GET`    | `/api/community/discussions`    | No           | List discussions   |
| `GET`    | `/api/community/groups`         | No           | List peer groups   |
| `GET`    | `/api/community/featured-event` | No           | Get featured event |
| `POST`   | `/api/community/*`              | [Superadmin] | Create (admin)     |
| `PATCH`  | `/api/community/*`              | [Superadmin] | Update (admin)     |
| `DELETE` | `/api/community/*`              | [Superadmin] | Delete (admin)     |

---

## Emergency Contacts -- `/api/emergency-contacts`

| Method   | Path                          | Auth         | Description             |
| -------- | ----------------------------- | ------------ | ----------------------- |
| `GET`    | `/api/emergency-contacts`     | No           | List emergency contacts |
| `POST`   | `/api/emergency-contacts`     | [Superadmin] | Create contact          |
| `PATCH`  | `/api/emergency-contacts/:id` | [Superadmin] | Update contact          |
| `DELETE` | `/api/emergency-contacts/:id` | [Superadmin] | Delete contact          |

---

## Medical Contacts -- `/api/medical-contacts`

| Method   | Path                        | Auth         | Description        |
| -------- | --------------------------- | ------------ | ------------------ |
| `GET`    | `/api/medical-contacts`     | No           | List hospitals/RHU |
| `POST`   | `/api/medical-contacts`     | [Superadmin] | Create contact     |
| `PATCH`  | `/api/medical-contacts/:id` | [Superadmin] | Update contact     |
| `DELETE` | `/api/medical-contacts/:id` | [Superadmin] | Delete contact     |

---

## Office Directory -- `/api/office-directory`

| Method   | Path                        | Auth         | Description         |
| -------- | --------------------------- | ------------ | ------------------- |
| `GET`    | `/api/office-directory`     | No           | List offices        |
| `POST`   | `/api/office-directory`     | [Superadmin] | Create office entry |
| `PATCH`  | `/api/office-directory/:id` | [Superadmin] | Update office entry |
| `DELETE` | `/api/office-directory/:id` | [Superadmin] | Delete office entry |

---

## Contact -- `/api/contact`

| Method  | Path           | Auth         | Description                 |
| ------- | -------------- | ------------ | --------------------------- |
| `GET`   | `/api/contact` | No           | Get contact information     |
| `POST`  | `/api/contact` | No           | Submit contact form         |
| `PATCH` | `/api/contact` | [Superadmin] | Update contact info (admin) |

---

## Popular Services -- `/api/popular-services`

| Method   | Path                            | Auth         | Description            |
| -------- | ------------------------------- | ------------ | ---------------------- |
| `GET`    | `/api/popular-services`         | No           | List featured services |
| `POST`   | `/api/popular-services`         | [Superadmin] | Create entry           |
| `PATCH`  | `/api/popular-services/:id`     | [Superadmin] | Update entry           |
| `DELETE` | `/api/popular-services/:id`     | [Superadmin] | Delete entry           |
| `POST`   | `/api/popular-services/reorder` | [Superadmin] | Reorder entries        |

---

## At a Glance -- `/api/at-a-glance`

| Method   | Path                   | Auth         | Description           |
| -------- | ---------------------- | ------------ | --------------------- |
| `GET`    | `/api/at-a-glance`     | No           | Get glance statistics |
| `POST`   | `/api/at-a-glance`     | [Superadmin] | Create entry          |
| `PATCH`  | `/api/at-a-glance/:id` | [Superadmin] | Update entry          |
| `DELETE` | `/api/at-a-glance/:id` | [Superadmin] | Delete entry          |

---

## History -- `/api/history`

| Method   | Path               | Auth         | Description             |
| -------- | ------------------ | ------------ | ----------------------- |
| `GET`    | `/api/history`     | No           | List history milestones |
| `POST`   | `/api/history`     | [Superadmin] | Create milestone        |
| `PATCH`  | `/api/history/:id` | [Superadmin] | Update milestone        |
| `DELETE` | `/api/history/:id` | [Superadmin] | Delete milestone        |

---

## Latest Updates -- `/api/latest-updates`

| Method   | Path                      | Auth         | Description             |
| -------- | ------------------------- | ------------ | ----------------------- |
| `GET`    | `/api/latest-updates`     | No           | List news/announcements |
| `GET`    | `/api/latest-updates/:id` | No           | Get single update       |
| `POST`   | `/api/latest-updates`     | [Superadmin] | Create update           |
| `PATCH`  | `/api/latest-updates/:id` | [Superadmin] | Update entry            |
| `DELETE` | `/api/latest-updates/:id` | [Superadmin] | Delete entry            |

---

## Marquee Images -- `/api/marquee-images`

| Method   | Path                          | Auth         | Description           |
| -------- | ----------------------------- | ------------ | --------------------- |
| `GET`    | `/api/marquee-images`         | No           | List carousel images  |
| `POST`   | `/api/marquee-images`         | [Superadmin] | Upload new image      |
| `PATCH`  | `/api/marquee-images/:id`     | [Superadmin] | Update image metadata |
| `DELETE` | `/api/marquee-images/:id`     | [Superadmin] | Delete image          |
| `POST`   | `/api/marquee-images/reorder` | [Superadmin] | Reorder carousel      |

---

## Municipal Hall -- `/api/municipal-hall`

Single-record endpoint for municipal hall information.

| Method  | Path                  | Auth         | Description             |
| ------- | --------------------- | ------------ | ----------------------- |
| `GET`   | `/api/municipal-hall` | No           | Get municipal hall info |
| `PATCH` | `/api/municipal-hall` | [Superadmin] | Update info (admin)     |

---

## Barangay Map -- `/api/barangay-map`

| Method   | Path                    | Auth         | Description             |
| -------- | ----------------------- | ------------ | ----------------------- |
| `GET`    | `/api/barangay-map`     | No           | List barangay locations |
| `POST`   | `/api/barangay-map`     | [Superadmin] | Add barangay            |
| `PATCH`  | `/api/barangay-map/:id` | [Superadmin] | Update barangay         |
| `DELETE` | `/api/barangay-map/:id` | [Superadmin] | Delete barangay         |

---

## Better LUGs -- `/api/better-lugs`

| Method   | Path                          | Auth         | Description              |
| -------- | ----------------------------- | ------------ | ------------------------ |
| `GET`    | `/api/better-lugs`            | No           | List other LGU platforms |
| `POST`   | `/api/better-lugs`            | [Superadmin] | Create entry             |
| `PATCH`  | `/api/better-lugs/:id`        | [Superadmin] | Update entry             |
| `DELETE` | `/api/better-lugs/:id`        | [Superadmin] | Delete entry             |
| `POST`   | `/api/better-lugs/:id/upload` | [Superadmin] | Upload logo              |

---

## Quiz -- `/api/quiz`

| Method   | Path            | Auth         | Description         |
| -------- | --------------- | ------------ | ------------------- |
| `GET`    | `/api/quiz`     | No           | List quiz questions |
| `POST`   | `/api/quiz`     | [Superadmin] | Create question     |
| `PATCH`  | `/api/quiz/:id` | [Superadmin] | Update question     |
| `DELETE` | `/api/quiz/:id` | [Superadmin] | Delete question     |

---

## Social Links -- `/api/social-links`

| Method   | Path                    | Auth         | Description                 |
| -------- | ----------------------- | ------------ | --------------------------- |
| `GET`    | `/api/social-links`     | No           | Get social media links      |
| `POST`   | `/api/social-links`     | [Superadmin] | Create/update links (admin) |
| `PATCH`  | `/api/social-links/:id` | [Superadmin] | Update specific link        |
| `DELETE` | `/api/social-links/:id` | [Superadmin] | Delete link                 |

---

## Notifications -- `/api/notifications`

| Method   | Path                          | Auth   | Description             |
| -------- | ----------------------------- | ------ | ----------------------- |
| `GET`    | `/api/notifications`          | [Auth] | Get admin notifications |
| `PATCH`  | `/api/notifications/:id/read` | [Auth] | Mark notification read  |
| `DELETE` | `/api/notifications/:id`      | [Auth] | Delete notification     |

---

## Files / Image Proxy -- `/api/properties`

| Method | Path                                            | Auth | Description                 |
| ------ | ----------------------------------------------- | ---- | --------------------------- |
| `GET`  | `/api/properties/image-proxy?url=<encoded-url>` | No   | Proxy image through backend |

This endpoint resolves the image URL using Node.js DNS overrides, which is useful for R2 assets that are inconsistently resolved on some networks.

---

## Health Reports -- `/api/health`

| Method | Path                 | Auth | Description                  |
| ------ | -------------------- | ---- | ---------------------------- |
| `POST` | `/api/health/report` | No   | Report frontend health error |

Used by the frontend to report runtime errors to the backend, which forwards them via email.

---

## Error Responses

All endpoints return errors in the standard format:

```json
{
  "success": false,
  "message": "Human-readable error description",
  "errors": ["Optional array of detailed errors"],
  "code": "OPTIONAL_ERROR_CODE",
  "reason": "optional_machine_reason"
}
```

**Common HTTP Status Codes**:

| Code  | Meaning                                                   |
| ----- | --------------------------------------------------------- |
| `200` | Success                                                   |
| `201` | Created                                                   |
| `400` | Bad request / validation error                            |
| `401` | Unauthenticated (missing or expired token)                |
| `403` | Unauthorized (authenticated but insufficient permissions) |
| `404` | Resource not found                                        |
| `409` | Conflict (duplicate, already exists)                      |
| `422` | Unprocessable entity                                      |
| `429` | Rate limit exceeded                                       |
| `500` | Internal server error                                     |
| `502` | Bad gateway (upstream API error)                          |
| `503` | Service unavailable (starting up)                         |
| `504` | Gateway timeout (upstream timeout)                        |

See [Error Handling](./errors.md) for the complete error reference.
