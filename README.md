# Счетчик на React + Tauri

Простое приложение-счетчик, собранное с помощью Tauri для десктоп Ubuntu 24.04.3.

## Требования

- Node.js (рекомендуется версия 18 или выше)
- pnpm (`npm install -g pnpm`)
- Rust и Cargo (для сборки Tauri приложения)
- Системные зависимости для Ubuntu:
  ```bash
  sudo apt update
  sudo apt install libwebkit2gtk-4.1-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
  ```

## Установка зависимостей

```bash
pnpm install
```

## Разработка

Запуск приложения в режиме разработки:

```bash
pnpm tauri:dev
```

Это команда запустит:
- Vite dev server для React приложения
- Tauri приложение с hot-reload

## Сборка

Сборка приложения для Ubuntu:

```bash
pnpm tauri:build
```

Собранное приложение будет находиться в `src-tauri/target/release/bundle/`.

**Примечание:** Перед первой сборкой вам нужно будет добавить иконки в папку `src-tauri/icons/`. Вы можете использовать Tauri CLI для генерации иконок из одного исходного изображения:

```bash
pnpm tauri icon path/to/your-icon.png
```

Или создать иконки вручную в следующих размерах:
- 32x32.png
- 128x128.png
- 128x128@2x.png
- icon.icns (для macOS)
- icon.ico (для Windows)

## Структура проекта

```
.
├── src/              # React приложение
│   ├── App.tsx       # Главный компонент со счетчиком
│   ├── App.css       # Стили приложения
│   ├── main.tsx      # Точка входа React
│   └── index.css     # Глобальные стили
├── src-tauri/        # Tauri приложение (Rust)
│   ├── src/
│   │   └── main.rs   # Точка входа Rust
│   ├── Cargo.toml    # Конфигурация Cargo
│   └── tauri.conf.json # Конфигурация Tauri
├── package.json      # Зависимости Node.js
├── vite.config.ts    # Конфигурация Vite
└── tsconfig.json     # Конфигурация TypeScript
```

## Функциональность

Приложение представляет собой простой счетчик с тремя кнопками:
- **-1**: Уменьшает значение счетчика на 1
- **Сброс**: Сбрасывает счетчик в 0
- **+1**: Увеличивает значение счетчика на 1
