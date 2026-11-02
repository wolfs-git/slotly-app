import { Controller, Get, Logger, ServiceUnavailableException } from '@nestjs/common';
import type { HealthResponse } from '@slotly/shared';
import { PrismaService } from '../prisma/prisma.service.js';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check(): Promise<HealthResponse> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      this.logger.error(error);
      throw new ServiceUnavailableException('Database is unavailable');
    }
    return { status: 'ok', database: 'up' };
  }
}
