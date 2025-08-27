import { Injectable, LoggerService, ConsoleLogger } from '@nestjs/common';

@Injectable()
export class CustomLogger extends ConsoleLogger implements LoggerService {
  constructor() {
    super();
    this.setLogLevels(['log', 'error', 'warn', 'debug', 'verbose']);
  }

  log(message: any, context?: string) {
    const timestamp = new Date().toISOString();
    const logLevel = 'LOG';
    const contextStr = context ? `[${context}] ` : '';
    
    if (typeof message === 'object') {
      console.log(`\x1b[32m[${timestamp}] [${logLevel}] ${contextStr}\x1b[0m`);
      console.log(JSON.stringify(message, null, 2));
    } else {
      console.log(`\x1b[32m[${timestamp}] [${logLevel}] ${contextStr}${message}\x1b[0m`);
    }
  }

  error(message: any, trace?: string, context?: string) {
    const timestamp = new Date().toISOString();
    const logLevel = 'ERROR';
    const contextStr = context ? `[${context}] ` : '';
    
    if (typeof message === 'object') {
      console.error(`\x1b[31m[${timestamp}] [${logLevel}] ${contextStr}\x1b[0m`);
      console.error(JSON.stringify(message, null, 2));
    } else {
      console.error(`\x1b[31m[${timestamp}] [${logLevel}] ${contextStr}${message}\x1b[0m`);
    }
    
    if (trace) {
      console.error(`\x1b[31mStack trace:\x1b[0m`);
      console.error(trace);
    }
  }

  warn(message: any, context?: string) {
    const timestamp = new Date().toISOString();
    const logLevel = 'WARN';
    const contextStr = context ? `[${context}] ` : '';
    
    if (typeof message === 'object') {
      console.warn(`\x1b[33m[${timestamp}] [${logLevel}] ${contextStr}\x1b[0m`);
      console.warn(JSON.stringify(message, null, 2));
    } else {
      console.warn(`\x1b[33m[${timestamp}] [${logLevel}] ${contextStr}${message}\x1b[0m`);
    }
  }

  debug(message: any, context?: string) {
    const timestamp = new Date().toISOString();
    const logLevel = 'DEBUG';
    const contextStr = context ? `[${context}] ` : '';
    
    if (typeof message === 'object') {
      console.debug(`\x1b[36m[${timestamp}] [${logLevel}] ${contextStr}\x1b[0m`);
      console.debug(JSON.stringify(message, null, 2));
    } else {
      console.debug(`\x1b[36m[${timestamp}] [${logLevel}] ${contextStr}${message}\x1b[0m`);
    }
  }

  verbose(message: any, context?: string) {
    const timestamp = new Date().toISOString();
    const logLevel = 'VERBOSE';
    const contextStr = context ? `[${context}] ` : '';
    
    if (typeof message === 'object') {
      console.log(`\x1b[35m[${timestamp}] [${logLevel}] ${contextStr}\x1b[0m`);
      console.log(JSON.stringify(message, null, 2));
    } else {
      console.log(`\x1b[35m[${timestamp}] [${logLevel}] ${contextStr}${message}\x1b[0m`);
    }
  }
}
