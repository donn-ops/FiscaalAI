
const C = {
  pageBg:'#dbeafe', surface:'rgba(255,255,255,0.65)', surfaceHi:'rgba(255,255,255,0.85)',
  blue:'#1d4ed8', blueMid:'#2563eb', blueLight:'#60a5fa', bluePale:'#93c5fd',
  text:'#0f172a', textMid:'#334155', textMuted:'#64748b', textLight:'#94a3b8',
  green:'#10b981', greenText:'#065f46', amber:'#f59e0b', red:'#ef4444',
  border:'rgba(255,255,255,0.9)', borderBlue:'rgba(59,130,246,0.2)', white:'#ffffff',
};
const sh = (op=0.08,r=8) => ({ shadowColor:'#1d4ed8', shadowOpacity:op, shadowRadius:r, shadowOffset:{width:0,height:2}, elevation:Math.round(r/3) });

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { purchasePremium, purchasePro, restorePurchases } from '../utils/purchases';

const FEATURES = [
  'Onbeperkt vragen aan Taxly',
  'Bonnetjes scannen - automatisch geboekt',
  'Belastingkalender met deadlines',
  'Jaaroverzicht en rapportage',
  'Prioriteitsondersteuning',
];

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
    } catch { Alert.alert('Fout', 'Aankoop mislukt. Probeer opnieuw.'); }
    setLoading(false);
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={s.closeBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={s.closeBtnText}>x</Text>
        </TouchableOpacity>
        <View style={s.orbWrap}>
          <View style={s.orb}>
            <View style={s.orbGlow} />
            <View style={s.orbCore} />
          </View>
        </View>
        <Text style={s.badge}>TAXLY PREMIUM</Text>
        <Text style={s.title}>Onbeperkt advies,{'\n'}een vast bedrag</Text>
        <View style={s.planRow}>
          <TouchableOpacity style={[s.planCard, selected==='free'&&s.planSel]} onPress={() => setSelected('free')} activeOpacity={0.8}>
            <Text style={s.planLabel}>BASIS</Text>
            <Text style={s.planPrice}>Gratis</Text>
            <Text style={s.planSub}>3 vragen / mnd</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.planCard, s.planPremium, selected==='premium'&&s.planSel]} onPress={() => setSelected('premium')} activeOpacity={0.8}>
            <View style={s.popularBadge}><Text style={s.popularText}>POPULAIRST</Text></View>
            <Text style={[s.planLabel, { color: C.blue }]}>PREMIUM</Text>
            <Text style={s.planPrice}>6,99 euro</Text>
            <Text style={s.planSub}>per maand</Text>
          </TouchableOpacity>
        </View>
        <View style={s.featCard}>
          {FEATURES.map((f,i) => (
            <View key={i} style={s.featRow}>
              <View style={s.featCheck}><Text style={{ color:'#fff', fontSize:10, fontWeight:'700' }}>v</Text></View>
              <Text style={s.featText}>{f}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={s.cta} onPress={handlePurchase} disabled={loading} activeOpacity={0.88}>
          <Text style={s.ctaText}>{loading ? 'Laden...' : 'Start 14 dagen gratis'}</Text>
        </TouchableOpacity>
        <Text style={s.subText}>Daarna 6,99 euro/mnd - Altijd opzegbaar</Text>
        <TouchableOpacity onPress={restorePurchases} activeOpacity={0.7}>
          <Text style={s.restore}>Aankoop herstellen</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex:1, backgroundColor: C.pageBg },
  scroll: { flexGrow:1, alignItems:'center', paddingHorizontal:22, paddingTop:18, paddingBottom:36 },
  closeBtn: { alignSelf:'flex-end', width:32, height:32, borderRadius:999, backgroundColor: C.surface, borderWidth:1, borderColor: C.border, alignItems:'center', justifyContent:'center', marginBottom:6 },
  closeBtnText: { fontSize:14, color: C.textMuted },
  orbWrap: { marginBottom:14, alignItems:'center' },
  orb: { width:78, height:78, borderRadius:39, backgroundColor: C.blue, alignItems:'center', justifyContent:'center', borderWidth:2, borderColor:'rgba(255,255,255,0.65)', overflow:'hidden', ...sh(0.45,22) },
  orbGlow: { position:'absolute', top:-8, left:-8, width:50, height:50, borderRadius:25, backgroundColor:'rgba(255,255,255,0.18)' },
  orbCore: { width:34, height:34, borderRadius:17, backgroundColor:'rgba(191,219,254,0.75)' },
  badge: { fontSize:11, fontWeight:'700', letterSpacing:2.5, textTransform:'uppercase', color: C.blueLight, marginBottom:7, textAlign:'center' },
  title: { fontSize:24, fontWeight:'200', color: C.text, letterSpacing:-0.8, lineHeight:30, textAlign:'center', marginBottom:22 },
  planRow: { flexDirection:'row', gap:10, width:'100%', marginBottom:14 },
  planCard: { flex:1, backgroundColor: C.surface, borderRadius:18, borderWidth:1, borderColor: C.border, padding:13, ...sh() },
  planPremium: { backgroundColor: C.surfaceHi },
  planSel: { borderWidth:2, borderColor: C.blue, ...sh(0.2,16) },
  popularBadge: { position:'absolute', top:-9, left:9, backgroundColor: C.blue, borderRadius:6, paddingHorizontal:7, paddingVertical:2 },
  popularText: { fontSize:7, fontWeight:'700', color:'#fff', letterSpacing:0.5 },
  planLabel: { fontSize:9, fontWeight:'700', letterSpacing:1.2, color: C.textMuted, textTransform:'uppercase', marginTop:4 },
  planPrice: { fontSize:20, fontWeight:'200', color: C.text, marginTop:3, letterSpacing:-0.5 },
  planSub: { fontSize:10, color: C.textMuted, marginTop:2 },
  featCard: { width:'100%', backgroundColor: C.surface, borderRadius:22, borderWidth:1, borderColor: C.border, padding:15, gap:11, marginBottom:22, ...sh() },
  featRow: { flexDirection:'row', alignItems:'center', gap:11 },
  featCheck: { width:20, height:20, borderRadius:999, backgroundColor: C.blue, alignItems:'center', justifyContent:'center', flexShrink:0, ...sh(0.3,6) },
  featText: { fontSize:13, color: C.textMid, flex:1 },
  cta: { width:'100%', backgroundColor:'#1e40af', borderRadius:999, paddingVertical:15, alignItems:'center', ...sh(0.45,20), marginBottom:9 },
  ctaText: { color:'#fff', fontSize:15, fontWeight:'700' },
  subText: { fontSize:11, color: C.blue, fontWeight:'500', textAlign:'center', opacity:0.65, marginBottom:14 },
  restore: { fontSize:12, color: C.textMuted, textAlign:'center', textDecorationLine:'underline' },
});
