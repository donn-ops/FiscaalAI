import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { purchasePremium, purchasePro, restorePurchases } from '../utils/purchases';
import { t } from '../constants/translations';
import { getUserData } from '../utils/storage';
import { Colors, Radii, Shadows } from '../constants/theme';

const FEATURES = [
  'Onbeperkt vragen aan Taxly',
  'Bonnetjes scannen - automatisch geboekt',
  'Belastingkalender met deadlines',
  'Jaaroverzicht & rapportage',
  'Prioriteitsondersteuning',
];

function OrbSmall() {
  return (
    <View style={s.orbWrap}>
      <View style={s.orb}>
        <View style={s.orbShine} />
      </View>
    </View>
  );
}

export default function PaywallScreen({ navigation }) {
  const [selected, setSelected] = useState('premium');
  const [loading,  setLoading]  = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      if (selected === 'premium') await purchasePremium();
      else await purchasePro();
      Alert.alert('Welkom bij Taxly Premium!', 'Uw abonnement is geactiveerd.');
      navigation.goBack();
    } catch {
      Alert.alert('Fout', 'Aankoop mislukt. Probeer opnieuw.');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Close */}
        <TouchableOpacity style={s.closeBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={s.closeBtnText}>✕</Text>
        </TouchableOpacity>

        {/* Orb */}
        <OrbSmall />

        {/* Title */}
        <Text style={s.badge}>TAXLY PREMIUM</Text>
        <Text style={s.title}>Onbeperkt advies,{'\n'}één vast bedrag</Text>

        {/* Plan cards */}
        <View style={s.planRow}>
          <TouchableOpacity
            style={[s.planCard, selected === 'free' && s.planCardSelected]}
            onPress={() => setSelected('free')}
            activeOpacity={0.8}
          >
            <Text style={s.planLabel}>BASIS</Text>
            <Text style={s.planPrice}>Gratis</Text>
            <Text style={s.planSub}>3 vragen / mnd</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.planCard, s.planCardPremium, selected === 'premium' && s.planCardSelected]}
            onPress={() => setSelected('premium')}
            activeOpacity={0.8}
          >
            <View style={s.popularBadge}>
              <Text style={s.popularText}>POPULAIRST</Text>
            </View>
            <Text style={[s.planLabel, { color: Colors.blueDeep }]}>PREMIUM</Text>
            <Text style={s.planPrice}>€6,99</Text>
            <Text style={s.planSub}>per maand</Text>
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View style={s.featuresCard}>
          {FEATURES.map((f, i) => (
            <View key={i} style={s.featureRow}>
              <View style={s.featureCheck}>
                <Text style={s.featureCheckText}>✓</Text>
              </View>
              <Text style={s.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={s.ctaBtn}
          onPress={handlePurchase}
          disabled={loading}
          activeOpacity={0.88}
        >
          <Text style={s.ctaBtnText}>
            {loading ? 'Laden…' : 'Start 14 dagen gratis →'}
          </Text>
        </TouchableOpacity>

        {/* Sub text — donkerblauw, niet wit */}
        <Text style={s.subText}>Daarna €6,99/mnd · Altijd opzegbaar</Text>

        <TouchableOpacity onPress={restorePurchases} activeOpacity={0.7}>
          <Text style={s.restoreText}>Aankoop herstellen</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.pageBg },
  scroll: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },

  closeBtn: {
    alignSelf: 'flex-end',
    width: 32, height: 32, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  closeBtnText: { fontSize: 14, color: Colors.textMuted },

  orbWrap: { marginBottom: 16, alignItems: 'center' },
  orb: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.blueDeep,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.65)',
    overflow: 'hidden',
    shadowColor: Colors.blueDeep, shadowOpacity: 0.45,
    shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 10,
  },
  orbShine: {
    position: 'absolute', top: -10, left: -10,
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  badge: {
    fontSize: 11, fontWeight: '700', letterSpacing: 2.5,
    textTransform: 'uppercase', color: Colors.blueLight,
    marginBottom: 8, textAlign: 'center',
  },
  title: {
    fontSize: 26, fontWeight: '200', color: Colors.textPrimary,
    letterSpacing: -0.8, lineHeight: 32, textAlign: 'center',
    marginBottom: 24,
  },

  planRow: { flexDirection: 'row', gap: 10, width: '100%', marginBottom: 16 },
  planCard: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: Radii.lg, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    padding: 14,
    shadowColor: Colors.blueDeep, shadowOpacity: 0.08,
    shadowRadius: 10, elevation: 2,
  },
  planCardPremium: { backgroundColor: 'rgba(255,255,255,0.85)' },
  planCardSelected: {
    borderWidth: 2, borderColor: Colors.blueDeep,
    shadowColor: Colors.blueDeep, shadowOpacity: 0.2,
    shadowRadius: 16, elevation: 6,
  },
  popularBadge: {
    position: 'absolute', top: -10, left: 10,
    backgroundColor: Colors.blueDeep,
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2,
  },
  popularText: { fontSize: 8, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
  planLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1.2, color: Colors.textMuted, textTransform: 'uppercase', marginTop: 4 },
  planPrice: { fontSize: 22, fontWeight: '200', color: Colors.textPrimary, marginTop: 4, letterSpacing: -0.5 },
  planSub:   { fontSize: 10, color: Colors.textMuted, marginTop: 2 },

  featuresCard: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: Radii.xl, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    padding: 16, gap: 12, marginBottom: 24,
    shadowColor: Colors.blueDeep, shadowOpacity: 0.08,
    shadowRadius: 12, elevation: 2,
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureCheck: {
    width: 22, height: 22, borderRadius: 999,
    backgroundColor: Colors.blueDeep,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    shadowColor: Colors.blueDeep, shadowOpacity: 0.3,
    shadowRadius: 6, elevation: 3,
  },
  featureCheckText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  featureText: { fontSize: 13, color: Colors.textSecond, flex: 1 },

  ctaBtn: {
    width: '100%',
    background: 'linear-gradient(135deg,#1e40af,#1d4ed8)',
    backgroundColor: '#1d4ed8',
    borderRadius: 999, paddingVertical: 15,
    alignItems: 'center',
    shadowColor: Colors.blueDeep, shadowOpacity: 0.45,
    shadowRadius: 20, shadowOffset: { width: 0, height: 8 },
    elevation: 8, marginBottom: 10,
  },
  ctaBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Niet wit — donkerblauw
  subText: {
    fontSize: 11, color: Colors.blueDeep,
    fontWeight: '500', textAlign: 'center',
    opacity: 0.65, marginBottom: 16,
  },
  restoreText: {
    fontSize: 12, color: Colors.textMuted,
    textAlign: 'center', textDecorationLine: 'underline',
  },
});
