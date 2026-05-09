import AsyncStorage from '@react-native-async-storage/async-storage';

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

export const clearUserData = async () => {
  try {
    await AsyncStorage.removeItem('taxly_user');
  } catch (e) {
    console.log('Clear error:', e);
  }
};
