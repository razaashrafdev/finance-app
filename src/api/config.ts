import { Platform } from 'react-native';

export function getApiBaseUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!fromEnv) {
    throw new Error('EXPO_PUBLIC_API_URL is missing in .env');
  }

  const url = fromEnv.replace(/\/$/, '');
  if (Platform.OS === 'android' && /localhost|127\.0\.0\.1/.test(url)) {
    return url.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2');
  }
  return url;
}
