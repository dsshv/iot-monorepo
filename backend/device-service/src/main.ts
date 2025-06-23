import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { DeviceController } from './device/device.controller';
import { Device } from './entities/device.entity';
import { natsManager, disconnectNats } from '../../shared/nats';

@Module({
  imports: [
    MikroOrmModule.forRoot({
      entities: [Device],
      dbName: process.env.MONGO_DB_NAME || 'iot',
      type: 'mongo',
      clientUrl: process.env.MONGO_URL || 'mongodb://mongo:27017',
    }),
    MikroOrmModule.forFeature([Device]),
  ],
  controllers: [DeviceController],
})
class AppModule {}

async function bootstrap() {
  await natsManager.connect();
  
  const app = await NestFactory.create(AppModule);
  
  const corsOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:4000'];
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });
  
  const port = process.env.PORT || 3002;
  await app.listen(port);
  console.log(`Device service running on port ${port}`);

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
