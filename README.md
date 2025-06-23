# IoT Platform

Полнофункциональная IoT платформа с микросервисной архитектурой, включающая управление устройствами, телеметрию и веб-интерфейс.

## Архитектура

Проект состоит из следующих компонентов:

### Backend (Микросервисы)

- **api-gateway** (порт 4000) - GraphQL API Gateway с JWT аутентификацией
- **auth-service** (порт 3001) - Сервис аутентификации
- **device-service** (порт 3002) - Управление устройствами
- **telemetry-service** (порт 3003) - Обработка телеметрии

### Frontend

- **React приложение** (порт 3000) - Веб-интерфейс

### Инфраструктура

- **NATS** (порт 4222) - Message broker
- **MongoDB** (порт 27017) - База данных

## Новые улучшения

### 1. Оптимизация NATS

- ✅ Singleton pattern для подключения к NATS
- ✅ Автоматическое переподключение и graceful shutdown
- ✅ Единый экземпляр подключения во всех сервисах

### 2. Поддержка .env файлов

- ✅ Конфигурация через переменные окружения
- ✅ Отдельные .env файлы для каждого сервиса
- ✅ Передача переменных через Docker Compose

### 3. Расширенные API эндпойнты

- ✅ PUT /devices/:id - обновление статуса устройства
- ✅ GET /telemetry/device/:deviceId - получение телеметрии устройства
- ✅ Настраиваемое количество записей телеметрии

### 4. Модульный API Gateway

- ✅ Полноценная модульная архитектура NestJS
- ✅ JWT аутентификация для всех GraphQL запросов и подписок
- ✅ Фильтрация подписок по deviceId
- ✅ Автоматическая генерация GraphQL схем

### 5. Безопасность

- ✅ JWT guard для защиты всех эндпойнтов
- ✅ Декоратор для получения текущего пользователя
- ✅ Валидация токенов в заголовке Authorization

### 6. Тестирование

- ✅ Jest тесты для всех микросервисов
- ✅ Unit тесты для контроллеров, сервисов и резолверов
- ✅ Интеграционные тесты для API Gateway
- ✅ Покрытие кода с отчетами
- ✅ Автоматизированный запуск тестов

## Запуск проекта

### 1. Подготовка окружения

```bash
# Копирование примеров .env файлов
./setup-env.sh

# Установка зависимостей
./install-dependencies.sh
```

### 2. Запуск через Docker Compose

```bash
docker-compose up --build
```

### 3. Альтернативный запуск (без Docker)

```bash
# Запуск сервисов в отдельных терминалах
cd backend/api-gateway && npm run build && npm start
cd backend/device-service && npm run build && npm start
cd backend/telemetry-service && npm run build && npm start
cd frontend && npm run dev
```

## Тестирование

### Запуск тестов

```bash
# Запуск всех тестов
cd backend && ./run-tests.sh

# Запуск тестов конкретного сервиса
cd backend && ./run-tests.sh auth-service
cd backend && ./run-tests.sh device-service
cd backend && ./run-tests.sh telemetry-service
cd backend && ./run-tests.sh api-gateway

# Запуск тестов с покрытием
cd backend && ./run-tests.sh coverage api-gateway

# Справка
cd backend && ./run-tests.sh help
```

### Типы тестов

- **Unit тесты** - тестирование отдельных компонентов
- **Интеграционные тесты** - тестирование взаимодействия компонентов
- **E2E тесты** - тестирование полного flow приложения

### Покрытие кода

Тесты покрывают:

- ✅ Контроллеры (все endpoints)
- ✅ Сервисы (бизнес-логика)
- ✅ GraphQL резолверы
- ✅ Guards и декораторы
- ✅ NATS интеграция
- ✅ Обработка ошибок

Подробная документация по тестированию: [backend/TESTS.md](backend/TESTS.md)

## Функциональность

### Backend

#### Device Service

- `GET /devices` - Получение списка всех устройств
- `GET /devices/:id` - Получение информации о конкретном устройстве
- `POST /devices` - Создание нового устройства
- `PUT /devices/:id` - Обновление статуса устройства

#### Telemetry Service

- `POST /telemetry` - Отправка телеметрии
- `GET /telemetry/device/:deviceId` - Получение телеметрии устройства
- Автоматическое ограничение записей (настраивается через MAX_TELEMETRY_RECORDS_PER_DEVICE)

#### API Gateway (GraphQL с JWT)

- GraphQL endpoint на `/graphql`
- JWT аутентификация для всех запросов и подписок
- Поддержка подписок для real-time обновлений
- Фильтрация подписок по deviceId

### Frontend

#### Страницы

- `/devices` - Список всех устройств
- `/devices/:id` - Детальная информация об устройстве с телеметрией

#### Функции

- Отображение списка устройств в виде карточек
- Детальная информация об устройстве
- Таблица телеметрии с обновлением в реальном времени
- Адаптивный дизайн

## Переменные окружения

### Auth Service

```env
PORT=3001
MONGO_URL=mongodb://mongo:27017
MONGO_DB_NAME=iot
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:3000,http://localhost:4000
```

### API Gateway

```env
PORT=3000
NATS_URL=nats://nats:4222
JWT_SECRET=your-super-secret-jwt-key
DEVICE_SERVICE_URL=http://device-service:3002
TELEMETRY_SERVICE_URL=http://telemetry-service:3003
AUTH_SERVICE_URL=http://auth-service:3001
CORS_ORIGIN=http://localhost:3000,http://localhost:8080
```

### Device Service

```env
PORT=3002
MONGO_URL=mongodb://mongo:27017
MONGO_DB_NAME=iot
NATS_URL=nats://nats:4222
CORS_ORIGIN=http://localhost:3000,http://localhost:4000
```

### Telemetry Service

```env
PORT=3003
MONGO_URL=mongodb://mongo:27017
MONGO_DB_NAME=iot
NATS_URL=nats://nats:4222
MAX_TELEMETRY_RECORDS_PER_DEVICE=100
CORS_ORIGIN=http://localhost:3000,http://localhost:4000
```

## GraphQL API

### Аутентификация

Все запросы и подписки требуют JWT токен в заголовке:

```
Authorization: Bearer <your-jwt-token>
```

### Запросы

```graphql
# Получить все устройства
query {
  devices {
    _id
    name
    type
    status
  }
}

# Получить конкретное устройство
query {
  device(id: "device_id") {
    _id
    name
    type
    status
  }
}

# Получить телеметрию устройства
query {
  deviceTelemetry(deviceId: "device_id") {
    _id
    deviceId
    timestamp
    payload
  }
}
```

### Подписки

```graphql
# Подписка на телеметрию конкретного устройства
subscription {
  telemetry(deviceId: "device_id") {
    _id
    deviceId
    timestamp
    payload
  }
}
```

## REST API

### Устройства

```bash
# Получить все устройства
GET http://localhost:3002/devices

# Получить конкретное устройство
GET http://localhost:3002/devices/:id

# Создать устройство
POST http://localhost:3002/devices
Content-Type: application/json

{
  "name": "Название устройства",
  "type": "sensor",
  "status": "online"
}

# Обновить статус устройства
PUT http://localhost:3002/devices/:id
Content-Type: application/json

{
  "status": "offline"
}
```

### Телеметрия

```bash
# Отправить телеметрию
POST http://localhost:3003/telemetry
Content-Type: application/json

{
  "deviceId": "device_id",
  "payload": {
    "temperature": 23.5,
    "humidity": 45
  }
}

# Получить телеметрию устройства
GET http://localhost:3003/telemetry/device/:deviceId
```

## Тестирование

### Тестирование API

```bash
# Создание тестовых данных и тестирование всех эндпойнтов
node test-api.js
```

### Тестирование GraphQL с JWT

```bash
# Тестирование GraphQL API с аутентификацией
cd backend/api-gateway
node test-graphql.js
```

## Доступные URL

- **Frontend**: http://localhost:3000
- **GraphQL Playground**: http://localhost:4000/graphql
- **Device Service**: http://localhost:3002
- **Telemetry Service**: http://localhost:3003
- **Auth Service**: http://localhost:3001

## Структура API Gateway

```
backend/api-gateway/
├── src/
│   ├── app.module.ts           # Основной модуль приложения
│   ├── app.controller.ts       # Основной контроллер
│   ├── app.service.ts          # Основной сервис
│   ├── main.ts                 # Точка входа
│   ├── auth/                   # Модуль аутентификации
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── auth.guard.ts
│   │   ├── jwt.strategy.ts
│   │   └── current-user.decorator.ts
│   ├── device/                 # Модуль устройств
│   │   ├── device.module.ts
│   │   ├── device.service.ts
│   │   └── device.resolver.ts
│   ├── telemetry/              # Модуль телеметрии
│   │   ├── telemetry.module.ts
│   │   ├── telemetry.service.ts
│   │   └── telemetry.resolver.ts
│   ├── nats/                   # Модуль NATS
│   │   ├── nats.module.ts
│   │   └── nats.service.ts
│   └── graphql/                # GraphQL схемы
│       └── schema.ts
├── graphql-examples.md         # Примеры GraphQL запросов
└── test-graphql.js             # Тестирование GraphQL API
```

## Технологии

### Backend

- **NestJS** - Фреймворк для Node.js с модульной архитектурой
- **MikroORM** - ORM для работы с базой данных
- **MongoDB** - NoSQL база данных
- **NATS** - Message broker с singleton pattern
- **GraphQL** - API query language с подписками
- **JWT** - Аутентификация и авторизация
- **dotenv** - Управление переменными окружения
- **Passport** - Стратегии аутентификации

### Frontend

- **React** - UI библиотека
- **Apollo Client** - GraphQL клиент
- **React Router** - Маршрутизация
- **TypeScript** - Типизированный JavaScript

### Инфраструктура

- **Docker** - Контейнеризация
- **Docker Compose** - Оркестрация контейнеров
- **Environment Variables** - Конфигурация через .env файлы
