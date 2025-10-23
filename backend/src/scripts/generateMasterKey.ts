import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * Generate a 96-byte master key for local CSFLE development
 * This key will be used to encrypt the Data Encryption Keys (DEKs)
 * 
 * IMPORTANT: In production, use a proper KMS (AWS KMS, Azure Key Vault, or GCP KMS)
 */
function generateMasterKey() {
  // Generate 96 random bytes
  const masterKey = crypto.randomBytes(96);
  
  // Convert to base64 for easy storage in .env
  const masterKeyBase64 = masterKey.toString('base64');
  
  // Save to a file in the backend directory (two levels up from scripts)
  const keyPath = path.resolve(__dirname, '../../master-key.txt');
  fs.writeFileSync(keyPath, masterKeyBase64);
  
  console.log('✅ Master key generated successfully!');
  console.log('📁 Saved to:', keyPath);
  console.log('\n📋 Add this to your .env file:');
  console.log(`CSFLE_MASTER_KEY=${masterKeyBase64}`);
  console.log('\n⚠️  IMPORTANT: Keep this key secure and NEVER commit it to git!');
  console.log('Add master-key.txt to your .gitignore file.');
}

generateMasterKey();
