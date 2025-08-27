import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MongoError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: any = null;

    // Handle different types of exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        details = exceptionResponse;
      }
    } else if (exception instanceof MongoError) {
      // MongoDB specific errors
      status = HttpStatus.BAD_REQUEST;
      
      if (exception.code === 11000) {
        // Duplicate key error
        const field = Object.keys((exception as any).keyValue || {})[0];
        message = `${field} already exists`;
      } else {
        message = 'Database error occurred';
      }
      
      details = {
        code: exception.code,
        name: exception.name,
      };
    } else if (exception instanceof MongooseError.ValidationError) {
      // Mongoose validation errors
      status = HttpStatus.BAD_REQUEST;
      message = 'Validation failed';
      
      const validationErrors: Record<string, string> = {};
      Object.keys(exception.errors).forEach(key => {
        validationErrors[key] = exception.errors[key].message;
      });
      
      details = {
        name: exception.name,
        errors: validationErrors,
      };
    } else if (exception instanceof MongooseError.CastError) {
      // Mongoose cast errors (invalid ObjectId, etc.)
      status = HttpStatus.BAD_REQUEST;
      message = `Invalid ${exception.path}: ${exception.value}`;
      
      details = {
        name: exception.name,
        path: exception.path,
        value: exception.value,
      };
    } else if (exception instanceof Error) {
      // Generic Error objects
      message = exception.message;
      details = {
        name: exception.name,
        stack: process.env.NODE_ENV === 'development' ? exception.stack : undefined,
      };
    }

    // Create error response
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      ...(details && { details }),
      ...(process.env.NODE_ENV === 'development' && {
        exception: exception instanceof Error ? exception.stack : String(exception),
      }),
    };

    // Log the error with full details
    const logContext = {
      method: request.method,
      url: request.url,
      userAgent: request.get('User-Agent'),
      ip: request.ip,
      user: (request as any).user?.id || 'anonymous',
      statusCode: status,
      message,
      ...(details && { details }),
    };

    if (status >= 500) {
      this.logger.error(
        `SERVER ERROR [${status}] ${request.method} ${request.url}`,
        {
          ...logContext,
          stack: exception instanceof Error ? exception.stack : undefined,
          exception: String(exception),
        },
      );
    } else if (status >= 400) {
      this.logger.warn(
        ` CLIENT ERROR [${status}] ${request.method} ${request.url}`,
        logContext,
      );
    } else {
      this.logger.log(
        `ℹINFO [${status}] ${request.method} ${request.url}`,
        logContext,
      );
    }

    // Send response
    response.status(status).json(errorResponse);
  }
}
