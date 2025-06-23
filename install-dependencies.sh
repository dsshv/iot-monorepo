#!/bin/bash

echo "Установка зависимостей для IoT Platform..."

# Backend зависимости
echo "Установка зависимостей backend..."
cd backend
npm run install:all
cd ..

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
echo "cd backend/event-service && npm run build && npm start"
echo "cd backend/command-service && npm run build && npm start"
echo "cd frontend && npm run dev" 