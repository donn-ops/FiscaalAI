import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Dimensions
} from 'react-native';
import { QUICK_QUESTIONS } from '../constants/prompts';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const startChat = (question = null) => {
    navigation.navigate('Chat', { initialQuestion: question });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoIcon}>⚖</Text>
          </View>
          <Text style={styles.appName}>FiscaalAI</Text>
          <Text style={styles.tagline}>Nederlands Belastingadvies</Text>
          <View style={styles.liveBadge}>
            <Text style={styles.liveDot}>●</Text>
            <Text style={styles.liveText}>Live AI — Altijd actueel</Text>
          </View>
        </View>

        <Text style={styles.intro}>
          Stel uw belastingvraag en ontvang direct professioneel advies over het Nederlandse belastingrecht.
        </Text>

        <Text style={styles.sectionTitle}>Populaire vragen</Text>
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
          <Text style={styles.ctaText}>Eigen vraag stellen →</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          FiscaalAI geeft informatief advies. Geen vervanging voor een gecertificeerde belastingadviseur.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0a1628' },
  container: { padding: 24, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 28, marginTop: 12 },
  logoBox: {
    width: 64, height: 64, borderRadius: 16,
    backgroundColor: '#ff8c00',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    shadowColor: '#ff8c00', shadowOpacity: 0.5, shadowRadius: 20, elevation: 10,
  },
  logoIcon: { fontSize: 30 },
  appName: { fontSize: 28, color: '#ffd700', fontWeight: 'bold', letterSpacing: 1 },
  tagline: { fontSize: 12, color: '#a08060', letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,180,100,0.15)',
    borderWidth: 1, borderColor: 'rgba(0,200,100,0.3)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginTop: 12,
  },
  liveDot: { color: '#4a8', marginRight: 6, fontSize: 10 },
  liveText: { color: '#4a8', fontSize: 11 },
  intro: { color: '#a08060', fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  sectionTitle: { color: '#e8dcc8', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  quickCard: {
    width: (width - 58) / 2,
    backgroundColor: 'rgba(255,165,0,0.07)',
    borderWidth: 1, borderColor: 'rgba(255,165,0,0.2)',
    borderRadius: 12, padding: 16,
  },
  quickIcon: { fontSize: 24, marginBottom: 8 },
  quickLabel: { color: '#e8dcc8', fontSize: 13 },
  ctaButton: {
    backgroundColor: '#ff8c00', borderRadius: 14, padding: 18,
    alignItems: 'center', marginBottom: 24,
    shadowColor: '#ff8c00', shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  ctaText: { color: '#0a1628', fontSize: 16, fontWeight: 'bold' },
  disclaimer: { color: '#5a4a3a', fontSize: 11, textAlign: 'center', lineHeight: 16 },
});
