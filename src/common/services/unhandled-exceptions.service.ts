import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';

@Injectable()
export class UnhandledExceptionsService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UnhandledExceptionsService.name);

  onApplicationBootstrap() {
    this.setupGlobalErrorHandlers();
  }

  private setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      this.logger.error('🚨 UNHANDLED PROMISE REJECTION', {
        reason: reason?.message || reason,
        stack: reason?.stack,
        promise: promise.toString(),
        timestamp: new Date().toISOString(),
        type: 'unhandledRejection',
      });

      // In development, you might want to crash the process
      if (process.env.NODE_ENV === 'development') {
        console.error('\n💥 Unhandled Promise Rejection - Server will continue running but this should be fixed!\n');
      }
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      this.logger.error('🚨 UNCAUGHT EXCEPTION', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        timestamp: new Date().toISOString(),
        type: 'uncaughtException',
      });

      // Uncaught exceptions are more serious - we should exit gracefully
      console.error('\n💥 Uncaught Exception - Server will shut down!\n');
      process.exit(1);
    });

    // Handle warning events
    process.on('warning', (warning: Error) => {
      this.logger.warn('⚠️ PROCESS WARNING', {
        message: warning.message,
        stack: warning.stack,
        name: warning.name,
        timestamp: new Date().toISOString(),
        type: 'warning',
      });
    });

    // Handle SIGTERM and SIGINT for graceful shutdown
    process.on('SIGTERM', () => {
      this.logger.log('📤 SIGTERM received - Starting graceful shutdown');
      this.gracefulShutdown();
    });

    process.on('SIGINT', () => {
      this.logger.log('📤 SIGINT received - Starting graceful shutdown');
      this.gracefulShutdown();
    });

    this.logger.log('🛡️ Global error handlers initialized');
  }

  private gracefulShutdown() {
    this.logger.log('🔄 Performing graceful shutdown...');
    
    // Give some time for ongoing requests to complete
    setTimeout(() => {
      this.logger.log('👋 Graceful shutdown completed');
      process.exit(0);
    }, 5000);
  }
}
