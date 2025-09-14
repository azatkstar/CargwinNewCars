# 🚀 CargwinNewCar - Production Deployment Guide

Полная инструкция по развертыванию CargwinNewCar на продакшн сервере.

## 📋 Системные требования

### Минимальные требования сервера:
- **CPU**: 2 ядра (рекомендуется 4+ для production)
- **RAM**: 4GB (рекомендуется 8GB+ для production)
- **Диск**: 50GB SSD (рекомендуется 100GB+ для uploads)
- **Операционная система**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+

### Обязательные зависимости:
```bash
# Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Git
sudo apt-get update
sudo apt-get install git curl nginx certbot python3-certbot-nginx
```

## 📦 Процесс развертывания

### 1. Клонирование проекта
```bash
# Клонируйте репозиторий
git clone https://github.com/yourusername/cargwin-newcar.git
cd cargwin-newcar

# Или загрузите файлы проекта на сервер
```

### 2. Конфигурация окружения
```bash
# Скопируйте и настройте environment файл
cp backend/.env.production .env

# Отредактируйте .env файл
nano .env
```

### 3. Критически важные настройки в .env:

```bash
# Безопасность - ОБЯЗАТЕЛЬНО ИЗМЕНИТЕ!
SECRET_KEY=your-super-secure-secret-key-here-at-least-32-chars
JWT_SECRET_KEY=another-super-secure-jwt-secret-key-here

# База данных - настройте под ваш MongoDB
MONGO_URL=mongodb://admin:your-password@localhost:27017
DB_NAME=cargwin_production

# Домен - укажите ваш домен
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
FRONTEND_URL=https://yourdomain.com

# Email для magic links
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# Администраторы
ADMIN_EMAILS=admin@yourdomain.com,owner@yourdomain.com
```

### 4. Автоматическое развертывание
```bash
# Запустите скрипт развертывания
sudo ./deploy.sh
```

### 5. Ручное развертывание (если нужно)
```bash
# Создайте необходимые директории
mkdir -p uploads/{images/{original,processed},temp}
mkdir -p logs data/{mongodb,redis}

# Соберите образы
docker-compose build

# Запустите сервисы
docker-compose up -d

# Проверьте статус
docker-compose ps
```

## 🔧 Настройка веб-сервера

### Nginx конфигурация (если используете отдельный Nginx):
```nginx
# /etc/nginx/sites-available/cargwin
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL сертификаты
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Безопасность
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Заголовки безопасности
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;

    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploads
    location /uploads/ {
        proxy_pass http://localhost:8000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### SSL сертификат с Let's Encrypt:
```bash
# Получите SSL сертификат
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Настройте автообновление
sudo crontab -e
# Добавьте строку:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🗄️ Настройка базы данных

### MongoDB настройка:
```bash
# Подключитесь к MongoDB
docker-compose exec mongodb mongosh

# Создайте пользователя приложения
use cargwin_production
db.createUser({
  user: "cargwin_app",
  pwd: "secure_password_here",
  roles: ["readWrite"]
})

# Создайте индексы (автоматически создаются при запуске)
```

### Первоначальная настройка:
```bash
# Создайте первого админа через API
curl -X POST https://yourdomain.com/api/auth/magic \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@yourdomain.com"}'

# Используйте magic link из логов для входа
```

## 🔍 Мониторинг и поддержка

### Проверка работоспособности:
```bash
# Статус сервисов
docker-compose ps

# Логи
docker-compose logs -f backend
docker-compose logs -f frontend

# Проверка здоровья
curl https://yourdomain.com/health
curl https://yourdomain.com/api/health
```

### Мониторинг метрик:
```bash
# Метрики приложения
curl https://yourdomain.com/api/metrics

# Системные метрики
docker stats
```

### Бэкапы:
```bash
# Бэкап MongoDB
docker-compose exec mongodb mongodump --out /data/backup/$(date +%Y%m%d_%H%M%S)

# Бэкап файлов
tar -czf backup_uploads_$(date +%Y%m%d_%H%M%S).tar.gz uploads/
```

## 🚨 Безопасность

### Обязательные меры безопасности:
1. **Смените все пароли по умолчанию**
2. **Настройте firewall:**
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw --force enable
   ```
3. **Обновите систему:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```
4. **Настройте fail2ban:**
   ```bash
   sudo apt install fail2ban
   sudo systemctl enable fail2ban
   ```

### Регулярное обслуживание:
```bash
# Обновление образов
docker-compose pull
docker-compose up -d

# Очистка неиспользуемых ресурсов
docker system prune -f

# Ротация логов
docker-compose exec backend find /app/logs -name "*.log" -mtime +7 -delete
```

## 📊 Производительность

### Масштабирование:
```yaml
# Увеличьте количество worker'ов в docker-compose.yml
backend:
  environment:
    WORKERS: 4  # Увеличьте для большей нагрузки
```

### Кэширование:
- Redis настроен автоматически для кэширования
- CDN рекомендуется для статических файлов
- Browser caching настроен в Nginx

## 🆘 Устранение неполадок

### Общие проблемы:

1. **Сервисы не запускаются:**
   ```bash
   docker-compose logs service_name
   ```

2. **Проблемы с базой данных:**
   ```bash
   docker-compose exec mongodb mongosh
   db.runCommand({ping: 1})
   ```

3. **Проблемы с SSL:**
   ```bash
   sudo certbot certificates
   sudo nginx -t
   ```

4. **Нехватка места:**
   ```bash
   df -h
   docker system df
   docker system prune -a
   ```

## 📞 Поддержка

Если возникают проблемы:
1. Проверьте логи: `docker-compose logs -f`
2. Проверьте конфигурацию: `docker-compose config`
3. Проверьте здоровье сервисов: `curl https://yourdomain.com/health`

## 🔄 Обновления

### Обновление приложения:
```bash
# Получите последнюю версию
git pull origin main

# Пересоберите образы
docker-compose build --no-cache

# Перезапустите с нулевым временем простоя
docker-compose up -d --force-recreate
```

---

**Поздравляем! 🎉 CargwinNewCar успешно развернут в продакшене!**