import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { TelemetryService } from '../src/telemetry/telemetry.service';
import { NatsService } from '../src/nats/nats.service';

describe('TelemetryService', () => {
  let service: TelemetryService;
  let httpService: HttpService;
  let natsService: NatsService;

  const mockHttpService = {
    get: jest.fn(),
  };

  const mockNatsService = {
    subscribeToTelemetry: jest.fn(),
    unsubscribeFromTelemetry: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelemetryService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: NatsService, useValue: mockNatsService },
      ],
    }).compile();

    service = module.get<TelemetryService>(TelemetryService);
    httpService = module.get<HttpService>(HttpService);
    natsService = module.get<NatsService>(NatsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
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

      mockHttpService.get.mockReturnValue(of({ data: mockRecords }));

      const result = await service.getDeviceTelemetry(deviceId);

      expect(mockHttpService.get).toHaveBeenCalledWith(`${process.env.TELEMETRY_SERVICE_URL}/telemetry/device/${deviceId}`);
      expect(result).toEqual(mockRecords);
    });

    it('should handle empty telemetry records', async () => {
      const deviceId = 'device123';
      mockHttpService.get.mockReturnValue(of({ data: [] }));

      const result = await service.getDeviceTelemetry(deviceId);

      expect(result).toEqual([]);
    });

    it('should handle HTTP errors', async () => {
      const deviceId = 'device123';
      const error = new Error('HTTP Error');
      mockHttpService.get.mockImplementation(() => {
        throw error;
      });

      await expect(service.getDeviceTelemetry(deviceId)).rejects.toThrow('HTTP Error');
    });
  });

  describe('subscribeToTelemetry', () => {
    it('should subscribe to telemetry for device', async () => {
      const deviceId = 'device123';
      const callback = jest.fn();

      mockNatsService.subscribeToTelemetry.mockResolvedValue('subscription-id');

      const result = await service.subscribeToTelemetry(deviceId, callback);

      expect(mockNatsService.subscribeToTelemetry).toHaveBeenCalledWith(deviceId, callback);
      expect(result).toBe('subscription-id');
    });
  });

  describe('unsubscribeFromTelemetry', () => {
    it('should unsubscribe from telemetry', async () => {
      const subscriptionId = 'sub-123';

      mockNatsService.unsubscribeFromTelemetry.mockResolvedValue(undefined);

      await service.unsubscribeFromTelemetry(subscriptionId);

      expect(mockNatsService.unsubscribeFromTelemetry).toHaveBeenCalledWith(subscriptionId);
    });
  });
}); 