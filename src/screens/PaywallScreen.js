import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getOfferings, purchasePackage, restorePurchases } from '../utils/purchases';
import { getUserData } from '../utils/storage';
import { t } from '../constants/translations';

const FEATURES_PREMIUM = [
  { icon: '♾', name: 'Onbeperkte vragen', desc: 'Geen dagelijkse limiet' },
  { icon: '🌍', name: 'Alle 4 talen', desc: 'NL · EN · DE · FR' },
  { icon: '📄', name: 'PDF Export', desc: 'Adviezen opslaan en delen' },
  { icon: '🔔', name: 'Slimme deadlines', desc: 'Persoonlijke belastingkalender' },
  { icon: '⭐', name: 'Favorieten', desc: 'Onbeperkt opslaan' },
];

const FEATURES_PRO = [
  { icon: '📸', name: 'Document Scanner', desc: 'Bonnetjes automatisch analyseren', new: true },
  { icon: '📊', name: 'Jaaroverzicht', desc: 'Alle aftrekposten in één overzicht', new: true },
  { icon: '📁', name: 'Bonnetjes archief', desc: 'Lokaal opgeslagen, AVG-proof', new: true },
  { icon: '📧', name: 'Adviseur export', desc: 'Één knop naar uw belastingadviseur', new: true },
  { icon: '💼', name: 'BTW overzicht', desc: 'Kwartaaloverzicht voor ZZP' },
  { icon: '🌍', name: 'Land switcher', desc: 'NL · BE · DE · FR belastingregels' },
];

export default function PaywallScreen({ navigation, route }) {
  const [offerings, setOfferings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selected, setSelected] = useState('pro');
  const [lang, setLang] = useState('nl');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const user = await getUserData();
    setLang(user?.language || 'nl');
    const offering = await getOfferings();
    setOfferings(offering);
    setLoading(false);
  };

  const handlePurchase = async () => {
    if (!offerings) return;
    setPurchasing(true);
    try {
      const pkg = selected === 'pro'
        ? offerings.availablePackages.find(p => p.identifier === 'taxly_pro_monthly')
        : offerings.availablePackages.find(p => p.identifier === 'taxly_premium_monthly');

      if (!pkg) {
        Alert.alert('Fout', 'Pakket niet gevonden. Probeer opnieuw.');
        return;
      }

      const info = await purchasePackage(pkg);
      if (info) {
        Alert.alert('✓ Welkom bij Taxly ' + (selected === 'pro' ? 'Pro' : 'Premium') + '!',
          'Uw abonnement is geactiveerd.',
          [{ text: 'Aan de slag', onPress: () => navigation.goBack() }]
        );
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setPurchasing(true);
    const info = await restorePurchases();
    setPurchasing(false);
    if (info) {
      Alert.alert('✓', 'Aankopen hersteld.');
    } else {
      Alert.alert('Geen aankopen gevonden.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.logoRow}>
            <View style={styles.logo}><Text style={styles.logoText}>T</Text></View>
            <View>
              <Text style={styles.brandName}>Taxly</Text>
              <Text style={styles.brandTier}>Upgrade</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>Alles wat u nodig heeft,{'\n'}zonder limieten.</Text>
          <Text style={styles.heroSub}>Kies het pakket dat bij u past.</Text>
        </View>

        {/* TIER SELECTOR */}
        <View style={styles.tierRow}>
          <TouchableOpacity
            style={[styles.tierBtn, selected === 'premium' && styles.tierBtnActive]}
            onPress={() => setSelected('premium')}
          >
            <Text style={[styles.tierName, selected === 'premium' && styles.tierNameActive]}>Premium</Text>
            <Text style={[styles.tierPrice, selected === 'premium' && styles.tierPriceActive]}>€2,99/mnd</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tierBtn, styles.tierBtnPro, selected === 'pro' && styles.tierBtnProActive]}
            onPress={() => setSelected('pro')}
          >
            <View style={styles.popularBadge}><Text style={styles.popularText}>Meest gekozen</Text></View>
            <Text style={[styles.tierName, selected === 'pro' && styles.tierNameActive]}>Pro</Text>
            <Text style={[styles.tierPrice, selected === 'pro' && styles.tierPriceActive]}>€6,99/mnd</Text>
          </TouchableOpacity>
        </View>

        {/* FEATURES */}
        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>
            {selected === 'pro' ? '👑 Pro bevat alles van Premium, plus:' : '⭐ Premium bevat:'}
          </Text>

          {selected === 'pro' && FEATURES_PRO.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureCheck}><Text style={styles.featureCheckText}>✓</Text></View>
              <View style={styles.featureInfo}>
                <Text style={styles.featureName}>{f.icon} {f.name}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
              {f.new && <View style={styles.newBadge}><Text style={styles.newBadgeText}>Nieuw</Text></View>}
            </View>
          ))}

          {FEATURES_PREMIUM.map((f, i) => (
            <View key={i} style={[styles.featureRow, selected === 'pro' && styles.featureRowMuted]}>
              <View style={[styles.featureCheck, selected === 'pro' && styles.featureCheckMuted]}>
                <Text style={styles.featureCheckText}>✓</Text>
              </View>
              <View style={styles.featureInfo}>
                <Text style={[styles.featureName, selected === 'pro' && styles.featureNameMuted]}>
                  {f.icon} {f.name}
                </Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA */}
        <View style={styles.ctaArea}>
          {loading ? (
            <ActivityIndicator color="#154273" />
          ) : (
            <>
              <TouchableOpacity
                style={[styles.ctaBtn, purchasing && styles.ctaBtnDisabled]}
                onPress={handlePurchase}
                disabled={purchasing}
              >
                {purchasing
                  ? <ActivityIndicator color="white" />
                  : <>
                      <Text style={styles.ctaBtnText}>
                        Start 7 dagen gratis →
                      </Text>
                      <Text style={styles.ctaBtnSub}>
                        Daarna {selected === 'pro' ? '€6,99' : '€2,99'}/mnd · Altijd opzegbaar
                      </Text>
                    </>
                }
              </TouchableOpacity>

              <TouchableOpacity onPress={handleRestore} style={styles.restoreBtn}>
                <Text style={styles.restoreText}>Aankopen herstellen</Text>
              </TouchableOpacity>

              <Text style={styles.disclaimer}>
                Geen creditcard vereist · Altijd opzegbaar · AVG-proof
              </Text>
            </>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'white' },
  container: { paddingBottom: 40 },

  header: {
    background: 'transparent',
    backgroundColor: '#154273',
    padding: 20, paddingTop: 16,
    paddingBottom: 28,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    width: 28, height: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 50,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  closeText: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  logo: {
    width: 42, height: 42,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  logoText: { fontSize: 20, fontWeight: '800', color: 'white' },
  brandName: { fontSize: 16, fontWeight: '800', color: 'white' },
  brandTier: { fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1.5 },
  heroTitle: {
    fontSize: 22, fontWeight: '800', color: 'white',
    lineHeight: 28, marginBottom: 6,
  },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },

  tierRow: {
    flexDirection: 'row', gap: 10,
    padding: 16, paddingBottom: 0,
  },
  tierBtn: {
    flex: 1, backgroundColor: '#EEF2F7',
    borderRadius: 14, padding: 14,
    alignItems: 'center',
    borderWidth: 2, borderColor: '#dde3ed',
  },
  tierBtnActive: { borderColor: '#154273', backgroundColor: 'rgba(21,66,115,0.05)' },
  tierBtnPro: { position: 'relative' },
  tierBtnProActive: { borderColor: '#154273', backgroundColor: 'rgba(21,66,115,0.05)' },
  popularBadge: {
    position: 'absolute', top: -10,
    backgroundColor: '#154273',
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 10,
  },
  popularText: { fontSize: 9, fontWeight: '800', color: 'white', textTransform: 'uppercase', letterSpacing: 0.8 },
  tierName: { fontSize: 15, fontWeight: '700', color: '#7a8fa8', marginTop: 6 },
  tierNameActive: { color: '#154273' },
  tierPrice: { fontSize: 13, color: '#a0aec0', marginTop: 2 },
  tierPriceActive: { color: '#154273', fontWeight: '700' },

  featuresCard: {
    margin: 16, backgroundColor: '#EEF2F7',
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#dde3ed',
  },
  featuresTitle: {
    fontSize: 12, fontWeight: '700', color: '#154273',
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginBottom: 8,
    padding: 10, backgroundColor: 'white',
    borderRadius: 10, borderWidth: 1, borderColor: '#dde3ed',
  },
  featureRowMuted: { opacity: 0.6 },
  featureCheck: {
    width: 22, height: 22,
    backgroundColor: '#154273', borderRadius: 50,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  featureCheckMuted: { backgroundColor: '#a0aec0' },
  featureCheckText: { fontSize: 10, color: 'white', fontWeight: '700' },
  featureInfo: { flex: 1 },
  featureName: { fontSize: 12, fontWeight: '600', color: '#2c3e50' },
  featureNameMuted: { color: '#7a8fa8' },
  featureDesc: { fontSize: 10, color: '#a0aec0' },
  newBadge: {
    backgroundColor: 'rgba(21,66,115,0.1)',
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 10, borderWidth: 1, borderColor: 'rgba(21,66,115,0.2)',
  },
  newBadgeText: { fontSize: 8, fontWeight: '800', color: '#154273', textTransform: 'uppercase' },

  ctaArea: { padding: 16 },
  ctaBtn: {
    backgroundColor: '#154273', borderRadius: 14,
    padding: 16, alignItems: 'center',
    shadowColor: '#154273', shadowOpacity: 0.3, shadowRadius: 12, elevation: 5,
    marginBottom: 12,
  },
  ctaBtnDisabled: { backgroundColor: '#a0aec0' },
  ctaBtnText: { fontSize: 16, fontWeight: '800', color: 'white' },
  ctaBtnSub: { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 3 },
  restoreBtn: { alignItems: 'center', padding: 10, marginBottom: 8 },
  restoreText: { fontSize: 13, color: '#7a8fa8' },
  disclaimer: { fontSize: 10, color: '#a0aec0', textAlign: 'center', lineHeight: 16 },
});
