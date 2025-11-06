# 🔐 Доступ к Backend API - CargwinNewCar

## ✅ Backend запущен и работает!

**URL:** `https://autosales-platform-1.preview.emergentagent.com/api`

---

## 👤 Тестовые аккаунты

### 🔴 Администратор (полный доступ)
```
Email: admin@test.com
Password: Admin123!
Role: admin
```

### 🔵 Обычный пользователь
```
Email: user@test.com  
Password: User123!
Role: user
```

---

## 🧪 Быстрый тест

### 1. Получить токен админа
```bash
curl -X POST "https://autosales-platform-1.preview.emergentagent.com/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Admin123!"}' | jq '.access_token'
```

### 2. Проверить профиль
```bash
# Замените YOUR_TOKEN на полученный токен
curl -X GET "https://autosales-platform-1.preview.emergentagent.com/api/auth/me" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Получить список пользователей (админ)
```bash
curl -X GET "https://autosales-platform-1.preview.emergentagent.com/api/admin/users" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📋 Доступные endpoints

### Auth (✅ Работают)
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `POST /api/auth/oauth/session` - Google OAuth
- `GET /api/auth/me` - Текущий пользователь
- `POST /api/auth/logout` - Выход

### User Profile (✅ Работают)
- `GET /api/user/profile` - Получить профиль
- `PUT /api/user/profile` - Обновить профиль (кредитные данные)

### Applications (✅ Работают)
- `POST /api/applications?lot_id=XXX` - Создать заявку
- `GET /api/applications` - Мои заявки

### Admin - Users (✅ Работают)
- `GET /api/admin/users` - Все пользователи
- `PATCH /api/admin/users/{id}/role?role=admin` - Изменить роль

### Admin - Applications (✅ Работают)
- `GET /api/admin/applications` - Все заявки
- `PATCH /api/admin/applications/{id}/status?status=approved` - Обновить статус

### Admin - Lots (✅ Работают)
- `GET /api/admin/lots` - Все лоты
- `POST /api/admin/lots` - Создать лот
- `GET /api/admin/lots/{id}` - Получить лот
- `PATCH /api/admin/lots/{id}` - Обновить лот

### Public (✅ Работают)
- `GET /api/cars` - Все опубликованные машины
- `GET /api/cars/{slug}` - Детальная страница машины

---

## 📊 Проверенные функции

✅ Email/Password регистрация  
✅ Email/Password вход  
✅ JWT токены (30 минут)  
✅ Получение профиля  
✅ Обновление профиля  
✅ Создание заявок  
✅ Админ панель - список пользователей  
✅ Админ панель - управление ролями  
✅ Админ панель - список заявок  
✅ MongoDB коллекции созданы  
✅ Индексы настроены  

---

## 🔜 Что дальше?

**Фаза 2:** Frontend интеграция
- Login/Register страница
- User Dashboard
- Profile completion form  
- Admin панель расширение
- Google OAuth кнопка

---

## 📝 Полная документация

См. файл `/app/API_TESTING_GUIDE.md` для детального описания всех endpoints и примеров использования.

---

## 🐛 Если что-то не работает

1. Проверьте логи backend:
```bash
tail -f /var/log/supervisor/backend.err.log
```

2. Проверьте статус сервиса:
```bash
sudo supervisorctl status backend
```

3. Перезапустите backend:
```bash
sudo supervisorctl restart backend
```
