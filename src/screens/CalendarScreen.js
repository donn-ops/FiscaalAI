import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserData, getTaxProfile } from '../utils/storage';

const getDeadlines = (profile) => {
  const year = new Date().getFullYear();
  const base = [
    {
      date: `${year}-05-01`,
      title: 'Aangifte Inkomstenbelasting',
      desc: 'Deadline voor particulieren en ZZP\'ers',
      icon: '📋',
      color: '#154273',
      urgent: true,
    },
    {
      date: `${year}-03-01`,
      title: 'Voorlopige aanslag aanvragen',
      desc: 'Voorkom belastingrente door tijdig aan te vragen',
      icon: '📄',
      color: '#1e5fa8',
    },
    {
      date: `${year}-12-31`,
      title: 'Fiscaal partnerschap check',
      desc: 'Controleer uw fiscale situatie voor einde jaar',
      icon: '👥',
      color: '#2d7dd2',
    },
  ];

  if (profile?.situation === 'zzp' || profile?.situation === 'mkb') {
    base.push(
      {
        date: `${year}-01-31`,
        title: 'BTW aangifte Q4',
        desc: 'Omzetbelasting vierde kwartaal',
        icon: '💼',
        color: '#e17000',
      },
      {
        date: `${year}-04-30`,
        title: 'BTW aangifte Q1',
        desc: 'Omzetbelasting eerste kwartaal',
        icon: '💼',
        color: '#e17000',
      },
      {
        date: `${year}-07-31`,
        title: 'BTW aangifte Q2',
        desc: 'Omzetbelasting tweede kwartaal',
        icon: '💼',
        color: '#e17000',
      },
      {
        date: `${year}-10-31`,
        title: 'BTW aangifte Q3',
        desc: 'Omzetbelasting derde kwartaal',
        icon: '💼',
        color: '#e17000',
      }
    );
  }

  if (profile?.ownHome) {
    base.push({
      date: `${year}-04-01`,
      title: 'Hypotheekrenteaftrek',
      desc: 'Vergeet uw hypotheekrenteaftrek niet',
      icon: '🏠',
      color: '#16a34a',
    });
  }

  return base.sort((a, b) => new Date(a.date) - new Date(b.date));
};

const getDaysUntil = (dateStr) => {
  const today = new Date();
  const target = new Date(dateStr);
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  return diff;
};

export default function CalendarScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [userData, setUserData] = useState(null);
  const [deadlines, setDeadlines] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const user = await getUserData();
    const p = await getTaxProfile();
    setUserData(user);
    setProfile(p);
    setDeadlines(getDeadlines(p));
  };

  const getUrgencyColor = (days) => {
    if (days < 0) return '#a0aec0';
    if (days <= 14) return '#e53e3e';
    if (days <= 30) return '#e17000';
    return '#16a34a';
  };

  const getUrgencyLabel = (days) => {
    if (days < 0) return 'Verlopen';
    if (days === 0) return 'Vandaag!';
    if (days === 1) return 'Morgen!';
    if (days <= 14) return `${days} dagen`;
    if (days <= 30) return `${days} dagen`;
    return `${days} dagen`;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Belastingkalender</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>📅</Text>
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Uw persoonlijke kalender</Text>
            <Text style={styles.infoDesc}>
              Deadlines op basis van uw belastingprofiel
              {profile?.situation ? ` (${profile.situation.toUpperCase()})` : ''}
            </Text>
          </View>
        </View>

        {deadlines.map((d, i) => {
          const days = getDaysUntil(d.date);
          const urgencyColor = getUrgencyColor(days);
          const isPast = days < 0;

          return (
            <View key={i} style={[styles.deadlineCard, isPast && styles.deadlineCardPast]}>
              <View style={[styles.deadlineLeft, { backgroundColor: isPast ? '#f0f4f8' : `${d.color}15` }]}>
                <Text style={styles.deadlineIcon}>{d.icon}</Text>
                <Text style={[styles.deadlineDate, isPast && styles.deadlineDatePast]}>
                  {new Date(d.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                </Text>
              </View>
              <View style={styles.deadlineContent}>
                <Text style={[styles.deadlineTitle, isPast && styles.deadlineTitlePast]}>
                  {d.title}
                </Text>
                <Text style={styles.deadlineDesc}>{d.desc}</Text>
              </View>
              <View style={[styles.urgencyBadge, { backgroundColor: `${urgencyColor}15` }]}>
                <Text style={[styles.urgencyText, { color: urgencyColor }]}>
                  {getUrgencyLabel(days)}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#EEF2F7' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'white', padding: 16,
    borderBottomWidth: 1, borderBottomColor: '#dde3ed',
    shadowColor: '#154273', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  backBtn: { padding: 4 },
  backText: { color: '#154273', fontSize: 22, fontWeight: '600' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#154273' },
  container: { padding: 16, gap: 10 },
  infoCard: {
    backgroundColor: '#154273', borderRadius: 14,
    padding: 14, flexDirection: 'row', gap: 10,
    alignItems: 'center', marginBottom: 6,
  },
  infoIcon: { fontSize: 24 },
  infoText: { flex: 1 },
  infoTitle: { fontSize: 13, fontWeight: '700', color: 'white' },
  infoDesc: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  deadlineCard: {
    backgroundColor: 'white', borderRadius: 14,
    flexDirection: 'row', alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1, borderColor: '#dde3ed',
    shadowColor: '#154273', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  deadlineCardPast: { opacity: 0.5 },
  deadlineLeft: {
    width: 64, padding: 12,
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  deadlineIcon: { fontSize: 20 },
  deadlineDate: { fontSize: 10, fontWeight: '700', color: '#154273', textAlign: 'center' },
  deadlineDatePast: { color: '#a0aec0' },
  deadlineContent: { flex: 1, padding: 12 },
  deadlineTitle: { fontSize: 13, fontWeight: '700', color: '#2c3e50', marginBottom: 2 },
  deadlineTitlePast: { color: '#a0aec0' },
  deadlineDesc: { fontSize: 11, color: '#7a8fa8', lineHeight: 15 },
  urgencyBadge: {
    margin: 12, paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 10,
  },
  urgencyText: { fontSize: 10, fontWeight: '700' },
});
