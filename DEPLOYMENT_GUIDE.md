# 🚀 SuperSID Pro Analytics - Deployment Guide

**Complete guide for deploying SuperSID Pro to production environments**

## 📋 Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Deployment Options](#deployment-options)
- [Heroku Deployment](#heroku-deployment)
- [Docker Deployment](#docker-deployment)
- [AWS Deployment](#aws-deployment)
- [DigitalOcean Deployment](#digitalocean-deployment)
- [Electron Desktop App](#electron-desktop-app)
- [Production Configuration](#production-configuration)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Rollback Procedures](#rollback-procedures)

---

## ✅ Pre-Deployment Checklist

Before deploying to production, verify:

- [ ] All tests passing: `npm test`
- [ ] No TypeScript errors: `npm run type-check`
- [ ] Linting passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates ready (if HTTPS)
- [ ] Backup strategy in place
- [ ] Monitoring tools configured
- [ ] Documentation updated

---

## 🎯 Deployment Options

| Option | Cost | Complexity | Scalability | Best For |
|--------|------|-----------|------------|----------|
| **Heroku** | $7-50/mo | ⭐ Low | Medium | Quick deployment |
| **Docker + VPS** | $5-20/mo | ⭐⭐ Medium | High | Full control |
| **AWS** | $10-100+/mo | ⭐⭐⭐ High | Very High | Enterprise |
| **DigitalOcean** | $5-40/mo | ⭐⭐ Medium | High | Developer-friendly |
| **Electron Desktop** | Free | ⭐⭐ Medium | N/A | Desktop app |

---

## 🟣 Heroku Deployment

### Step 1: Install Heroku CLI

```bash
# macOS
brew tap heroku/brew && brew install heroku

# Linux
curl https://cli-assets.heroku.com/install.sh | sh

# Windows
# Download from https://devcenter.heroku.com/articles/heroku-cli
```

### Step 2: Create Heroku App

```bash
heroku login
heroku create supersid-pro-analytics
```

### Step 3: Set Environment Variables

```bash
heroku config:set NODE_ENV=production
heroku config:set DATABASE_PATH=/app/data/supersid.db
heroku config:set BACKEND_PORT=3001
heroku config:set CORS_ORIGIN=https://supersid-pro-analytics.herokuapp.com
```

### Step 4: Configure Procfile

Create `Procfile`:

```
web: npm run build && npm start
```

### Step 5: Deploy

```bash
git push heroku main
```

### Step 6: View Logs

```bash
heroku logs --tail
```

### Heroku Limitations

⚠️ **Important:**
- Database resets on dyno restart (use Heroku Postgres addon)
- Limited to 512MB RAM on free tier
- Sleeps after 30 mins of inactivity on free tier

### Add Heroku Postgres

```bash
heroku addons:create heroku-postgresql:hobby-dev
heroku config
```

---

## 🐳 Docker Deployment

### Step 1: Create Dockerfile

Already created! Check `Dockerfile`

### Step 2: Build Docker Image

```bash
docker build -t supersid-pro:latest .
```

### Step 3: Run Container Locally

```bash
docker run -p 3000:3000 -p 3001:3001 \
  -e NODE_ENV=production \
  -e DATABASE_PATH=/app/data/supersid.db \
  supersid-pro:latest
```

### Step 4: Push to Docker Hub

```bash
# Login to Docker Hub
docker login

# Tag image
docker tag supersid-pro:latest yourusername/supersid-pro:latest

# Push
docker push yourusername/supersid-pro:latest
```

### Step 5: Deploy to VPS

```bash
# SSH into VPS
ssh user@your-vps-ip

# Pull image
docker pull yourusername/supersid-pro:latest

# Run with docker-compose
docker-compose up -d
```

### Docker Compose (docker-compose.yml)

```yaml
version: '3.8'

services:
  app:
    image: yourusername/supersid-pro:latest
    ports:
      - "3000:3000"
      - "3001:3001"
    environment:
      NODE_ENV: production
      DATABASE_PATH: /app/data/supersid.db
      BACKEND_PORT: 3001
      CORS_ORIGIN: https://your-domain.com
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: always

volumes:
  data:
  logs:
```

### Deploy

```bash
docker-compose up -d
```

### View Logs

```bash
docker-compose logs -f app
```

---

## ☁️ AWS Deployment

### Option A: Elastic Beanstalk (Easiest)

#### Step 1: Install EB CLI

```bash
pip install awsebcli --upgrade --user
```

#### Step 2: Initialize

```bash
eb init -p node.js-18 supersid-pro --region us-east-1
```

#### Step 3: Create Environment

```bash
eb create supersid-prod
```

#### Step 4: Deploy

```bash
eb deploy
```

#### Step 5: Monitor

```bash
eb status
eb logs
```

### Option B: EC2 + RDS

#### Step 1: Launch EC2 Instance

- AMI: Ubuntu 22.04 LTS
- Instance Type: t3.medium (recommended)
- Storage: 20GB gp3
- Security Group: Allow 80, 443, 3001

#### Step 2: SSH and Setup

```bash
ssh -i your-key.pem ubuntu@your-instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone repository
git clone https://github.com/yourusername/SuperSID_Project.git
cd SuperSID_Project
npm install
npm run build
```

#### Step 3: Start with PM2

```bash
pm2 start npm --name "supersid-pro" -- start
pm2 save
pm2 startup
```

#### Step 4: Setup Nginx Reverse Proxy

```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/default
```

Add:

```nginx
upstream supersid {
    server localhost:3001;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://supersid;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo systemctl restart nginx
```

#### Step 5: SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

---

## 💧 DigitalOcean Deployment

### Step 1: Create Droplet

- OS: Ubuntu 22.04
- Plan: $5-10/mo
- Region: Choose closest to you

### Step 2: SSH Setup

```bash
ssh root@your-droplet-ip

# Create non-root user
adduser appuser
usermod -aG sudo appuser
su - appuser
```

### Step 3: Install Dependencies

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs nginx git curl

sudo npm install -g pm2
```

### Step 4: Clone and Setup

```bash
git clone https://github.com/yourusername/SuperSID_Project.git
cd SuperSID_Project
npm install
npm run build
```

### Step 5: Deploy with PM2

```bash
pm2 start npm --name "supersid" -- start
pm2 save
pm2 startup
```

### Step 6: Add Domain

1. Go to DigitalOcean Control Panel
2. Add domain
3. Create A record pointing to Droplet IP

### Step 7: SSL with Let's Encrypt

```bash
sudo certbot certonly --standalone -d your-domain.com
```

---

## 📦 Electron Desktop App

### Build for All Platforms

```bash
npm run dist
```

Creates installers in `dist/`:

```
dist/
├── SuperSID Pro-1.0.0.exe          # Windows
├── SuperSID Pro-1.0.0.dmg          # macOS
├── SuperSID Pro-1.0.0.AppImage     # Linux
└── SuperSID Pro-1.0.0.tar.gz       # Linux tar
```

### Build for Specific Platform

```bash
# Windows only
npm run dist -- --win

# macOS only
npm run dist -- --mac

# Linux only
npm run dist -- --linux
```

### Notarize macOS App

```bash
# Required for distribution
export APPLE_ID=your-email@example.com
export APPLE_PASSWORD=your-app-password
export APPLE_TEAM_ID=XXXXXXXXXX

npm run dist -- --mac --publish=never
```

### Code Signing (Windows)

Set in `package.json`:

```json
"build": {
  "win": {
    "certificateFile": "path/to/certificate.pfx",
    "certificatePassword": "password",
    "signingHashAlgorithms": ["sha256"],
    "sign": "./customSign.js"
  }
}
```

---

## ⚙️ Production Configuration

### Environment Variables

Create `.env.production`:

```env
# Server
NODE_ENV=production
BACKEND_PORT=3001
FRONTEND_PORT=3000

# Database
DATABASE_PATH=/var/data/supersid/supersid.db
DATABASE_BACKUP=/var/backups/supersid/

# Security
CORS_ORIGIN=https://your-domain.com
API_RATE_LIMIT=100
SESSION_SECRET=your-secret-key-here

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/supersid/app.log

# External APIs
SPACE_WEATHER_API=https://api.spaceweatherlive.com/v1
SPACE_WEATHER_API_KEY=your-api-key

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
DATADOG_API_KEY=your-datadog-key
```

### PM2 Ecosystem File

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
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'data'],
      max_memory_restart: '1G',
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
  deploy: {
    production: {
      user: 'appuser',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/SuperSID_Project.git',
      path: '/var/www/supersid-pro',
      'post-deploy': 'npm install && npm run build && pm2 restart ecosystem.config.js --env production',
    },
  },
};
```

---

## 📊 Monitoring & Maintenance

### Health Check Endpoint

Add to `server.ts`:

```typescript
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});
```

### Logging Setup

```bash
# Create log directory
mkdir -p logs
chmod 755 logs

# Rotate logs with logrotate
sudo nano /etc/logrotate.d/supersid-pro
```

Add:

```
/var/log/supersid/*.log {
  daily
  rotate 14
  compress
  delaycompress
  notifempty
  create 0640 appuser appuser
  sharedscripts
  postrotate
    pm2 reload ecosystem.config.js > /dev/null 2>&1 || true
  endscript
}
```

### Backup Strategy

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/var/backups/supersid"
DB_FILE="/var/data/supersid/supersid.db"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
cp $DB_FILE $BACKUP_DIR/supersid_$DATE.db
gzip $BACKUP_DIR/supersid_$DATE.db

# Keep last 30 days
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/supersid_$DATE.db.gz"
```

Schedule with cron:

```bash
crontab -e
# Add: 0 2 * * * /usr/local/bin/backup.sh
```

### Monitoring with Datadog

```bash
# Install Datadog agent
DD_AGENT_MAJOR_VERSION=7 DD_API_KEY=your-key DD_SITE=datadoghq.com bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_agent.sh)"
```

### Monitoring with Sentry

```bash
npm install --save @sentry/node @sentry/tracing
```

In `server.ts`:

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({ dsn: process.env.SENTRY_DSN });
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

---

## 🔄 Rollback Procedures

### Rollback from Git

```bash
# Revert to previous commit
git revert HEAD
git push production main

# Or reset to specific commit
git reset --hard abc1234
git push -f production main
```

### Rollback with PM2

```bash
# Save current version
pm2 save

# Rollback database
mv /var/backups/supersid/supersid_backup.db /var/data/supersid/supersid.db

# Restart
pm2 restart all
```

### Rollback Docker Image

```bash
# Switch to previous image
docker tag yourusername/supersid-pro:previous yourusername/supersid-pro:latest
docker-compose up -d
```

---

## 🆘 Troubleshooting Deployment

### App Won't Start

```bash
# Check logs
pm2 logs supersid-pro

# Check port
lsof -i :3001

# Check permissions
ls -la /var/data/supersid/
```

### Database Connection Failed

```bash
# Check database file
ls -la /var/data/supersid/supersid.db

# Check SQLite
sqlite3 /var/data/supersid/supersid.db ".tables"

# Reset database
rm /var/data/supersid/supersid.db
npm run dev:backend
```

### SSL Certificate Issues

```bash
# Renew certificate
sudo certbot renew

# Check expiration
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clear logs
rm -rf /var/log/supersid/*

# Clear old backups
find /var/backups/supersid -mtime +30 -delete
```

---

## ✅ Post-Deployment

### Verification Steps

1. ✅ Test health endpoint: `curl https://your-domain.com/health`
2. ✅ Access dashboard: `https://your-domain.com`
3. ✅ Check logs: `pm2 logs supersid-pro`
4. ✅ Monitor performance: Check Datadog/Sentry
5. ✅ Test API: `curl https://your-domain.com/api/analysis/space-weather`

### Performance Optimization

```bash
# Enable compression
# nginx.conf
gzip on;
gzip_types text/plain application/json;
gzip_min_length 1024;

# Cache static files
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 365d;
    add_header Cache-Control "public, immutable";
}
```

---

## 📞 Support

For deployment issues:
- Check logs: `pm2 logs`
- Monitor: Check Datadog/Sentry dashboards
- Contact: support@supersid-pro.com

---

**Last Updated**: 2025-11-03
**Version**: 1.0.0