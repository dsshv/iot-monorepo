import { Module, OnModuleInit } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { TelemetryResolver } from './telemetry.resolver';
import { TelemetryService } from './telemetry.service';
import { NatsService } from '../nats/nats.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [TelemetryResolver, TelemetryService, NatsService],
  exports: [TelemetryService, NatsService],
})
export class TelemetryModule implements OnModuleInit {
  constructor(
    private readonly telemetryResolver: TelemetryResolver,
    private readonly natsService: NatsService,
  ) {}

  onModuleInit() {
    // Устанавливаем связь между NatsService и TelemetryResolver
    this.natsService.setTelemetryResolver(this.telemetryResolver);
  }
} 