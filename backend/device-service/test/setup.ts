// Test setup for device-service
import 'dotenv/config';

// Mock environment variables for testing
process.env.MONGODB_URI = 'mongodb://localhost:27017/test-devices';

// Global test timeout
jest.setTimeout(10000); 