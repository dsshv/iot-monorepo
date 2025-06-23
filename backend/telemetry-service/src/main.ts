import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { TelemetryController } from './telemetry/telemetry.controller';
import { TelemetryRecord } from './entities/telemetry.entity';
import { natsManager, disconnectNats } from '../../shared/nats';

@Module({
  imports: [
    MikroOrmModule.forRoot({
      entities: [TelemetryRecord],
      dbName: process.env.MONGO_DB_NAME || 'iot',
      type: 'mongo',
      clientUrl: process.env.MONGO_URL || 'mongodb://mongo:27017',
    }),
    MikroOrmModule.forFeature([TelemetryRecord]),
  ],
  controllers: [TelemetryController],
})
class AppModule {}

async function bootstrap() {
  // Инициализация NATS
  await natsManager.connect();
  
  const app = await NestFactory.create(AppModule);
  
  // Настройка CORS
  const corsOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:4000'];
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });
  
  const port = process.env.PORT || 3003;
  await app.listen(port);
  console.log(`Telemetry service running on port ${port}`);

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await disconnectNats();
    await app.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await disconnectNats();
    await app.close();
    process.exit(0);
  });
}
bootstrap();