import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { healthResponseSchema } from '@slotly/shared';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HealthController } from '../src/health/health.controller.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('GET /health', () => {
  const $queryRaw = vi.fn();
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: PrismaService, useValue: { $queryRaw } }],
    }).compile();
    moduleRef.useLogger(false);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(() => app.close());

  it('returns a response matching the shared schema when the database is up', async () => {
    $queryRaw.mockResolvedValue([{ '?column?': 1 }]);
    const response = await request(app.getHttpServer()).get('/health').expect(200);
    expect(healthResponseSchema.parse(response.body).database).toBe('up');
  });

  it('returns 503 when the database is down', async () => {
    $queryRaw.mockRejectedValue(new Error('connection refused'));
    await request(app.getHttpServer()).get('/health').expect(503);
  });
});
