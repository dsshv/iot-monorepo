// Test setup for api-gateway
import 'dotenv/config';

// Mock environment variables for testing
process.env.JWT_SECRET = 'test-secret';
process.env.NATS_URL = 'nats://localhost:4222';
process.env.DEVICE_SERVICE_URL = 'http://localhost:3001';
process.env.TELEMETRY_SERVICE_URL = 'http://localhost:3002';
process.env.CORS_ORIGIN = 'http://localhost:3000';

// Global test timeout
jest.setTimeout(10000); 