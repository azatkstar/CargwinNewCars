# 📦 СПИСОК ФАЙЛОВ ДЛЯ ЭКСПОРТА

## ОБЯЗАТЕЛЬНЫЕ ФАЙЛЫ

### Backend (Python)
```
/app/backend/
├── server.py (3400+ lines - main API)
├── database.py (extended models)
├── auth.py (JWT authentication)
├── config.py (settings)
├── middleware.py (CORS, security)
├── file_storage.py (upload handling)
├── performance.py (Redis caching)
├── monitoring.py (health checks)
├── background_tasks.py (scheduled jobs)
├── notifications.py (Email/SMS)
├── cargwin_gpt.py (AI assistant)
├── model_templates.py (43 car templates)
├── websocket_manager.py (real-time)
├── ab_testing.py (A/B tests)
├── email_templates.py (HTML emails)
├── autobandit_scraper.py (web scraping)
├── requirements.txt (140+ packages)
└── .env.production (template)
```

### Frontend (React)
```
/app/frontend/
├── public/
│   ├── index.html (SEO, GA)
│   ├── manifest.json (PWA)
│   ├── service-worker.js (PWA)
│   └── logo.svg
├── src/
│   ├── App.js (main app, 22 routes)
│   ├── index.css (Tailwind + custom)
│   ├── components/ (105 components)
│   ├── pages/ (32 pages)
│   ├── hooks/ (useAuth, useI18n, useWebSocket)
│   ├── i18n/ (en.json, ru.json)
│   └── utils/
├── package.json
├── tailwind.config.js
└── .env
```

### Documentation
```
/app/
├── README.md (quick start)
├── DEPLOYMENT_GUIDE.md (полная инструкция)
├── STEP_BY_STEP_DEPLOYMENT.md (пошаговая)
├── PRE_DEPLOYMENT_CHECKLIST.md (чеклист)
└── FILES_TO_EXPORT.md (этот файл)
```

---

## ОПЦИОНАЛЬНЫЕ ФАЙЛЫ

### Uploaded Files (если есть данные)
```
/app/uploads/
├── images/
│   ├── original/
│   └── processed/
└── documents/
```

### Database Backup
```
mongodump output:
- /tmp/db-backup/
  ├── cargwin_production/
  │   ├── lots.bson
  │   ├── users.bson
  │   ├── applications.bson
  │   └── ... (10 collections)
```

---

## НЕ НУЖНО ЭКСПОРТИРОВАТЬ

**Исключите из переноса:**
```
/app/node_modules/ (установится через yarn install)
/app/backend/venv/ (создастся через python -m venv)
/app/backend/__pycache__/ (временные файлы)
/app/frontend/build/ (создастся через yarn build)
/app/.git/ (если есть - можно не брать)
/app/logs/ (старые логи)
```

---

## 📋 РАЗМЕР ФАЙЛОВ

**Примерная оценка:**

- Backend code: ~15 MB
- Frontend code: ~50 MB
- node_modules (после install): ~200 MB
- venv (после install): ~100 MB
- MongoDB backup: зависит от данных (обычно 10-50 MB)
- Production build: ~2 MB

**Total для переноса (без node_modules/venv): ~65 MB**
**Total после установки: ~400 MB**

---

## ✅ CHECKLIST ЭКСПОРТА

**Перед началом убедитесь что скачали:**

- [ ] `/app/backend/` (все .py файлы)
- [ ] `/app/frontend/src/` (все компоненты)
- [ ] `/app/frontend/public/` (assets)
- [ ] `requirements.txt`
- [ ] `package.json`
- [ ] `.env.production` (template)
- [ ] Все 4 MD документации
- [ ] MongoDB backup (если есть данные)
- [ ] Uploads (если есть загруженные файлы)

**НЕ скачивайте:**
- [ ] node_modules
- [ ] venv
- [ ] __pycache__
- [ ] .git (опционально)
- [ ] build/
- [ ] logs/

---

## 💾 КАК СКАЧАТЬ

### Вариант 1: GitHub (рекомендуется)

1. Emergent → Save to GitHub
2. Clone на локальную машину
3. Готово!

### Вариант 2: VS Code на Emergent

1. Откройте VS Code
2. File → Download Folder
3. Выберите /app/
4. Сохраните локально

### Вариант 3: SCP

```bash
# С сервера Emergent (если есть SSH доступ)
scp -r emergent-server:/app/ ./hunter-lease-export/
```

---

## 📂 РЕКОМЕНДУЕМАЯ СТРУКТУРА ЭКСПОРТА

```
hunter-lease-export/
├── backend/
├── frontend/
├── docs/
│   ├── README.md
│   ├── DEPLOYMENT_GUIDE.md
│   ├── STEP_BY_STEP_DEPLOYMENT.md
│   └── PRE_DEPLOYMENT_CHECKLIST.md
├── database-backup/
└── .env.example
```

---

**ГОТОВО К ЭКСПОРТУ!** 📦

После экспорта следуйте `STEP_BY_STEP_DEPLOYMENT.md`
