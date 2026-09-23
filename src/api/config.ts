import { Platform } from 'react-native';

const DEFAULT_API_URL = 'http://192.168.100.18:5000';

export function getApiBaseUrl() {
  // Same address as EXPO_PUBLIC_API_URL. Written here so a reload does not keep the old server.
  const fromEnv = 'http://192.168.100.18:5000';
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
