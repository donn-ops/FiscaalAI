import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getUserData, getTaxProfile } from '../utils/storage';
import { QUICK_QUESTIONS } from '../constants/prompts';
import { t } from '../constants/translations';

const { width } = Dimensions.get('window');

const getGreeting = (lang) => {
  const hour = new Date().getHours();
  if (hour < 12) return t(lang, 'greeting_morning');
  if (hour < 18) return t(lang, 'greeting_afternoon');
  return t(lang, 'greeting_evening');
};

const TIPS = {
  nl: [
    'Aangifte deadline voor particulieren is 1 mei. Heeft u alles op orde?',
    'ZZP\'ers mogen zakelijke kosten aftrekken. Denk aan laptop, telefoon en reiskosten.',
    'Box 3 vermogen boven €57.000 wordt belast. Check uw situatie.',
    'De zelfstandigenaftrek bedraagt €5.030 in 2025.',
  ],
  en: [
    'Tax return deadline is May 1st. Do you have everything ready?',
    'Freelancers can deduct business expenses. Think laptop, phone and travel costs.',
    'Box 3 assets above €57,000 are taxed. Check your situation.',
    'The self-employment deduction is €5,030 in 2025.',
  ],
  de: [
    'Steuererklärung Frist ist der 1. Mai. Haben Sie alles bereit?',
    'Freiberufler können Geschäftsausgaben abziehen.',
    'Vermögen über €57.000 in Box 3 wird besteuert.',
    'Der Selbständigenabzug beträgt €5.030 im Jahr 2025.',
  ],
  fr: [
    'La date limite de déclaration fiscale est le 1er mai.',
    'Les indépendants peuvent déduire les frais professionnels.',
    'Les actifs Box 3 supérieurs à 57 000 € sont imposés.',
    'La déduction pour indépendants est de 5 030 € en 2025.',
  ],
};

export default function HomeScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [taxProfile, setTaxProfile] = useState(null);
  const [tip, setTip] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const user = await getUserData();
    const profile = await getTaxProfile();
    setUserData(user);
    setTaxProfile(profile);
    const lang = user?.language || 'nl';
    const tips = TIPS[lang] || TIPS.nl;
    setTip(tips[Math.floor(Math.random() * tips.length)]);
  };

  const lang = userData?.language || 'nl';

  const startChat = (question = null) => {
    navigation.navigate('Chat', { initialQuestion: question, userData });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greetingTime}>{getGreeting(lang)}</Text>
              <Text style={styles.greetingName}>
                {userData?.name ? `${t(lang, 'hello')}, ${userData.name} 👋` : 'Welkom bij Taxly 👋'}
              </Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Profile')}>
                <Text style={styles.iconBtnText}>👤</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('History')}>
                <Text style={styles.iconBtnText}>🕐</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Favorites')}>
                <Text style={styles.iconBtnText}>⭐</Text>
              </TouchableOpacity>
            </View>
          </View>

          {taxProfile && (
            <View style={styles.profileBadge}>
              <Text style={styles.profileBadgeText}>
                {taxProfile.situation === 'zzp' ? '💼 ZZP' :
                 taxProfile.situation === 'mkb' ? '🏢 MKB' :
                 taxProfile.situation === 'dga' ? '👔 DGA' : '👤 Particulier'}
                {taxProfile.ownHome ? ' · 🏠' : ''}
                {taxProfile.hasPartner ? ' · 💑' : ''}
                {taxProfile.hasKids ? ' · 👶' : ''}
              </Text>
            </View>
          )}

          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>💡</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>{t(lang, 'tip_of_day')}</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          </View>
        </View>

        {/* QUICK QUESTIONS */}
        <Text style={styles.sectionTitle}>{t(lang, 'quick_start')}</Text>
        <View style={styles.grid}>
          {QUICK_QUESTIONS.map((q) => (
            <TouchableOpacity
              key={q.label}
              style={styles.quickCard}
              onPress={() => startChat(q.question)}
              activeOpacity={0.7}
            >
              <Text style={styles.quickIcon}>{q.icon}</Text>
              <Text style={styles.quickLabel}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.ctaButton} onPress={() => startChat()} activeOpacity={0.85}>
          <Text style={styles.ctaText}>{t(lang, 'own_question')}</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>{t(lang, 'disclaimer')}</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#EEF2F7' },
  container: { paddingBottom: 40 },
  header: {
    backgroundColor: 'white', padding: 20, marginBottom: 20,
    borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
    shadowColor: '#154273', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  headerRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', marginBottom: 14,
  },
  greetingTime: { fontSize: 12, color: '#7a8fa8', textTransform: 'uppercase', letterSpacing: 1 },
  greetingName: { fontSize: 20, fontWeight: '800', color: '#154273', marginTop: 2 },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 36, height: 36, backgroundColor: '#EEF2F7',
    borderRadius: 10, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#dde3ed',
  },
  iconBtnText: { fontSize: 16 },
  profileBadge: {
    backgroundColor: '#EEF2F7', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
    alignSelf: 'flex-start', marginBottom: 12,
    borderWidth: 1, borderColor: '#dde3ed',
  },
  profileBadgeText: { fontSize: 12, color: '#154273', fontWeight: '600' },
  tipCard: {
    backgroundColor: '#154273', borderRadius: 14,
    padding: 14, flexDirection: 'row', gap: 10, alignItems: 'flex-start',
  },
  tipIcon: { fontSize: 20, marginTop: 1 },
  tipContent: { flex: 1 },
  tipTitle: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '700', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.8 },
  tipText: { fontSize: 13, color: 'white', lineHeight: 19 },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: '#154273',
    textTransform: 'uppercase', letterSpacing: 1.5,
    marginBottom: 12, paddingHorizontal: 20,
  },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    marginBottom: 24, paddingHorizontal: 20,
  },
  quickCard: {
    width: (width - 50) / 2, backgroundColor: 'white',
    borderWidth: 1, borderColor: '#dde3ed', borderRadius: 14, padding: 16,
    shadowColor: '#154273', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  quickIcon: { fontSize: 24, marginBottom: 8 },
  quickLabel: { color: '#2c3e50', fontSize: 13, fontWeight: '500' },
  ctaButton: {
    backgroundColor: '#154273', borderRadius: 14, padding: 18,
    alignItems: 'center', marginHorizontal: 20, marginBottom: 20,
    shadowColor: '#154273', shadowOpacity: 0.3, shadowRadius: 12, elevation: 5,
  },
  ctaText: { color: 'white', fontSize: 16, fontWeight: '700' },
  disclaimer: {
    color: '#a0aec0', fontSize: 11, textAlign: 'center',
    lineHeight: 16, paddingHorizontal: 20,
  },
});
