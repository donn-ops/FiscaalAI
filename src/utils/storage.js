import AsyncStorage from '@react-native-async-storage/async-storage';

// USER DATA
export const saveUserData = async (data) => {
  try {
    await AsyncStorage.setItem('taxly_user', JSON.stringify(data));
  } catch (e) {
    console.log('Storage error:', e);
  }
};

export const getUserData = async () => {
  try {
    const data = await AsyncStorage.getItem('taxly_user');
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

// HISTORY
export const saveConversation = async (conversation) => {
  try {
    const existing = await getHistory();
    const updated = [conversation, ...existing].slice(0, 50);
    await AsyncStorage.setItem('taxly_history', JSON.stringify(updated));
  } catch (e) {
    console.log('History save error:', e);
  }
};

export const getHistory = async () => {
  try {
    const data = await AsyncStorage.getItem('taxly_history');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const deleteConversation = async (id) => {
  try {
    const existing = await getHistory();
    const updated = existing.filter(c => c.id !== id);
    await AsyncStorage.setItem('taxly_history', JSON.stringify(updated));
  } catch (e) {
    console.log('Delete error:', e);
  }
};

// FAVORITES
export const saveFavorite = async (item) => {
  try {
    const existing = await getFavorites();
    const updated = [item, ...existing].slice(0, 100);
    await AsyncStorage.setItem('taxly_favorites', JSON.stringify(updated));
  } catch (e) {
    console.log('Favorite save error:', e);
  }
};

export const getFavorites = async () => {
  try {
    const data = await AsyncStorage.getItem('taxly_favorites');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const deleteFavorite = async (id) => {
  try {
    const existing = await getFavorites();
    const updated = existing.filter(f => f.id !== id);
    await AsyncStorage.setItem('taxly_favorites', JSON.stringify(updated));
  } catch (e) {
    console.log('Delete favorite error:', e);
  }
};

// TAX PROFILE
export const saveTaxProfile = async (profile) => {
  try {
    await AsyncStorage.setItem('taxly_profile', JSON.stringify(profile));
  } catch (e) {
    console.log('Profile save error:', e);
  }
};

export const getTaxProfile = async () => {
  try {
    const data = await AsyncStorage.getItem('taxly_profile');
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

export const clearUserData = async () => {
  try {
    await AsyncStorage.multiRemove(['taxly_user', 'taxly_history', 'taxly_favorites', 'taxly_profile']);
  } catch (e) {
    console.log('Clear error:', e);
  }
};
