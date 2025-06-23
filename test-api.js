const axios = require('axios');

const API_BASE = 'http://localhost:4000/graphql';
const DEVICE_SERVICE = 'http://localhost:3002';
const TELEMETRY_SERVICE = 'http://localhost:3003';

async function testAPI() {
  try {
    console.log('Тестирование API...\n');

    // Создание устройств через device-service
    console.log('1. Создание тестовых устройств...');
    
    const devices = [
      { name: 'Температурный датчик 1', type: 'sensor', status: 'online' },
      { name: 'Контроллер освещения', type: 'controller', status: 'active' },
      { name: 'Датчик влажности', type: 'sensor', status: 'online' },
      { name: 'Система безопасности', type: 'security', status: 'offline' }
    ];

    const createdDevices = [];
    for (const device of devices) {
      try {
        const response = await axios.post(`${DEVICE_SERVICE}/devices`, device);
        createdDevices.push(response.data);
        console.log(`   Создано устройство: ${response.data.name} (ID: ${response.data._id})`);
      } catch (error) {
        console.log(`   Ошибка создания устройства ${device.name}:`, error.message);
      }
    }

    // Тестирование обновления статуса устройства
    if (createdDevices.length > 0) {
      console.log('\n2. Тестирование обновления статуса устройства...');
      const deviceToUpdate = createdDevices[0];
      try {
        const response = await axios.put(`${DEVICE_SERVICE}/devices/${deviceToUpdate._id}`, {
          status: 'offline'
        });
        console.log(`   Статус устройства ${deviceToUpdate.name} обновлен на: ${response.data.status}`);
      } catch (error) {
        console.log(`   Ошибка обновления статуса:`, error.message);
      }
    }

    // Отправка телеметрии
    console.log('\n3. Отправка телеметрии...');
    
    for (const device of createdDevices) {
      const telemetryData = [
        { deviceId: device._id, payload: { temperature: 23.5, humidity: 45, timestamp: new Date().toISOString() } },
        { deviceId: device._id, payload: { temperature: 24.1, humidity: 47, timestamp: new Date().toISOString() } },
        { deviceId: device._id, payload: { temperature: 22.8, humidity: 43, timestamp: new Date().toISOString() } }
      ];

      for (const data of telemetryData) {
        try {
          const response = await axios.post(`${TELEMETRY_SERVICE}/telemetry`, data);
          console.log(`   Отправлена телеметрия для устройства ${device.name}`);
        } catch (error) {
          console.log(`   Ошибка отправки телеметрии для устройства ${device.name}:`, error.message);
        }
      }
    }

    // Тестирование получения телеметрии
    if (createdDevices.length > 0) {
      console.log('\n4. Тестирование получения телеметрии...');
      const device = createdDevices[0];
      try {
        const response = await axios.get(`${TELEMETRY_SERVICE}/telemetry/device/${device._id}`);
        console.log(`   Получено ${response.data.length} записей телеметрии для устройства ${device.name}`);
      } catch (error) {
        console.log(`   Ошибка получения телеметрии:`, error.message);
      }
    }

    // Тестирование GraphQL
    console.log('\n5. Тестирование GraphQL запросов...');
    
    try {
      const devicesQuery = {
        query: `
          query {
            devices {
              _id
              name
              type
              status
            }
          }
        `
      };
      
      const response = await axios.post(API_BASE, devicesQuery);
      console.log('   Получен список устройств:', response.data.data.devices.length, 'устройств');
      
      // Тестирование получения конкретного устройства
      if (response.data.data.devices.length > 0) {
        const deviceId = response.data.data.devices[0]._id;
        const deviceQuery = {
          query: `
            query {
              device(id: "${deviceId}") {
                _id
                name
                type
                status
              }
            }
          `
        };
        
        const deviceResponse = await axios.post(API_BASE, deviceQuery);
        console.log('   Получено устройство:', deviceResponse.data.data.device.name);
        
        // Тестирование получения телеметрии устройства
        const telemetryQuery = {
          query: `
            query {
              deviceTelemetry(deviceId: "${deviceId}") {
                _id
                deviceId
                timestamp
                payload
              }
            }
          `
        };
        
        const telemetryResponse = await axios.post(API_BASE, telemetryQuery);
        console.log('   Получена телеметрия:', telemetryResponse.data.data.deviceTelemetry.length, 'записей');
      }
    } catch (error) {
      console.log('   Ошибка GraphQL запроса:', error.message);
    }

    console.log('\nТестирование завершено!');
    console.log('Frontend доступен по адресу: http://localhost:3000');
    console.log('GraphQL Playground доступен по адресу: http://localhost:4000/graphql');

  } catch (error) {
    console.error('Ошибка тестирования:', error.message);
  }
}

testAPI(); 