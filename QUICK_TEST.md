# ⚡ Быстрый тест интеграции

## 1. Создайте файл `.env` в корне проекта:

```env
VITE_API_URL=http://localhost:8000
```

## 2. Убедитесь что бэкенд запущен

```bash
# Проверка
curl http://localhost:8000/health
# Должно вернуть: {"status":"ok"}
```

## 3. Запустите фронтенд

```bash
npm run dev
# или
pnpm dev
```

## 4. Откройте браузер

Перейдите на `http://localhost:5173`

## 5. Тестируйте в таком порядке:

### ✅ Шаг 1: Регистрация
1. На странице /login нажмите "Зарегистрироваться"
2. Заполните:
   - Имя: Иван Иванов
   - Email: test@example.com
   - Пароль: 123456
   - Ресторан: Тестовый ресторан
3. Нажмите "Зарегистрироваться"
4. **Ожидание**: Редирект на главную страницу

### ✅ Шаг 2: Проверка токена
1. Откройте DevTools (F12)
2. Application → Local Storage
3. **Проверьте**: Есть ключ `auth_token` со значением

### ✅ Шаг 3: Проверка Network запросов
1. DevTools → Network
2. Перезагрузите страницу
3. **Проверьте запросы**:
   - `GET /auth/me` - загрузка пользователя
   - Header `Authorization: Bearer ...`
   - Status: 200

### ✅ Шаг 4: Выход
1. Нажмите "Выйти" в сайдбаре (внизу)
2. **Ожидание**: Редирект на /login
3. **Проверка**: Токен удален из localStorage

### ✅ Шаг 5: Вход
1. На странице /login введите:
   - Email: test@example.com
   - Пароль: 123456
2. Нажмите "Войти"
3. **Ожидание**: Редирект на главную

## 🔍 Проверка интеграции с API

Откройте Console в DevTools и выполните:

```javascript
// 1. Проверить токен
localStorage.getItem('auth_token')

// 2. Проверить запрос к API вручную
fetch('http://localhost:8000/auth/me', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
  }
})
  .then(r => r.json())
  .then(console.log)
```

## ❌ Если не работает:

### CORS ошибка
Добавьте в бэкенд (main.py):
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 401 Unauthorized
- Проверьте что токен есть в localStorage
- Проверьте что токен передается в Headers
- Проверьте срок действия токена

### Connection refused
- Проверьте что бэкенд запущен: `curl http://localhost:8000/health`
- Проверьте .env файл
- Перезапустите фронтенд

## 📋 Что дальше?

После успешного теста авторизации, можно интегрировать остальные страницы:
- Главная (Dashboard) → `/dashboard/today`
- Шаблоны → `/templates`
- История → `/checklists/history`
- Ресторан → `/restaurant` и `/users`

См. полный гайд в `INTEGRATION_GUIDE.md`
