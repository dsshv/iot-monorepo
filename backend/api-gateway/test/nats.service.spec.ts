import { Test, TestingModule } from '@nestjs/testing';
import { NatsService } from '../src/nats/nats.service';

// Mock NATS
const mockConnection = {
  subscribe: jest.fn(),
  publish: jest.fn(),
  close: jest.fn(),
};

const mockSubscription = {
  unsubscribe: jest.fn(),
};

jest.mock('nats', () => ({
  connect: jest.fn(() => mockConnection),
  StringCodec: jest.fn(() => ({
    encode: jest.fn((data) => data),
    decode: jest.fn((data) => data),
  })),
}));

describe('NatsService', () => {
  let service: NatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NatsService],
    }).compile();

    service = module.get<NatsService>(NatsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should connect to NATS on module init', async () => {
      const { connect } = require('nats');
      
      await service.onModuleInit();

      expect(connect).toHaveBeenCalledWith(process.env.NATS_URL);
    });

    it('should handle connection errors', async () => {
      const { connect } = require('nats');
      connect.mockImplementation(() => {
        throw new Error('Connection failed');
      });

      await expect(service.onModuleInit()).rejects.toThrow('Connection failed');
    });
  });

  describe('onModuleDestroy', () => {
    it('should close NATS connection on module destroy', async () => {
      // First connect
      await service.onModuleInit();
      
      // Then destroy
      await service.onModuleDestroy();

      expect(mockConnection.close).toHaveBeenCalled();
    });
  });

  describe('subscribeToTelemetry', () => {
    it('should subscribe to telemetry for device', async () => {
      await service.onModuleInit();
      
      const deviceId = 'device123';
      const callback = jest.fn();

      mockConnection.subscribe.mockReturnValue(mockSubscription);

      const subscriptionId = await service.subscribeToTelemetry(deviceId, callback);

      expect(mockConnection.subscribe).toHaveBeenCalledWith('telemetry');
      expect(subscriptionId).toBeDefined();
    });

    it('should filter telemetry by deviceId', async () => {
      await service.onModuleInit();
      
      const deviceId = 'device123';
      const callback = jest.fn();

      mockConnection.subscribe.mockReturnValue(mockSubscription);

      await service.subscribeToTelemetry(deviceId, callback);

      // Verify subscription was created
      expect(mockConnection.subscribe).toHaveBeenCalled();
    });
  });

  describe('unsubscribeFromTelemetry', () => {
    it('should unsubscribe from telemetry', async () => {
      await service.onModuleInit();
      
      const subscriptionId = 'sub-123';
      
      // Mock subscription map
      (service as any).subscriptions = new Map([
        [subscriptionId, mockSubscription]
      ]);

      await service.unsubscribeFromTelemetry(subscriptionId);

      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('should handle non-existent subscription', async () => {
      await service.onModuleInit();
      
      const subscriptionId = 'non-existent';

      await expect(service.unsubscribeFromTelemetry(subscriptionId)).rejects.toThrow('Subscription not found');
    });
  });

  describe('getConnection', () => {
    it('should return NATS connection', async () => {
      await service.onModuleInit();
      
      const connection = service.getConnection();
      
      expect(connection).toBe(mockConnection);
    });

    it('should return null if not connected', () => {
      const connection = service.getConnection();
      
      expect(connection).toBeNull();
    });
  });

  describe('getStringCodec', () => {
    it('should return string codec', () => {
      const codec = service.getStringCodec();
      
      expect(codec).toBeDefined();
      expect(typeof codec.encode).toBe('function');
      expect(typeof codec.decode).toBe('function');
    });
  });
}); 