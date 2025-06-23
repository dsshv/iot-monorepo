import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DeviceModule } from './device/device.module';
import { TelemetryModule } from './telemetry/telemetry.module';
import { NatsModule } from './nats/nats.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: true,
      subscriptions: {
        'graphql-ws': {
          onConnect: (context) => {
            const { connectionParams } = context;
            if (connectionParams?.authorization) {
              return { authorization: connectionParams.authorization };
            }
            return {};
          },
        },
        'subscriptions-transport-ws': {
          onConnect: (connectionParams) => {
            if (connectionParams?.authorization) {
              return { authorization: connectionParams.authorization };
            }
            return {};
          },
        },
      },
    }),
    AuthModule,
    DeviceModule,
    TelemetryModule,
    NatsModule,
  ],
})
export class AppModule {} 