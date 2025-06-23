import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { natsManager } from '../../../shared/nats';
import { TelemetryResolver } from '../telemetry/telemetry.resolver';

@Injectable()
export class NatsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NatsService.name);
  private telemetryResolver: TelemetryResolver;

  constructor() {}

  // Метод для установки ссылки на TelemetryResolver (избегаем циклических зависимостей)
  setTelemetryResolver(resolver: TelemetryResolver) {
    this.telemetryResolver = resolver;
  }

  async onModuleInit() {
    try {
      // Подключаемся к NATS
      await natsManager.connect();
      await this.setupTelemetrySubscription();
    } catch (error) {
      this.logger.error(`Failed to initialize NATS: ${error.message}`);
    }
  }

  async onModuleDestroy() {
    try {
      await natsManager.disconnect();
    } catch (error) {
      this.logger.error(`Failed to disconnect from NATS: ${error.message}`);
    }
  }

  private async setupTelemetrySubscription() {
    try {
      const connection = natsManager.getConnection();
      if (!connection) {
        this.logger.error('NATS connection not available');
        return;
      }

      const subscription = connection.subscribe('telemetry');
      this.logger.log('Subscribed to telemetry topic');

      // Обработка сообщений телеметрии
      (async () => {
        for await (const msg of subscription) {
          const telemetryData = msg.data.toString();
          this.logger.debug(`Received telemetry: ${telemetryData}`);
          
          // Публикуем в GraphQL subscription если resolver доступен
          if (this.telemetryResolver) {
            this.telemetryResolver.publishTelemetry(telemetryData);
          }
        }
      })();
    } catch (error) {
      this.logger.error(`Failed to setup telemetry subscription: ${error.message}`);
    }
  }

  async subscribeToTelemetry(deviceId: string, callback: (data: any) => void): Promise<string> {
    try {
      const connection = natsManager.getConnection();
      if (!connection) {
        throw new Error('NATS connection not available');
      }

      const subscription = connection.subscribe('telemetry');
      const subscriptionId = `sub_${Date.now()}_${Math.random()}`;

      // Обработка сообщений с фильтрацией по deviceId
      (async () => {
        for await (const msg of subscription) {
          const telemetryData = JSON.parse(msg.data.toString());
          if (telemetryData.deviceId === deviceId) {
            callback(telemetryData);
          }
        }
      })();

      return subscriptionId;
    } catch (error) {
      this.logger.error(`Failed to subscribe to telemetry: ${error.message}`);
      throw error;
    }
  }

  async unsubscribeFromTelemetry(subscriptionId: string): Promise<void> {
    // В текущей реализации подписки управляются через GraphQL
    // Этот метод может быть расширен для управления подписками
    this.logger.log(`Unsubscribing from telemetry: ${subscriptionId}`);
  }

  getConnection() {
    return natsManager.getConnection();
  }

  getStringCodec() {
    return natsManager.getStringCodec();
  }

  isConnected(): boolean {
    return natsManager.isConnected();
  }
} 