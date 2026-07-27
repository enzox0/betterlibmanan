# Deployment Guide

This guide covers deploying BetterLibmanan to various environments and platforms.

## Deployment Targets

- [Docker Compose](#docker-compose-local--vps)
- [Render.com](#rendercom)
- [Kubernetes](#kubernetes)
- [VPS / Bare Metal](#vps--bare-metal)

## Prerequisites

All deployment methods require the following:

- **MongoDB** -- Atlas, self-hosted, or containerized
- **Environment Variables** -- See [`.env.example`](../../.env.example)
- **SMTP Server** -- For email notifications (optional but recommended)
- **Cloudflare R2** -- For file storage (optional)

## Docker Compose (Local / VPS)

Perfect for development, testing, or small-scale production on a single server.

### Step 1: Clone Repository

```bash
git clone https://github.com/enzox0/betterlibmanan.git
cd betterlibmanan
```

### Step 2: Configure Environment

```bash
cp .env.example .env
nano .env  # Edit with your values
```

Critical variables:

- `MONGODB_URI` -- Connection string
- `JWT_ACCESS_SECRET` -- Random secret (min 32 chars)
- `JWT_REFRESH_SECRET` -- Random secret (min 32 chars)
- `CORS_ORIGIN` -- Frontend URL
- `R2_*` -- Cloudflare R2 credentials (if using file uploads)
- `SMTP_*` -- Email server credentials

### Step 3: Start Services

```bash
docker-compose up -d
```

This starts:

- **MongoDB** on `localhost:27017`
- **Redis** on `localhost:6379`
- **Backend** on `localhost:5000`
- **Frontend** on `localhost:3000`
- **Nginx** on `localhost:80` (reverse proxy)

### Step 4: Verify Deployment

```bash
curl http://localhost:5000/health
```

Should return `"success": true`.

### Step 5: Create Admin Account

```bash
docker exec -it betterlibmanan-backend pnpm --filter @betterlibmanan/backend run seed
```

Default credentials:

- **Username**: `admin`
- **Password**: `Admin@123` (change immediately!)

### Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### Updates

```bash
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## Render.com

Fully managed platform with auto-deploy from Git.

### Step 1: Connect Repository

1. Go to [render.com](https://render.com)
2. Click **New** -> **Blueprint**
3. Connect your GitHub repo
4. Render will detect `render.yaml` and provision services

### Step 2: Configure Environment Variables

In the Render dashboard, set:

- `NODE_ENV=production`
- `JWT_ACCESS_SECRET=<generate-strong-random-value>`
- `JWT_REFRESH_SECRET=<generate-strong-random-value>`
- `CORS_ORIGIN=<your-render-web-service-url>`
- `R2_*` credentials
- `SMTP_*` credentials

Render will auto-inject:

- `MONGODB_URI` (from managed database)
- `REDIS_URL` (from managed Redis)

### Step 3: Deploy

Push to `main` branch:

```bash
git push origin main
```

Render auto-deploys on every push.

### Step 4: Seed Database

SSH into the web service via Render dashboard:

```bash
pnpm --filter @betterlibmanan/backend run seed
```

### Custom Domain

1. Go to **Settings** -> **Custom Domain**
2. Add your domain (e.g., `libmanan.gov.ph`)
3. Configure DNS CNAME to Render's target
4. Render provisions free TLS certificate

---

## Kubernetes

For production-grade orchestration with auto-scaling and high availability.

### Prerequisites

- Kubernetes cluster (GKE, EKS, AKS, or self-hosted)
- `kubectl` configured with cluster access
- Persistent storage class available

### Step 1: Create Namespace

```bash
kubectl create namespace betterlibmanan
```

### Step 2: Deploy MongoDB

Using a managed service (MongoDB Atlas) is recommended. For self-hosted:

```bash
kubectl apply -f infrastructure/kubernetes/mongodb-deployment.yaml
```

### Step 3: Create Secrets

```bash
kubectl create secret generic betterlibmanan-secrets \
  --from-literal=mongodb-uri='mongodb://...' \
  --from-literal=jwt-access-secret='...' \
  --from-literal=jwt-refresh-secret='...' \
  --from-literal=r2-access-key-id='...' \
  --from-literal=r2-secret-access-key='...' \
  --from-literal=smtp-pass='...' \
  -n betterlibmanan
```

### Step 4: Deploy Application

```bash
kubectl apply -f infrastructure/kubernetes/ -n betterlibmanan
```

This deploys:

- Backend (3 replicas)
- Frontend (3 replicas)
- Worker (1 replica)
- Service (LoadBalancer)
- Ingress (TLS)

### Step 5: Verify

```bash
kubectl get pods -n betterlibmanan
kubectl get services -n betterlibmanan
```

### Access Application

Get the LoadBalancer IP:

```bash
kubectl get service betterlibmanan-backend -n betterlibmanan
```

Configure DNS A record to point to the LoadBalancer IP.

### Scaling

```bash
# Scale backend
kubectl scale deployment betterlibmanan-backend --replicas=5 -n betterlibmanan

# Auto-scale (HPA)
kubectl autoscale deployment betterlibmanan-backend \
  --cpu-percent=70 --min=3 --max=10 -n betterlibmanan
```

---

## VPS / Bare Metal

For full control over infrastructure.

### Prerequisites

- Ubuntu 20.04+ or Debian 11+
- Node.js 18+
- pnpm 8+
- MongoDB 7+
- Nginx
- PM2 (process manager)

### Step 1: Install Dependencies

```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# pnpm
npm install -g pnpm@9

# MongoDB (or use Atlas)
# https://www.mongodb.com/docs/manual/installation/

# PM2
npm install -g pm2

# Nginx
sudo apt install -y nginx
```

### Step 2: Clone and Build

```bash
cd /var/www
git clone https://github.com/enzox0/betterlibmanan.git
cd betterlibmanan

# Configure environment
cp .env.example .env
nano .env

# Install and build
pnpm install
pnpm run build
```

### Step 3: Start with PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Auto-start on reboot
```

### Step 4: Configure Nginx

```nginx
# /etc/nginx/sites-available/betterlibmanan
server {
    listen 80;
    server_name libmanan.gov.ph;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/betterlibmanan /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 5: SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d libmanan.gov.ph
```

### Step 6: Seed Database

```bash
cd /var/www/betterlibmanan
pnpm --filter @betterlibmanan/backend run seed
```

### Monitoring

```bash
# PM2 monitoring
pm2 monit

# Logs
pm2 logs

# Restart
pm2 restart all
```

---

## Post-Deployment Checklist

- [ ] Health check returns `200 OK`
- [ ] Admin login works
- [ ] File uploads work (if using R2)
- [ ] WebSocket connection established
- [ ] Email notifications work
- [ ] HTTPS enabled with valid certificate
- [ ] Monitoring dashboards accessible
- [ ] Database backups scheduled
- [ ] Firewall configured (allow 80, 443, 5000 only)
- [ ] Change default admin password
- [ ] Review security settings

## Rollback Procedure

### Docker Compose

```bash
git checkout <previous-commit>
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Render

Render keeps deployment history. Click **Rollback** in the dashboard.

### Kubernetes

```bash
kubectl rollout undo deployment betterlibmanan-backend -n betterlibmanan
```

### PM2

```bash
git checkout <previous-commit>
pnpm run build
pm2 restart all
```

## Maintenance Windows

- **Development**: No maintenance window
- **Staging**: Anytime (non-production)
- **Production**: Fridays 2:00 PM - 4:00 PM PHT (off-peak)

## Related Documents

- [Environment Management](./environments.md)
- [Security Hardening](./security-hardening.md)
- [Troubleshooting](./troubleshooting.md)
