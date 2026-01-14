#!/usr/bin/env node

// Setup script to help configure Better Auth
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

console.log('🔐 Better Auth Setup Script\n');

try {
  // Generate a secure secret key
  console.log('1. Generating secure secret key...');
  const secret = execSync('openssl rand -base64 32', { encoding: 'utf-8' }).trim();
  
  console.log('✅ Secret key generated:', secret.substring(0, 20) + '...');
  
  // Check if .env file exists
  const fs = await import('fs');
  const envPath = '.env';
  
  if (fs.existsSync(envPath)) {
    console.log('\n📝 Updating existing .env file...');
    
    let envContent = fs.readFileSync(envPath, 'utf-8');
    
    // Update or add Better Auth variables
    const betterAuthUrl = 'http://localhost:3000';
    
    if (envContent.includes('BETTER_AUTH_URL=')) {
      envContent = envContent.replace(/BETTER_AUTH_URL=.*/, `BETTER_AUTH_URL="${betterAuthUrl}"`);
    } else {
      envContent += `\nBETTER_AUTH_URL="${betterAuthUrl}"\n`;
    }
    
    if (envContent.includes('BETTER_AUTH_SECRET=')) {
      envContent = envContent.replace(/BETTER_AUTH_SECRET=.*/, `BETTER_AUTH_SECRET="${secret}"`);
    } else {
      envContent += `BETTER_AUTH_SECRET="${secret}"\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Environment variables updated in .env file');
  } else {
    console.log('\n📝 Creating new .env file...');
    const envContent = `# Better Auth Configuration
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="${secret}"

# Copy other variables from .env.example as needed
`;
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created with Better Auth variables');
  }
  
  console.log('\n🎉 Setup complete!');
  console.log('\nNext steps:');
  console.log('1. Review the .env file and add any other required variables from .env.example');
  console.log('2. Run: npm run db:push');
  console.log('3. Run: npm run dev');
  console.log('\n🚀 Your auth should now work without network errors!');
  
} catch (error) {
  console.error('❌ Error:', error instanceof Error ? error.message : String(error));
  console.log('\nManual setup:');
  console.log('1. Generate a secret: openssl rand -base64 32');
  console.log('2. Add these to your .env file:');
  console.log('   BETTER_AUTH_URL="http://localhost:3000"');
  console.log('   BETTER_AUTH_SECRET="your-generated-secret"');
}