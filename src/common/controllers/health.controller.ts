import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppHealthService } from '../services/app-health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly appHealthService: AppHealthService) {}

  @Get()
  @ApiOperation({ summary: 'Get application health status' })
  @ApiResponse({
    status: 200,
    description: 'Application health status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', format: 'date-time' },
        environment: { type: 'object' },
        services: { type: 'object' },
        system: { type: 'object' },
      },
    },
  })
  async getHealth() {
    return this.appHealthService.checkHealth();
  }

  @Get('ready')
  @ApiOperation({ summary: 'Check if application is ready to serve requests' })
  @ApiResponse({
    status: 200,
    description: 'Application readiness status',
    schema: {
      type: 'object',
      properties: {
        ready: { type: 'boolean' },
        issues: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async getReadiness() {
    return this.appHealthService.checkReadiness();
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe for Kubernetes/Docker' })
  @ApiResponse({
    status: 200,
    description: 'Application is alive',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'alive' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  getLiveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }
}