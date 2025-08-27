import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class DatabaseHealthService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseHealthService.name);

  constructor(@InjectConnection() private connection: Connection) {}

  onModuleInit() {
    this.setupDatabaseEventHandlers();
  }

  private setupDatabaseEventHandlers() {
    // Database connection events
    this.connection.on('connected', () => {
      this.logger.log(' MongoDB connected successfully');
    });

    this.connection.on('disconnected', () => {
      this.logger.warn(' MongoDB disconnected');
    });

    this.connection.on('error', (error) => {
      this.logger.error('MongoDB connection error:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
    });

    this.connection.on('reconnected', () => {
      this.logger.log('MongoDB reconnected');
    });

    this.connection.on('reconnectFailed', () => {
      this.logger.error('🚨 MongoDB reconnection failed - Check your database connection');
    });

    // Initial connection state
    if (this.connection.readyState === 1) {
      this.logger.log('MongoDB is already connected');
    } else {
      this.logger.warn('MongoDB connection pending...');
    }
  }

  getConnectionStatus(): string {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    return states[this.connection.readyState] || 'unknown';
  }
}
