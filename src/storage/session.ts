import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'financeflow.accessToken';
const REFRESH_TOKEN_KEY = 'financeflow.refreshToken';
const CHUNK_SIZE = 1800;

async function setItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(key, value);
    return;
  }

  const chunks: string[] = [];
  for (let index = 0; index < value.length; index += CHUNK_SIZE) {
    chunks.push(value.slice(index, index + CHUNK_SIZE));
  }
  await SecureStore.setItemAsync(`${key}.count`, String(chunks.length));
  for (let index = 0; index < chunks.length; index += 1) {
    await SecureStore.setItemAsync(`${key}.${index}`, chunks[index]);
  }
}

async function getItem(key: string) {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem(key) ?? null;
  }

  const countRaw = await SecureStore.getItemAsync(`${key}.count`);
  if (!countRaw) {
    return SecureStore.getItemAsync(key);
  }

  const count = Number(countRaw);
  if (!Number.isFinite(count) || count <= 0) {
    return null;
  }

  let value = '';
  for (let index = 0; index < count; index += 1) {
    const part = await SecureStore.getItemAsync(`${key}.${index}`);
    if (!part) {
      return null;
    }
    value += part;
  }
  return value;
}

async function deleteItem(key: string) {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(key);
    return;
  }

  const countRaw = await SecureStore.getItemAsync(`${key}.count`);
  const count = Number(countRaw || 0);
  const deletions = [
    SecureStore.deleteItemAsync(`${key}.count`),
    SecureStore.deleteItemAsync(key),
  ];
  for (let index = 0; index < count; index += 1) {
    deletions.push(SecureStore.deleteItemAsync(`${key}.${index}`));
  }
  await Promise.all(deletions.map((job) => job.catch(() => undefined)));
}

export async function saveSession(accessToken: string, refreshToken?: string | null) {
  await setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    await setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export async function getAccessToken() {
  try {
    return await getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function getRefreshToken() {
  try {
    return await getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function clearSession() {
  try {
    await deleteItem(ACCESS_TOKEN_KEY);
    await deleteItem(REFRESH_TOKEN_KEY);
  } catch {
    // A failed delete should still let the user leave the signed-in screens.
  }
}
