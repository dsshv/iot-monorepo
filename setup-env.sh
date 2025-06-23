#!/bin/bash

echo "Настройка переменных окружения для IoT Platform..."

# Создание .env файлов из примеров
echo "Копирование примеров .env файлов..."

if [ -f "backend/api-gateway/env.example" ]; then
  cp backend/api-gateway/env.example backend/api-gateway/.env
  echo "✅ API Gateway .env создан"
else
  echo "❌ Файл backend/api-gateway/env.example не найден"
fi

if [ -f "backend/device-service/env.example" ]; then
  cp backend/device-service/env.example backend/device-service/.env
  echo "✅ Device Service .env создан"
else
  echo "❌ Файл backend/device-service/env.example не найден"
fi

if [ -f "backend/telemetry-service/env.example" ]; then
  cp backend/telemetry-service/env.example backend/telemetry-service/.env
  echo "✅ Telemetry Service .env создан"
else
  echo "❌ Файл backend/telemetry-service/env.example не найден"
fi

if [ -f "backend/auth-service/env.example" ]; then
  cp backend/auth-service/env.example backend/auth-service/.env
  echo "✅ Auth Service .env создан"
else
  echo "❌ Файл backend/auth-service/env.example не найден"
fi

echo ""
echo "Настройка окружения завершена!"
echo ""
echo "Теперь вы можете:"
echo "1. Отредактировать .env файлы при необходимости"
echo "2. Запустить проект: docker-compose up --build"
echo ""
echo "Примечание: В продакшене обязательно измените JWT_SECRET!" 