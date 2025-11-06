# 🧪 API Testing Guide - CargwinNewCar

## 🔐 Test Accounts

### Admin Account
- **Email:** `admin@test.com`
- **Password:** `Admin123!`
- **Role:** Admin (полный доступ)

### Regular User Account
- **Email:** `user@test.com`
- **Password:** `User123!`
- **Role:** User (обычный пользователь)

---

## 📡 Backend URL
```
https://autosales-platform-1.preview.emergentagent.com/api
```

---

## 🧪 Тестирование API Endpoints

### 1️⃣ Регистрация нового пользователя
```bash
curl -X POST "https://autosales-platform-1.preview.emergentagent.com/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@test.com",
    "password": "Password123!",
    "name": "New Test User"
  }'
```

**Ожидаемый результат:**
```json
{
  "ok": true,
  "message": "User registered successfully",
  "user": {...},
  "access_token": "...",
  "refresh_token": "..."
}
```

---

### 2️⃣ Вход (Email/Password)
```bash
curl -X POST "https://autosales-platform-1.preview.emergentagent.com/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Admin123!"
  }'
```

**Сохраните access_token из ответа для следующих запросов!**

---

### 3️⃣ Получить текущего пользователя
```bash
curl -X GET "https://autosales-platform-1.preview.emergentagent.com/api/auth/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 4️⃣ Получить профиль пользователя
```bash
curl -X GET "https://autosales-platform-1.preview.emergentagent.com/api/user/profile" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 5️⃣ Обновить профиль (заполнить кредитную анкету)
```bash
curl -X PUT "https://autosales-platform-1.preview.emergentagent.com/api/user/profile" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "credit_score": 720,
    "auto_loan_history": true,
    "employment_type": "W2",
    "annual_income": 75000,
    "employment_duration_months": 24,
    "address": "123 Main St, Los Angeles, CA 90001",
    "residence_duration_months": 36,
    "monthly_expenses": 2500,
    "down_payment_ready": 5000
  }'
```

---

### 6️⃣ Создать заявку на машину
Сначала получите ID любого лота:
```bash
curl -X GET "https://autosales-platform-1.preview.emergentagent.com/api/cars" | jq '.[0].id'
```

Затем создайте заявку:
```bash
curl -X POST "https://autosales-platform-1.preview.emergentagent.com/api/applications?lot_id=2024-lexus-rx350-premium" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 7️⃣ Получить мои заявки
```bash
curl -X GET "https://autosales-platform-1.preview.emergentagent.com/api/applications" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 👨‍💼 Admin Endpoints (требуется админ токен)

### 8️⃣ Получить всех пользователей
```bash
curl -X GET "https://autosales-platform-1.preview.emergentagent.com/api/admin/users" \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

---

### 9️⃣ Изменить роль пользователя
```bash
curl -X PATCH "https://autosales-platform-1.preview.emergentagent.com/api/admin/users/user-test-001/role?role=editor" \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

Доступные роли: `user`, `editor`, `admin`

---

### 🔟 Получить все заявки (админ)
```bash
curl -X GET "https://autosales-platform-1.preview.emergentagent.com/api/admin/applications" \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

---

### 1️⃣1️⃣ Обновить статус заявки
```bash
curl -X PATCH "https://autosales-platform-1.preview.emergentagent.com/api/admin/applications/APP_ID/status?status=approved&admin_notes=Customer approved for financing" \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

Доступные статусы: `pending`, `approved`, `rejected`, `contacted`

---

## 🌐 Google OAuth Flow

### Шаг 1: Открыть OAuth URL
Перейдите по ссылке:
```
https://auth.emergentagent.com/?redirect=https://autosales-platform-1.preview.emergentagent.com/dashboard
```

### Шаг 2: После авторизации Google
Вы будете перенаправлены на:
```
https://autosales-platform-1.preview.emergentagent.com/dashboard#session_id=XXXXX
```

### Шаг 3: Обработать session_id на frontend
Frontend должен отправить:
```bash
curl -X POST "https://autosales-platform-1.preview.emergentagent.com/api/auth/oauth/session" \
  -H "Content-Type: application/json" \
  -d '{"session_id": "XXXXX"}'
```

---

## 🔓 Выход
```bash
curl -X POST "https://autosales-platform-1.preview.emergentagent.com/api/auth/logout" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📊 Полезные команды

### Получить список всех машин (публичный эндпоинт)
```bash
curl -X GET "https://autosales-platform-1.preview.emergentagent.com/api/cars" | jq
```

### Проверить здоровье сервера
```bash
curl -X GET "https://autosales-platform-1.preview.emergentagent.com/api/health"
```

---

## 🧪 Простой тест всего flow

### 1. Войти как админ
```bash
TOKEN=$(curl -s -X POST "https://autosales-platform-1.preview.emergentagent.com/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Admin123!"}' | jq -r '.access_token')

echo "Admin Token: $TOKEN"
```

### 2. Проверить профиль
```bash
curl -X GET "https://autosales-platform-1.preview.emergentagent.com/api/auth/me" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 3. Получить всех пользователей
```bash
curl -X GET "https://autosales-platform-1.preview.emergentagent.com/api/admin/users" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 4. Получить все заявки
```bash
curl -X GET "https://autosales-platform-1.preview.emergentagent.com/api/admin/applications" \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## ✅ Checklist для тестирования

- [ ] Регистрация работает
- [ ] Вход по email/password работает
- [ ] Получение профиля работает
- [ ] Обновление профиля работает
- [ ] Создание заявки работает
- [ ] Получение своих заявок работает
- [ ] Admin: получение пользователей работает
- [ ] Admin: изменение ролей работает
- [ ] Admin: получение заявок работает
- [ ] Admin: обновление статуса заявок работает
- [ ] Выход работает

---

## 🐛 Troubleshooting

### Ошибка 401 Unauthorized
- Проверьте что access_token правильный
- Токен мог истечь (30 минут), нужно войти заново

### Ошибка 403 Forbidden
- У пользователя недостаточно прав (нужна роль admin/editor)

### Ошибка 404 Not Found
- Проверьте URL эндпоинта
- Проверьте что ID ресурса (user_id, app_id, lot_id) правильный

---

## 📝 Примечания

- Все токены JWT действительны 30 минут
- Refresh токены действительны 7 дней
- OAuth session токены действительны 7 дней (хранятся в httpOnly cookie)
- При создании заявки пользователь должен иметь заполненный профиль
