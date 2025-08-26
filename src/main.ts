import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as compression from 'compression';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Get configuration service
  const configService = app.get(ConfigService);
  
  // Global prefix
  app.setGlobalPrefix('api');
  
  // API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: configService.get('apiVersion') || '1',
  });
  
  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));
  
  // Compression
  app.use(compression());
  
  // CORS configuration
  app.enableCors(configService.get('frontend.cors'));
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      validateCustomDecorators: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  
  // Swagger documentation
  if (configService.get('nodeEnv') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('FreelanceHub API')
      .setDescription('Comprehensive freelancer hiring platform API with payments and authentication')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Authentication', 'User registration, login, and security')
      .addTag('Projects', 'Project management and search')
      .addTag('Proposals', 'Freelancer proposals and bidding')
      .addTag('Contracts', 'Contract management and milestones')
      .addTag('Payments', 'Payment processing and escrow')
      .addTag('Messages', 'Real-time messaging system')
      .addTag('Reviews', 'Review and rating system')
      .addServer(configService.get('frontend.url') || 'http://localhost:3000', 'Development server')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
      customSiteTitle: 'FreelanceHub API Documentation',
    });
  }
  
  const port = configService.get('port') || 3000;
  await app.listen(port);
  
  console.log(`🚀 FreelanceHub backend is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap().catch((error) => {
  console.error('Failed to start the application:', error);
  process.exit(1);
});
