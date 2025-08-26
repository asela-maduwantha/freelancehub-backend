import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DatabaseSeederService } from './database-seeder.service';

async function bootstrap() {
  try {
    console.log('🚀 Starting database seeding...');
    
    const app = await NestFactory.createApplicationContext(AppModule);
    const seeder = app.get(DatabaseSeederService);
    
    await seeder.seedAll();
    
    await app.close();
    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

bootstrap();
