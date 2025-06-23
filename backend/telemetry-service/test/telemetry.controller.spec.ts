import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/mongodb';
import { TelemetryController } from '../src/telemetry/telemetry.controller';
import { TelemetryRecord } from '../src/entities/telemetry.entity';

// Mock NATS manager
jest.mock('../../../shared/nats', () => ({
  natsManager: {
    getConnection: jest.fn(),
    getStringCodec: jest.fn(),
  },
}));

describe('TelemetryController', () => {
  let controller: TelemetryController;
  let entityManager: EntityManager;

  const mockEntityManager = {
    persistAndFlush: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
    flush: jest.fn(),
  };

  const mockNatsConnection = {
    publish: jest.fn(),
  };

  const mockStringCodec = {
    encode: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TelemetryController],
      providers: [
        { provide: EntityManager, useValue: mockEntityManager },
      ],
    }).compile();

    controller = module.get<TelemetryController>(TelemetryController);
    entityManager = module.get<EntityManager>(EntityManager);

    // Setup NATS mocks
    const { natsManager } = require('../../../shared/nats');
    natsManager.getConnection.mockReturnValue(mockNatsConnection);
    natsManager.getStringCodec.mockReturnValue(mockStringCodec);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create telemetry record successfully', async () => {
      const createData = {
        deviceId: 'device123',
        payload: { temperature: 25.5, humidity: 60 },
      };

      const mockRecord = new TelemetryRecord();
      mockRecord.deviceId = createData.deviceId;
      mockRecord.timestamp = new Date();
      mockRecord.payload = JSON.stringify(createData.payload);
      mockRecord._id = 'record123';

      mockEntityManager.persistAndFlush.mockResolvedValue(undefined);
      mockEntityManager.find.mockResolvedValue([]);
      mockStringCodec.encode.mockReturnValue('encoded-data');

      const result = await controller.create(createData);

      expect(mockEntityManager.persistAndFlush).toHaveBeenCalled();
      expect(result.deviceId).toBe(createData.deviceId);
      expect(result.payload).toBe(JSON.stringify(createData.payload));
      expect(mockNatsConnection.publish).toHaveBeenCalledWith('telemetry', 'encoded-data');
    });

    it('should limit telemetry records per device', async () => {
      const createData = {
        deviceId: 'device123',
        payload: { temperature: 25.5 },
      };

      // Mock existing records (more than max)
      const existingRecords = Array.from({ length: 105 }, (_, i) => ({
        _id: `record${i}`,
        deviceId: 'device123',
        timestamp: new Date(Date.now() - i * 1000),
        payload: JSON.stringify({ temperature: 20 + i }),
      }));

      mockEntityManager.persistAndFlush.mockResolvedValue(undefined);
      mockEntityManager.find.mockResolvedValue(existingRecords);
      mockEntityManager.remove.mockResolvedValue(undefined);
      mockEntityManager.flush.mockResolvedValue(undefined);
      mockStringCodec.encode.mockReturnValue('encoded-data');

      await controller.create(createData);

      // Should remove 5 records (105 - 100 = 5)
      expect(mockEntityManager.remove).toHaveBeenCalledTimes(5);
      expect(mockEntityManager.flush).toHaveBeenCalled();
    });

    it('should handle NATS connection failure gracefully', async () => {
      const createData = {
        deviceId: 'device123',
        payload: { temperature: 25.5 },
      };

      const { natsManager } = require('../../../shared/nats');
      natsManager.getConnection.mockReturnValue(null);

      mockEntityManager.persistAndFlush.mockResolvedValue(undefined);
      mockEntityManager.find.mockResolvedValue([]);

      const result = await controller.create(createData);

      expect(result).toBeDefined();
      expect(mockNatsConnection.publish).not.toHaveBeenCalled();
    });
  });

  describe('getDeviceTelemetry', () => {
    it('should return telemetry records for device', async () => {
      const deviceId = 'device123';
      const mockRecords = [
        {
          _id: 'record1',
          deviceId,
          timestamp: new Date(),
          payload: JSON.stringify({ temperature: 25.5 }),
        },
        {
          _id: 'record2',
          deviceId,
          timestamp: new Date(),
          payload: JSON.stringify({ temperature: 26.0 }),
        },
      ];

      mockEntityManager.find.mockResolvedValue(mockRecords);

      const result = await controller.getDeviceTelemetry(deviceId);

      expect(mockEntityManager.find).toHaveBeenCalledWith(
        TelemetryRecord,
        { deviceId },
        { orderBy: { timestamp: 'DESC' }, limit: 100 }
      );
      expect(result).toEqual(mockRecords);
    });

    it('should use custom max records from environment', async () => {
      const deviceId = 'device123';
      const originalEnv = process.env.MAX_TELEMETRY_RECORDS_PER_DEVICE;
      process.env.MAX_TELEMETRY_RECORDS_PER_DEVICE = '50';

      mockEntityManager.find.mockResolvedValue([]);

      await controller.getDeviceTelemetry(deviceId);

      expect(mockEntityManager.find).toHaveBeenCalledWith(
        TelemetryRecord,
        { deviceId },
        { orderBy: { timestamp: 'DESC' }, limit: 50 }
      );

      // Restore original env
      if (originalEnv) {
        process.env.MAX_TELEMETRY_RECORDS_PER_DEVICE = originalEnv;
      } else {
        delete process.env.MAX_TELEMETRY_RECORDS_PER_DEVICE;
      }
    });

    it('should return empty array when no records exist', async () => {
      const deviceId = 'device123';

      mockEntityManager.find.mockResolvedValue([]);

      const result = await controller.getDeviceTelemetry(deviceId);

      expect(result).toEqual([]);
    });
  });
}); 