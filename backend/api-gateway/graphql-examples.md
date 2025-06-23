# GraphQL API Examples

## Аутентификация

Все запросы и подписки требуют JWT токен в заголовке Authorization:

```
Authorization: Bearer <your-jwt-token>
```

## Запросы (Queries)

### 1. Получить список всех устройств

```graphql
query {
  devices {
    _id
    name
    type
    status
  }
}
```

### 2. Получить конкретное устройство по ID

```graphql
query {
  device(id: "device-id-here") {
    _id
    name
    type
    status
  }
}
```

### 3. Получить телеметрию устройства

```graphql
query {
  deviceTelemetry(deviceId: "device-id-here") {
    _id
    deviceId
    timestamp
    payload
  }
}
```

## Подписки (Subscriptions)

### 1. Подписка на телеметрию конкретного устройства

```graphql
subscription {
  telemetry(deviceId: "device-id-here") {
    _id
    deviceId
    timestamp
    payload
  }
}
```

## Примеры использования с cURL

### Получить список устройств

```bash
curl -X POST \
  http://localhost:4000/graphql \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer your-jwt-token' \
  -d '{
    "query": "query { devices { _id name type status } }"
  }'
```

### Получить устройство по ID

```bash
curl -X POST \
  http://localhost:4000/graphql \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer your-jwt-token' \
  -d '{
    "query": "query { device(id: \"device-id\") { _id name type status } }"
  }'
```

### Получить телеметрию устройства

```bash
curl -X POST \
  http://localhost:4000/graphql \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer your-jwt-token' \
  -d '{
    "query": "query { deviceTelemetry(deviceId: \"device-id\") { _id deviceId timestamp payload } }"
  }'
```

## Примеры использования с JavaScript/TypeScript

### Apollo Client

```typescript
import {ApolloClient, InMemoryCache, createHttpLink} from "@apollo/client";
import {setContext} from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: "http://localhost:4000/graphql",
});

const authLink = setContext((_, {headers}) => {
  const token = localStorage.getItem("jwt-token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

// Запрос устройств
const GET_DEVICES = gql`
  query GetDevices {
    devices {
      _id
      name
      type
      status
    }
  }
`;

// Подписка на телеметрию
const TELEMETRY_SUBSCRIPTION = gql`
  subscription OnTelemetry($deviceId: String!) {
    telemetry(deviceId: $deviceId) {
      _id
      deviceId
      timestamp
      payload
    }
  }
`;
```

## WebSocket подключение для подписок

```typescript
import {WebSocketLink} from "@apollo/client/link/ws";
import {getMainDefinition} from "@apollo/client/utilities";

const wsLink = new WebSocketLink({
  uri: "ws://localhost:4000/graphql",
  options: {
    reconnect: true,
    connectionParams: {
      authToken: "your-jwt-token",
    },
  },
});

const splitLink = split(
  ({query}) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);
```

## Обработка ошибок

### Ошибка аутентификации

```json
{
  "errors": [
    {
      "message": "Authentication required",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

### Ошибка валидации

```json
{
  "errors": [
    {
      "message": "Device with id device-id not found",
      "extensions": {
        "code": "NOT_FOUND"
      }
    }
  ]
}
```

## Тестирование в GraphQL Playground

1. Откройте http://localhost:4000/graphql
2. В разделе HTTP HEADERS добавьте:
   ```json
   {
     "Authorization": "Bearer your-jwt-token"
   }
   ```
3. Выполните запросы в редакторе

## Примечания

- Все запросы требуют валидный JWT токен
- Подписки фильтруются по deviceId - вы получаете только данные для указанного устройства
- Телеметрия публикуется в реальном времени через NATS
- Ошибки логируются в консоли сервиса
