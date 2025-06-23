import { Injectable, Logger } from '@nestjs/common';
import { natsManager } from '../../../shared/nats';

@Injectable()
export class CommandService {
  private readonly logger = new Logger(CommandService.name);

  async sendCommand(deviceId: string, command: string) {
    const payload = { deviceId, command };
    await natsManager.publish('device.command', payload);
    this.logger.log(`Command sent to device ${deviceId}: ${command}`);
  }
} 