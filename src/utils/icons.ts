import { Ionicons } from '@expo/vector-icons';

type IoniconName = keyof typeof Ionicons.glyphMap;

const ICON_MAP: Record<string, IoniconName> = {
  coffee: 'cafe-outline',
  zap: 'flash-outline',
  smartphone: 'phone-portrait-outline',
  'arrow-left': 'arrow-back-outline',
  'shopping-cart': 'cart-outline',
  activity: 'fitness-outline',
  'chart-line': 'trending-up-outline',
  'arrow-right': 'arrow-forward-outline',
  music: 'musical-notes-outline',
  percent: 'pie-chart-outline',
  'piggy-bank': 'save-outline',
  sunset: 'sunny-outline',
  bank: 'business-outline',
  'credit-card': 'card-outline',
  apple: 'logo-apple',
  university: 'business-outline',
  'bar-chart': 'bar-chart-outline',
  clipboard: 'clipboard-outline',
  laptop: 'laptop-outline',
  briefcase: 'briefcase-outline',
  shirt: 'shirt-outline',
  wifi: 'wifi-outline',
  cash: 'cash-outline',
  home: 'home-outline',
  car: 'car-outline',
  tv: 'tv-outline',
  heart: 'heart-outline',
  book: 'book-outline',
  shield: 'shield-outline',
  film: 'film-outline',
  flag: 'flag-outline',
  wallet: 'wallet-outline',
  calculator: 'calculator-outline',
  'trending-up': 'trending-up-outline',
  'shield-checkmark': 'shield-checkmark-outline',
};

export function toIonicon(name?: string | null): IoniconName {
  if (!name) return 'ellipsis-horizontal-outline';
  if (name in ICON_MAP) return ICON_MAP[name];
  if (name in Ionicons.glyphMap) return name as IoniconName;
  const outlined = `${name}-outline`;
  if (outlined in Ionicons.glyphMap) return outlined as IoniconName;
  return 'ellipsis-horizontal-outline';
}
