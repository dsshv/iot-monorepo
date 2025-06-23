// Test setup for auth-service
import 'dotenv/config';

// Mock environment variables for testing
process.env.JWT_SECRET = 'test-secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test-auth';

// Global test timeout
jest.setTimeout(10000); 