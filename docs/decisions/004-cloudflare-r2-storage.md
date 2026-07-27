# ADR-004: Cloudflare R2 for File Storage

**Status**: Accepted  
**Date**: 2026-07-27  
**Decision Makers**: BetterLibmanan Team

## Context

BetterLibmanan requires file storage for:

- Admin and user avatar images
- Tourism attraction photos
- Leadership official portraits
- Marquee/carousel images
- Better LUGs platform logos
- Other user-uploaded assets

Uploaded images need to be:

- Stored persistently (survive app restarts and re-deployments)
- Publicly accessible via URL
- Efficiently served (ideally from a CDN)

The project runs on Render.com, which does not offer persistent file storage on its Starter plan.

## Decision

Use **Cloudflare R2** as the file storage solution.

### R2 Properties

- S3-compatible API (uses `@aws-sdk/client-s3`)
- Free egress (no bandwidth charges for downloads)
- Built-in CDN via Cloudflare's global network
- Custom domain support
- Public bucket URL (`*.r2.dev` or custom domain)

### Upload Flow

Images are accepted as **base64-encoded strings** in the API request body:

```json
{
  "filename": "photo.jpg",
  "mimeType": "image/jpeg",
  "data": "base64-encoded-binary..."
}
```

The backend converts base64 to a `Buffer`, then uploads via the AWS SDK `PutObjectCommand`.

### Image Key Strategy

Each uploaded object receives a unique key:

```
<folder>/<timestamp>-<random-id>.<ext>
```

Example: `avatars/1720000000000-abc12345.webp`

Old objects are deleted when replaced (prevents orphaned files consuming storage).

### Image Proxy

R2 URLs are served through an image proxy endpoint (`/api/properties/image-proxy`) for:

- DNS resolution reliability (the proxy uses Node.js DNS overrides)
- Consistent URL structure for the frontend

### Custom Domain

The `VITE_R2_PUBLIC_BASE_URL` environment variable configures the public base URL. This supports custom domains (e.g., `https://assets.libmanan.gov.ph`) in addition to the default `*.r2.dev` domain.

## Consequences

### Positive

- **Free egress**: No per-GB transfer costs from R2 to the internet (unlike S3)
- **S3-compatible**: Works with the widely-adopted AWS SDK, avoiding lock-in concerns
- **CDN included**: Files are served from Cloudflare's edge network globally
- **Persistent storage**: Files survive application restarts and re-deployments
- **Simple setup**: Single bucket, public access, no IAM complexity

### Negative

- **Cloudflare account required**: Adds a third-party provider dependency
- **Base64 encoding overhead**: ~33% larger payload vs. multipart form upload
- **No stream uploads**: Large files are fully loaded into memory before upload
- **No server-side image processing**: Resizing/optimization is not automatic (images are stored as-is)
- **Custom domain setup**: Requires DNS configuration for custom domain support

## Alternatives Considered

### AWS S3

**Considered**: Industry standard object storage.

**Not chosen because**:

- Per-request costs and egress fees (R2 has free egress)
- More complex IAM setup
- No significant advantage for this use case

### Supabase Storage

**Considered**: Open-source Firebase alternative with built-in storage.

**Not chosen because**:

- Project already uses MongoDB for the database
- Adds a secondary database provider
- Less mature CDN compared to Cloudflare

### Local File System (VPS)

**Considered**: Store files directly on the server.

**Rejected because**:

- Files are lost on re-deployment (Render ephemeral storage)
- No CDN distribution
- Single point of failure
- Doesn't scale horizontally

### Uploadthing

**Considered**: Developer-friendly file upload service.

**Not chosen because**:

- Additional third-party service
- Less control over storage and serving
- Cost at scale

## References

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
- [AWS SDK S3 Client](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/)
