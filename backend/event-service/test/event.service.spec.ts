import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/mongodb';
import { EventService } from '../src/event/event.service';
import { Event } from '../src/entities/event.entity';

describe('EventService', () => {
  let service: EventService;
  let entityManager: EntityManager;

  const mockEntityManager = {
    find: jest.fn(),
    count: jest.fn(),
    persistAndFlush: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
    entityManager = module.get<EntityManager>(EntityManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getEventsByType', () => {
    it('should return events by type', async () => {
      const mockEvents = [
        { _id: '1', eventType: 'device.created', source: 'device-service' },
        { _id: '2', eventType: 'device.created', source: 'device-service' },
      ];

      mockEntityManager.find.mockResolvedValue(mockEvents);

      const result = await service.getEventsByType('device.created', 10);

      expect(mockEntityManager.find).toHaveBeenCalledWith(
        Event,
        { eventType: 'device.created' },
        { orderBy: { timestamp: 'DESC' }, limit: 10 }
      );
      expect(result).toEqual(mockEvents);
    });
  });

  describe('getEventsByDevice', () => {
    it('should return events by device ID', async () => {
      const mockEvents = [
        { _id: '1', deviceId: 'device-1', eventType: 'telemetry.received' },
        { _id: '2', deviceId: 'device-1', eventType: 'device.updated' },
      ];

      mockEntityManager.find.mockResolvedValue(mockEvents);

      const result = await service.getEventsByDevice('device-1', 20);

      expect(mockEntityManager.find).toHaveBeenCalledWith(
        Event,
        { deviceId: 'device-1' },
        { orderBy: { timestamp: 'DESC' }, limit: 20 }
      );
      expect(result).toEqual(mockEvents);
    });
  });

  describe('getEventsByDateRange', () => {
    it('should return events within date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const mockEvents = [
        { _id: '1', timestamp: new Date('2024-01-15') },
        { _id: '2', timestamp: new Date('2024-01-20') },
      ];

      mockEntityManager.find.mockResolvedValue(mockEvents);

      const result = await service.getEventsByDateRange(startDate, endDate, 50);

      expect(mockEntityManager.find).toHaveBeenCalledWith(
        Event,
        {
          timestamp: {
            $gte: startDate,
            $lte: endDate,
          },
        },
        { orderBy: { timestamp: 'DESC' }, limit: 50 }
      );
      expect(result).toEqual(mockEvents);
    });
  });

  describe('getEventCountByType', () => {
    it('should return count of events by type', async () => {
      mockEntityManager.count.mockResolvedValue(5);

      const result = await service.getEventCountByType('telemetry.received');

      expect(mockEntityManager.count).toHaveBeenCalledWith(Event, { eventType: 'telemetry.received' });
      expect(result).toBe(5);
    });
  });

  describe('onModuleInit', () => {
    it('should setup event subscriptions', async () => {
      const setupSpy = jest.spyOn(service as any, 'setupEventSubscriptions');
      
      await service.onModuleInit();

      expect(setupSpy).toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('should handle cleanup', async () => {
      await expect(service.onModuleDestroy()).resolves.not.toThrow();
    });
  });
}); 