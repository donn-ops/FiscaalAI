import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
            <Text style={styles.logoIcon}>⚖️</Text>
          </View>
          <Text style={styles.appName}>FiscaalAI</Text>
          <Text style={styles.tagline}>Persoonlijk belastingadvies</Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live AI — Altijd actueel</Text>
          </View>
        </View>

        <View style={styles.introCard}>
          <Text style={styles.introText}>
            Stel uw belastingvraag en ontvang direct professioneel advies over het Nederlandse belastingrecht.
          </Text>
        </View>

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
  safe: { flex: 1, backgroundColor: '#EEF2F7' },
  container: { padding: 20, paddingBottom: 40 },

  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 12,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#154273',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  logoBox: {
    width: 64, height: 64, borderRadius: 14,
    backgroundColor: '#154273',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    shadowColor: '#154273', shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  logoIcon: { fontSize: 30 },
  appName: { fontSize: 26, color: '#154273', fontWeight: '700', letterSpacing: 0.5 },
  tagline: { fontSize: 12, color: '#7a8fa8', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 4 },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(46,204,113,0.1)',
    borderWidth: 1, borderColor: 'rgba(46,204,113,0.3)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginTop: 12,
    gap: 6,
  },
  liveDot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: '#2ecc71',
  },
  liveText: { color: '#27ae60', fontSize: 11, fontWeight: '600' },

  introCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#154273',
    shadowColor: '#154273',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  introText: { color: '#4a5568', fontSize: 14, lineHeight: 22 },

  sectionTitle: {
    color: '#154273', fontSize: 12, letterSpacing: 1.5,
    textTransform: 'uppercase', fontWeight: '700', marginBottom: 12,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  quickCard: {
    width: (width - 50) / 2,
    backgroundColor: 'white',
    borderWidth: 1, borderColor: '#dde3ed',
    borderRadius: 12, padding: 16,
    shadowColor: '#154273',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  quickIcon: { fontSize: 24, marginBottom: 8 },
  quickLabel: { color: '#2c3e50', fontSize: 13, fontWeight: '500', lineHeight: 18 },

  ctaButton: {
    backgroundColor: '#154273',
    borderRadius: 12, padding: 18,
    alignItems: 'center', marginBottom: 20,
    shadowColor: '#154273', shadowOpacity: 0.3, shadowRadius: 12, elevation: 5,
  },
  ctaText: { color: 'white', fontSize: 16, fontWeight: '700' },

  disclaimer: { color: '#a0aec0', fontSize: 11, textAlign: 'center', lineHeight: 16 },
});
