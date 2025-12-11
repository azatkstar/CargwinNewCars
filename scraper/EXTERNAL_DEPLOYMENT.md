# External Scraper Deployment Guide

## Overview

Hunter.Lease Scraper не может работать в Emergent sandbox из-за Puppeteer/Chrome requirements.
Нужен отдельный server или serverless setup.

---

## Option 1: AWS Lambda + Puppeteer Layer

### Setup:

1. **Create Lambda Function:**
```bash
# Install Serverless Framework
npm install -g serverless

# Create project
serverless create --template aws-nodejs --path hunter-scraper-lambda
```

2. **Add Puppeteer Layer:**
```yaml
# serverless.yml
service: hunter-scraper

provider:
  name: aws
  runtime: nodejs20.x
  region: us-west-2
  timeout: 300
  memorySize: 2048
  
functions:
  scraper:
    handler: handler.scrape
    events:
      - schedule: cron(0 4 * * ? *)  # Daily 4AM
    layers:
      - arn:aws:lambda:us-west-2:764866452798:layer:chrome-aws-lambda:45
    environment:
      HUNTER_API_URL: https://carlease-pro.emergent.host/api
      HUNTER_ADMIN_TOKEN: ${env:ADMIN_TOKEN}
```

3. **Deploy:**
```bash
serverless deploy
```

---

## Option 2: Separate VPS (DigitalOcean/AWS EC2)

### Requirements:
- Ubuntu 22.04
- Node.js 20
- Chrome/Chromium

### Setup:

```bash
# 1. Install dependencies
sudo apt update
sudo apt install -y nodejs npm chromium-browser

# 2. Clone scraper
git clone <your-repo> /opt/hunter-scraper
cd /opt/hunter-scraper/scraper

# 3. Install packages
npm install

# 4. Configure
cat > .env << EOF
HUNTER_API_URL=https://carlease-pro.emergent.host/api
HUNTER_ADMIN_TOKEN=your_admin_token_here
USE_MOCK_SCRAPER=false
EOF

# 5. Install PM2
npm install -g pm2

# 6. Start scraper scheduler
pm2 start scheduler/cronManager.js --name hunter-scraper
pm2 save
pm2 startup

# 7. Monitor
pm2 logs hunter-scraper
```

---

## Option 3: Docker Container

### Dockerfile:

```dockerfile
FROM node:20-slim

# Install Chrome
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY scraper/package*.json ./
RUN npm install

COPY scraper/ ./

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

CMD ["node", "scheduler/cronManager.js"]
```

### Deploy:

```bash
docker build -t hunter-scraper .
docker run -d \
  -e HUNTER_API_URL=https://carlease-pro.emergent.host/api \
  -e HUNTER_ADMIN_TOKEN=your_token \
  hunter-scraper
```

---

## Option 4: Render.com (Easiest)

### Setup:

1. Create account on Render.com
2. New > Background Worker
3. Connect GitHub repo
4. Configure:
   - Build: `cd scraper && npm install`
   - Start: `node scheduler/cronManager.js`
   - Environment:
     - HUNTER_API_URL
     - HUNTER_ADMIN_TOKEN

5. Deploy автоматически

---

## Current Mock Scraper Status

**For Development/Demo:**
- ✅ Mock scraper works in sandbox
- ✅ Loads 100 generated offers
- ✅ Skips image processing
- ✅ Logs to file
- ✅ Returns results

**Limitation:**
- ⚠️ No actual AutoBandit scraping (mock data)
- ⚠️ No API sync (401 - need token)

**To Enable API Sync:**
```bash
# Get admin token
TOKEN=$(curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testadmin@hunter.lease","password":"testpass123"}' \
  | jq -r '.access_token')

# Set for scraper
export HUNTER_ADMIN_TOKEN=$TOKEN

# Run
cd /app/scraper
node run.js --force
```

---

## Recommended Approach

**For Production:**
1. Use **Render.com** (easiest, ~$7/month)
2. Or **AWS Lambda** (serverless, pay-per-use)
3. Or **VPS** (full control, ~$6/month)

**For Development:**
- Use Mock Scraper (current setup)
- Manual offer management
- Generated data

---

## Integration Checklist

When deploying external scraper:

- [ ] Set HUNTER_API_URL to production URL
- [ ] Generate admin API token
- [ ] Configure cron schedule
- [ ] Enable notifications
- [ ] Monitor logs
- [ ] Test import endpoint
- [ ] Verify offers appear on /deals

---

## Cost Estimates

- Render.com: $7/month (background worker)
- AWS Lambda: ~$2-5/month (pay-per-execution)
- DigitalOcean VPS: $6/month (basic droplet)
- AWS EC2 t3.micro: $8/month

**Recommended: Render.com** (easiest setup, reliable)
