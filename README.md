## Roxide bot API

API для игры

## Установка пакетов

```bash
$ npm install
```

## Запуск приложения

```bash
# dev
$ npm run start

# watch mode
$ npm run start:dev

# build (перед запуском prod)
$ npm run build

# prod (Если не запускает этой командой на сервере попробовать node dist/src/main.js)
$ npm run start:prod
```

## Названия перменных в Env-файл (файлик .env)
- DB_HOST - хост БД
- DB_PORT - порт БД
- DB_USERNAME - username пользователя БД
- DB_PASSWORD - пароль БД
- DB_DATABASE - название БД
- TELEGRAM_BOT_TOKEN - токен бота
- TELEGRAM_BOT_NAME - название бота

## Конфигурации
Использовать для конфигурации БД PostgreSQL
