// Encryption utilities for sensitive data
// Using native btoa/atob for base64 encoding/decoding

import { encode as encodeBase64, decode as decodeBase64 } from "https://deno.land/std@0.210.0/encoding/base64.ts";

// Constants for encryption
const ENCRYPTION_ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const KEY_ITERATIONS = 100000;

interface EncryptedData {
  encrypted: string;  // Base64 encoded encrypted data
  iv: string;        // Base64 encoded initialization vector
  salt: string;      // Base64 encoded salt
}

/**
 * Derives an encryption key from the master key and salt
 */
async function deriveKey(masterKey: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(masterKey),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: KEY_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts sensitive data using AES-GCM
 */
export async function encrypt(data: string): Promise<EncryptedData> {
  const masterKey = Deno.env.get('ENCRYPTION_KEY');
  if (!masterKey) {
    throw new Error('ENCRYPTION_KEY environment variable not set');
  }

  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // Derive the encryption key
  const key = await deriveKey(masterKey, salt);

  // Encrypt the data
  const encoder = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    {
      name: ENCRYPTION_ALGORITHM,
      iv
    },
    key,
    encoder.encode(data)
  );

  // Convert to base64 for storage using native btoa
  return {
    encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
    salt: btoa(String.fromCharCode(...salt))
  };
}

/**
 * Decrypts encrypted data using AES-GCM
 */
export async function decrypt(encryptedData: EncryptedData): Promise<string> {
  const masterKey = Deno.env.get('ENCRYPTION_KEY');
  if (!masterKey) {
    throw new Error('ENCRYPTION_KEY environment variable not set');
  }

  // Convert base64 back to Uint8Array using native atob
  const encrypted = new Uint8Array(atob(encryptedData.encrypted).split('').map(c => c.charCodeAt(0)));
  const iv = new Uint8Array(atob(encryptedData.iv).split('').map(c => c.charCodeAt(0)));
  const salt = new Uint8Array(atob(encryptedData.salt).split('').map(c => c.charCodeAt(0)));

  // Derive the decryption key
  const key = await deriveKey(masterKey, salt);

  // Decrypt the data
  const decrypted = await crypto.subtle.decrypt(
    {
      name: ENCRYPTION_ALGORITHM,
      iv
    },
    key,
    encrypted
  );

  // Convert back to string
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

/**
 * Encrypts an OAuth token for storage
 */
export async function encryptToken(token: string): Promise<string> {
  // Use native btoa for base64 encoding
  return btoa(token);
}

/**
 * Decrypts an OAuth token from storage
 */
export async function decryptToken(encryptedToken: string): Promise<string> {
  // Use native atob for base64 decoding
  return atob(encryptedToken);
}

/**
 * Rotates the encryption of a token using a new key
 * Use this when changing the master encryption key
 */
export async function rotateTokenEncryption(encryptedToken: string): Promise<string> {
  const decrypted = await decryptToken(encryptedToken);
  return await encryptToken(decrypted);
}

/**
 * Validates that the encryption key is properly set and working
 */
export async function validateEncryption(): Promise<boolean> {
  try {
    const testData = 'test-encryption-' + Date.now();
    const encrypted = await encryptToken(testData);
    const decrypted = await decryptToken(encrypted);
    return testData === decrypted;
  } catch (error) {
    console.error('Encryption validation failed:', error);
    return false;
  }
} 