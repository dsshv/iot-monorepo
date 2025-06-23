// Test setup for telemetry-service
import 'dotenv/config';

// Mock environment variables for testing
process.env.MONGODB_URI = 'mongodb://localhost:27017/test-telemetry';
process.env.NATS_URL = 'nats://localhost:4222';
process.env.MAX_TELEMETRY_RECORDS_PER_DEVICE = '100';

// Global test timeout
jest.setTimeout(10000); 