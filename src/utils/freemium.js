import AsyncStorage from '@react-native-async-storage/async-storage';
import { isPremium, isPro } from './purchases';

const DAILY_LIMIT = 5;

export const checkCanSendMessage = async () => {
  const hasPremium = await isPremium();
  const hasPro = await isPro();
  if (hasPremium || hasPro) return { allowed: true };

  const today = new Date().toDateString();
  const key = `taxly_usage_${today}`;
  
  try {
    const count = await AsyncStorage.getItem(key);
    const used = count ? parseInt(count) : 0;
    
    if (used >= DAILY_LIMIT) {
      return { allowed: false, used, limit: DAILY_LIMIT };
    }
    
    await AsyncStorage.setItem(key, String(used + 1));
    return { allowed: true, used: used + 1, limit: DAILY_LIMIT };
  } catch (e) {
    return { allowed: true };
  }
};

export const getDailyUsage = async () => {
  const today = new Date().toDateString();
  const key = `taxly_usage_${today}`;
  try {
    const count = await AsyncStorage.getItem(key);
    return count ? parseInt(count) : 0;
  } catch (e) {
    return 0;
  }
};
