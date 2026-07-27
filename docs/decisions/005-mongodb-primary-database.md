# ADR-005: MongoDB as Primary Database

**Status**: Accepted  
**Date**: 2026-07-27  
**Decision Makers**: BetterLibmanan Team

## Context

BetterLibmanan needs a primary database to store content for 30+ feature modules (tourism, leadership, services, legislative records, user data, audit logs, etc.).

The data characteristics are:

- Mostly **content-oriented** (articles, listings, records) with varied shapes per module
- Low to **moderate write rates** (admin CMS updates, user registrations)
- **Read-heavy** (public portal traffic)
- **Schema evolution** expected (government services and content change frequently)
- Some modules have **nested structures** (e.g., services with categories and subcategories)
- The team has more experience with document databases

## Decision

Use **MongoDB** (via Mongoose ODM) as the primary database.

### Version

MongoDB 7 (latest stable at the time of the decision).

### Connection

MongoDB Atlas (managed cloud service) for production; Docker container for development.

### ODM

Mongoose 8 for:

- Schema definitions with TypeScript types
- Validation at the model level
- Middleware hooks (e.g., bcrypt password hashing pre-save)
- Query builder API

### Connection Configuration

```typescript
await mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 10_000, // 10s timeout for initial connection
  socketTimeoutMS: 45_000, // Keep idle connections alive
});
```

### DNS Override for Atlas SRV

Atlas connection strings use `mongodb+srv://` which requires SRV record resolution. The connection module overrides DNS resolvers to Cloudflare/Google to ensure reliable SRV lookups in all network environments.

## Consequences

### Positive

- **Flexible schema**: Each module can have a different document structure without complex migrations
- **Rapid iteration**: Adding new fields to a module doesn't require ALTER TABLE statements
- **JSON-native**: MongoDB documents map directly to JavaScript/TypeScript objects (no ORM impedance mismatch)
- **Rich querying**: Aggregation pipeline, full-text search, geospatial queries (useful for barangay map)
- **Horizontal scaling**: Sharding available if the platform grows beyond a single server
- **Atlas managed service**: Auto-backups, monitoring, connection pooling, and HA provided by MongoDB Atlas
- **Nested documents**: Services with categories/subcategories map naturally to nested document arrays

### Negative

- **No ACID multi-document transactions by default**: Each document operation is atomic, but multi-document transactions require explicit transaction handling
- **Consistency trade-offs**: No foreign key constraints -- referential integrity must be enforced in application code
- **Memory overhead**: Mongoose Model instances are heavier than plain PostgreSQL rows (mitigated with `.lean()`)
- **Schema validation**: While Mongoose schemas provide validation, the database itself can store any document shape (can be addressed with JSON Schema validators in MongoDB)

## Alternatives Considered

### PostgreSQL

**Considered**: Industry-standard relational database.

**Not chosen because**:

- Schema migrations are required for every structural change (high friction for rapid CMS feature development)
- The content is naturally document-shaped (nested arrays, flexible metadata)
- Setting up PostgreSQL on Render requires a paid plan (Atlas free tier is available)

### SQLite (for simplicity)

**Not chosen because**:

- No production-grade managed hosting
- No horizontal scaling
- Not suitable for multi-process deployments (backend + worker)

### Supabase (PostgreSQL managed)

**Considered**: Developer-friendly managed PostgreSQL.

**Not chosen because**:

- All benefits of PostgreSQL with relational constraints still apply (friction for schema changes)
- Would introduce a second vendor for both auth and database (Supabase Auth vs. custom JWT)
- Vendor lock-in concerns

### PlanetScale (MySQL managed)

**Not chosen because**:

- Relational database schema migration friction
- Less natural fit for document-style content management

## References

- [MongoDB Atlas](https://www.mongodb.com/atlas)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB vs PostgreSQL -- When to Use Which](https://www.mongodb.com/compare/mongodb-postgresql)
