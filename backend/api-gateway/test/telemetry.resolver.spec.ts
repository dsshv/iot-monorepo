import { Test, TestingModule } from '@nestjs/testing';
import { TelemetryResolver } from '../src/telemetry/telemetry.resolver';
import { TelemetryService } from '../src/telemetry/telemetry.service';

describe('TelemetryResolver', () => {
  let resolver: TelemetryResolver;
  let telemetryService: TelemetryService;

  const mockTelemetryService = {
    getDeviceTelemetry: jest.fn(),
    subscribeToTelemetry: jest.fn(),
    unsubscribeFromTelemetry: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelemetryResolver,
        { provide: TelemetryService, useValue: mockTelemetryService },
      ],
    }).compile();

    resolver = module.get<TelemetryResolver>(TelemetryResolver);
    telemetryService = module.get<TelemetryService>(TelemetryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('deviceTelemetry', () => {
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

      mockTelemetryService.getDeviceTelemetry.mockResolvedValue(mockRecords);

      const result = await resolver.deviceTelemetry(deviceId);

      expect(mockTelemetryService.getDeviceTelemetry).toHaveBeenCalledWith(deviceId);
      expect(result).toEqual(mockRecords);
    });

    it('should handle empty telemetry records', async () => {
      const deviceId = 'device123';
      mockTelemetryService.getDeviceTelemetry.mockResolvedValue([]);

      const result = await resolver.deviceTelemetry(deviceId);

      expect(result).toEqual([]);
    });
  });

  describe('telemetry', () => {
    it('should return telemetry subscription', async () => {
      const deviceId = 'device123';
      const mockSubscription = {
        [Symbol.asyncIterator]: () => ({
          next: () => Promise.resolve({ value: { temperature: 25.5 }, done: false }),
        }),
      };

      mockTelemetryService.subscribeToTelemetry.mockReturnValue(mockSubscription);

      const result = await resolver.telemetry(deviceId);

      expect(mockTelemetryService.subscribeToTelemetry).toHaveBeenCalledWith(deviceId);
      expect(result).toBe(mockSubscription);
    });
  });
}); 