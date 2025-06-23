import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mongodb';
import { Event } from '../entities/event.entity';
import { natsManager } from '../../../shared/nats';

export interface EventData {
  eventType: string;
  source: string;
  payload: any;
  deviceId?: string;
  userId?: string;
  metadata?: any;
}

@Injectable()
export class EventService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventService.name);
  private readonly enableStorage: boolean;

  constructor(private readonly em: EntityManager) {
    this.enableStorage = process.env.ENABLE_EVENT_STORAGE === 'true';
  }

  async onModuleInit() {
    await this.setupEventSubscriptions();
  }

  async onModuleDestroy() {
  }

  private async setupEventSubscriptions() {
    try {
      const connection = natsManager.getConnection();
      if (!connection) {
        this.logger.error('NATS connection not available');
        return;
      }

      const deviceCreatedSub = connection.subscribe('device.created');
      const deviceUpdatedSub = connection.subscribe('device.updated');
      const telemetryReceivedSub = connection.subscribe('telemetry.received');

      this.logger.log('Subscribed to event channels: device.created, device.updated, telemetry.received');

      (async () => {
        for await (const msg of deviceCreatedSub) {
          const eventData = JSON.parse(msg.data.toString());
          await this.handleDeviceCreated(eventData);
        }
      })();

      (async () => {
        for await (const msg of deviceUpdatedSub) {
          const eventData = JSON.parse(msg.data.toString());
          await this.handleDeviceUpdated(eventData);
        }
      })();

      (async () => {
        for await (const msg of telemetryReceivedSub) {
          const eventData = JSON.parse(msg.data.toString());
          await this.handleTelemetryReceived(eventData);
        }
      })();

    } catch (error) {
      this.logger.error(`Failed to setup event subscriptions: ${error.message}`);
    }
  }

  private async handleDeviceCreated(eventData: any) {
    const event: EventData = {
      eventType: 'device.created',
      source: 'device-service',
      payload: eventData,
      deviceId: eventData.deviceId || eventData._id,
      metadata: {
        timestamp: new Date(),
        processed: true,
      },
    };

    await this.processEvent(event);
  }

  private async handleDeviceUpdated(eventData: any) {
    const event: EventData = {
      eventType: 'device.updated',
      source: 'device-service',
      payload: eventData,
      deviceId: eventData.deviceId || eventData._id,
      metadata: {
        timestamp: new Date(),
        processed: true,
      },
    };

    await this.processEvent(event);
  }

  private async handleTelemetryReceived(eventData: any) {
    const event: EventData = {
      eventType: 'telemetry.received',
      source: 'telemetry-service',
      payload: eventData,
      deviceId: eventData.deviceId,
      metadata: {
        timestamp: new Date(),
        processed: true,
      },
    };

    await this.processEvent(event);
  }

  private async processEvent(eventData: EventData) {
    try {
      this.logger.log(`Processing event: ${eventData.eventType} from ${eventData.source}`, {
        deviceId: eventData.deviceId,
        payload: eventData.payload,
      });

      if (this.enableStorage) {
        await this.saveEvent(eventData);
      }

      await this.executeBusinessLogic(eventData);

    } catch (error) {
      this.logger.error(`Failed to process event ${eventData.eventType}: ${error.message}`);
    }
  }

  private async saveEvent(eventData: EventData) {
    try {
      const event = new Event();
      event.eventType = eventData.eventType;
      event.source = eventData.source;
      event.timestamp = new Date();
      event.payload = eventData.payload;
      event.deviceId = eventData.deviceId;
      event.userId = eventData.userId;
      event.metadata = eventData.metadata;

      await this.em.persistAndFlush(event);
      this.logger.debug(`Event saved to database: ${event._id}`);
    } catch (error) {
      this.logger.error(`Failed to save event to database: ${error.message}`);
    }
  }

  private async executeBusinessLogic(eventData: EventData) {
    switch (eventData.eventType) {
      case 'device.created':
        this.logger.log(`New device created: ${eventData.deviceId}`);
        break;
      case 'device.updated':
        this.logger.log(`Device updated: ${eventData.deviceId}`);
        break;
      case 'telemetry.received':
        this.logger.log(`Telemetry received for device: ${eventData.deviceId}`);
        break;
      default:
        this.logger.log(`Unknown event type: ${eventData.eventType}`);
    }
  }

  async getEventsByType(eventType: string, limit: number = 100): Promise<Event[]> {
    return this.em.find(Event, { eventType }, { 
      orderBy: { timestamp: 'DESC' }, 
      limit 
    });
  }

  async getEventsByDevice(deviceId: string, limit: number = 100): Promise<Event[]> {
    return this.em.find(Event, { deviceId }, { 
      orderBy: { timestamp: 'DESC' }, 
      limit 
    });
  }

  async getEventsByDateRange(startDate: Date, endDate: Date, limit: number = 100): Promise<Event[]> {
    return this.em.find(Event, {
      timestamp: {
        $gte: startDate,
        $lte: endDate,
      },
    }, { 
      orderBy: { timestamp: 'DESC' }, 
      limit 
    });
  }

  async getEventCountByType(eventType: string): Promise<number> {
    return this.em.count(Event, { eventType });
  }
} 