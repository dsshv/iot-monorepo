# API Gateway Structure

## Обзор

API Gateway использует модульную архитектуру NestJS с разделением на функциональные модули.

## Структура файлов

```
backend/api-gateway/
├── src/
│   ├── app.module.ts           # Основной модуль приложения
│   ├── app.controller.ts       # Основной контроллер (health check)
│   ├── app.service.ts          # Основной сервис
│   ├── main.ts                 # Точка входа приложения
│   ├── auth/                   # Модуль аутентификации
│   │   ├── auth.module.ts      # Модуль аутентификации
│   │   ├── auth.service.ts     # Сервис аутентификации
│   │   ├── auth.guard.ts       # JWT Guard для GraphQL
│   │   ├── jwt.strategy.ts     # Passport JWT стратегия
│   │   └── current-user.decorator.ts # Декоратор для получения пользователя
│   ├── device/                 # Модуль устройств
│   │   ├── device.module.ts    # Модуль устройств
│   │   ├── device.service.ts   # Сервис для работы с device-service
│   │   └── device.resolver.ts  # GraphQL резолвер устройств
│   ├── telemetry/              # Модуль телеметрии
│   │   ├── telemetry.module.ts # Модуль телеметрии
│   │   ├── telemetry.service.ts # Сервис для работы с telemetry-service
│   │   └── telemetry.resolver.ts # GraphQL резолвер телеметрии
│   ├── nats/                   # Модуль NATS
│   │   ├── nats.module.ts      # Модуль NATS
│   │   └── nats.service.ts     # Сервис для работы с NATS
│   └── graphql/                # GraphQL схемы
│       └── schema.ts           # GraphQL схемы
├── package.json                # Зависимости
├── tsconfig.json              # Конфигурация TypeScript
├── Dockerfile                 # Docker конфигурация
├── env.example                # Пример переменных окружения
├── graphql-examples.md        # Примеры GraphQL запросов
├── test-graphql.js            # Тестирование GraphQL API
└── STRUCTURE.md               # Этот файл
```

## Модули

### AppModule

- Основной модуль приложения
- Импортирует все остальные модули
- Настраивает GraphQL, JWT, CORS

### AuthModule

- Управляет JWT аутентификацией
- Предоставляет guards и стратегии
- Экспортирует сервисы для других модулей

### DeviceModule

- Взаимодействует с device-service
- Предоставляет GraphQL резолверы для устройств
- Обрабатывает HTTP запросы к device-service

### TelemetryModule

- Взаимодействует с telemetry-service
- Предоставляет GraphQL резолверы для телеметрии
- Управляет подписками на телеметрию

### NatsModule

- Управляет подключением к NATS
- Обрабатывает сообщения телеметрии
- Интегрируется с TelemetryModule

## GraphQL API

### Запросы (Queries)

- `devices` - список всех устройств
- `device(id)` - конкретное устройство
- `deviceTelemetry(deviceId)` - телеметрия устройства

### Подписки (Subscriptions)

- `telemetry(deviceId)` - подписка на телеметрию устройства

## Безопасность

- Все GraphQL запросы и подписки защищены JWT
- Токен передается в заголовке `Authorization: Bearer <token>`
- Используется `JwtAuthGuard` для защиты резолверов

## Конфигурация

Все параметры настраиваются через переменные окружения:

- `JWT_SECRET` - секрет для JWT
- `NATS_URL` - URL NATS сервера
- `DEVICE_SERVICE_URL` - URL device-service
- `TELEMETRY_SERVICE_URL` - URL telemetry-service
- `CORS_ORIGIN` - разрешенные origins для CORS
