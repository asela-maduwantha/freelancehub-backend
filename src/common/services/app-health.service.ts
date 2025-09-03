import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthCheckService, TerminusModule, HealthCheck, MongooseHealthIndicator, MemoryHealthIndicator, DiskHealthIndicator } from '@nestjs/terminus';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { getEnvironmentInfo } from '../../config/environment-validation';

@Injectable()
export class AppHealthService {
  private readonly logger = new Logger(AppHealthService.name);

  constructor(
    private configService: ConfigService,
    @InjectConnection() private mongoConnection: Connection,
  ) {}

  @HealthCheck()
  async checkHealth() {
    const environment = getEnvironmentInfo();
    const mongoStatus = this.getMongoStatus();
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment,
      services: {
        database: mongoStatus,
        redis: this.getRedisStatus(),
        storage: this.getStorageStatus(),
        email: this.getEmailStatus(),
        payment: this.getPaymentStatus(),
      },
      system: {
        memory: this.getMemoryUsage(),
        uptime: process.uptime(),
        nodeVersion: process.version,
      },
    };
  }

  private getMongoStatus() {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    
    return {
      status: states[this.mongoConnection.readyState] || 'unknown',
      readyState: this.mongoConnection.readyState,
      host: this.mongoConnection.host,
      name: this.mongoConnection.name,
    };
  }

  private getRedisStatus() {
    return {
      configured: !!(process.env.REDIS_HOST),
      host: process.env.REDIS_HOST || 'not configured',
      port: process.env.REDIS_PORT || 'not configured',
    };
  }

  private getStorageStatus() {
    return {
      provider: 'aws-s3',
      configured: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
      bucket: process.env.AWS_S3_BUCKET || 'not configured',
      region: process.env.AWS_REGION || 'not configured',
    };
  }

  private getEmailStatus() {
    return {
      configured: !!(process.env.EMAIL_HOST && process.env.EMAIL_USER),
      service: process.env.EMAIL_SERVICE || 'smtp',
      host: process.env.EMAIL_HOST || 'not configured',
    };
  }

  private getPaymentStatus() {
    return {
      provider: 'stripe',
      configured: !!process.env.STRIPE_SECRET_KEY,
      testMode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') || false,
    };
  }

  private getMemoryUsage() {
    const memUsage = process.memoryUsage();
    const formatBytes = (bytes: number) => (bytes / 1024 / 1024).toFixed(2) + ' MB';
    
    return {
      rss: formatBytes(memUsage.rss),
      heapTotal: formatBytes(memUsage.heapTotal),
      heapUsed: formatBytes(memUsage.heapUsed),
      external: formatBytes(memUsage.external),
    };
  }

  async checkReadiness(): Promise<{ ready: boolean; issues: string[] }> {
    const issues: string[] = [];
    
    // Check critical services
    if (this.mongoConnection.readyState !== 1) {
      issues.push('Database not connected');
    }

    const environment = getEnvironmentInfo();
    if (!environment.secureSecrets && process.env.NODE_ENV === 'production') {
      issues.push('Insecure secrets detected in production');
    }

    return {
      ready: issues.length === 0,
      issues,
    };
  }
}