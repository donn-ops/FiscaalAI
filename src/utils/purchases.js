import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { Platform } from 'react-native';

const API_KEY = 'test_wqxcnWLrYIfxwtWVuxrVNPpflAe';

export const initializePurchases = async () => {
  Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
  await Purchases.configure({ apiKey: API_KEY });
};

export const getOfferings = async () => {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (e) {
    console.log('Offerings error:', e);
    return null;
  }
};

export const purchasePackage = async (pkg) => {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo;
  } catch (e) {
    if (!e.userCancelled) console.log('Purchase error:', e);
    return null;
  }
};

export const restorePurchases = async () => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo;
  } catch (e) {
    console.log('Restore error:', e);
    return null;
  }
};

export const getCustomerInfo = async () => {
  try {
    return await Purchases.getCustomerInfo();
  } catch (e) {
    return null;
  }
};

export const checkEntitlement = async (entitlement) => {
  try {
    const info = await Purchases.getCustomerInfo();
    return info.entitlements.active[entitlement] !== undefined;
  } catch (e) {
    return false;
  }
};

export const isPremium = async () => checkEntitlement('premium');
export const isPro = async () => checkEntitlement('pro');
