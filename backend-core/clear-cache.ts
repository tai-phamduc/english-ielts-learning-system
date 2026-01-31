
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { RedisService } from './src/common/redis/redis.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const redis = app.get(RedisService);
  await redis.delByPattern('grammar:*');
  console.log('Cleared grammar cache');
  await app.close();
}
bootstrap();
