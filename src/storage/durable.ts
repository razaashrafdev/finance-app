import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { EncryptionEnvelope } from '../crypto/encryption';

const DURABLE_STATE_KEY = 'financeflow.durableState';
const ENVELOPE_KEY = 'financeflow.envelope';

export interface DurableState {
  state: Record<string, any>;
  version: number;
  timestamp: string;
  userId: string;
}

export async function saveDurableState(state: Record<string, any>, userId: string): Promise<void> {
  try {
    const durable: DurableState = {
      state,
      version: Date.now(),
      timestamp: new Date().toISOString(),
      userId,
    };
    const json = JSON.stringify(durable);
    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem(DURABLE_STATE_KEY, json);
    } else {
      await SecureStore.setItemAsync(DURABLE_STATE_KEY, json);
    }
  } catch {}
}

export async function loadDurableState(): Promise<DurableState | null> {
  try {
    const raw = Platform.OS === 'web'
      ? globalThis.localStorage?.getItem(DURABLE_STATE_KEY)
      : await SecureStore.getItemAsync(DURABLE_STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DurableState;
  } catch {
    return null;
  }
}

export async function clearDurableState(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.removeItem(DURABLE_STATE_KEY);
    } else {
      await SecureStore.deleteItemAsync(DURABLE_STATE_KEY);
    }
  } catch {}
}

export async function saveEncryptedEnvelope(envelope: EncryptionEnvelope): Promise<void> {
  try {
    const json = JSON.stringify(envelope);
    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem(ENVELOPE_KEY, json);
    } else {
      await SecureStore.setItemAsync(ENVELOPE_KEY, json);
    }
  } catch {}
}

export async function clearEncryptedEnvelope(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.removeItem(ENVELOPE_KEY);
    } else {
      await SecureStore.deleteItemAsync(ENVELOPE_KEY);
    }
  } catch {}
}

export async function setLastSyncTimestamp(ts: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem('financeflow.lastSync', ts);
    } else {
      await SecureStore.setItemAsync('financeflow.lastSync', ts);
    }
  } catch {}
}

export async function setPendingSyncState(state: Record<string, any>, version: number): Promise<void> {
  try {
    const json = JSON.stringify({ state, version });
    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem('financeflow.pendingSync', json);
    } else {
      await SecureStore.setItemAsync('financeflow.pendingSync', json);
    }
  } catch {}
}
