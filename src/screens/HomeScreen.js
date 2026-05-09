import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserData } from '../utils/storage';
import { QUICK_QUESTIONS } from '../constants/prompts';

const { width } = Dimensions.get('window');

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Goedemorgen';
  if (hour < 18) return 'Goedemiddag';
  return 'Goedenavond';
};

const TIPS = [
  'Aangifte deadline voor particulieren is 1 mei. Heeft u alles op orde?',
  'ZZP\'ers mogen zakelijke kosten aftrekken. Denk aan laptop, telefoon en reiskosten.',
  'Box 3 vermogen boven €57.000 wordt belast. Check uw situatie.',
  'De zelfstandigenaftrek bedraagt €5.030 in 2025.',
];

export default function HomeScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [tip] = useState(TIPS[Math.floor(Math.random() * TIPS.length)]);

  useEffect(() => {
    getUserData().then(setUserData);
  }, []);

  const startChat = (question = null) => {
    navigation.navigate('Chat', { initialQuestion: question, userData });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.greetingBlock}>
              <Text style={styles.greetingTime}>{getGreeting()}</Text>
              <Text style={styles.greetingName}>
                {userData?.name ? `Hallo, ${userData.name} 👋` : 'Welkom bij Taxly 👋'}
              </Text>
            </View>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>T</Text>
            </View>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>💡</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Tip van de dag</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          </View>
        </View>

        {/* QUICK QUESTIONS */}
        <Text style={styles.sectionTitle}>Snel starten</Text>
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

        {/* CTA */}
        <TouchableOpacity style={styles.ctaButton} onPress={() => startChat()} activeOpacity={0.85}>
          <Text style={styles.ctaText}>Eigen vraag stellen →</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Taxly geeft informatief advies. Geen vervanging voor een gecertificeerde belastingadviseur.
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#EEF2F7' },
  container: { paddingBottom: 40 },

  header: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#154273', shadowOpacity: 0.08,
    shadowRadius: 12, elevation: 4,
  },
  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 16,
  },
  greetingBlock: {},
  greetingTime: { fontSize: 12, color: '#7a8fa8', textTransform: 'uppercase', letterSpacing: 1 },
  greetingName: { fontSize: 20, fontWeight: '800', color: '#154273', marginTop: 2 },
  logoBox: {
    width: 42, height: 42,
    backgroundColor: '#154273', borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#154273', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  logoText: { fontSize: 20, fontWeight: '800', color: 'white' },

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
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 10, marginBottom: 24, paddingHorizontal: 20,
  },
  quickCard: {
    width: (width - 50) / 2,
    backgroundColor: 'white',
    borderWidth: 1, borderColor: '#dde3ed',
    borderRadius: 14, padding: 16,
    shadowColor: '#154273', shadowOpacity: 0.05,
    shadowRadius: 6, elevation: 2,
  },
  quickIcon: { fontSize: 24, marginBottom: 8 },
  quickLabel: { color: '#2c3e50', fontSize: 13, fontWeight: '500' },

  ctaButton: {
    backgroundColor: '#154273', borderRadius: 14,
    padding: 18, alignItems: 'center',
    marginHorizontal: 20, marginBottom: 20,
    shadowColor: '#154273', shadowOpacity: 0.3,
    shadowRadius: 12, elevation: 5,
  },
  ctaText: { color: 'white', fontSize: 16, fontWeight: '700' },
  disclaimer: {
    color: '#a0aec0', fontSize: 11, textAlign: 'center',
    lineHeight: 16, paddingHorizontal: 20,
  },
});
