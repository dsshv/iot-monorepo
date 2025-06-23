import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { CommandModule } from './command/command.module';

@Module({
  imports: [CommandModule],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:4000'];
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });
  const port = process.env.PORT || 3005;
  await app.listen(port);
  console.log(`Command service running on port ${port}`);
}
bootstrap(); 