import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface TelemetryRecord {
  _id: string;
  deviceId: string;
  timestamp: string;
  payload: string;
}

@Injectable()
export class TelemetryService {
  private readonly logger = new Logger(TelemetryService.name);
  private readonly telemetryServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.telemetryServiceUrl = this.configService.get<string>('TELEMETRY_SERVICE_URL') || 'http://telemetry-service:3003';
  }

  async getDeviceTelemetry(deviceId: string): Promise<TelemetryRecord[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<TelemetryRecord[]>(`${this.telemetryServiceUrl}/telemetry/device/${deviceId}`)
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch telemetry for device ${deviceId}: ${error.message}`);
      throw new Error(`Failed to fetch telemetry for device ${deviceId}`);
    }
  }

  async sendTelemetry(deviceId: string, payload: any): Promise<TelemetryRecord> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<TelemetryRecord>(`${this.telemetryServiceUrl}/telemetry`, {
          deviceId,
          payload,
        })
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to send telemetry for device ${deviceId}: ${error.message}`);
      throw new Error(`Failed to send telemetry for device ${deviceId}`);
    }
  }

  async subscribeToTelemetry(deviceId: string, callback: (data: any) => void): Promise<string> {
    // Этот метод будет реализован через NATS
    // Возвращаем заглушку для совместимости
    this.logger.log(`Subscribing to telemetry for device ${deviceId}`);
    return `sub_${deviceId}_${Date.now()}`;
  }

  async unsubscribeFromTelemetry(subscriptionId: string): Promise<void> {
    // Этот метод будет реализован через NATS
    this.logger.log(`Unsubscribing from telemetry: ${subscriptionId}`);
  }
} 