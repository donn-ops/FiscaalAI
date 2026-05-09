import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const requestPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

export const scheduleDeadlineNotifications = async (profile) => {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!profile) return;

  const notifications = [];

  // Aangifte inkomstenbelasting — 1 mei
  notifications.push({
    title: '📋 Taxly Herinnering',
    body: 'Aangifte inkomstenbelasting deadline: 1 mei. Heeft u alles op orde?',
    trigger: getNextDate(4, 15), // April 15
  });

  // BTW kwartaal voor ZZP/MKB
  if (profile.situation === 'zzp' || profile.situation === 'mkb') {
    notifications.push({
      title: '💼 BTW Aangifte',
      body: 'BTW aangifte kwartaal deadline nadert. Check uw omzetbelasting.',
      trigger: getNextDate(0, 25), // Jan 25
    });
  }

  // Eigen woning
  if (profile.ownHome) {
    notifications.push({
      title: '🏠 Hypotheekrenteaftrek',
      body: 'Vergeet uw hypotheekrenteaftrek niet mee te nemen in de aangifte.',
      trigger: getNextDate(3, 1), // April 1
    });
  }

  for (const notif of notifications) {
    if (notif.trigger) {
      await Notifications.scheduleNotificationAsync({
        content: { title: notif.title, body: notif.body },
        trigger: notif.trigger,
      });
    }
  }
};

const getNextDate = (month, day) => {
  const now = new Date();
  let year = now.getFullYear();
  const target = new Date(year, month, day, 9, 0, 0);
  if (target <= now) target.setFullYear(year + 1);
  return target;
};
