# Nepal Election Portal - Professional Deployment Guide

## 📋 Table of Contents

1. [Project Overview & Tech Stack Analysis](#project-overview--tech-stack-analysis)
2. [Component Breakdown](#component-breakdown)
3. [Deployment Architecture](#deployment-architecture)
4. [Frontend Deployment Options](#1-frontend-deployment-react--vite)
5. [Backend Deployment Options](#2-backend-deployment-nodejs--express)
6. [Database Hosting Options](#3-database-hosting-mysql)
7. [File Storage Options](#4-file-storage-pdf-uploads)
8. [Complete Deployment Scenarios](#complete-deployment-scenarios)
9. [Environment Configuration](#environment-configuration)
10. [Cost Summary Tables](#cost-summary-tables)
11. [Recommended Production Setup](#recommended-production-setup)
12. [Step-by-Step Deployment Instructions](#step-by-step-deployment-instructions)

---

## Project Overview & Tech Stack Analysis

### What This Project Contains

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | React 18 + TypeScript + Vite | Public-facing election information portal |
| **Backend** | Node.js + Express.js | RESTful API server |
| **Database** | MySQL + Sequelize ORM | Data persistence |
| **File Storage** | Local disk (Multer) | PDF document storage |
| **Authentication** | JWT (jsonwebtoken) | Admin authentication |
| **UI Framework** | Tailwind CSS + shadcn/ui | Styling and components |

### Resource Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| Node.js | v18.0.0 | v20 LTS |
| MySQL | v8.0 | v8.0+ |
| RAM (Backend) | 512MB | 1GB+ |
| Storage | 1GB | 5GB+ (for PDFs) |
| Bandwidth | 10GB/mo | 100GB+/mo |

---

## Component Breakdown

### 🎨 Frontend Component

**Type:** Static Site / Single Page Application (SPA)

**Build Output:** Static HTML, CSS, JS files

**Build Command:** `npm run build` → outputs to `dist/` folder

**Characteristics:**
- Can be served from any static hosting provider
- No server-side processing required
- Requires VITE_API_URL environment variable to connect to backend
- Production build is ~2-5MB

### ⚙️ Backend Component

**Type:** Node.js Application Server

**Entry Point:** `src/server.js`

**Start Command:** `npm start` or `node src/server.js`

**Characteristics:**
- Requires persistent server (not serverless-friendly for file uploads)
- Handles API requests, authentication, file uploads
- Requires MySQL database connection
- Serves uploaded files from `/uploads` directory

### 🗄️ Database Component

**Type:** MySQL Relational Database

**Tables:** 5 main tables
- `admin_users` - Admin authentication
- `voter_educations` - Educational content
- `election_integrities` - Election integrity resources
- `newsletters` - Newsletter content
- `political_parties` - Party information

**Size Estimate:** < 100MB (primarily text data, PDFs stored separately)

### 📁 File Storage Component

**Type:** PDF document storage

**Current Implementation:** Local disk storage via Multer

**File Types:** PDF only (max 50MB per file)

**Storage Structure:**
```
uploads/
├── voter-education/
├── election-integrity/
├── newsletters/
├── parties/
└── general/
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PRODUCTION ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────────┐         ┌──────────────┐         ┌────────────┐ │
│   │   Frontend   │ ──────► │   Backend    │ ──────► │  Database  │ │
│   │  (Static)    │         │  (Node.js)   │         │  (MySQL)   │ │
│   │              │         │              │         │            │ │
│   │  Vercel /    │   API   │  Railway /   │   SQL   │ PlanetScale│ │
│   │  Netlify /   │  Calls  │  Render /    │ Queries │ / Aiven /  │ │
│   │  Cloudflare  │         │  DigitalOcean│         │ Railway    │ │
│   └──────────────┘         └──────┬───────┘         └────────────┘ │
│                                   │                                 │
│                                   │ File Storage                    │
│                                   ▼                                 │
│                          ┌──────────────┐                          │
│                          │ File Storage │                          │
│                          │              │                          │
│                          │ Cloudinary / │                          │
│                          │ S3 / Local   │                          │
│                          └──────────────┘                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 1. Frontend Deployment (React + Vite)

### FREE Options ✅

#### A. Vercel (Recommended - FREE)
| Aspect | Details |
|--------|---------|
| **Pricing** | FREE (Hobby tier) |
| **Bandwidth** | 100GB/month |
| **Builds** | Unlimited |
| **Custom Domain** | ✅ Free SSL |
| **Deployment** | Automatic via Git |

**Deployment Steps:**
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login and deploy
cd frontend
vercel

# 3. Set environment variable
vercel env add VITE_API_URL production
```

#### B. Netlify (FREE)
| Aspect | Details |
|--------|---------|
| **Pricing** | FREE (Starter tier) |
| **Bandwidth** | 100GB/month |
| **Build Minutes** | 300/month |
| **Custom Domain** | ✅ Free SSL |

#### C. Cloudflare Pages (FREE)
| Aspect | Details |
|--------|---------|
| **Pricing** | FREE |
| **Bandwidth** | Unlimited |
| **Builds** | 500/month |
| **Custom Domain** | ✅ Free SSL |

#### D. GitHub Pages (FREE)
| Aspect | Details |
|--------|---------|
| **Pricing** | FREE |
| **Bandwidth** | 100GB/month |
| **Limitation** | Public repos only (free tier) |

### PAID Options 💰

#### Vercel Pro
| Aspect | Details |
|--------|---------|
| **Pricing** | $20/month per member |
| **Bandwidth** | 1TB/month |
| **Best For** | Team collaboration, preview deploys |

#### AWS Amplify
| Aspect | Details |
|--------|---------|
| **Pricing** | ~$0.15/GB served |
| **Best For** | AWS ecosystem integration |

---

## 2. Backend Deployment (Node.js + Express)

### FREE Options ✅

#### A. Railway (Recommended - FREE Tier)
| Aspect | Details |
|--------|---------|
| **Pricing** | FREE ($5 credit/month) |
| **RAM** | 512MB |
| **Storage** | 1GB |
| **Limitation** | ~500 hours/month |

**Why Railway:**
- Easy deployment with Dockerfile or Nixpacks
- Built-in MySQL database option
- Automatic HTTPS
- Environment variable management

#### B. Render (FREE Tier)
| Aspect | Details |
|--------|---------|
| **Pricing** | FREE |
| **RAM** | 512MB |
| **Limitation** | Spins down after 15min inactivity |
| **Cold Start** | 30-60 seconds |

⚠️ **Note:** Free tier has spin-down which causes slow first requests

#### C. Fly.io (FREE Tier)
| Aspect | Details |
|--------|---------|
| **Pricing** | FREE (3 shared VMs) |
| **RAM** | 256MB each |
| **Storage** | 3GB total |

#### D. Cyclic.sh (FREE)
| Aspect | Details |
|--------|---------|
| **Pricing** | FREE |
| **Limitation** | 100K requests/month |
| **Best For** | Low traffic APIs |

### PAID Options 💰

#### A. Railway Pro (Recommended Paid)
| Aspect | Details |
|--------|---------|
| **Pricing** | $5/month + usage (~$5-20/month total) |
| **RAM** | Configurable |
| **Always On** | ✅ |
| **Best For** | Production workloads |

#### B. DigitalOcean App Platform
| Aspect | Details |
|--------|---------|
| **Pricing** | $5/month (Basic) |
| **RAM** | 512MB |
| **Always On** | ✅ |
| **Managed** | Auto-scaling available |

#### C. DigitalOcean Droplet (Best Value)
| Aspect | Details |
|--------|---------|
| **Pricing** | $4-6/month |
| **RAM** | 512MB-1GB |
| **Full Control** | ✅ |
| **Best For** | Combined backend + file storage |

#### D. AWS EC2 / Lightsail
| Aspect | Details |
|--------|---------|
| **Pricing** | $3.50-5/month (Lightsail) |
| **RAM** | 512MB-1GB |
| **Best For** | AWS ecosystem |

#### E. Heroku
| Aspect | Details |
|--------|---------|
| **Pricing** | $5/month (Eco tier) |
| **RAM** | 512MB |
| **Limitation** | No free tier anymore |

---

## 3. Database Hosting (MySQL)

### FREE Options ✅

#### A. PlanetScale (Recommended - FREE)
| Aspect | Details |
|--------|---------|
| **Pricing** | FREE (Scaler tier) |
| **Storage** | 5GB |
| **Row Reads** | 1B/month |
| **Row Writes** | 10M/month |
| **Branches** | ✅ (Dev/Production) |

⚠️ **Note:** PlanetScale uses MySQL-compatible Vitess, some Sequelize features may need adjustment

#### B. Railway MySQL (FREE with credits)
| Aspect | Details |
|--------|---------|
| **Pricing** | Part of $5 free credit |
| **Storage** | 1GB (shared with app) |
| **Best For** | All-in-one Railway deployment |

#### C. Aiven MySQL (FREE Tier)
| Aspect | Details |
|--------|---------|
| **Pricing** | FREE (Hobbyist) |
| **Storage** | Limited |
| **Limitation** | Single node, no backups |

#### D. TiDB Cloud (FREE)
| Aspect | Details |
|--------|---------|
| **Pricing** | FREE (Serverless Tier) |
| **Storage** | 25GB |
| **MySQL Compatible** | ✅ |

#### E. Clever Cloud MySQL (FREE Tier)
| Aspect | Details |
|--------|---------|
| **Pricing** | FREE (Dev tier) |
| **Storage** | 256MB |
| **Limitation** | Very limited storage |

### PAID Options 💰

#### A. PlanetScale Scaler Pro
| Aspect | Details |
|--------|---------|
| **Pricing** | $29/month |
| **Storage** | 10GB included |
| **Best For** | Production with scaling |

#### B. DigitalOcean Managed MySQL
| Aspect | Details |
|--------|---------|
| **Pricing** | $15/month |
| **Storage** | 10GB |
| **Features** | Automated backups, standby |

#### C. AWS RDS MySQL
| Aspect | Details |
|--------|---------|
| **Pricing** | ~$15-30/month (db.t3.micro) |
| **Best For** | AWS ecosystem |

#### D. Railway MySQL (Paid)
| Aspect | Details |
|--------|---------|
| **Pricing** | ~$5-10/month |
| **Best For** | Easy integration |

---

## 4. File Storage (PDF Uploads)

### Current Implementation Analysis

Your project uses **local disk storage** via Multer. For production deployment, you have two paths:

### Option A: Keep Local Storage (VPS Required)

If you deploy backend on a VPS (DigitalOcean Droplet, AWS EC2, etc.), you can keep the current implementation.

**Pros:**
- No code changes needed
- No additional service costs
- Full control

**Cons:**
- Need VPS (not compatible with serverless)
- Manual backup required
- Storage limited to VPS disk

### Option B: Cloud Storage (Recommended for Scalability)

#### Cloudinary (FREE Tier) ⭐ Recommended
| Aspect | Details |
|--------|---------|
| **Pricing** | FREE |
| **Storage** | 25GB |
| **Bandwidth** | 25GB/month |
| **Transformations** | 25K/month |
| **PDF Support** | ✅ |

**Required Code Change:** Modify `backend/src/utils/upload.js` to use Cloudinary SDK

#### AWS S3 (Pay-as-you-go)
| Aspect | Details |
|--------|---------|
| **Pricing** | $0.023/GB storage + transfer |
| **First Year** | 5GB free (AWS Free Tier) |
| **Best For** | High volume, AWS ecosystem |

#### DigitalOcean Spaces (Cheap)
| Aspect | Details |
|--------|---------|
| **Pricing** | $5/month (250GB included) |
| **Best For** | Cost-effective cloud storage |

#### Backblaze B2 (Cheapest)
| Aspect | Details |
|--------|---------|
| **Pricing** | $0.006/GB storage |
| **Free** | 10GB |
| **Best For** | Budget cloud storage |

---

## Complete Deployment Scenarios

### 🆓 Scenario 1: 100% FREE Deployment

| Component | Service | Cost | Limitations |
|-----------|---------|------|-------------|
| Frontend | Vercel | FREE | 100GB bandwidth |
| Backend | Railway | FREE | ~500 hrs/month |
| Database | PlanetScale | FREE | 5GB storage |
| Files | Cloudinary | FREE | 25GB storage |
| **TOTAL** | | **$0/month** | Some limitations |

**Best For:** Development, testing, low-traffic sites

**Expected Capacity:** ~1,000-5,000 visitors/month

---

### 💰 Scenario 2: Budget Production ($10-15/month)

| Component | Service | Cost |
|-----------|---------|------|
| Frontend | Vercel | FREE |
| Backend | Railway Pro | $5-10/month |
| Database | Railway MySQL | Included |
| Files | Cloudinary (Free) | FREE |
| **TOTAL** | | **$5-10/month** |

**Best For:** Small production sites, startups

**Expected Capacity:** ~10,000-50,000 visitors/month

---

### 💎 Scenario 3: Professional Production ($25-40/month)

| Component | Service | Cost |
|-----------|---------|------|
| Frontend | Vercel Pro | $20/month |
| Backend | DigitalOcean Droplet | $6/month |
| Database | DigitalOcean MySQL | $15/month |
| Files | Local on Droplet | Included |
| **TOTAL** | | **$41/month** |

OR

| Component | Service | Cost |
|-----------|---------|------|
| Frontend | Cloudflare Pages | FREE |
| Backend | DigitalOcean Droplet | $12/month (2GB) |
| Database | On Droplet | Included |
| Files | On Droplet | Included |
| **TOTAL** | | **$12/month** |

**Best For:** Production sites, moderate traffic

**Expected Capacity:** ~50,000-200,000 visitors/month

---

### 🏢 Scenario 4: Enterprise Production ($100+/month)

| Component | Service | Cost |
|-----------|---------|------|
| Frontend | AWS CloudFront + S3 | ~$20/month |
| Backend | AWS ECS/EC2 Auto-scaling | ~$50-100/month |
| Database | AWS RDS Multi-AZ | ~$50-100/month |
| Files | AWS S3 | ~$10/month |
| **TOTAL** | | **$130-230/month** |

**Best For:** High traffic, mission-critical applications

**Expected Capacity:** 500,000+ visitors/month

---

## Cost Summary Tables

### Free vs Paid Comparison

| Service Type | Free Option | Paid Option | When to Upgrade |
|--------------|-------------|-------------|-----------------|
| **Frontend** | Vercel/Netlify | Vercel Pro ($20/mo) | Team features, custom limits |
| **Backend** | Railway Free | Railway Pro ($5/mo) | Always-on, more resources |
| **Database** | PlanetScale Free | Managed MySQL ($15/mo) | More storage, backups |
| **Files** | Cloudinary Free | S3 ($5-20/mo) | More storage, bandwidth |

### One-Time vs Subscription Costs

| Cost Type | Examples |
|-----------|----------|
| **One-Time** | Domain name (~$10-15/year), SSL (usually free) |
| **Subscription** | Hosting, Database, CDN |
| **Usage-Based** | AWS/GCP services, bandwidth overages |

---

## Environment Configuration

### Production Environment Variables

#### Backend (.env.production)
```env
# Server
PORT=5000
NODE_ENV=production

# Database (PlanetScale example)
DB_HOST=aws.connect.psdb.cloud
DB_PORT=3306
DB_NAME=nepal_election_portal
DB_USER=your_username
DB_PASSWORD=your_password
DATABASE_URL=mysql://user:pass@host:3306/db

# JWT
JWT_SECRET=your-very-long-secure-random-string-minimum-32-chars
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=https://your-domain.com

# Admin (change after first setup)
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=SecurePassword123!

# File Storage (if using Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Frontend (.env.production)
```env
VITE_API_URL=https://api.your-domain.com/api
VITE_BACKEND_URL=https://api.your-domain.com
```

---

## Recommended Production Setup

### For This Election Portal Project

Given the nature of this project (election information portal), I recommend:

#### Tier 1: Budget-Conscious (Best Value)
```
Frontend: Cloudflare Pages (FREE, unlimited bandwidth)
Backend:  Railway Pro ($5/month)
Database: Railway MySQL (included)
Files:    Cloudinary Free (25GB)
Domain:   Cloudflare ($10/year)
─────────────────────────────────
Total:    ~$5-7/month + $10/year domain
```

#### Tier 2: Reliable Production
```
Frontend: Vercel (FREE)
Backend:  DigitalOcean Droplet 1GB ($6/month)
Database: On Droplet (MySQL installed)
Files:    On Droplet
Domain:   Any registrar ($10-15/year)
SSL:      Let's Encrypt (FREE)
─────────────────────────────────
Total:    ~$6-7/month + domain
```

---

## Step-by-Step Deployment Instructions

### Option A: Deploy to Railway (Easiest - Recommended)

#### Step 1: Prepare Repository
```bash
# Ensure your project is in a Git repository
cd Election-Portal-ALN
git init
git add .
git commit -m "Initial commit for deployment"

# Push to GitHub
git remote add origin https://github.com/yourusername/election-portal.git
git push -u origin main
```

#### Step 2: Deploy Backend to Railway
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Set the root directory to `backend`
5. Add environment variables:
   ```
   NODE_ENV=production
   JWT_SECRET=your-secret-key
   FRONTEND_URL=https://your-frontend-url.com
   ADMIN_EMAIL=admin@election.com
   ADMIN_PASSWORD=SecurePass123!
   ```
6. Railway will auto-detect Node.js and deploy

#### Step 3: Add MySQL Database
1. In Railway, click "New" → "Database" → "MySQL"
2. Railway automatically sets `DATABASE_URL`
3. Update your `database.js` to support `DATABASE_URL`:

```javascript
// Add this to backend/src/config/database.js
const sequelize = process.env.DATABASE_URL 
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'mysql',
      logging: false,
      dialectOptions: {
        ssl: { rejectUnauthorized: false }
      }
    })
  : new Sequelize(/* existing config */);
```

#### Step 4: Deploy Frontend to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project" → Import Git repository
3. Set root directory to `frontend`
4. Add environment variable:
   ```
   VITE_API_URL=https://your-railway-backend-url.up.railway.app/api
   ```
5. Deploy

#### Step 5: Seed Admin User
```bash
# In Railway, open the terminal for your backend service
npm run seed:admin
```

### Option B: Deploy to DigitalOcean Droplet (Full Control)

#### Step 1: Create Droplet
1. Go to [digitalocean.com](https://digitalocean.com)
2. Create Droplet → Ubuntu 22.04 → Basic → $6/month plan
3. Add SSH key or password

#### Step 2: Server Setup
```bash
# SSH into droplet
ssh root@your-droplet-ip

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# Install MySQL
apt install mysql-server -y
mysql_secure_installation

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx (reverse proxy)
apt install nginx -y
```

#### Step 3: Setup MySQL Database
```bash
mysql -u root -p

CREATE DATABASE nepal_election_portal;
CREATE USER 'election_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON nepal_election_portal.* TO 'election_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Step 4: Deploy Backend
```bash
# Clone repository
cd /var/www
git clone https://github.com/yourusername/election-portal.git
cd election-portal/backend

# Install dependencies
npm install --production

# Create .env file
nano .env
# Add your production environment variables

# Seed admin
npm run seed:admin

# Start with PM2
pm2 start src/server.js --name "election-api"
pm2 save
pm2 startup
```

#### Step 5: Configure Nginx
```bash
nano /etc/nginx/sites-available/election-api

# Add configuration:
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /uploads {
        alias /var/www/election-portal/backend/uploads;
    }
}

# Enable site
ln -s /etc/nginx/sites-available/election-api /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

#### Step 6: Add SSL with Let's Encrypt
```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d api.yourdomain.com
```

#### Step 7: Deploy Frontend to Vercel
(Same as Option A, Step 4)

---

## Security Checklist for Production

- [ ] Change default admin password after first login
- [ ] Use strong JWT_SECRET (32+ random characters)
- [ ] Enable HTTPS on all endpoints
- [ ] Set proper CORS origins (not `*`)
- [ ] Configure rate limiting
- [ ] Set up database backups
- [ ] Use environment variables for all secrets
- [ ] Enable security headers (already using Helmet)
- [ ] Set NODE_ENV=production
- [ ] Remove development dependencies

---

## Monitoring & Maintenance

### Free Monitoring Options
- **UptimeRobot** (FREE) - Uptime monitoring
- **Railway/Vercel Logs** - Built-in logging
- **Sentry** (FREE tier) - Error tracking

### Recommended Maintenance Tasks
| Task | Frequency |
|------|-----------|
| Database backup | Daily |
| Log review | Weekly |
| Security updates | Monthly |
| SSL renewal | Auto with Let's Encrypt |
| Dependency updates | Monthly |

---

## Summary Decision Matrix

| If You Need... | Choose This Setup | Monthly Cost |
|----------------|-------------------|--------------|
| Just testing/development | Railway + Vercel (free) | $0 |
| Low traffic production | Railway Pro + Vercel | $5-10 |
| Full control | DigitalOcean Droplet | $6-12 |
| High reliability | Managed services | $30-50 |
| Enterprise scale | AWS/GCP | $100+ |

---

## Quick Reference

### Domain Setup
- **Namecheap/Cloudflare:** ~$10-15/year for `.com`
- **Freenom:** FREE for `.tk`, `.ml` domains (not recommended for production)

### SSL Certificates
- **Let's Encrypt:** FREE (90-day auto-renewal)
- **Cloudflare:** FREE (proxied domains)
- **Paid SSL:** $10-100/year (rarely needed)

### Estimated Total Costs

| Setup Level | Monthly | Yearly |
|-------------|---------|--------|
| Free Tier | $0 | ~$10 (domain only) |
| Budget | $5-10 | $70-130 |
| Professional | $20-40 | $250-500 |
| Enterprise | $100+ | $1200+ |

---

*Document prepared for Nepal Election Portal 2082 - Accountability Lab Nepal*

*Last Updated: February 2026*
