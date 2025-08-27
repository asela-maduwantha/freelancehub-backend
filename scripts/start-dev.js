#!/usr/bin/env node

// Enhanced startup script with better error handling
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting FreelanceHub Backend with Enhanced Error Logging');
console.log('=' .repeat(60));
console.log('✅ All errors will be displayed in this terminal');
console.log('✅ Database connection errors will be logged');
console.log('✅ Unhandled exceptions will be caught');
console.log('✅ Request/Response logging enabled');
console.log('=' .repeat(60));

// Start the NestJS application
const child = spawn('npm', ['run', 'start:dev'], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'development',
    ENABLE_REQUEST_LOGGING: 'true',
    ENABLE_DATABASE_LOGGING: 'true',
  }
});

child.on('error', (error) => {
  console.error('💥 Failed to start the application:');
  console.error(error);
  process.exit(1);
});

child.on('exit', (code) => {
  if (code !== 0) {
    console.error(`💥 Application exited with code ${code}`);
  }
  process.exit(code);
});

// Handle CTRL+C gracefully
process.on('SIGINT', () => {
  console.log('\n📤 Received SIGINT, shutting down gracefully...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n📤 Received SIGTERM, shutting down gracefully...');
  child.kill('SIGTERM');
});
