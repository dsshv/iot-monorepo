import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mongodb';
import { TelemetryRecord } from '../entities/telemetry.entity';
import { natsManager } from '../../../shared/nats';

@Controller('telemetry')
export class TelemetryController {
  constructor(private readonly em: EntityManager) {}

  @Post()
  async create(@Body() body: { deviceId: string; payload: any }) {
    const record = new TelemetryRecord();
    record.deviceId = body.deviceId;
    record.timestamp = new Date();
    record.payload = JSON.stringify(body.payload);
    await this.em.persistAndFlush(record);

    // Удаляем старые записи, оставляя только последние N записей
    const maxRecords = parseInt(process.env.MAX_TELEMETRY_RECORDS_PER_DEVICE || '100');
    const deviceRecords = await this.em.find(TelemetryRecord, { deviceId: body.deviceId }, { orderBy: { timestamp: 'DESC' } });
    if (deviceRecords.length > maxRecords) {
      const recordsToDelete = deviceRecords.slice(maxRecords);
      for (const recordToDelete of recordsToDelete) {
        await this.em.remove(recordToDelete);
      }
      await this.em.flush();
    }

    // Отправка в NATS
    const connection = natsManager.getConnection();
    const stringCodec = natsManager.getStringCodec();
    
    if (connection) {
      connection.publish(
        'telemetry',
        stringCodec.encode(JSON.stringify(record))
      );
    }

    return record;
  }

  @Get('device/:deviceId')
  async getDeviceTelemetry(@Param('deviceId') deviceId: string) {
    const maxRecords = parseInt(process.env.MAX_TELEMETRY_RECORDS_PER_DEVICE || '100');
    return this.em.find(TelemetryRecord, { deviceId }, { orderBy: { timestamp: 'DESC' }, limit: maxRecords });
  }
}