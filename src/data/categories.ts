export const DEFAULT_CATEGORIES: Record<string, { icon: string; color: string }> = {
  Income: { icon: 'briefcase', color: '#4caf50' },
  Housing: { icon: 'home', color: '#2196f3' },
  Food: { icon: 'cart-outline', color: '#ff9800' },
  Dining: { icon: 'cafe-outline', color: '#e91e63' },
  Transport: { icon: 'car', color: '#9c27b0' },
  Entertainment: { icon: 'tv', color: '#f44336' },
  Shopping: { icon: 'shirt', color: '#3f51b5' },
  Utilities: { icon: 'flash-outline', color: '#00bcd4' },
  Health: { icon: 'heart', color: '#8bc34a' },
  Education: { icon: 'book', color: '#ff5722' },
  Transfer: { icon: 'arrow-forward-outline', color: '#607d8b' },
  Groceries: { icon: 'cart-outline', color: '#ff9800' },
  Rent: { icon: 'home', color: '#2196f3' },
  Electricity: { icon: 'flash-outline', color: '#00bcd4' },
  Internet: { icon: 'wifi', color: '#00bcd4' },
  Phone: { icon: 'phone-portrait-outline', color: '#00bcd4' },
  Gas: { icon: 'car', color: '#9c27b0' },
  Insurance: { icon: 'shield', color: '#607d8b' },
  Restaurants: { icon: 'cafe-outline', color: '#e91e63' },
  Coffee: { icon: 'cafe-outline', color: '#e91e63' },
  Streaming: { icon: 'tv', color: '#f44336' },
  Music: { icon: 'musical-notes-outline', color: '#f44336' },
  Gym: { icon: 'heart', color: '#8bc34a' },
  Medical: { icon: 'fitness-outline', color: '#8bc34a' },
  Courses: { icon: 'book', color: '#ff5722' },
  Books: { icon: 'book', color: '#ff5722' },
  Clothing: { icon: 'shirt', color: '#3f51b5' },
  Movies: { icon: 'film', color: '#f44336' },
};

export const categoryList = Object.entries(DEFAULT_CATEGORIES).map(([name, meta]) => ({
  id: name,
  name,
  icon: meta.icon,
  color: meta.color,
  type: name === 'Income' ? 'income' : name === 'Transfer' ? 'transfer' : 'expense',
}));

export function resolveCategories(
  storeCategories?: Record<string, any> | null
): Record<string, { icon: string; color: string }> {
  if (storeCategories && Object.keys(storeCategories).length > 0) {
    return storeCategories as Record<string, { icon: string; color: string }>;
  }
  return DEFAULT_CATEGORIES;
}

export function resolveCategoryList(storeCategories?: Record<string, any> | null) {
  const cats = resolveCategories(storeCategories);
  if (cats === DEFAULT_CATEGORIES) return categoryList;
  return Object.entries(cats).map(([name, meta]) => ({
    id: name,
    name,
    icon: meta.icon,
    color: meta.color,
    type: name === 'Income' ? 'income' : name === 'Transfer' ? 'transfer' : 'expense',
  }));
}
