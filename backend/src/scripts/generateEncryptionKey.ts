import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * Generate a secure encryption key for application-level encryption
 * This is much simpler than CSFLE and works reliably
 */
function generateEncryptionKey() {
  // Generate a 256-bit (32 bytes) random key
  const key = crypto.randomBytes(32).toString('hex');
  
  // Save to file
  const keyPath = path.resolve(__dirname, '../../encryption-key.txt');
  fs.writeFileSync(keyPath, key);
  
  console.log('✅ Encryption key generated successfully!');
  console.log('📁 Saved to:', keyPath);
  console.log('\n📋 Add this to your .env file:');
  console.log(`ENCRYPTION_KEY=${key}`);
  console.log('\n⚠️  IMPORTANT: Keep this key secure and NEVER commit it to git!');
  console.log('Add encryption-key.txt to your .gitignore file.');
  console.log('\n💡 This key will be used to encrypt the "content" field in your database.');
}

generateEncryptionKey();
