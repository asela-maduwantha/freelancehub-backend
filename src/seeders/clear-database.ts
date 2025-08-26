import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';

async function clearAndDropIndex() {
  try {
    console.log('🚀 Starting database cleanup...');
    
    const app = await NestFactory.createApplicationContext(AppModule);
    const userModel = app.get(getModelToken(User.name));
    
    // First, clear all users
    const deleteResult = await userModel.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} users`);
    
    // Try to drop the problematic index
    try {
      await userModel.collection.dropIndex('passkeys.credentialId_1');
      console.log('✅ Dropped passkeys.credentialId index');
    } catch (error) {
      console.log('ℹ️ Index might not exist or already dropped:', error.message);
    }
    
    // List all indexes to see what's left
    const indexes = await userModel.collection.indexes();
    console.log('📋 Current indexes:', indexes.map(idx => idx.name));
    
    await app.close();
    console.log('✅ Database cleanup completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

clearAndDropIndex();
