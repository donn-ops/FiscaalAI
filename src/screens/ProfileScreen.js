import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Alert, Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserData, saveTaxProfile, getTaxProfile, saveUserData, clearUserData } from '../utils/storage';
import { scheduleDeadlineNotifications, requestPermissions } from '../utils/notifications';
import { t } from '../constants/translations';

const SITUATIONS = [
  { key: 'particulier', icon: '👤', label: { nl: 'Particulier', en: 'Individual', de: 'Privatperson', fr: 'Particulier' } },
  { key: 'zzp', icon: '💼', label: { nl: 'ZZP\'er', en: 'Freelancer', de: 'Freiberufler', fr: 'Indépendant' } },
  { key: 'mkb', icon: '🏢', label: { nl: 'MKB / BV', en: 'SME / Ltd', de: 'KMU / GmbH', fr: 'PME / SARL' } },
  { key: 'dga', icon: '👔', label: { nl: 'DGA', en: 'Director', de: 'Geschäftsführer', fr: 'Dirigeant' } },
];

export default function ProfileScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [situation, setSituation] = useState('particulier');
  const [ownHome, setOwnHome] = useState(false);
  const [hasPartner, setHasPartner] = useState(false);
  const [hasKids, setHasKids] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const lang = userData?.language || 'nl';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const user = await getUserData();
    const profile = await getTaxProfile();
    setUserData(user);
    if (profile) {
      setSituation(profile.situation || 'particulier');
      setOwnHome(profile.ownHome || false);
      setHasPartner(profile.hasPartner || false);
      setHasKids(profile.hasKids || false);
      setNotifications(profile.notifications !== false);
    }
  };

  const saveProfile = async () => {
    const profile = { situation, ownHome, hasPartner, hasKids, notifications };
    await saveTaxProfile(profile);
    if (notifications) {
      const granted = await requestPermissions();
      if (granted) await scheduleDeadlineNotifications(profile);
    }
    Alert.alert('✓', t(lang, 'profile_saved'));
  };

  const resetApp = () => {
    Alert.alert(
      'Reset',
      'Weet u zeker dat u alle data wilt verwijderen?',
      [
        { text: 'Annuleren', style: 'cancel' },
        { text: 'Verwijderen', style: 'destructive', onPress: async () => {
          await clearUserData();
          navigation.replace('Onboarding');
        }},
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t(lang, 'tax_profile')}</Text>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>T</Text>
          </View>
        </View>

        {userData && (
          <View style={styles.userCard}>
            <Text style={styles.userName}>{userData.name}</Text>
            <Text style={styles.userLang}>🌍 {userData.language?.toUpperCase()}</Text>
          </View>
        )}

        <Text style={styles.sectionLabel}>{t(lang, 'situation')}</Text>
        <View style={styles.situationGrid}>
          {SITUATIONS.map((s) => (
            <TouchableOpacity
              key={s.key}
              style={[styles.situationCard, situation === s.key && styles.situationCardActive]}
              onPress={() => setSituation(s.key)}
            >
              <Text style={styles.situationIcon}>{s.icon}</Text>
              <Text style={[styles.situationLabel, situation === s.key && styles.situationLabelActive]}>
                {s.label[lang] || s.label.nl}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Persoonlijke situatie</Text>
        <View style={styles.toggleCard}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>🏠 {t(lang, 'own_home')}</Text>
            <Switch value={ownHome} onValueChange={setOwnHome} trackColor={{ true: '#154273' }} />
          </View>
          <View style={styles.divider} />
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>💑 Fiscaal partner</Text>
            <Switch value={hasPartner} onValueChange={setHasPartner} trackColor={{ true: '#154273' }} />
          </View>
          <View style={styles.divider} />
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>👶 Kinderen</Text>
            <Switch value={hasKids} onValueChange={setHasKids} trackColor={{ true: '#154273' }} />
          </View>
        </View>

        <Text style={styles.sectionLabel}>Notificaties</Text>
        <View style={styles.toggleCard}>
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>🔔 Belastingdeadlines</Text>
              <Text style={styles.toggleSub}>Herinneringen op basis van uw profiel</Text>
            </View>
            <Switch value={notifications} onValueChange={setNotifications} trackColor={{ true: '#154273' }} />
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
          <Text style={styles.saveBtnText}>{t(lang, 'save_profile')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetBtn} onPress={resetApp}>
          <Text style={styles.resetBtnText}>🗑 Reset app</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#EEF2F7' },
  container: { paddingBottom: 40 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'white', padding: 16,
    borderBottomWidth: 1, borderBottomColor: '#dde3ed',
    shadowColor: '#154273', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  backBtn: { padding: 4 },
  backText: { color: '#154273', fontSize: 22, fontWeight: '600' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#154273' },
  logoBox: {
    width: 34, height: 34, backgroundColor: '#154273',
    borderRadius: 10, alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontSize: 16, fontWeight: '800', color: 'white' },
  userCard: {
    backgroundColor: '#154273', margin: 16, borderRadius: 14,
    padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  userName: { fontSize: 18, fontWeight: '700', color: 'white' },
  userLang: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: '#154273',
    textTransform: 'uppercase', letterSpacing: 1.5,
    marginHorizontal: 16, marginTop: 20, marginBottom: 10,
  },
  situationGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    paddingHorizontal: 16,
  },
  situationCard: {
    width: '47%', backgroundColor: 'white',
    borderWidth: 2, borderColor: '#dde3ed',
    borderRadius: 14, padding: 16, alignItems: 'center', gap: 6,
  },
  situationCardActive: { borderColor: '#154273', backgroundColor: '#EEF2F7' },
  situationIcon: { fontSize: 24 },
  situationLabel: { fontSize: 13, fontWeight: '600', color: '#7a8fa8' },
  situationLabelActive: { color: '#154273' },
  toggleCard: {
    backgroundColor: 'white', marginHorizontal: 16,
    borderRadius: 14, padding: 4,
    borderWidth: 1, borderColor: '#dde3ed',
    shadowColor: '#154273', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 14,
  },
  toggleLabel: { fontSize: 14, color: '#2c3e50', fontWeight: '500' },
  toggleSub: { fontSize: 11, color: '#a0aec0', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#EEF2F7', marginHorizontal: 14 },
  saveBtn: {
    backgroundColor: '#154273', borderRadius: 14, padding: 18,
    alignItems: 'center', margin: 16,
    shadowColor: '#154273', shadowOpacity: 0.3, shadowRadius: 12, elevation: 5,
  },
  saveBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
  resetBtn: {
    borderWidth: 1, borderColor: '#dde3ed',
    borderRadius: 14, padding: 14,
    alignItems: 'center', marginHorizontal: 16,
  },
  resetBtnText: { color: '#a0aec0', fontSize: 14 },
});
