#!/bin/bash

# Скрипт для запуска всех тестов в микросервисах
# Использование: ./run-tests.sh [service_name]

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода с цветом
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Проверка наличия Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js не установлен"
    exit 1
fi

# Проверка наличия npm
if ! command -v npm &> /dev/null; then
    print_error "npm не установлен"
    exit 1
fi

# Функция для запуска тестов в сервисе
run_service_tests() {
    local service=$1
    local service_dir="./$service"
    
    if [ ! -d "$service_dir" ]; then
        print_error "Директория $service_dir не найдена"
        return 1
    fi
    
    print_status "Запуск тестов в $service..."
    cd "$service_dir"
    
    # Проверка наличия package.json
    if [ ! -f "package.json" ]; then
        print_error "package.json не найден в $service"
        cd ..
        return 1
    fi
    
    # Установка зависимостей если node_modules не существует
    if [ ! -d "node_modules" ]; then
        print_status "Установка зависимостей для $service..."
        npm install
    fi
    
    # Запуск тестов
    print_status "Выполнение тестов для $service..."
    if npm test; then
        print_success "Тесты $service прошли успешно"
    else
        print_error "Тесты $service завершились с ошибкой"
        cd ..
        return 1
    fi
    
    cd ..
}

# Функция для запуска тестов с покрытием
run_service_tests_with_coverage() {
    local service=$1
    local service_dir="./$service"
    
    if [ ! -d "$service_dir" ]; then
        print_error "Директория $service_dir не найдена"
        return 1
    fi
    
    print_status "Запуск тестов с покрытием в $service..."
    cd "$service_dir"
    
    # Проверка наличия package.json
    if [ ! -f "package.json" ]; then
        print_error "package.json не найден в $service"
        cd ..
        return 1
    fi
    
    # Установка зависимостей если node_modules не существует
    if [ ! -d "node_modules" ]; then
        print_status "Установка зависимостей для $service..."
        npm install
    fi
    
    # Запуск тестов с покрытием
    print_status "Выполнение тестов с покрытием для $service..."
    if npm run test:cov; then
        print_success "Тесты с покрытием $service прошли успешно"
    else
        print_error "Тесты с покрытием $service завершились с ошибкой"
        cd ..
        return 1
    fi
    
    cd ..
}

# Основная логика
main() {
    print_status "Начинаем запуск тестов..."
    
    # Если указан конкретный сервис
    if [ $# -eq 1 ]; then
        local service=$1
        case $service in
            "auth-service"|"device-service"|"telemetry-service"|"event-service"|"api-gateway")
                run_service_tests "$service"
                ;;
            *)
                print_error "Неизвестный сервис: $service"
                print_status "Доступные сервисы: auth-service, device-service, telemetry-service, event-service, api-gateway"
                exit 1
                ;;
        esac
    else
        # Запуск тестов во всех сервисах
        local services=("auth-service" "device-service" "telemetry-service" "event-service" "api-gateway")
        local failed_services=()
        
        for service in "${services[@]}"; do
            if ! run_service_tests "$service"; then
                failed_services+=("$service")
            fi
        done
        
        # Вывод результатов
        if [ ${#failed_services[@]} -eq 0 ]; then
            print_success "Все тесты прошли успешно!"
        else
            print_error "Тесты завершились с ошибкой в следующих сервисах:"
            for service in "${failed_services[@]}"; do
                print_error "  - $service"
            done
            exit 1
        fi
    fi
}

# Обработка аргументов командной строки
case "${1:-}" in
    "coverage"|"cov")
        if [ $# -eq 2 ]; then
            run_service_tests_with_coverage "$2"
        else
            print_error "Для запуска с покрытием укажите сервис: ./run-tests.sh coverage <service>"
            exit 1
        fi
        ;;
    "help"|"-h"|"--help")
        echo "Использование: $0 [опция] [сервис]"
        echo ""
        echo "Опции:"
        echo "  coverage, cov  Запуск тестов с покрытием кода"
        echo "  help, -h, --help  Показать эту справку"
        echo ""
        echo "Сервисы:"
        echo "  auth-service"
        echo "  device-service"
        echo "  telemetry-service"
        echo "  event-service"
        echo "  api-gateway"
        echo ""
        echo "Примеры:"
        echo "  $0                    # Запуск всех тестов"
        echo "  $0 auth-service       # Запуск тестов только auth-service"
        echo "  $0 coverage api-gateway  # Запуск тестов с покрытием для api-gateway"
        ;;
    *)
        main "$@"
        ;;
esac 