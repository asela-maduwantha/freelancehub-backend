import { Logger } from '@nestjs/common';

const logger = new Logger('EnvironmentValidation');

interface EnvironmentConfig {
  required: string[];
  recommended: string[];
  secure: string[];
}

const environmentVariables: EnvironmentConfig = {
  // Critical variables that must be set
  required: [
    'NODE_ENV',
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
  ],
  
  // Important for production but have defaults
  recommended: [
    'PORT',
    'REDIS_HOST',
    'REDIS_PORT',
    'EMAIL_HOST',
    'EMAIL_USER',
    'EMAIL_PASSWORD',
  ],
  
  // Security-sensitive variables that should not use defaults in production
  secure: [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'SESSION_SECRET',
    'BCRYPT_SALT_ROUNDS',
  ],
};

export function validateEnvironment(): void {
  const isProduction = process.env.NODE_ENV === 'production';
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  environmentVariables.required.forEach((varName) => {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  });

  // Check recommended variables
  environmentVariables.recommended.forEach((varName) => {
    if (!process.env[varName]) {
      warnings.push(`Missing recommended environment variable: ${varName}`);
    }
  });

  // Check for insecure defaults in production
  if (isProduction) {
    const insecureDefaults = new Map([
      ['JWT_SECRET', 'default-jwt-secret'],
      ['JWT_REFRESH_SECRET', 'default-refresh-secret'],
      ['SESSION_SECRET', 'default-session-secret'],
    ]);

    insecureDefaults.forEach((defaultValue, varName) => {
      if (process.env[varName] === defaultValue) {
        errors.push(
          `Production security risk: ${varName} is using default value. Set a secure value.`,
        );
      }
    });

    // Check for development email credentials in production
    if (process.env.EMAIL_USER === 'maduwanthaaselagra@gmail.com') {
      warnings.push(
        'Production warning: Using development email credentials',
      );
    }
  }

  // Log results
  if (errors.length > 0) {
    logger.error('❌ Environment validation failed:');
    errors.forEach((error) => logger.error(`  - ${error}`));
    
    if (isProduction) {
      logger.error('🚨 Application cannot start in production with these errors');
      process.exit(1);
    }
  }

  if (warnings.length > 0) {
    logger.warn('⚠️  Environment validation warnings:');
    warnings.forEach((warning) => logger.warn(`  - ${warning}`));
  }

  if (errors.length === 0 && warnings.length === 0) {
    logger.log('✅ Environment validation passed');
  }
}

export function getEnvironmentInfo(): Record<string, any> {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT || '3000',
    hasDatabase: !!process.env.MONGODB_URI,
    hasRedis: !!process.env.REDIS_HOST,
    hasEmail: !!(process.env.EMAIL_HOST && process.env.EMAIL_USER),
    hasAws: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
    hasStripe: !!process.env.STRIPE_SECRET_KEY,
    secureSecrets: !!(
      process.env.JWT_SECRET !== 'default-jwt-secret' &&
      process.env.JWT_REFRESH_SECRET !== 'default-refresh-secret' &&
      process.env.SESSION_SECRET !== 'default-session-secret'
    ),
  };
}