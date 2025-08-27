import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    
    const { method, url, body, query, params, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const ip = request.ip;
    const userId = (request as any).user?.id || 'anonymous';
    
    const startTime = Date.now();

    // Log incoming request
    this.logger.log(
      `🔵 INCOMING [${method}] ${url}`,
      {
        method,
        url,
        userAgent,
        ip,
        userId,
        body: this.sanitizeBody(body),
        query,
        params,
        timestamp: new Date().toISOString(),
      },
    );

    return next
      .handle()
      .pipe(
        tap((data) => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;
          
          // Log successful response
          this.logger.log(
            `🟢 SUCCESS [${statusCode}] ${method} ${url} - ${duration}ms`,
            {
              method,
              url,
              statusCode,
              duration,
              userId,
              responseSize: JSON.stringify(data).length,
              timestamp: new Date().toISOString(),
            },
          );
        }),
        catchError((error) => {
          const duration = Date.now() - startTime;
          
          // Log error response
          this.logger.error(
            `🔴 ERROR [${method}] ${url} - ${duration}ms`,
            {
              method,
              url,
              duration,
              userId,
              error: error.message,
              stack: error.stack,
              timestamp: new Date().toISOString(),
            },
          );
          
          throw error;
        }),
      );
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;
    
    const sanitized = { ...body };
    
    // Remove sensitive fields from logs
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth', 'credential'];
    
    Object.keys(sanitized).forEach(key => {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        sanitized[key] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }
}
