# 🚀 Hostinger VPS Deployment Guide — Shri Shyam Properties

Complete step-by-step guide to deploy your full-stack application on Hostinger VPS.

---

## Step 1: Prepare your VPS

Log in via SSH and install Docker + Docker Compose:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install -y docker-compose

# Verify installation
docker --version
docker-compose --version
```

---

## Step 2: Transfer your Project

**Option A — Using Git (Recommended):**
```bash
git clone <your-repo-url>
cd shrishyam
```

**Option B — Using SCP from your local machine:**
```bash
scp -r C:\Users\user\Desktop\shrishyam user@YOUR_VPS_IP:/home/user/shrishyam
```

---

## Step 2.5: Setup Cloudinary (FREE Image Storage) ⚠️ Required

Images are stored on Cloudinary — you **must** do this before deploying.

1. Go to **[https://cloudinary.com](https://cloudinary.com)** → Sign Up (free)
2. After login, go to your **Dashboard**
3. Copy these 3 values:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
4. You will paste these in the `.env` file in Step 3.

> Free tier gives you **25GB storage + 25GB bandwidth/month** — more than enough!

---

## Step 3: Configure Environment

```bash
cd shrishyam
cp .env.example .env
nano .env
```

**Edit these values in `.env`:**

```env
# Database — use a strong password
DB_PASSWORD=your_strong_db_password

# Admin credentials — CHANGE THESE!
ADMIN_EMAIL=your-email@gmail.com
ADMIN_PASSWORD=your_strong_admin_password
ADMIN_NAME=YourName
ADMIN_PHONE=9999999999

# JWT Secret — paste a long random string (min 64 chars)
JWT_SECRET=paste_a_very_long_random_string_here_minimum_64_characters

# Cloudinary — from your Cloudinary Dashboard
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# IMPORTANT: Use your domain (recommended) or VPS IP
# If you have a domain with Nginx:
API_URL=https://kanharaj.com/api
# If running without domain (IP only):
# API_URL=http://YOUR_VPS_PUBLIC_IP:3000/api
```

> ⚠️ **IMPORTANT:** If using a domain with Nginx (e.g. kanharaj.com), set `API_URL=https://kanharaj.com/api`
> This ensures images load without mixed-content errors.
> If no domain, set it to `http://YOUR_IP:3000/api` (port 3000, not 8080)

---

## Step 4: Open Firewall Ports (Hostinger Panel)

In your **Hostinger VPS Panel → Firewall**, allow these ports:
- `22` — SSH
- `3000` — Frontend
- `8080` — Backend API
- `3306` — MySQL (only if you need external DB access — optional)

---

## Step 5: Deploy with Docker

```bash
docker-compose up -d --build
```

This will:
1. Build the Spring Boot backend JAR
2. Build the Next.js frontend
3. Start MySQL, Backend, and Frontend containers

**First build takes ~5-10 minutes.** After that it's fast.

---

## Step 6: Verify Deployment

```bash
# Check all containers are running
docker-compose ps

# Check backend logs
docker-compose logs backend

# Check frontend logs
docker-compose logs frontend
```

**Access your app:**
- 🌐 **Frontend:** `http://YOUR_VPS_IP:3000`
- 🔧 **Backend API:** `http://YOUR_VPS_IP:8080/api`
- 👤 **Admin Panel:** `http://YOUR_VPS_IP:3000/admin`

---

## Step 7 (Optional): Setup Domain with Nginx Reverse Proxy

If you have a domain (e.g., `shrishyam.com`), install Nginx to route traffic:

```bash
sudo apt install -y nginx

sudo nano /etc/nginx/sites-available/shrishyam
```

Paste this config:

```nginx
server {
    listen 80;
    server_name shrishyam.com www.shrishyam.com;

    # Allow large file uploads (413 Request Entity Too Large fix)
    client_max_body_size 100M;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/shrishyam /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Useful Commands

```bash
# Stop all containers
docker-compose down

# Restart everything
docker-compose restart

# View real-time logs
docker-compose logs -f

# Rebuild after code changes
docker-compose up -d --build

# Check container resource usage
docker stats
```

---

## Architecture

```
Internet
    │
    ├── :3000 → Frontend (Next.js — Standalone)
    │               │
    │               └── API calls → :8080/api
    │
    └── :8080 → Backend (Spring Boot)
                    │
                    └── :3306 → MySQL (Docker Volume)
```
