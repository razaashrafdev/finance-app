import * as SecureStore from 'expo-secure-store';
import * as ExpoCrypto from 'expo-crypto';
import { AESEncryptionKey, AESSealedData, aesEncryptAsync, aesDecryptAsync } from 'expo-crypto';

const ENCRYPTION_KEY_VERSION = 1;
const ENCRYPTION_ALGORITHM = 'AES-256-GCM';
const ENVELOPE_FORMAT = 'financeflow-encrypted';
const KEY_STORAGE_KEY = 'financeflow.encryptionKey';

export interface EncryptionEnvelope {
  format: string;
  version: number;
  algorithm: string;
  iv: string;
  ciphertext: string;
  authTag: string;
  createdAt: string;
  stateVersion: number;
}

export async function getOrCreateEncryptionKey(userId: string): Promise<AESEncryptionKey> {
  const stored = await SecureStore.getItemAsync(`${KEY_STORAGE_KEY}_${userId}`);
  if (stored) {
    try {
      return await AESEncryptionKey.import(stored, 'base64');
    } catch {
      // Corrupted key, generate new one
    }
  }
  const key = await AESEncryptionKey.generate(256);
  await SecureStore.setItemAsync(`${KEY_STORAGE_KEY}_${userId}`, await key.encoded('base64'));
  return key;
}

export async function getEncryptionKey(userId: string): Promise<AESEncryptionKey | null> {
  try {
    const stored = await SecureStore.getItemAsync(`${KEY_STORAGE_KEY}_${userId}`);
    if (!stored) return null;
    return await AESEncryptionKey.import(stored, 'base64');
  } catch {
    return null;
  }
}

export async function encryptState(
  state: string,
  userId: string
): Promise<EncryptionEnvelope> {
  const key = await getOrCreateEncryptionKey(userId);
  // expo-crypto BinaryInput strings must be base64; pass UTF-8 bytes for JSON plaintext.
  const plaintext = new TextEncoder().encode(state);
  const sealedData = await aesEncryptAsync(plaintext, key, {
    tagLength: 16,
  });
  const iv = await sealedData.iv('base64');
  const ciphertext = await sealedData.ciphertext({ includeTag: false, encoding: 'base64' });
  const authTag = await sealedData.tag('base64');

  return {
    format: ENVELOPE_FORMAT,
    version: ENCRYPTION_KEY_VERSION,
    algorithm: ENCRYPTION_ALGORITHM,
    iv,
    ciphertext,
    authTag,
    createdAt: new Date().toISOString(),
    stateVersion: 0,
  };
}

export async function decryptState(
  envelope: EncryptionEnvelope,
  userId: string
): Promise<string> {
  const key = await getEncryptionKey(userId);
  if (!key) {
    throw new Error('Encryption key not found');
  }

  const sealedData = AESSealedData.fromParts(
    envelope.iv,
    envelope.ciphertext,
    envelope.authTag
  );

  const bytes = await aesDecryptAsync(sealedData, key, { output: 'bytes' });
  return new TextDecoder().decode(bytes);
}

export async function computePayloadHash(data: string): Promise<string> {
  const digest = await ExpoCrypto.digestStringAsync(
    ExpoCrypto.CryptoDigestAlgorithm.SHA256,
    data,
    { encoding: ExpoCrypto.CryptoEncoding.HEX }
  );
  return digest as string;
}

export function isEncryptedEnvelope(data: any): data is EncryptionEnvelope {
  return (
    data &&
    typeof data === 'object' &&
    data.format === ENVELOPE_FORMAT &&
    data.algorithm === ENCRYPTION_ALGORITHM &&
    typeof data.ciphertext === 'string' &&
    typeof data.iv === 'string' &&
    typeof data.authTag === 'string'
  );
}
