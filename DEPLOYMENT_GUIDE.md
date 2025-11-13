# ТЕХНИЧЕСКОЕ ЗАДАНИЕ
# Перенос CargwinNewCar на собственный хостинг

## ОБЗОР ПРОЕКТА

**Название:** CargwinNewCar  
**Тип:** Enterprise car leasing platform  
**Архитектура:** Full-stack монолит (Backend + Frontend + Database)  
**Компания:** Cargwin LLC (лицензированный автомобильный брокер, California)

---

## 1. ТЕХНОЛОГИЧЕСКИЙ СТЕК

### Backend (Python)
- **Framework:** FastAPI 0.115.x
- **Runtime:** Python 3.11
- **ASGI Server:** Uvicorn
- **Database Driver:** Motor (async MongoDB driver)
- **Authentication:** JWT (PyJWT)
- **Password Hashing:** bcrypt
- **Validation:** Pydantic 2.x
- **HTTP Client:** httpx, requests
- **Web Scraping:** beautifulsoup4, lxml
- **Email:** (готово к SendGrid integration)
- **SMS:** (готово к Twilio integration)
- **File Storage:** Local filesystem (/app/uploads)

### Frontend (JavaScript/React)
- **Framework:** React 19.x
- **Build Tool:** Create React App (Webpack)
- **Routing:** React Router v7
- **Styling:** Tailwind CSS 3.x
- **UI Components:** Shadcn UI (Radix UI + Tailwind)
- **HTTP Client:** Axios
- **SEO:** react-helmet-async
- **Icons:** Lucide React
- **State:** React Context API (useAuth, useI18n, useFOMOSettings)

### Database
- **Primary:** MongoDB 6.x+
- **Collections:** 8 (lots, users, applications, reservations, subscriptions, appointments, documents, audit_logs)
- **Optional:** Redis (для caching, есть in-memory fallback)

### Infrastructure
- **Web Server:** Nginx (для production frontend)
- **Process Manager:** Supervisor или systemd
- **Containerization:** Docker (опционально)
- **Reverse Proxy:** Nginx

---

## 2. ТРЕБОВАНИЯ К СЕРВЕРУ

### Минимальные требования:
```
CPU: 2 vCPU
RAM: 4 GB
Storage: 40 GB SSD
OS: Ubuntu 22.04 LTS или Debian 11+
Network: 100 Mbps
```

### Рекомендуемые для production:
```
CPU: 4 vCPU
RAM: 8 GB
Storage: 100 GB SSD
OS: Ubuntu 22.04 LTS
Network: 1 Gbps
Backup: Ежедневный backup MongoDB
```

### Открытые порты:
```
80 (HTTP)
443 (HTTPS)
8001 (Backend API - internal)
3000 (Frontend dev - internal)
27017 (MongoDB - internal only)
```

---

## 3. СТРУКТУРА ПРОЕКТА

```
/var/www/cargwin-newcar/
├── backend/
│   ├── server.py (3300+ lines, 65+ endpoints)
│   ├── database.py (extended models, 6 repositories)
│   ├── auth.py (JWT, OAuth, 4 roles)
│   ├── config.py (settings management)
│   ├── middleware.py (CORS, logging, performance)
│   ├── file_storage.py (image handling)
│   ├── monitoring.py (health checks)
│   ├── performance.py (Redis cache, optional)
│   ├── background_tasks.py (auto-archiving, subscriptions)
│   ├── notifications.py (Email/SMS/Telegram service)
│   ├── autobandit_scraper.py (web scraping)
│   ├── requirements.txt (140+ packages)
│   ├── .env (environment variables)
│   └── .env.production (template)
├── frontend/
│   ├── public/
│   │   └── index.html (OpenGraph tags, SEO)
│   ├── src/
│   │   ├── App.js (main app, 15+ routes)
│   │   ├── components/ (50+ React components)
│   │   ├── pages/ (18 страниц)
│   │   ├── hooks/ (useAuth, useI18n, useFOMOSettings)
│   │   ├── i18n/ (en.json, ru.json)
│   │   └── utils/ (helpers)
│   ├── package.json
│   ├── .env
│   └── build/ (production build)
├── docker/
│   ├── nginx.conf (Nginx configuration)
│   └── env-config.sh (runtime env injection)
├── uploads/ (загруженные файлы)
│   ├── images/
│   └── documents/
└── logs/
    ├── backend.log
    └── frontend.log
```

---

## 4. УСТАНОВКА И РАЗВЕРТЫВАНИЕ

### Шаг 1: Подготовка сервера

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка необходимых пакетов
sudo apt install -y python3.11 python3.11-venv python3-pip \
  nodejs npm nginx mongodb-org supervisor \
  git curl wget build-essential

# Установка Yarn (для frontend)
npm install -g yarn

# Создание пользователя для приложения
sudo useradd -m -s /bin/bash cargwin
sudo usermod -aG sudo cargwin
```

### Шаг 2: Установка MongoDB

```bash
# Импорт GPG ключа MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | \
  sudo gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg --dearmor

# Добавление repository
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] \
  https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Установка
sudo apt update
sudo apt install -y mongodb-org

# Запуск
sudo systemctl start mongod
sudo systemctl enable mongod

# Создание базы данных
mongosh << EOF
use cargwin_production
db.createUser({
  user: "cargwin_user",
  pwd: "SECURE_PASSWORD_HERE",
  roles: [{role: "readWrite", db: "cargwin_production"}]
})
EOF
```

### Шаг 3: Клонирование и настройка проекта

```bash
# Переход в рабочую директорию
cd /var/www
sudo mkdir cargwin-newcar
sudo chown cargwin:cargwin cargwin-newcar
cd cargwin-newcar

# Копирование файлов проекта (из Emergent или Git)
# Если из Git:
# git clone <your-repo-url> .

# Создание директорий
mkdir -p uploads/images/{original,processed}
mkdir -p uploads/documents
mkdir -p logs
chmod 755 uploads logs
```

### Шаг 4: Настройка Backend

```bash
cd /var/www/cargwin-newcar/backend

# Создание virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Установка зависимостей
pip install --upgrade pip
pip install -r requirements.txt

# Создание .env файла
cp .env.production .env

# Редактирование .env (КРИТИЧНО!)
nano .env
```

**Содержание backend/.env:**
```bash
# Environment
ENVIRONMENT=production
DEBUG=false

# Database
MONGO_URL=mongodb://cargwin_user:SECURE_PASSWORD@localhost:27017/cargwin_production
DB_NAME=cargwin_production

# Security - ОБЯЗАТЕЛЬНО ИЗМЕНИТЬ!
SECRET_KEY=CHANGE_TO_SECURE_RANDOM_STRING_AT_LEAST_32_CHARS
JWT_SECRET_KEY=ANOTHER_SECURE_RANDOM_STRING_32_CHARS

# Authentication
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS - ваш домен
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
CORS_CREDENTIALS=true

# URLs
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://yourdomain.com

# Google OAuth (опционально)
GOOGLE_OAUTH_CLIENT_ID=your_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret

# File Upload
UPLOAD_DIR=/var/www/cargwin-newcar/uploads
MAX_UPLOAD_SIZE=10485760

# Email (SendGrid) - опционально
SENDGRID_API_KEY=your_sendgrid_key

# SMS (Twilio) - опционально
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+17477227494

# Telegram - опционально
TELEGRAM_BOT_TOKEN=your_telegram_token

# Prescoring (700credit/eLAND) - когда получите
PRESCORING_API_KEY=your_700credit_key
PRESCORING_API_URL=https://api.700credit.com/v1

# Redis (опционально)
REDIS_URL=redis://localhost:6379/0

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json

# Workers
WORKERS=4
```

### Шаг 5: Настройка Frontend

```bash
cd /var/www/cargwin-newcar/frontend

# Установка зависимостей
yarn install --frozen-lockfile

# Создание .env файла
nano .env
```

**Содержание frontend/.env:**
```bash
# Backend API URL
REACT_APP_BACKEND_URL=https://yourdomain.com/api

# Emergent Auth (если используете)
REACT_APP_EMERGENT_AUTH_URL=https://auth.emergentagent.com
```

```bash
# Production build
yarn build

# Результат в frontend/build/
```

---

## 5. КОНФИГУРАЦИЯ NGINX

**Файл:** `/etc/nginx/sites-available/cargwin-newcar`

```nginx
# Upstream для backend
upstream cargwin_backend {
    server localhost:8001;
    keepalive 32;
}

# HTTP → HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Logs
    access_log /var/log/nginx/cargwin-access.log;
    error_log /var/log/nginx/cargwin-error.log;
    
    # Root for frontend
    root /var/www/cargwin-newcar/frontend/build;
    index index.html;
    
    # Client max body size (для загрузки файлов)
    client_max_body_size 10M;
    
    # API proxy to backend
    location /api/ {
        proxy_pass http://cargwin_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Uploads proxy to backend
    location /uploads/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://cargwin_backend;
    }
    
    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
    
    # React routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
        
        # No cache for HTML
        location ~* \.html$ {
            expires -1;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma "no-cache";
        }
    }
    
    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

**Активация:**
```bash
sudo ln -s /etc/nginx/sites-available/cargwin-newcar /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 6. SSL СЕРТИФИКАТЫ (Let's Encrypt)

```bash
# Установка Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получение сертификата
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## 7. SUPERVISOR КОНФИГУРАЦИЯ

**Файл:** `/etc/supervisor/conf.d/cargwin.conf`

```ini
[program:cargwin-backend]
command=/var/www/cargwin-newcar/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001 --workers 4
directory=/var/www/cargwin-newcar/backend
user=cargwin
autostart=true
autorestart=true
stderr_logfile=/var/www/cargwin-newcar/logs/backend-error.log
stdout_logfile=/var/www/cargwin-newcar/logs/backend.log
environment=PATH="/var/www/cargwin-newcar/backend/venv/bin"

[program:cargwin-frontend]
command=/usr/bin/serve -s build -l 3000
directory=/var/www/cargwin-newcar/frontend
user=cargwin
autostart=true
autorestart=true
stderr_logfile=/var/www/cargwin-newcar/logs/frontend-error.log
stdout_logfile=/var/www/cargwin-newcar/logs/frontend.log
```

**Активация:**
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start all
sudo supervisorctl status
```

**Альтернатива - systemd:**

**Backend service:** `/etc/systemd/system/cargwin-backend.service`
```ini
[Unit]
Description=CargwinNewCar Backend API
After=network.target mongodb.service

[Service]
Type=simple
User=cargwin
WorkingDirectory=/var/www/cargwin-newcar/backend
Environment="PATH=/var/www/cargwin-newcar/backend/venv/bin"
ExecStart=/var/www/cargwin-newcar/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001 --workers 4
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable cargwin-backend
sudo systemctl start cargwin-backend
```

---

## 8. МИГРАЦИЯ ДАННЫХ

### Экспорт из Emergent MongoDB:

```bash
# На Emergent платформе (если есть доступ)
mongodump --uri="mongodb://localhost:27017/cargwin_production" --out=/tmp/cargwin-backup

# Или экспорт через API
# Используйте endpoint: GET /api/admin/lots/export/json
```

### Импорт на новый сервер:

```bash
# Копирование backup на новый сервер
scp -r cargwin-backup user@your-server:/tmp/

# На новом сервере
mongorestore --uri="mongodb://cargwin_user:PASSWORD@localhost:27017/cargwin_production" /tmp/cargwin-backup/cargwin_production
```

### Создание тестового пользователя:

```bash
mongosh cargwin_production << EOF
db.users.insertOne({
  email: "admin@cargwin.com",
  password_hash: "\$2b\$12\$...", // bcrypt hash of password
  name: "Admin User",
  role: "admin",
  is_active: true,
  profile_completed: false,
  created_at: new Date()
})
EOF
```

---

## 9. ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ (ПОЛНЫЙ СПИСОК)

### Backend Required:
```bash
ENVIRONMENT=production
DEBUG=false
MONGO_URL=mongodb://user:pass@localhost:27017/cargwin_production
DB_NAME=cargwin_production
SECRET_KEY=<32+ chars random>
JWT_SECRET_KEY=<32+ chars random>
CORS_ORIGINS=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://yourdomain.com
UPLOAD_DIR=/var/www/cargwin-newcar/uploads
```

### Backend Optional:
```bash
SENDGRID_API_KEY=<если есть>
TWILIO_ACCOUNT_SID=<если есть>
TWILIO_AUTH_TOKEN=<если есть>
TWILIO_PHONE_NUMBER=+17477227494
TELEGRAM_BOT_TOKEN=<если есть>
PRESCORING_API_KEY=<700credit key>
REDIS_URL=redis://localhost:6379/0
GOOGLE_OAUTH_CLIENT_ID=<если используете>
GOOGLE_OAUTH_CLIENT_SECRET=<если используете>
```

### Frontend Required:
```bash
REACT_APP_BACKEND_URL=/api
REACT_APP_EMERGENT_AUTH_URL=https://auth.emergentagent.com
```

---

## 10. БАЗА ДАННЫХ - СХЕМЫ И ИНДЕКСЫ

### Collections (8):

**1. lots** - Автомобильные лоты
```javascript
{
  make: String,              // Lexus, Toyota, etc.
  model: String,             // RX350, ES350, etc.
  year: Number,              // 2024, 2025, 2026
  trim: String,
  vin: String,
  msrp: Number,
  discount: Number,
  dealer_addons: Number,     // Обязательно!
  images: [{url, alt}],
  lease: {monthly, dueAtSigning, termMonths, milesPerYear},
  finance: {apr, termMonths, downPayment},
  status: String,            // draft, published, archived
  slug: String,              // unique
  created_at: Date
}

// Indexes:
db.lots.createIndex({slug: 1}, {unique: true})
db.lots.createIndex({status: 1})
db.lots.createIndex({make: 1, model: 1, year: 1})
```

**2. users** - Пользователи
```javascript
{
  email: String,             // unique
  password_hash: String,     // bcrypt
  role: String,              // user, finance_manager, editor, admin
  name: String,
  // 25+ дополнительных полей для флит отдела
  employer_name: String,
  job_title: String,
  monthly_income_pretax: Number,
  date_of_birth: String,
  drivers_license_number: String,
  immigration_status: String,
  ssn: String,               // Encrypted!
  phone: String,
  current_address: String,
  // ... и другие
  created_at: Date
}

// Indexes:
db.users.createIndex({email: 1}, {unique: true})
db.users.createIndex({role: 1})
```

**3. applications** - Заявки на финансирование
```javascript
{
  user_id: String,
  lot_id: String,
  status: String,            // pending, approved, rejected, contacted
  user_data: Object,         // snapshot
  lot_data: Object,          // snapshot
  alternatives: [{lot_id, type, suggested_by}],  // 3 альтернативы
  trade_in: {vin, year, make, model, kbb_value},
  prescoring_data: {credit_score, approval_probability, max_amount},
  approval_details: {apr, monthly_payment, loan_term},
  pickup_status: String,
  pickup_slot: Date,
  notifications_sent: [{type, message, sent_at}],
  verified_income: Number,   // Finance Manager поле
  manager_comments: String,
  created_at: Date
}

// Indexes:
db.applications.createIndex({user_id: 1})
db.applications.createIndex({status: 1})
```

**4. reservations** - Резервации (48h)
```javascript
{
  user_id: String,
  lot_id: String,
  lot_slug: String,
  reserved_price: Number,
  monthly_payment: Number,
  deposit_paid: Boolean,     // false до оплаты $97.49
  deposit_amount: Number,    // 97.49
  status: String,            // active, expired, converted
  expires_at: Date,
  created_at: Date
}

// Indexes:
db.reservations.createIndex({user_id: 1})
db.reservations.createIndex({lot_slug: 1})
db.reservations.createIndex({expires_at: 1})
```

**5. subscriptions** - Подписки на модели
```javascript
{
  user_id: String,
  email: String,
  phone: String,
  telegram_id: String,
  makes: [String],           // ["Lexus", "BMW"]
  models: [String],          // ["RX350", "ES350"]
  max_price: Number,
  notify_email: Boolean,
  notify_sms: Boolean,
  notify_telegram: Boolean,
  is_active: Boolean,
  created_at: Date
}

// Indexes:
db.subscriptions.createIndex({user_id: 1})
db.subscriptions.createIndex({is_active: 1})
```

**6. appointments** - Встречи
**7. documents** - Загруженные документы
**8. audit_logs** - Логи аудита

---

## 11. ЗАПУСК ПРИЛОЖЕНИЯ

### Production запуск:

```bash
# Backend (через supervisor)
cd /var/www/cargwin-newcar/backend
source venv/bin/activate
sudo supervisorctl start cargwin-backend

# Проверка
curl http://localhost:8001/api/
# Должен вернуть: {"message": "Hello World"}

# Frontend уже собран в build/, Nginx раздаёт статику
```

### Проверка здоровья:

```bash
# Backend health
curl http://localhost:8001/api/
curl http://localhost:8001/api/cars

# Frontend
curl http://localhost/

# MongoDB
mongosh --eval "db.adminCommand('ping')"

# Logs
tail -f /var/www/cargwin-newcar/logs/backend.log
tail -f /var/log/nginx/cargwin-access.log
```

---

## 12. BACKUP И MONITORING

### Автоматический backup MongoDB:

```bash
# Cron job для ежедневного backup
sudo crontab -e

# Добавить:
0 2 * * * mongodump --uri="mongodb://cargwin_user:PASSWORD@localhost:27017/cargwin_production" --out=/backups/cargwin-$(date +\%Y\%m\%d)
0 3 * * * find /backups -name "cargwin-*" -mtime +7 -exec rm -rf {} \;
```

### Monitoring:

```bash
# Установка monitoring tools
sudo apt install -y prometheus node-exporter

# Или использовать:
# - Uptime Robot (для uptime monitoring)
# - Sentry (для error tracking) - уже подготовлено в коде
# - Datadog / New Relic (для APM)
```

---

## 13. БЕЗОПАСНОСТЬ

### Firewall (UFW):

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Fail2ban:

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
```

### SSL Auto-renewal:

```bash
# Certbot уже настроит auto-renewal
# Проверка:
sudo certbot renew --dry-run
```

---

## 14. ТЕСТИРОВАНИЕ ПОСЛЕ РАЗВЕРТЫВАНИЯ

### Checklist:

```bash
# 1. Homepage загружается
curl -I https://yourdomain.com
# Expected: 200 OK

# 2. Backend API работает
curl https://yourdomain.com/api/
# Expected: {"message": "Hello World"}

# 3. MongoDB подключена
curl https://yourdomain.com/api/cars
# Expected: JSON array с лотами

# 4. Admin login работает
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Admin123!"}'
# Expected: JWT token

# 5. Загрузка изображений
# Через админ панель: Create Lot → Upload images

# 6. Reservations
# User workflow: Reserve Price → Dashboard

# 7. Finance Manager
# Login as finance_manager → Prescoring
```

---

## 15. ПРОИЗВОДИТЕЛЬНОСТЬ

### Оптимизация:

**Backend:**
```bash
# Workers: 4-8 (зависит от CPU)
# В uvicorn команде: --workers 4

# Gunicorn альтернатива:
gunicorn server:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001
```

**Database:**
```bash
# MongoDB tuning
# /etc/mongod.conf

net:
  maxIncomingConnections: 1000

storage:
  wiredTiger:
    engineConfig:
      cacheSizeGB: 2  # 50% RAM for MongoDB
```

**Redis (опционально):**
```bash
sudo apt install redis-server
sudo systemctl enable redis-server

# В backend .env:
REDIS_URL=redis://localhost:6379/0
```

---

## 16. DOCKER АЛЬТЕРНАТИВА (опционально)

Если хотите использовать Docker:

**docker-compose.yml** уже есть в проекте:

```bash
# Запуск через Docker
cd /var/www/cargwin-newcar
docker-compose up -d

# Проверка
docker-compose ps
docker-compose logs -f
```

---

## 17. ОСОБЕННОСТИ ПРОЕКТА

### Background Tasks:
```
Приложение запускает фоновые задачи при старте:
- Auto-archiving (каждый час)
- Subscription notifications (каждый час)
- Reservation expiration (каждый час)

Эти задачи запускаются автоматически в server.py при startup.
```

### File Uploads:
```
Директория: /var/www/cargwin-newcar/uploads/
Должна быть writable для пользователя cargwin
chmod 755 uploads
chown -R cargwin:cargwin uploads
```

### API Endpoints:
```
Всего: 65+ endpoints
Критичные:
  - /api/cars (public)
  - /api/auth/login (auth)
  - /api/applications (reservations)
  - /api/admin/* (admin panel)

Все endpoints требуют префикс /api для правильного роутинга через Nginx.
```

---

## 18. TROUBLESHOOTING

### Частые проблемы:

**1. Backend не запускается:**
```bash
# Проверить логи
tail -100 /var/www/cargwin-newcar/logs/backend-error.log

# Проверить .env файл
cat /var/www/cargwin-newcar/backend/.env | grep MONGO_URL

# Проверить MongoDB
mongosh --eval "db.adminCommand('ping')"
```

**2. Frontend показывает 404:**
```bash
# Проверить Nginx config
sudo nginx -t

# Проверить build
ls -la /var/www/cargwin-newcar/frontend/build/

# Rebuild frontend
cd /var/www/cargwin-newcar/frontend
yarn build
```

**3. CORS ошибки:**
```bash
# В backend/.env
CORS_ORIGINS=https://yourdomain.com

# Перезапустить backend
sudo supervisorctl restart cargwin-backend
```

---

## 19. КОНТАКТЫ И ПОДДЕРЖКА

**Компания:** Cargwin LLC  
**Адрес:** 2855 Michelle Dr, Office 180, Irvine, CA 92606  
**Телефон:** +1 (747) CARGWIN  
**Email:** info@cargwin.com

**Технический стек:** FastAPI + React + MongoDB  
**Версия проекта:** Enterprise Platform v2.0  
**Дата ТЗ:** November 2025

---

## 20. ЧЕКЛИСТ ПЕРЕНОСА

- [ ] Сервер подготовлен (Ubuntu 22.04, 4GB RAM)
- [ ] MongoDB установлен и настроен
- [ ] Python 3.11 + venv установлены
- [ ] Node.js + Yarn установлены
- [ ] Nginx установлен
- [ ] SSL сертификаты получены (Let's Encrypt)
- [ ] Файлы проекта скопированы
- [ ] Backend dependencies установлены (pip install -r requirements.txt)
- [ ] Frontend dependencies установлены (yarn install)
- [ ] Frontend собран (yarn build)
- [ ] .env файлы настроены (backend + frontend)
- [ ] Nginx сконфигурирован и активен
- [ ] Supervisor/systemd настроен для процессов
- [ ] MongoDB данные мигрированы
- [ ] Backup настроен (cron job)
- [ ] Firewall настроен (UFW)
- [ ] Тестовый пользователь создан
- [ ] Тестирование пройдено (все endpoints работают)
- [ ] Monitoring настроен
- [ ] DNS records обновлены (A record → ваш IP)

---

## ИТОГОВЫЕ ХАРАКТЕРИСТИКИ ПРОЕКТА

**Backend:**
- 65+ API endpoints
- 8 MongoDB collections
- 6 repositories
- 4 user roles
- 3 background services
- Auto-notifications система
- Web scraping (AutoBandit)

**Frontend:**
- 50+ React компонентов
- 18 страниц
- 15 routes
- Responsive design
- SEO optimized
- Accessibility compliant

**Features:**
- 110+ реализованных функций
- Reservation system
- Finance Manager CRM
- Prescoring engine
- Alternative vehicles
- Trade-in valuation
- Document management
- Multi-channel subscriptions
- Analytics dashboard
- Legal compliance (CCPA)

**Размер:**
- Backend: ~15 MB (с venv)
- Frontend build: 222 KB (gzipped)
- MongoDB: зависит от данных
- Total: ~100-200 MB

---

**ГОТОВО ДЛЯ ПЕРЕДАЧИ СПЕЦИАЛИСТУ! 🚀**
