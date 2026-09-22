import { Platform } from 'react-native';

const DEFAULT_API_URL = 'http://192.168.100.18:5000';

export function getApiBaseUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) {
    const url = fromEnv.replace(/\/$/, '');
    if (Platform.OS === 'android' && /localhost|127\.0\.0\.1/.test(url)) {
      return url.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2');
    }
    return url;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }
  return DEFAULT_API_URL;
}
