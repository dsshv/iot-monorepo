# Event Service

Централизованный сервис для обработки событий в IoT платформе.

## Назначение

Event Service отвечает за:

- Централизованную обработку событий, поступающих через NATS
- Логирование событий в консоль
- Сохранение событий в MongoDB для отложенного анализа
- Расширяемую архитектуру для будущей бизнес-логики событий

## Функциональность

### Подписки на события

Сервис подписывается на следующие NATS каналы:

- `device.created` - события создания устройств
- `device.updated` - события обновления устройств
- `telemetry.received` - события получения телеметрии

### Обработка событий

1. **Логирование** - все события логируются в консоль с детальной информацией
2. **Сохранение** - события сохраняются в MongoDB (если включено через `ENABLE_EVENT_STORAGE`)
3. **Бизнес-логика** - расширяемая архитектура для обработки событий

### API для работы с событиями

```typescript
// Получение событий по типу
async getEventsByType(eventType: string, limit?: number): Promise<Event[]>

// Получение событий по устройству
async getEventsByDevice(deviceId: string, limit?: number): Promise<Event[]>

// Получение событий по диапазону дат
async getEventsByDateRange(startDate: Date, endDate: Date, limit?: number): Promise<Event[]>

// Получение количества событий по типу
async getEventCountByType(eventType: string): Promise<number>
```

## Структура события

```typescript
interface EventData {
  eventType: string; // Тип события
  source: string; // Источник события
  payload: any; // Данные события
  deviceId?: string; // ID устройства (опционально)
  userId?: string; // ID пользователя (опционально)
  metadata?: any; // Дополнительные метаданные
}
```

## Конфигурация

### Переменные окружения

```env
# Основные настройки
PORT=3004
NODE_ENV=development

# MongoDB
MONGO_URL=mongodb://mongo:27017
MONGO_DB_NAME=iot

# NATS
NATS_URL=nats://nats:4222

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:4000

# Обработка событий
ENABLE_EVENT_STORAGE=true
EVENT_RETENTION_DAYS=30
```

### Docker

```yaml
event-service:
  build: ./backend/event-service
  ports:
    - "3004:3004"
  depends_on:
    - mongo
    - nats
  environment:
    - MONGO_URL=mongodb://mongo:27017
    - MONGO_DB_NAME=iot
    - NATS_URL=nats://nats:4222
    - ENABLE_EVENT_STORAGE=true
    - EVENT_RETENTION_DAYS=30
```

## Запуск

### Локальный запуск

```bash
# Установка зависимостей
npm install

# Сборка
npm run build

# Запуск
npm start
```

### Через Docker

```bash
# Сборка и запуск
docker-compose up event-service

# Только сборка
docker build -t event-service .
```

## Тестирование

```bash
# Запуск всех тестов
npm test

# Запуск тестов с покрытием
npm run test:cov

# Запуск тестов в режиме watch
npm run test:watch
```

## Архитектура

### Модули

- **EventService** - основной сервис для обработки событий
- **Event Entity** - сущность для хранения событий в MongoDB
- **NATS Integration** - интеграция с NATS через shared/nats.ts

### Жизненный цикл

1. **Инициализация** - подключение к NATS и MongoDB
2. **Подписка** - подписка на каналы событий
3. **Обработка** - получение и обработка событий
4. **Сохранение** - сохранение в базу данных
5. **Graceful Shutdown** - корректное завершение работы

## Расширение функциональности

### Добавление новых типов событий

1. Добавить новый канал в `setupEventSubscriptions()`
2. Создать обработчик события
3. Добавить бизнес-логику в `executeBusinessLogic()`

### Пример добавления обработчика

```typescript
// Подписка на новый канал
const newEventSub = connection.subscribe('new.event.type');

// Обработка событий
(async () => {
  for await (const msg of newEventSub) {
    const eventData = JSON.parse(msg.data.toString());
    await this.handleNewEvent(eventData);
  }
})();

// Обработчик события
private async handleNewEvent(eventData: any) {
  const event: EventData = {
    eventType: 'new.event.type',
    source: 'source-service',
    payload: eventData,
    metadata: { timestamp: new Date(), processed: true },
  };

  await this.processEvent(event);
}
```

## Мониторинг

### Логи

Сервис выводит подробные логи:

- Подключение к NATS и MongoDB
- Получение событий
- Ошибки обработки
- Статистика обработки

### Метрики

Можно добавить метрики для:

- Количества обработанных событий
- Времени обработки
- Ошибок
- Использования памяти

## Безопасность

- Валидация входящих событий
- Ограничение размера payload
- Логирование подозрительной активности
- Защита от DoS атак

## Производительность

- Асинхронная обработка событий
- Батчинг для сохранения в MongoDB
- Индексы для быстрого поиска
- Настраиваемые лимиты
