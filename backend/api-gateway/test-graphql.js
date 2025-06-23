const axios = require('axios');
const jwt = require('jsonwebtoken');

const API_BASE = 'http://localhost:4000/graphql';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Создание тестового JWT токена
function createTestToken() {
  const payload = {
    userId: 'test-user-123',
    email: 'test@example.com',
    role: 'user',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 часа
  };
  
  return jwt.sign(payload, JWT_SECRET);
}

async function testGraphQLAPI() {
  try {
    console.log('Тестирование GraphQL API с JWT аутентификацией...\n');

    const token = createTestToken();
    console.log(`Создан тестовый JWT токен: ${token.substring(0, 20)}...\n`);

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    // 1. Тестирование запроса списка устройств
    console.log('1. Тестирование запроса списка устройств...');
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
      
      const response = await axios.post(API_BASE, devicesQuery, { headers });
      console.log('   ✅ Успешно получен список устройств');
      console.log(`   📊 Количество устройств: ${response.data.data.devices.length}`);
      
      if (response.data.data.devices.length > 0) {
        const deviceId = response.data.data.devices[0]._id;
        console.log(`   🔍 Первое устройство: ${response.data.data.devices[0].name} (ID: ${deviceId})`);
        
        // 2. Тестирование запроса конкретного устройства
        console.log('\n2. Тестирование запроса конкретного устройства...');
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
        
        const deviceResponse = await axios.post(API_BASE, deviceQuery, { headers });
        console.log('   ✅ Успешно получено устройство');
        console.log(`   📱 Устройство: ${deviceResponse.data.data.device.name}`);
        
        // 3. Тестирование запроса телеметрии устройства
        console.log('\n3. Тестирование запроса телеметрии устройства...');
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
        
        const telemetryResponse = await axios.post(API_BASE, telemetryQuery, { headers });
        console.log('   ✅ Успешно получена телеметрия');
        console.log(`   📈 Количество записей телеметрии: ${telemetryResponse.data.data.deviceTelemetry.length}`);
      }
    } catch (error) {
      console.log('   ❌ Ошибка при получении данных:', error.response?.data?.errors?.[0]?.message || error.message);
    }

    // 4. Тестирование без токена (должно вернуть ошибку аутентификации)
    console.log('\n4. Тестирование запроса без токена...');
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
      
      await axios.post(API_BASE, devicesQuery, { 
        headers: { 'Content-Type': 'application/json' } 
      });
      console.log('   ❌ Ошибка: запрос должен был быть отклонен');
    } catch (error) {
      if (error.response?.data?.errors?.[0]?.message === 'Authentication required') {
        console.log('   ✅ Правильно отклонен запрос без токена');
      } else {
        console.log('   ❌ Неожиданная ошибка:', error.response?.data?.errors?.[0]?.message || error.message);
      }
    }

    // 5. Тестирование с невалидным токеном
    console.log('\n5. Тестирование с невалидным токеном...');
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
      
      await axios.post(API_BASE, devicesQuery, { 
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer invalid-token'
        } 
      });
      console.log('   ❌ Ошибка: запрос должен был быть отклонен');
    } catch (error) {
      if (error.response?.data?.errors?.[0]?.message === 'Authentication required') {
        console.log('   ✅ Правильно отклонен запрос с невалидным токеном');
      } else {
        console.log('   ❌ Неожиданная ошибка:', error.response?.data?.errors?.[0]?.message || error.message);
      }
    }

    console.log('\n🎉 Тестирование завершено!');
    console.log('\n📝 Для тестирования подписок используйте GraphQL Playground:');
    console.log('   http://localhost:4000/graphql');
    console.log('\n🔑 Добавьте в HTTP HEADERS:');
    console.log(`   {"Authorization": "Bearer ${token}"}`);

  } catch (error) {
    console.error('❌ Ошибка тестирования:', error.message);
  }
}

testGraphQLAPI(); 