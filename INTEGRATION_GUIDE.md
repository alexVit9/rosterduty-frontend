# 🚀 Гайд по интеграции бэкенда с фронтендом

## 📋 Что было сделано

### 1. Создан API клиент (`/src/app/lib/api-client.ts`)
- Полная интеграция всех эндпоинтов бэкенда
- Автоматическая работа с JWT токенами
- Обработка ошибок
- Загрузка фотографий

### 2. Создана система авторизации (`/src/app/lib/auth-context.tsx`)
- React Context для глобального состояния пользователя
- Автоматическая проверка токена при загрузке
- Функции login, logout, register

### 3. Созданы страницы авторизации
- `/src/app/pages/LoginPage.tsx` - страница входа
- `/src/app/pages/RegisterPage.tsx` - регистрация менеджера
- Защищенные роуты через `ProtectedRoute`

### 4. Добавлены UI компоненты
- `Input` - поле ввода
- `Label` - метка для формы

## 🔧 Настройка окружения

### 1. Создайте файл `.env` в корне проекта:

\`\`\`env
VITE_API_URL=http://localhost:8000
\`\`\`

### 2. Установите зависимости (если нужно):

\`\`\`bash
npm install
# или
pnpm install
\`\`\`

## 🧪 Как тестировать

### Этап 1: Проверка подключения к бэкенду

1. **Запустите бэкенд** на `http://localhost:8000`

2. **Откройте DevTools в браузере** (F12) → вкладка Console

3. **Проверьте health endpoint**:
\`\`\`javascript
fetch('http://localhost:8000/health')
  .then(r => r.json())
  .then(console.log)
\`\`\`

Должно вернуть: `{ "status": "ok" }`

### Этап 2: Регистрация менеджера

1. Откройте приложение: `http://localhost:5173`
2. Должна открыться страница `/login`
3. Нажмите "Зарегистрироваться"
4. Заполните форму:
   - Имя: Иван Иванов
   - Email: manager@test.com
   - Пароль: 123456
   - Название ресторана: Тестовый ресторан
5. Нажмите "Зарегистрироваться"

**Что проверить:**
- ✅ Успешная регистрация → редирект на главную
- ✅ Токен сохранен в localStorage (DevTools → Application → Local Storage)
- ✅ Данные пользователя загружены

### Этап 3: Вход в систему

1. Выйдите из аккаунта (если есть кнопка в сайдбаре)
2. Перейдите на `/login`
3. Введите:
   - Email: manager@test.com
   - Пароль: 123456
4. Нажмите "Войти"

**Что проверить:**
- ✅ Успешный вход → редирект на главную
- ✅ Токен сохранен
- ✅ Пользователь загружен

### Этап 4: Проверка API запросов

Откройте **DevTools → Network** и проверьте запросы:

#### 4.1 Главная страница (Dashboard)
- Должен отправиться `GET /dashboard/today`
- Header: `Authorization: Bearer <token>`
- Ответ: список чек-листов на сегодня

#### 4.2 Управление чек-листами
- Перейдите в "Мои чек-листы"
- Должен отправиться `GET /templates`
- Ответ: список шаблонов

#### 4.3 Создание шаблона
- Нажмите "Создать чек-лист"
- Заполните форму
- Должен отправиться `POST /templates`
- Body: `{ name, location, department, items: [...] }`

#### 4.4 Мой ресторан
- Перейдите в "Мой ресторан"
- Должен отправиться `GET /restaurant`
- Ответ: данные ресторана

#### 4.5 Сотрудники
- В разделе "Мой ресторан" → Сотрудники
- Должен отправиться `GET /users`
- Ответ: список сотрудников

#### 4.6 Приглашение сотрудника
- Нажмите "Пригласить сотрудника"
- Заполните форму
- Должен отправиться `POST /users/invite`

### Этап 5: Загрузка фотографий

1. Перейдите к заполнению чек-листа
2. Для пункта с фото:
   - Загрузите изображение
   - Должен отправиться `POST /photos/upload` (multipart/form-data)
   - Ответ: `{ "photo_url": "..." }`
3. При завершении чек-листа:
   - Должен отправиться `POST /checklists/complete`
   - В items должны быть photo_url из загрузок

## 🐛 Отладка ошибок

### Ошибка: "Network error" или CORS

**Проблема**: Бэкенд не разрешает запросы с фронтенда

**Решение**: Добавьте CORS на бэкенде:
\`\`\`python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
\`\`\`

### Ошибка: "Unauthorized" (401)

**Проблема**: Токен не передается или истек

**Решение**:
1. Проверьте localStorage → `auth_token`
2. Проверьте Headers запроса: `Authorization: Bearer <token>`
3. Проверьте срок действия токена на бэкенде

### Ошибка: "Failed to fetch"

**Проблема**: Бэкенд не запущен или неверный URL

**Решение**:
1. Проверьте, что бэкенд запущен: `http://localhost:8000/health`
2. Проверьте `.env`: `VITE_API_URL=http://localhost:8000`
3. Перезапустите фронтенд: `npm run dev`

## 📝 Следующие шаги для полной интеграции

Чтобы полностью заменить localStorage на API, нужно обновить:

1. **HomePage.tsx** - использовать `apiClient.getDashboardToday()`
2. **TemplatesPage.tsx** - использовать `apiClient.getTemplates()`
3. **TemplateEditorPage.tsx** - использовать `apiClient.createTemplate()` / `updateTemplate()`
4. **FillChecklistPage.tsx** - использовать `apiClient.completeChecklist()`
5. **HistoryPage.tsx** - использовать `apiClient.getChecklistHistory()`
6. **RestaurantPage.tsx** - использовать `apiClient.getRestaurant()`, `getUsers()`, etc.

## ✅ Чеклист тестирования

- [ ] Бэкенд запущен и доступен
- [ ] CORS настроен
- [ ] .env файл создан
- [ ] Регистрация работает
- [ ] Вход работает
- [ ] Токен сохраняется
- [ ] GET запросы отправляются с токеном
- [ ] POST запросы работают
- [ ] Загрузка фото работает
- [ ] Выход работает (токен удаляется)

## 🔍 Полезные команды для отладки

### В браузере (Console):
\`\`\`javascript
// Проверить текущий токен
localStorage.getItem('auth_token')

// Проверить API запрос вручную
fetch('http://localhost:8000/auth/me', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
  }
}).then(r => r.json()).then(console.log)
\`\`\`

## 📞 Если что-то не работает

1. Откройте DevTools → Console - посмотрите ошибки JavaScript
2. Откройте DevTools → Network - посмотрите HTTP запросы
3. Проверьте ответы бэкенда - статус коды и body
4. Проверьте логи бэкенда в терминале
