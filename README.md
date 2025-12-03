# Firework Store

Интернет-магазин фейерверков на React + Vite.

## Настройка окружения

### Переменные окружения

Создайте файл `.env` в корне проекта со следующими переменными:

```env
VITE_TELEGRAM_BOT_TOKEN=your_bot_token_here
VITE_TELEGRAM_CHAT_ID=your_chat_id_here
```

**Важно:** Не коммитьте файл `.env` в репозиторий. Он должен быть добавлен в `.gitignore`.

### Получение токена Telegram бота

1. Создайте бота через [@BotFather](https://t.me/BotFather) в Telegram
2. Получите токен бота
3. Узнайте ID чата, куда будут отправляться заказы (можно использовать [@userinfobot](https://t.me/userinfobot))

## Установка и запуск

```bash
npm install
npm run dev
```

## Сборка для продакшена

```bash
npm run build
```

## Технологии

- React 19
- Vite
- Redux Toolkit
- React Router
- Tailwind CSS
- React Hook Form
