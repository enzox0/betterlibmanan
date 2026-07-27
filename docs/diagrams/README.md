# System Diagrams

Visual representations of BetterLibmanan's architecture, data flows, and component interactions. All diagrams use Mermaid syntax.

## Table of Contents

- [System Context](#system-context)
- [Container Diagram](#container-diagram)
- [Component Diagram -- Backend](#component-diagram--backend)
- [Sequence Diagrams](#sequence-diagrams)
  - [Admin Authentication](#admin-authentication)
  - [Public Data Fetch](#public-data-fetch)
  - [File Upload](#file-upload)
- [Database Collections](#database-collections)
- [Deployment Topology](#deployment-topology)

---

## System Context

Actors and external systems that interact with the platform.

```mermaid
graph LR
    Resident["Libmanan Resident\n(Public user)"]
    Admin["Municipal Admin\n(Content management)"]
    Superadmin["Super Admin\n(Full control)"]

    Platform["BetterLibmanan Platform\n(Digital portal)"]

    R2["Cloudflare R2\n(File storage)"]
    Atlas["MongoDB Atlas\n(Managed database)"]
    SMTP["SMTP Server\n(Email delivery)"]
    Maps["Google Maps API\n(Map tiles)"]

    Resident -->|HTTPS| Platform
    Admin -->|HTTPS| Platform
    Superadmin -->|HTTPS| Platform

    Platform -->|HTTPS| R2
    Platform -->|MongoDB SRV| Atlas
    Platform -->|SMTP| SMTP
    Resident -->|HTTPS| Maps
```

---

## Container Diagram

The major deployable units and their responsibilities.

```mermaid
graph TD
    subgraph Platform["BetterLibmanan Platform"]
        subgraph Backend["Express.js Backend -- Port 5000"]
            SPA["SPA Host\n(Serves React build)"]
            API["REST API\n/api/* -- 30+ modules"]
            WS["WebSocket\nSocket.IO /socket.io"]
        end

        subgraph Worker["Background Worker"]
            HealthMon["Health Monitor\nPolls /health every N minutes"]
            EmailAlert["Email Alerts\n(Nodemailer)"]
        end
    end

    MongoDB["MongoDB Atlas\n(Primary database)"]
    R2["Cloudflare R2\n(File storage)"]
    SMTP["SMTP Server\n(Email)"]

    Backend --> MongoDB
    Backend --> R2
    Backend --> SMTP
    HealthMon -->|HTTP| Backend
    HealthMon --> EmailAlert
    EmailAlert --> SMTP
```

---

## Component Diagram -- Backend

Internal structure of the backend application.

```mermaid
graph TD
    subgraph Bootstrap["bootstrap/"]
        App["app.ts\nGlobal middleware, SPA serving"]
        Routes["routes.ts\nCentral API router"]
        Server["server.ts\nHTTP server wrapper"]
    end

    subgraph Gateway["gateway/"]
        WS["websocket/\nSocket.IO handlers"]
        HTTP["http/ (planned)"]
        REST["rest/ (planned)"]
        GQL["graphql/ (planned)"]
    end

    subgraph Modules["modules/ -- 30+ feature modules"]
        Auth["auth/\nJWT, token rotation"]
        Accounts["accounts/\nAdmin management"]
        Audit["audit/\nAction logging"]
        Tourism["tourism/"]
        Legislative["legislative/"]
        Other["... 24 more modules"]
    end

    subgraph Infra["infrastructure/"]
        DB["database.ts\nMongoDB connection"]
        Storage["storage/\nR2 upload helpers"]
        Messaging["messaging/\nEmail"]
    end

    subgraph Shared["shared/"]
        Config["config/"]
        Logger["logger/\nWinston"]
        Middleware["middleware/\nerror-handler, auth guards"]
        Mailer["mailer/\nEmail templates"]
    end

    App --> Routes
    Routes --> Modules
    Routes --> Gateway
    Modules --> Infra
    Modules --> Shared
```

---

## Sequence Diagrams

### Admin Authentication

```mermaid
sequenceDiagram
    participant C as Admin Browser
    participant B as Express Backend
    participant DB as MongoDB

    C->>B: POST /api/auth/login { username, password }
    B->>B: Validate with Zod schema
    B->>DB: findOne({ username })
    DB-->>B: Admin document
    B->>B: bcrypt.compare(password, hash)
    B->>DB: Create RefreshToken document
    B->>DB: Update lastLoginAt
    B-->>C: { accessToken, refreshToken, admin }

    Note over C,B: Access token valid for 15 minutes

    C->>B: GET /api/resource (Authorization: Bearer accessToken)
    B->>B: Verify JWT signature and expiry
    B-->>C: API response

    Note over C,B: Access token expires, client initiates refresh

    C->>B: POST /api/auth/refresh { refreshToken }
    B->>DB: findOne({ token: refreshToken })
    DB-->>B: RefreshToken document
    B->>B: Check isRevoked, expiresAt, lastUsedAt
    B->>DB: Revoke old token
    B->>DB: Create new RefreshToken
    B-->>C: { newAccessToken, newRefreshToken, admin }
```

---

### Public Data Fetch

```mermaid
sequenceDiagram
    participant C as Public Browser
    participant E as Express Backend
    participant DB as MongoDB

    C->>E: GET /
    E-->>C: index.html (React SPA)
    C->>C: React Router matches route
    C->>E: GET /api/tourism
    E->>DB: Tourism.find({ isActive: true })
    DB-->>E: Tourism documents
    E-->>C: { success: true, data: [...] }
    C->>C: React Query caches response
    C->>C: Page component renders
```

---

### File Upload

```mermaid
sequenceDiagram
    participant A as Admin Browser
    participant B as Express Backend
    participant R2 as Cloudflare R2
    participant DB as MongoDB

    A->>A: Select image file
    A->>A: FileReader.readAsDataURL(file)
    A->>B: POST /api/module/upload { filename, mimeType, data: base64 }
    B->>B: Validate with Zod
    B->>B: Decode base64 to Buffer
    B->>R2: PutObjectCommand { key, body, contentType }
    R2-->>B: Upload confirmed
    B->>B: Build public URL from R2_PUBLIC_BASE_URL + key
    B-->>A: { url, key }
    A->>B: POST /api/module { ..., imageUrl, imageKey }
    B->>DB: Module.create(data)
    DB-->>B: Created document
    B-->>A: { success: true, data: {...} }
```

---

---

## Database Collections

Key collections in the `betterlibmanan` MongoDB database.

```mermaid
graph TD
    subgraph Auth["Authentication"]
        admins["admins\nAdmin accounts, hashed passwords"]
        refreshtokens["refreshtokens\nActive session tokens"]
        auditlogs["auditlogs\nAdmin action audit trail"]
    end

    subgraph Users["Users"]
        users["users\nPublic user accounts"]
    end

    subgraph Content["Content Modules"]
        tourism["tourism"]
        leadership["leadership"]
        legislative["legislative"]
        services["services"]
        statistics["statistics"]
        history["history"]
        latestupdates["latestupdates"]
        marqueeimages["marqueeimages"]
        popularservices["popularservices"]
        ataglance["ataglance"]
    end

    subgraph Community["Community"]
        freedomwall["freedomwall\nAnonymous posts"]
        communityposts["communityposts"]
        quiz["quiz"]
    end

    subgraph Directory["Directory & Contacts"]
        emergencycontacts["emergencycontacts"]
        medicalcontacts["medicalcontacts"]
        officedirectory["officedirectory"]
        barangaymap["barangaymap"]
        betterlugs["betterlugs"]
    end

    subgraph Config["Configuration"]
        sociallinks["sociallinks"]
        municipalhall["municipalhall\nSingle document"]
    end
```

---

## Deployment Topology

### Production -- Render.com

```mermaid
graph TD
    Internet["Internet"]
    Edge["Render Edge\n(TLS Termination)"]

    subgraph Container["Docker Container"]
        Backend["Express Backend\nPort 5000"]
        SPA["Serves React SPA\n/ through /*"]
        RAPI["REST API\n/api/*"]
        WSock["WebSocket\n/socket.io"]
        WP["Worker Process\nHealth Monitor"]
    end

    Atlas["MongoDB Atlas"]
    R2["Cloudflare R2"]
    SMTP2["SMTP Server"]

    Internet -->|HTTPS| Edge
    Edge -->|HTTP| Backend
    Backend --> SPA
    Backend --> RAPI
    Backend --> WSock
    Backend --> Atlas
    Backend --> R2
    WP -->|HTTP| Backend
    WP --> SMTP2
```

### Local Development -- Docker Compose

```mermaid
graph LR
    subgraph localhost
        FE["Frontend\nVite Dev Server :3000"]
        BE["Backend\ntsx watch :5000"]
        MDB["MongoDB\nDocker :27017"]
        RDS["Redis\nDocker :6379"]
        NGX["Nginx\nReverse Proxy :80"]
    end

    NGX --> FE
    NGX --> BE
    BE --> MDB
    BE --> RDS
```

---

## Rendering Diagrams

- **GitHub**: Mermaid diagrams render natively in Markdown files
- **VS Code**: Install the [Mermaid Preview extension](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid)
- **Mermaid Live Editor**: [mermaid.live](https://mermaid.live)
