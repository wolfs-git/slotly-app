import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import type { Env } from './config/env.js';

const app = await NestFactory.create(AppModule);
app.setGlobalPrefix('api');
app.enableShutdownHooks();
await app.listen(app.get<ConfigService<Env, true>>(ConfigService).get('PORT', { infer: true }));
