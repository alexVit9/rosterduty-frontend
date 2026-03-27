# 📁 Структура проекта Crew Table

## Полный список файлов для ручного создания

Если вы хотите создать проект локально, вот полная структура:

---

## 📂 Корневые файлы

```
crew-table-app/
├── package.json                    ← Зависимости проекта
├── vite.config.ts                  ← Конфигурация Vite
├── postcss.config.mjs              ← Конфигурация PostCSS
├── tsconfig.json                   ← Конфигурация TypeScript (создастся автоматически)
├── .env                            ← СОЗДАТЬ ВРУЧНУЮ
├── .gitignore                      ← СОЗДАТЬ ВРУЧНУЮ
└── index.html                      ← Главный HTML файл
```

---

## 📂 Папка /src

```
src/
├── main.tsx                        ← Точка входа React
├── styles/
│   ├── index.css                   ← Главный CSS
│   ├── tailwind.css                ← Tailwind базовые стили
│   ├── theme.css                   ← Тема приложения
│   └── fonts.css                   ← Шрифты
│
└── app/
    ├── App.tsx                     ← Главный компонент
    ├── routes.ts                   ← Роуты приложения
    ├── types.ts                    ← TypeScript типы
    │
    ├── lib/
    │   ├── api-client.ts           ← API клиент
    │   ├── auth-context.tsx        ← Контекст авторизации
    │   ├── storage.ts              ← Работа с localStorage
    │   ├── seed-data.ts            ← Тестовые данные
    │   └── badge-colors.ts         ← Цвета для бэйджей
    │
    ├── hooks/
    │   └── useApi.ts               ← Хук для API запросов
    │
    ├── components/
    │   ├── MainLayout.tsx          ← Главный layout с сайдбаром
    │   ├── Sidebar.tsx             ← Сайдбар навигации
    │   ├── ProtectedRoute.tsx      ← Защищенные роуты
    │   │
    │   ├── figma/
    │   │   └── ImageWithFallback.tsx ← Компонент изображений
    │   │
    │   └── ui/                     ← UI компоненты (shadcn/ui)
    │       ├── button.tsx
    │       ├── input.tsx
    │       ├── card.tsx
    │       ├── badge.tsx
    │       ├── progress.tsx
    │       ├── dialog.tsx
    │       ├── select.tsx
    │       ├── textarea.tsx
    │       ├── checkbox.tsx
    │       ├── tabs.tsx
    │       ├── table.tsx
    │       ├── alert.tsx
    │       ├── sonner.tsx
    │       └── ... (еще ~40 UI компонентов)
    │
    └── pages/
        ├── HomePage.tsx            ← Главная (Dashboard)
        ├── TemplatesPage.tsx       ← Мои чек-листы
        ├── TemplateEditorPage.tsx  ← Создание/редактирование
        ├── FillChecklistPage.tsx   ← Заполнение чек-листа
        ├── HistoryPage.tsx         ← История проверок
        ├── RestaurantPage.tsx      ← Мой ресторан
        ├── SubscriptionPage.tsx    ← Подписка
        ├── LoginPage.tsx           ← Страница входа
        └── RegisterPage.tsx        ← Страница регистрации
```

---

## 📦 Зависимости (package.json)

Основные пакеты которые используются:

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router": "^7.1.3",
    "lucide-react": "^0.468.0",
    "sonner": "^1.7.1",
    "@radix-ui/*": "много UI компонентов"
  },
  "devDependencies": {
    "typescript": "~5.6.2",
    "vite": "^5.4.2",
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^4.0.0"
  }
}
```

---

## 🔧 Конфигурационные файлы

### `.env` (создать вручную):
```env
VITE_API_URL=http://localhost:8000
```

### `.gitignore` (создать вручную):
```
# Dependencies
node_modules/

# Build output
dist/
build/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
```

---

## 📊 Размер проекта

- **Общее количество файлов:** ~80
- **Основные файлы (ваш код):** ~25
- **UI компоненты (библиотека):** ~50
- **Размер после установки:** ~300-500 MB (с node_modules)

---

## 🚀 Как создать проект локально

### Вариант 1: Быстрый (новый Vite проект + копирование)

```bash
# 1. Создать Vite проект
npm create vite@latest crew-table-app -- --template react-ts
cd crew-table-app

# 2. Установить зависимости
npm install

# 3. Установить дополнительные пакеты
npm install react-router lucide-react sonner

# 4. Создать папки
mkdir -p src/app/{lib,hooks,components,pages}
mkdir -p src/app/components/{ui,figma}
mkdir -p src/styles

# 5. Скопировать файлы из списка ниже
# (см. следующий раздел)
```

### Вариант 2: Полностью с нуля

Следуйте инструкциям в `MANUAL_SETUP.md` (я могу создать этот файл)

---

## 📝 Следующие шаги

**Что выбрать:**

1. **Хотите полный экспорт всех файлов?**
   - Я создам файлы `FILE_01.md`, `FILE_02.md` и т.д.
   - В каждом будет содержимое группы файлов
   - Вы скопируете и создадите локально

2. **Хотите пошаговую инструкцию по созданию?**
   - Я создам `MANUAL_SETUP.md`
   - Пошаговое создание проекта с нуля
   - С установкой всех зависимостей

3. **Хотите использовать Git?**
   - Я объясню как настроить GitHub интеграцию
   - Вы получите репозиторий с кодом

---

**Напишите какой вариант вам нужен!** 🎯
