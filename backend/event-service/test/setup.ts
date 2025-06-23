import 'dotenv/config';

// Mock NATS for testing
jest.mock('../../../shared/nats', () => ({
  natsManager: {
    connect: jest.fn(),
    getConnection: jest.fn(() => ({
      subscribe: jest.fn(() => ({
        [Symbol.asyncIterator]: async function* () {
        },
      })),
    })),
  },
  disconnectNats: jest.fn(),
}));

// Mock MikroORM
jest.mock('@mikro-orm/mongodb', () => ({
  EntityManager: jest.fn().mockImplementation(() => ({
    find: jest.fn(),
    count: jest.fn(),
    persistAndFlush: jest.fn(),
  })),
}));

// Mock console methods
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}; 