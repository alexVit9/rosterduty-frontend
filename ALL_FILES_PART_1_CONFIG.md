# 📦 ЧАСТЬ 1: Конфигурационные файлы

Скопируйте эти файлы в **КОРЕНЬ** проекта (рядом с папкой `src`)

---

## 📄 Файл: `package.json`

**Где создать:** `/package.json` (корень проекта)

```json
{
  "name": "crew-table-app",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@radix-ui/react-accordion": "1.2.3",
    "@radix-ui/react-alert-dialog": "1.1.6",
    "@radix-ui/react-avatar": "1.1.3",
    "@radix-ui/react-checkbox": "1.1.4",
    "@radix-ui/react-dialog": "1.1.6",
    "@radix-ui/react-dropdown-menu": "2.1.6",
    "@radix-ui/react-label": "2.1.2",
    "@radix-ui/react-popover": "1.1.6",
    "@radix-ui/react-progress": "1.1.2",
    "@radix-ui/react-select": "2.1.6",
    "@radix-ui/react-separator": "1.1.2",
    "@radix-ui/react-slot": "1.1.2",
    "@radix-ui/react-switch": "1.1.3",
    "@radix-ui/react-tabs": "1.1.3",
    "class-variance-authority": "0.7.1",
    "clsx": "2.1.1",
    "date-fns": "3.6.0",
    "lucide-react": "0.487.0",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "react-router": "7.13.0",
    "sonner": "2.0.3",
    "tailwind-merge": "3.2.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "4.1.12",
    "@vitejs/plugin-react": "4.7.0",
    "@types/react": "18.3.12",
    "@types/react-dom": "18.3.1",
    "tailwindcss": "4.1.12",
    "typescript": "5.6.2",
    "vite": "6.3.5"
  }
}
```

---

## 📄 Файл: `vite.config.ts`

**Где создать:** `/vite.config.ts` (корень проекта)

```typescript
import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
```

---

## 📄 Файл: `tsconfig.json`

**Где создать:** `/tsconfig.json` (корень проекта)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

---

## 📄 Файл: `tsconfig.node.json`

**Где создать:** `/tsconfig.node.json` (корень проекта)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noEmit": true
  },
  "include": ["vite.config.ts"]
}
```

---

## 📄 Файл: `postcss.config.mjs`

**Где создать:** `/postcss.config.mjs` (корень проекта)

```javascript
export default {}
```

---

## 📄 Файл: `.env`

**Где создать:** `/.env` (корень проекта)

```env
VITE_API_URL=http://localhost:8000
```

---

## 📄 Файл: `.gitignore`

**Где создать:** `/.gitignore` (корень проекта)

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
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Local
.cache/
```

---

## 📄 Файл: `index.html`

**Где создать:** `/index.html` (корень проекта)

```html
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Crew Table - Управление чек-листами</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## 📄 Файл: `src/main.tsx`

**Где создать:** `/src/main.tsx`

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

---

## ✅ Проверка

После создания этих файлов у вас должна быть структура:

```
crew-table-app/
├── package.json          ✅
├── vite.config.ts        ✅
├── tsconfig.json         ✅
├── tsconfig.node.json    ✅
├── postcss.config.mjs    ✅
├── .env                  ✅
├── .gitignore            ✅
├── index.html            ✅
└── src/
    └── main.tsx          ✅
```

---

## 🚀 Следующий шаг

После создания этих файлов:

1. Откройте терминал в папке проекта
2. Выполните: `npm install`
3. Дождитесь установки всех пакетов
4. Переходите к `ALL_FILES_PART_2_STYLES.md`

---

**Готово? Переходите к следующей части!** →
