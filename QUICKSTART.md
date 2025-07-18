# Быстрый запуск IoT Platform

## 1. Подготовка окружения

```bash
# Настройка переменных окружения
./setup-env.sh

# Установка зависимостей (новый подход с общим package.json)
./install-dependencies.sh
```

## 2. Запуск проекта

### Вариант A: Docker Compose (рекомендуется)

```bash
docker-compose up --build
```

### Вариант B: Локальный запуск

```bash
# Сборка всех сервисов
cd backend && npm run build:all

# Запуск сервисов в отдельных терминалах
cd backend/api-gateway && npm start
cd backend/device-service && npm start
cd backend/telemetry-service && npm start
cd backend/event-service && npm start
cd backend/command-service && npm start
cd frontend && npm run dev
```

## 3. Доступ к приложению

- **Frontend**: http://localhost:3000
- **GraphQL Playground**: http://localhost:4000/graphql
- **Event Service**: http://localhost:3004
- **Command Service**: http://localhost:3005

## 4. Управление зависимостями

```bash
# Установка всех зависимостей
cd backend && npm run install:all

# Сборка всех сервисов
cd backend && npm run build:all

# Очистка и переустановка
cd backend && npm run clean:install
```

## 5. Тестирование

```bash
# Создание тестовых данных и тестирование всех эндпойнтов
node test-api.js
```

## 6. Структура приложения

- `/devices` - Список всех устройств
- `/devices/:id` - Детальная информация об устройстве с телеметрией

## Новые возможности

### Event Service

- Централизованная обработка событий через NATS
- Подписка на каналы: `device.created`, `device.updated`, `telemetry.received`
- Логирование событий в консоль
- Сохранение событий в MongoDB

### API эндпойнты

- `PUT /devices/:id` - Обновление статуса устройства
- `GET /telemetry/device/:deviceId` - Получение телеметрии устройства

### GraphQL запросы

- `device(id: ID!)` - Получение устройства по ID
- `deviceTelemetry(deviceId: String!)` - Получение телеметрии устройства
- `telemetry` - Подписка на новые данные телеметрии

### Конфигурация

- Переменные окружения в `.env` файлах
- Настраиваемое количество записей телеметрии
- Singleton pattern для NATS подключения

## Возможные проблемы

1. **Порты заняты**: Убедитесь, что порты 3000, 3001, 3002, 3003, 3004, 4000 свободны
2. **MongoDB не запущен**: Проверьте, что MongoDB доступен на localhost:27017
3. **NATS не запущен**: Проверьте, что NATS доступен на localhost:4222
4. **Отсутствуют .env файлы**: Запустите `./setup-env.sh`

## Остановка

```bash
# Если запущено через Docker Compose
docker-compose down

# Если запущено локально
# Нажмите Ctrl+C в каждом терминале
```

## Переменные окружения

Основные переменные (настраиваются в .env файлах):

```env
# NATS
NATS_URL=nats://nats:4222

# MongoDB
MONGO_URL=mongodb://mongo:27017
MONGO_DB_NAME=iot

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Telemetry
MAX_TELEMETRY_RECORDS_PER_DEVICE=100

# Event Service
ENABLE_EVENT_STORAGE=true
EVENT_RETENTION_DAYS=30
```
