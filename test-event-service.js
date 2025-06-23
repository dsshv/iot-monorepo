const { natsManager } = require('./backend/shared/nats');

async function testEventService() {
  console.log('🚀 Тестирование Event Service...\n');

  try {
    // Подключение к NATS
    await natsManager.connect();
    const connection = natsManager.getConnection();
    
    if (!connection) {
      console.error('❌ Не удалось подключиться к NATS');
      return;
    }

    console.log('✅ Подключение к NATS установлено');

    // Тестовые данные
    const testDevice = {
      _id: 'test-device-' + Date.now(),
      name: 'Test Device',
      type: 'sensor',
      status: 'online',
      createdAt: new Date()
    };

    const testTelemetry = {
      deviceId: testDevice._id,
      timestamp: new Date(),
      payload: {
        temperature: 23.5,
        humidity: 45,
        pressure: 1013.25
      }
    };

    // Отправка события создания устройства
    console.log('\n📡 Отправка события device.created...');
    connection.publish('device.created', JSON.stringify(testDevice));
    console.log('✅ Событие device.created отправлено');

    // Небольшая задержка
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Отправка события обновления устройства
    console.log('\n📡 Отправка события device.updated...');
    const updatedDevice = { ...testDevice, status: 'offline' };
    connection.publish('device.updated', JSON.stringify(updatedDevice));
    console.log('✅ Событие device.updated отправлено');

    // Небольшая задержка
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Отправка события телеметрии
    console.log('\n📡 Отправка события telemetry.received...');
    connection.publish('telemetry.received', JSON.stringify(testTelemetry));
    console.log('✅ Событие telemetry.received отправлено');

    // Небольшая задержка для обработки
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n📋 Проверка Event Service API...');

    // Проверка доступности Event Service
    try {
      const response = await fetch('http://localhost:3004/health');
      if (response.ok) {
        console.log('✅ Event Service доступен');
      } else {
        console.log('⚠️  Event Service отвечает, но статус:', response.status);
      }
    } catch (error) {
      console.log('⚠️  Event Service API недоступен (возможно, не запущен)');
    }

    console.log('\n🎯 Тестирование завершено!');
    console.log('\n📝 Проверьте логи Event Service для подтверждения обработки событий:');
    console.log('   docker-compose logs event-service');

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.message);
  } finally {
    // Отключение от NATS
    await natsManager.disconnect();
    console.log('\n🔌 Отключение от NATS');
  }
}

// Запуск тестирования
testEventService().catch(console.error); 