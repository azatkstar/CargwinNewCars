# 📖 ПОШАГОВАЯ ИНСТРУКЦИЯ ПЕРЕНОСА НА СЕРВЕР

**Время: 4-6 часов | Уровень: Средний**

---

## ШАГ 1: ПОДГОТОВКА СЕРВЕРА (30 минут)

### 1.1 Подключитесь к серверу

```bash
ssh root@your-server-ip
# Или
ssh -i ~/.ssh/your-key.pem ubuntu@your-server-ip
```

### 1.2 Обновите систему

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.3 Установите базовые пакеты

```bash
sudo apt install -y \
  python3.11 python3.11-venv python3-pip \
  nodejs npm \
  nginx \
  git curl wget \
  build-essential \
  supervisor
```

### 1.4 Установите Yarn

```bash
npm install -g yarn
```

### 1.5 Создайте пользователя для приложения

```bash
sudo useradd -m -s /bin/bash hunter
sudo usermod -aG sudo hunter
```

---

## ШАГ 2: УСТАНОВКА MONGODB (45 минут)

### 2.1 Импорт ключа MongoDB

```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | \
  sudo gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg --dearmor
```

### 2.2 Добавление репозитория

```bash
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
```

### 2.3 Установка

```bash
sudo apt update
sudo apt install -y mongodb-org
```

### 2.4 Запуск MongoDB

```bash
sudo systemctl start mongod
sudo systemctl enable mongod
sudo systemctl status mongod
```

### 2.5 Создание базы данных

```bash
mongosh << 'EOF'
use hunter_lease_production

db.createUser({
  user: "hunter_user",
  pwd: "СОЗДАЙТЕ_СЛОЖНЫЙ_ПАРОЛЬ_ЗДЕСЬ",
  roles: [{role: "readWrite", db: "hunter_lease_production"}]
})

exit
EOF
```

**⚠️ СОХРАНИТЕ ПАРОЛЬ!** Понадобится в .env

---

## ШАГ 3: ЗАГРУЗКА КОДА (30 минут)

### 3.1 Создайте директорию проекта

```bash
cd /var/www
sudo mkdir hunter-lease
sudo chown hunter:hunter hunter-lease
cd hunter-lease
```

### 3.2 Загрузите код

**Вариант A: Из GitHub**
```bash
git clone https://github.com/your-username/hunter-lease.git .
```

**Вариант B: Ручная загрузка**
```bash
# С локальной машины:
scp -r /path/to/downloaded/app/ root@server-ip:/var/www/hunter-lease/
```

### 3.3 Создайте необходимые директории

```bash
mkdir -p uploads/images/{original,processed}
mkdir -p uploads/documents
mkdir -p logs
chmod 755 uploads logs
```

---

## ШАГ 4: BACKEND SETUP (45 минут)

### 4.1 Переход в backend

```bash
cd /var/www/hunter-lease/backend
```

### 4.2 Создание virtual environment

```bash
python3.11 -m venv venv
source venv/bin/activate
```

### 4.3 Установка зависимостей

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**⏱️ Это займёт 10-15 минут**

### 4.4 Создание .env файла

```bash
cp .env.production .env
nano .env
```

**Заполните следующие переменные:**

```bash
# Environment
ENVIRONMENT=production
DEBUG=false

# Database
MONGO_URL=mongodb://hunter_user:ВАШ_ПАРОЛЬ@localhost:27017/hunter_lease_production
DB_NAME=hunter_lease_production

# Security - ОБЯЗАТЕЛЬНО ИЗМЕНИТЬ!
SECRET_KEY=<вставьте сгенерированный ключ>
JWT_SECRET_KEY=<вставьте другой сгенерированный ключ>

# CORS
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# URLs
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://yourdomain.com

# AI Assistant
EMERGENT_LLM_KEY=sk-emergent-54a3d4c0186EbD1E11

# Optional (добавьте если есть)
SENDGRID_API_KEY=your_key
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
REDIS_URL=redis://localhost:6379/0
```

**Сохраните: Ctrl+O, Enter, Ctrl+X**

---

## ШАГ 5: FRONTEND SETUP (30 минут)

### 5.1 Переход в frontend

```bash
cd /var/www/hunter-lease/frontend
```

### 5.2 Установка зависимостей

```bash
yarn install --frozen-lockfile
```

**⏱️ Это займёт 5-10 минут**

### 5.3 Создание .env

```bash
nano .env
```

**Содержание:**
```bash
REACT_APP_BACKEND_URL=/api
```

**Сохраните**

### 5.4 Production Build

```bash
yarn build
```

**⏱️ Это займёт 2-3 минуты**

**Результат:** `/var/www/hunter-lease/frontend/build/`

---

## ШАГ 6: NGINX КОНФИГУРАЦИЯ (30 минут)

### 6.1 Создание конфига

```bash
sudo nano /etc/nginx/sites-available/hunter-lease
```

**Вставьте:**

```nginx
# Backend upstream
upstream hunter_backend {
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
    
    # SSL (будет настроено Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Root для frontend
    root /var/www/hunter-lease/frontend/build;
    index index.html;
    
    # Logs
    access_log /var/log/nginx/hunter-lease-access.log;
    error_log /var/log/nginx/hunter-lease-error.log;
    
    # Client max body size
    client_max_body_size 10M;
    
    # API proxy
    location /api/ {
        proxy_pass http://hunter_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Uploads
    location /uploads/ {
        expires 1y;
        proxy_pass http://hunter_backend;
    }
    
    # React routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Замените `yourdomain.com` на ваш домен!**

### 6.2 Активация

```bash
sudo ln -s /etc/nginx/sites-available/hunter-lease /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## ШАГ 7: SSL СЕРТИФИКАТЫ (15 минут)

### 7.1 Установка Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 7.2 Получение сертификата

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Следуйте инструкциям на экране.

### 7.3 Проверка auto-renewal

```bash
sudo certbot renew --dry-run
```

---

## ШАГ 8: SUPERVISOR SETUP (20 минут)

### 8.1 Создание конфига

```bash
sudo nano /etc/supervisor/conf.d/hunter-lease.conf
```

**Вставьте:**

```ini
[program:hunter-backend]
command=/var/www/hunter-lease/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001 --workers 4
directory=/var/www/hunter-lease/backend
user=hunter
autostart=true
autorestart=true
stderr_logfile=/var/www/hunter-lease/logs/backend-error.log
stdout_logfile=/var/www/hunter-lease/logs/backend.log
environment=PATH="/var/www/hunter-lease/backend/venv/bin"
```

### 8.2 Активация

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start hunter-backend
sudo supervisorctl status
```

**Должно показать:** `hunter-backend RUNNING`

---

## ШАГ 9: ИМПОРТ ДАННЫХ (30 минут)

### 9.1 Загрузка backup на сервер

```bash
# С локальной машины:
scp -r /path/to/db-backup/ root@server-ip:/tmp/
```

### 9.2 Импорт в MongoDB

```bash
mongorestore --uri="mongodb://hunter_user:ПАРОЛЬ@localhost:27017/hunter_lease_production" /tmp/db-backup/cargwin_production
```

### 9.3 Создание админа (если нет backup)

```bash
mongosh hunter_lease_production << 'EOF'
db.users.insertOne({
  email: "admin@hunter.lease",
  password_hash: "$2b$12$...",  // Bcrypt hash
  name: "Admin User",
  role: "admin",
  is_active: true,
  created_at: new Date()
})
EOF
```

**Или создайте через API после запуска**

---

## ШАГ 10: ТЕСТИРОВАНИЕ (30 минут)

### 10.1 Проверка backend

```bash
curl http://localhost:8001/api/
# Должно вернуть: {"message":"Hello World"}

curl http://localhost:8001/api/cars
# Должно вернуть: JSON с автомобилями
```

### 10.2 Проверка frontend

```bash
curl http://localhost/
# Должна загрузиться HTML страница

curl https://yourdomain.com/
# Должен работать SSL
```

### 10.3 Проверка функций

**Откройте браузер:**
- [ ] Главная загружается
- [ ] /offers работает
- [ ] Login работает (admin@test.com / Admin123!)
- [ ] Dashboard открывается
- [ ] Admin panel доступен
- [ ] Формы отправляются
- [ ] Images загружаются

---

## ШАГ 11: ФИНАЛЬНАЯ НАСТРОЙКА (30 минут)

### 11.1 Настройка firewall

```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### 11.2 Настройка backup

```bash
# Создание cron job
sudo crontab -e

# Добавьте:
0 2 * * * mongodump --uri="mongodb://hunter_user:ПАРОЛЬ@localhost:27017/hunter_lease_production" --out=/backups/$(date +\%Y\%m\%d)
0 3 * * * find /backups -mtime +7 -delete
```

### 11.3 Мониторинг

```bash
# Просмотр логов
tail -f /var/www/hunter-lease/logs/backend.log
tail -f /var/log/nginx/hunter-lease-access.log

# Статус сервисов
sudo supervisorctl status
sudo systemctl status nginx
sudo systemctl status mongod
```

---

## ✅ ПРОВЕРКА УСПЕШНОСТИ

**Всё работает если:**
- ✅ https://yourdomain.com загружается
- ✅ SSL сертификат валиден (зелёный замок)
- ✅ Offers страница работает
- ✅ Login функционирует
- ✅ Backend API отвечает
- ✅ Нет ошибок в логах

---

## 🆘 TROUBLESHOOTING

### Backend не запускается

```bash
# Проверьте логи
tail -50 /var/www/hunter-lease/logs/backend-error.log

# Проверьте .env
cat /var/www/hunter-lease/backend/.env | grep MONGO_URL

# Проверьте MongoDB
mongosh --eval "db.adminCommand('ping')"

# Проверьте permissions
ls -la /var/www/hunter-lease/backend
```

### Frontend показывает 404

```bash
# Проверьте build
ls -la /var/www/hunter-lease/frontend/build/

# Rebuild если нужно
cd /var/www/hunter-lease/frontend
yarn build

# Проверьте Nginx
sudo nginx -t
sudo systemctl reload nginx
```

### База данных пустая

```bash
# Импортируйте заново
mongorestore --uri="mongodb://hunter_user:ПАРОЛЬ@localhost:27017/hunter_lease_production" /tmp/db-backup

# Или создайте тестовые данные через admin panel
```

---

## 📞 ПОДДЕРЖКА

**Если застряли:**

1. Проверьте логи (команды выше)
2. Прочитайте `/app/DEPLOYMENT_GUIDE.md` (детальнее)
3. Напишите в Emergent Discord
4. Используйте ChatGPT для debug (можете показать ошибки)

---

## ✨ ПОСЛЕ УСПЕШНОГО ЗАПУСКА

**Настройте:**
1. Google Analytics ID (замените G-XXXXXXXXXX в index.html)
2. API ключи (SendGrid, Twilio если нужны)
3. Добавьте больше лотов через Admin Panel
4. Протестируйте все функции
5. Настройте monitoring (Uptime Robot, etc.)

---

**ГОТОВО!** Ваш сайт hunter.lease работает! 🎉
