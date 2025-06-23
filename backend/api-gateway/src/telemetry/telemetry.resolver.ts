import { Resolver, Query, Args, Subscription, UseGuards } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/auth.guard';
import { TelemetryService, TelemetryRecord } from './telemetry.service';

const pubSub = new PubSub();

@Resolver('Telemetry')
@UseGuards(JwtAuthGuard)
export class TelemetryResolver {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Query()
  async deviceTelemetry(
    @Args('deviceId') deviceId: string,
    @CurrentUser() user: any
  ): Promise<TelemetryRecord[]> {
    return this.telemetryService.getDeviceTelemetry(deviceId);
  }

  @Subscription(() => TelemetryRecord, {
    filter: (payload, variables, context) => {
      // Проверяем, что deviceId совпадает с параметром подписки
      const telemetryData = JSON.parse(payload.telemetry);
      return telemetryData.deviceId === variables.deviceId;
    },
    resolve: (payload) => {
      return JSON.parse(payload.telemetry);
    },
  })
  telemetry(@Args('deviceId') deviceId: string) {
    return pubSub.asyncIterator('telemetry');
  }

  // Метод для публикации телеметрии (вызывается из NATS handler)
  publishTelemetry(telemetryData: string) {
    pubSub.publish('telemetry', { telemetry: telemetryData });
  }
} 