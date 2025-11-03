# 🚀 SuperSID Pro Analytics - Deployment Guide

**Complete guide for deploying to production environments**

**Last Updated**: 2025-11-03 21:24:27 UTC
**Version**: 1.0.0

---

## 📋 Table of Contents

- [Overview](#overview)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Setup](#environment-setup)
- [Docker Deployment](#docker-deployment)
- [Heroku Deployment](#heroku-deployment)
- [AWS Deployment](#aws-deployment)
- [Production Configuration](#production-configuration)
- [Monitoring & Logging](#monitoring--logging)
- [Database Migration](#database-migration)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)

---

## 🌟 Overview

SuperSID Pro Analytics can be deployed to multiple platforms:

| Platform | Best For | Ease | Cost |
|----------|----------|------|------|
| Docker | Self-hosted | ⭐⭐⭐⭐ | 💰 |
| Heroku | Rapid deployment | ⭐⭐⭐⭐⭐ | 💰💰 |
| AWS | Enterprise scale | ⭐⭐⭐ | 💰💰💰 |
| DigitalOcean | VPS hosting | ⭐⭐⭐⭐ | 💰 |
| DigitalOcean App Platform | Containerized | ⭐⭐⭐⭐ | 💰💰 |

---

## ✅ Pre-Deployment Checklist

Before deploying, verify:

### Code Quality
- [ ] All tests pass: `npm test`
- [ ] No TypeScript errors: `npm run type-check`
- [ ] Linting passes: `npm run lint`
- [ ] Code formatted: `npm run format`

### Build Verification
- [ ] Backend builds: `npm run build:backend`
- [ ] Frontend builds: `npm run build:renderer`
- [ ] Docker builds: `docker build -t supersid-pro:latest .`
- [ ] No console errors

### Configuration
- [ ] `.env.production` configured
- [ ] Database backup created
- [ ] API keys secured
- [ ] CORS origins set correctly

### Documentation
- [ ] README.md updated
- [ ] CHANGELOG.md updated
- [ ] API docs current
- [ ] Deployment notes added

### Testing
- [ ] Manual testing completed
- [ ] All endpoints tested
- [ ] Database operations verified
- [ ] Error handling tested

---

## 🔧 Environment Setup

### Production Environment Variables

Create `.env.production`:

```env
# Environment
NODE_ENV=production
LOG_LEVEL=info

# Server Configuration
BACKEND_PORT=3001
FRONTEND_PORT=3000

# Database
DATABASE_PATH=/data/supersid.db

# API Configuration
API_TIMEOUT=10000
CORS_ORIGIN=https://yourdomain.com
CORS_METHODS=GET,POST,PUT,DELETE
CORS_CREDENTIALS=true

# External APIs
SPACE_WEATHER_API=https://api.spaceweatherlive.com/v1
SOLAR_CENTER_API=https://sid-ftp.stanford.edu

# Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
LOG_FILE=/logs/supersid.log

# Security
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
API_KEY_HEADER=X-API-Key

# Performance
NODE_ENV_PRODUCTION=true
CLUSTER_ENABLED=true
MAX_WORKERS=4
```

### Security Best Practices

```bash
# 1. Generate secure secret
openssl rand -base64 32

# 2. Store in environment variables, NOT in files
export JWT_SECRET="generated-secret"

# 3. Use secrets manager for production
# AWS Secrets Manager, Heroku Config Vars, etc.

# 4. Encrypt sensitive data
# Database passwords, API keys, tokens

# 5. Enable HTTPS only
# Set CORS_ORIGIN to https:// only
```

---

## 🐳 Docker Deployment

### Build Production Image

```bash
# Build with tag
docker build -t supersid-pro:v1.0.0 .

# Tag as latest
docker tag supersid-pro:v1.0.0 supersid-pro:latest

# Push to registry (optional)
docker push your-registry/supersid-pro:v1.0.0
```

### Run Container

```bash
# Basic run
docker run -d \
  -p 3000:3000 \
  -p 3001:3001 \
  --name supersid-pro \
  supersid-pro:latest

# With environment variables
docker run -d \
  -p 3000:3000 \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e DATABASE_PATH=/data/supersid.db \
  -e CORS_ORIGIN=https://yourdomain.com \
  --volume /data/supersid.db:/app/data/supersid.db \
  --volume /logs:/app/logs \
  --name supersid-pro \
  supersid-pro:latest

# With resource limits
docker run -d \
  -p 3000:3000 \
  -p 3001:3001 \
  --memory=2g \
  --cpus=2 \
  --restart unless-stopped \
  --name supersid-pro \
  supersid-pro:latest
```

### Docker Compose

Create `docker-compose.production.yml`:

```yaml
version: '3.8'

services:
  app:
    image: supersid-pro:latest
    container_name: supersid-pro
    ports:
      - "3000:3000"
      - "3001:3001"
    environment:
      NODE_ENV: production
      DATABASE_PATH: /data/supersid.db
      CORS_ORIGIN: https://yourdomain.com
      LOG_LEVEL: info
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - supersid-network

networks:
  supersid-network:
    driver: bridge
```

Run:

```bash
docker-compose -f docker-compose.production.yml up -d
```

### Container Orchestration (Kubernetes)

Create `k8s-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: supersid-pro
spec:
  replicas: 3
  selector:
    matchLabels:
      app: supersid-pro
  template:
    metadata:
      labels:
        app: supersid-pro
    spec:
      containers:
      - name: supersid-pro
        image: your-registry/supersid-pro:v1.0.0
        ports:
        - containerPort: 3000
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_PATH
          value: "/data/supersid.db"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
```

Deploy:

```bash
kubectl apply -f k8s-deployment.yaml
```

---

## 📦 Heroku Deployment

### Prerequisites

```bash
# Install Heroku CLI
brew tap heroku/brew && brew install heroku

# Login
heroku login
```

### Deploy

```bash
# 1. Create app
heroku create supersid-pro

# 2. Set environment variables
heroku config:set NODE_ENV=production
heroku config:set DATABASE_PATH=/app/data/supersid.db
heroku config:set CORS_ORIGIN=https://supersid-pro.herokuapp.com

# 3. Deploy
git push heroku main

# 4. View logs
heroku logs --tail

# 5. Monitor
heroku ps
heroku status
```

### Procfile

Create `Procfile`:

```
web: npm start
```

### Buildpacks

```bash
# Set Node.js buildpack
heroku buildpacks:add heroku/nodejs

# View buildpacks
heroku buildpacks
```

### Database on Heroku

```bash
# Use file-based SQLite (persisted)
heroku config:set DATABASE_PATH=/app/data/supersid.db

# Or use Heroku Postgres
heroku addons:create heroku-postgresql:standard-0
```

### Scaling

```bash
# Scale dynos
heroku ps:scale web=2

# Check dyno status
heroku ps

# View costs
heroku billing
```

---

## ☁️ AWS Deployment

### Option 1: EC2 Instance

```bash
# 1. Launch EC2 instance (Ubuntu 20.04)
# 2. SSH into instance
ssh -i key.pem ubuntu@instance-ip

# 3. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Clone repository
git clone https://github.com/alearecuest/SuperSID_Project.git
cd SuperSID_Project

# 5. Install dependencies
npm install

# 6. Build
npm run build

# 7. Set environment variables
export NODE_ENV=production
export DATABASE_PATH=/data/supersid.db

# 8. Start with PM2
npm install -g pm2
pm2 start npm --name "supersid-pro" -- start
pm2 save
pm2 startup

# 9. Setup Nginx reverse proxy
# See nginx.conf in project
sudo cp nginx.conf /etc/nginx/sites-available/supersid-pro
sudo ln -s /etc/nginx/sites-available/supersid-pro /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Option 2: ECS (Elastic Container Service)

```bash
# 1. Push image to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

docker tag supersid-pro:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/supersid-pro:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/supersid-pro:latest

# 2. Create ECS task definition
# Use ecs-task-definition.json

# 3. Create ECS service
aws ecs create-service \
  --cluster supersid-cluster \
  --service-name supersid-pro \
  --task-definition supersid-pro:1 \
  --desired-count 2 \
  --load-balancers targetGroupArn=arn:aws:...,containerName=supersid-pro,containerPort=3001

# 4. Monitor
aws ecs describe-services --cluster supersid-cluster --services supersid-pro
```

### Option 3: App Runner

```bash
# 1. Push to ECR (same as above)

# 2. Create App Runner service
aws apprunner create-service \
  --service-name supersid-pro \
  --source-configuration ImageRepository='{RepositoryUrl=YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/supersid-pro,ImageIdentifier=latest,ImageRepositoryType=ECR}'

# 3. Monitor
aws apprunner list-services
```

---

## ⚙️ Production Configuration

### Nginx Reverse Proxy

Create `nginx.conf`:

```nginx
upstream backend {
  server localhost:3001;
}

upstream frontend {
  server localhost:3000;
}

server {
  listen 80;
  server_name yourdomain.com www.yourdomain.com;

  # Redirect HTTP to HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name yourdomain.com www.yourdomain.com;

  # SSL certificates
  ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

  # Security headers
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-Frame-Options "DENY" always;
  add_header X-XSS-Protection "1; mode=block" always;

  # Gzip compression
  gzip on;
  gzip_types text/plain text/css application/json application/javascript;
  gzip_min_length 1000;

  # Frontend
  location / {
    proxy_pass http://frontend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # Backend API
  location /api {
    proxy_pass http://backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # CORS headers
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
  }

  # Static files
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
  }
}
```

### PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'supersid-pro',
      script: './dist/backend/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        DATABASE_PATH: '/data/supersid.db',
        CORS_ORIGIN: 'https://yourdomain.com'
      },
      error_file: '/logs/supersid-error.log',
      out_file: '/logs/supersid-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      restart_delay: 4000,
      max_memory_restart: '1G',
      merge_logs: true
    }
  ]
};
```

---

## 📊 Monitoring & Logging

### Application Monitoring

```bash
# Install monitoring packages
npm install --save-dev @sentry/node @sentry/tracing
npm install pm2-logrotate

# Enable log rotation
pm2 install pm2-logrotate

# Monitor with PM2
pm2 monit

# Check status
pm2 status
pm2 logs supersid-pro
```

### Health Checks

Add to `src/backend/server.ts`:

```typescript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: 'connected'
  });
});
```

### Log Aggregation

```bash
# Using ELK Stack or similar
# Logs should go to:
# - /logs/supersid.log
# - /logs/supersid-error.log

# Rotate logs daily
# Use pm2-logrotate or logrotate

# Monitor with:
tail -f /logs/supersid.log
```

---

## 🗄️ Database Migration

### Backup Before Deployment

```bash
# Backup current database
cp ./data/supersid.db ./backups/supersid.db.backup

# Export SQL
sqlite3 ./data/supersid.db ".dump" > ./backups/supersid.sql
```

### Production Database Setup

```bash
# 1. Initialize empty database
rm /data/supersid.db

# 2. Let app initialize on first run
npm start

# 3. Verify tables created
sqlite3 /data/supersid.db ".tables"

# 4. Restore backup if needed
sqlite3 /data/supersid.db < ./backups/supersid.sql
```

---

## 🔄 Rollback Procedures

### Docker Rollback

```bash
# 1. Stop current container
docker stop supersid-pro

# 2. Remove it
docker rm supersid-pro

# 3. Run previous version
docker run -d \
  -p 3000:3000 \
  -p 3001:3001 \
  --name supersid-pro \
  supersid-pro:v0.9.0

# 4. Verify
docker logs supersid-pro
```

### Heroku Rollback

```bash
# 1. View releases
heroku releases

# 2. Rollback to previous
heroku rollback v123

# 3. Verify
heroku logs --tail
```

### Database Rollback

```bash
# 1. Stop application
pm2 stop supersid-pro

# 2. Restore backup
cp ./backups/supersid.db.backup ./data/supersid.db

# 3. Restart
pm2 start supersid-pro
```

---

## 🐛 Troubleshooting

### Application Won't Start

```bash
# Check Node version
node --version  # Should be ≥18.0.0

# Check port conflicts
lsof -i :3001
lsof -i :3000

# Check environment variables
env | grep DATABASE_PATH

# Check logs
pm2 logs supersid-pro
docker logs supersid-pro
```

### Database Connection Issues

```bash
# Check database path
ls -la /data/supersid.db

# Check permissions
chmod 644 /data/supersid.db

# Test connection
sqlite3 /data/supersid.db ".tables"
```

### Memory Issues

```bash
# Monitor memory
free -h
top

# Increase limits
docker run --memory=4g ...
pm2 set max_memory_restart 2G

# Enable clustering
# See ecosystem.config.js
```

### CORS Issues

```bash
# Verify CORS_ORIGIN set
echo $CORS_ORIGIN

# Should match frontend domain
# Update in .env.production
```

---

## 📞 Support

For development setup, see [SETUP_DEVELOPMENT.md](./SETUP_DEVELOPMENT.md).
For architecture details, see [ARCHITECTURE.md](./ARCHITECTURE.md).

**Last Updated**: 2025-11-03 21:24:27 UTC
**Maintained by**: @alearecuest