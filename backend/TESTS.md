# Тестирование микросервисов

## Обзор

Все микросервисы бэкенда покрыты Jest тестами, включая unit тесты, интеграционные тесты и e2e тесты.

## Структура тестов

### Auth Service

```
backend/auth-service/test/
├── auth.controller.spec.ts    # Тесты контроллера аутентификации
└── setup.ts                   # Настройка тестового окружения
```

### Device Service

```
backend/device-service/test/
├── device.controller.spec.ts  # Тесты контроллера устройств
└── setup.ts                   # Настройка тестового окружения
```

### Telemetry Service

```
backend/telemetry-service/test/
├── telemetry.controller.spec.ts # Тесты контроллера телеметрии
└── setup.ts                      # Настройка тестового окружения
```

### API Gateway

```
backend/api-gateway/test/
├── auth.service.spec.ts       # Тесты сервиса аутентификации
├── device.service.spec.ts     # Тесты сервиса устройств
├── telemetry.service.spec.ts  # Тесты сервиса телеметрии
├── device.resolver.spec.ts    # Тесты GraphQL резолвера устройств
├── telemetry.resolver.spec.ts # Тесты GraphQL резолвера телеметрии
├── nats.service.spec.ts       # Тесты NATS сервиса
├── app.e2e-spec.ts           # Интеграционные тесты
└── setup.ts                   # Настройка тестового окружения
```

## Запуск тестов

### Запуск всех тестов

```bash
# Из корневой директории проекта
cd backend/auth-service && npm test
cd backend/device-service && npm test
cd backend/telemetry-service && npm test
cd backend/api-gateway && npm test
```

### Запуск с покрытием

```bash
npm run test:cov
```

### Запуск в watch режиме

```bash
npm run test:watch
```

### Запуск e2e тестов

```bash
npm run test:e2e
```

## Конфигурация Jest

Все сервисы используют единую конфигурацию Jest с настройками:

- **preset**: `ts-jest` - для TypeScript поддержки
- **testEnvironment**: `node` - для Node.js окружения
- **coverage**: Включен сбор покрытия кода
- **setupFilesAfterEnv**: Настройка тестового окружения
- **testTimeout**: 10 секунд для асинхронных тестов

## Типы тестов

### Unit тесты

- Тестируют отдельные компоненты изолированно
- Используют моки для внешних зависимостей
- Быстрые и надежные

### Интеграционные тесты

- Тестируют взаимодействие между компонентами
- Проверяют работу с базой данных и внешними сервисами
- Более медленные, но более реалистичные

### E2E тесты

- Тестируют полный flow приложения
- Проверяют HTTP endpoints и GraphQL API
- Используют supertest для HTTP запросов

## Моки и стабы

### База данных

```typescript
const mockEntityManager = {
  find: jest.fn(),
  findOne: jest.fn(),
  persistAndFlush: jest.fn(),
  remove: jest.fn(),
  flush: jest.fn(),
};
```

### HTTP сервисы

```typescript
const mockHttpService = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
};
```

### NATS

```typescript
jest.mock("nats", () => ({
  connect: jest.fn(() => mockConnection),
  StringCodec: jest.fn(() => mockCodec),
}));
```

### JWT

```typescript
const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};
```

## Покрытие кода

Тесты покрывают:

- ✅ Контроллеры (все endpoints)
- ✅ Сервисы (бизнес-логика)
- ✅ GraphQL резолверы
- ✅ Guards и декораторы
- ✅ NATS интеграция
- ✅ Обработка ошибок
- ✅ Валидация данных

## Переменные окружения для тестов

Все тесты используют отдельные переменные окружения:

```typescript
// test/setup.ts
process.env.JWT_SECRET = "test-secret";
process.env.MONGODB_URI = "mongodb://localhost:27017/test-db";
process.env.NATS_URL = "nats://localhost:4222";
```

## Лучшие практики

1. **Изоляция тестов**: Каждый тест независим
2. **Очистка моков**: `jest.clearAllMocks()` после каждого теста
3. **Описательные названия**: Тесты описывают что тестируется
4. **AAA паттерн**: Arrange, Act, Assert
5. **Моки внешних зависимостей**: Не тестируем внешние сервисы
6. **Покрытие edge cases**: Тестируем ошибки и граничные случаи

## Добавление новых тестов

1. Создайте файл `*.spec.ts` в соответствующей директории
2. Импортируйте тестируемый компонент
3. Создайте моки для зависимостей
4. Напишите тесты используя `describe` и `it`
5. Запустите тесты и убедитесь в покрытии

## Пример теста

```typescript
import {Test, TestingModule} from "@nestjs/testing";
import {MyController} from "./my.controller";
import {MyService} from "./my.service";

describe("MyController", () => {
  let controller: MyController;
  let service: MyService;

  const mockService = {
    doSomething: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MyController],
      providers: [{provide: MyService, useValue: mockService}],
    }).compile();

    controller = module.get<MyController>(MyController);
    service = module.get<MyService>(MyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should do something", async () => {
    const result = {success: true};
    mockService.doSomething.mockResolvedValue(result);

    const actual = await controller.myMethod();

    expect(service.doSomething).toHaveBeenCalled();
    expect(actual).toEqual(result);
  });
});
```
