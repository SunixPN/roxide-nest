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

## Админка
Админка реализована в боте. Для начала работы с админкой в боте необходимо ввести команду /admin 
(команда доступна пользователям с ролью 'admin')

## Админка - функционал
- Create task - Создание задачи (Вводим нужные данные, которые просит бот). Если мы не хотим добавлять подзадачи для этой задачи, то следует указать ссылку на телеграмм канал либо на внешние ресурсы при создании. Если хотим -- пропускаем данный шаг

- Edit task - Обновление задачи - Пишем боту название той задачи, которую хотим изменить, далее пишем поля, которые хотим изменить. Если не хотим менять какое-либо поле, то пропускаем шаг. (Не рекомендуется добавлять для задачи ссылку на ресурсы, если у этой задачи есть подзадачи)

- Delete task - Удаление задачи - Пишем название задачи, которую хотим удалить. бот её удалит

- Creating subTask - Создание подзадачи. (См. пункт Create Task), Только перед созданием вводим название главной задачи, к которой хотим подвязать эту подзадачу. (В данном варианте обязательно нужно указать ссылки на внешние ресурсы или телеграм канал, также не указываем награду, так-как награда будет от главной задачи, после выполнения всех подзадач)

- Return to previoues step - Вернуться на шаг назад

