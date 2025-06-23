#!/bin/bash

echo "Установка зависимостей для IoT Platform..."

# Backend зависимости
echo "Установка зависимостей backend..."

echo "API Gateway..."
cd backend/api-gateway
npm install
cd ../..

echo "Auth Service..."
cd backend/auth-service
npm install
cd ../..

echo "Device Service..."
cd backend/device-service
npm install
cd ../..

echo "Telemetry Service..."
cd backend/telemetry-service
npm install
cd ../..

# Frontend зависимости
echo "Установка зависимостей frontend..."
cd frontend
npm install
cd ..

echo "Все зависимости установлены!"
echo ""
echo "Для запуска проекта используйте:"
echo "docker-compose up --build"
echo ""
echo "Или запустите сервисы отдельно:"
echo "cd backend/api-gateway && npm run build && npm start"
echo "cd backend/device-service && npm run build && npm start"
echo "cd backend/telemetry-service && npm run build && npm start"
echo "cd frontend && npm run dev" 