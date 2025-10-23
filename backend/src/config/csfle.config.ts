import { MongoClient, ClientEncryption, Binary } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Client Side Field Level Encryption Configuration for encrypting sensitive fields
 */

// Key Vault configuration
export const keyVaultNamespace = process.env.CSFLE_KEY_VAULT_NAMESPACE || 'encryption.__keyVault';
const [keyVaultDb, keyVaultColl] = keyVaultNamespace.split('.');

// Local Key Management Service Provider configuration
export const kmsProviders = {
  local: {
    key: Buffer.from(process.env.CSFLE_MASTER_KEY || '', 'base64')
  }
};

/**
 * Auto-encryption schema for node_contents collection
 * This tells MongoDB which fields to automatically encrypt
 */
export const autoEncryptionSchema = {
  'ai_writing_assistant.nodecontents': {  // Mongoose uses lowercase collection name
    bsonType: 'object',
    encryptMetadata: {
      keyId: '/keyId',
    },
    properties: {
      content: {
        encrypt: {
          bsonType: 'string',
          algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic'
        }
      }
    }
  }
};

/**
 * Create or retrieve the Data Encryption Key (DEK)
 * This key is used to encrypt the actual data
 */
export async function setupDataEncryptionKey(): Promise<Binary> {
  const client = new MongoClient(process.env.MONGO_URI || '', {
    authSource: 'admin'
  });

  try {
    await client.connect();
    console.log('🔐 Setting up Data Encryption Key...');

    const encryption = new ClientEncryption(client, {
      keyVaultNamespace,
      kmsProviders
    });

    // Check if DEK already exists
    const keyVaultClient = client.db(keyVaultDb).collection(keyVaultColl);
    const existingKey = await keyVaultClient.findOne({
      keyAltNames: 'nodeContentEncryptionKey'
    });

    if (existingKey) {
      console.log('✅ Data Encryption Key already exists');
      return existingKey.id;
    }

    // Create new DEK
    console.log('Creating new Data Encryption Key...');
    const dataKeyId = await encryption.createDataKey('local', {
      keyAltNames: ['nodeContentEncryptionKey']
    });

    console.log('Data Encryption Key created successfully!');
    console.log('Key ID:', dataKeyId.toString('base64'));

    return dataKeyId;
  } catch (error) {
    console.error('Error setting up Data Encryption Key:', error);
    throw error;
  } finally {
    await client.close();
  }
}

/**
 * Get auto-encryption options for Mongoose
 */
export async function getAutoEncryptionOptions() {
  // Ensure DEK exists
  const keyId = await setupDataEncryptionKey();

  // Update schema with actual keyId
  const schemaWithKeyId = {
    'ai_writing_assistant.nodecontents': {
      ...autoEncryptionSchema['ai_writing_assistant.nodecontents'],
      encryptMetadata: {
        keyId: [keyId]
      }
    }
  };

  return {
    keyVaultNamespace,
    kmsProviders,
    schemaMap: schemaWithKeyId,
    bypassQueryAnalysis: false
  };
}
