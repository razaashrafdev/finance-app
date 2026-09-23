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

const PENDING_SIGNUP_KEY = 'financeflow.pendingSignup';

export async function savePendingSignup(email: string, fullName: string) {
  await setItem(PENDING_SIGNUP_KEY, JSON.stringify({ email, fullName }));
}

export async function getPendingSignup(): Promise<{ email: string; fullName: string } | null> {
  try {
    const raw = await getItem(PENDING_SIGNUP_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function clearPendingSignup() {
  try {
    await deleteItem(PENDING_SIGNUP_KEY);
  } catch {
    // Ignore
  }
}

const DRIVE_PROMPT_KEY = 'financeflow.drivePrompt';

export async function saveDrivePromptPending() {
  await setItem(DRIVE_PROMPT_KEY, String(Date.now()));
}

export async function getDrivePromptAgeMs(): Promise<number | null> {
  try {
    const raw = await getItem(DRIVE_PROMPT_KEY);
    if (!raw) return null;
    const startedAt = Number(raw);
    if (!Number.isFinite(startedAt) || startedAt <= 0) return 0;
    return Date.now() - startedAt;
  } catch {
    return null;
  }
}

export async function clearDrivePromptPending() {
  try {
    await deleteItem(DRIVE_PROMPT_KEY);
  } catch {
    // Ignore
  }
}
