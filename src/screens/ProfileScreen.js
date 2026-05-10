
const C = {
  pageBg:'#dbeafe', surface:'rgba(255,255,255,0.65)', surfaceHi:'rgba(255,255,255,0.85)',
  blue:'#1d4ed8', blueMid:'#2563eb', blueLight:'#60a5fa', bluePale:'#93c5fd',
  text:'#0f172a', textMid:'#334155', textMuted:'#64748b', textLight:'#94a3b8',
  green:'#10b981', greenText:'#065f46', amber:'#f59e0b', red:'#ef4444',
  border:'rgba(255,255,255,0.9)', borderBlue:'rgba(59,130,246,0.2)', white:'#ffffff',
};
const sh = (op=0.08,r=8) => ({ shadowColor:'#1d4ed8', shadowOpacity:op, shadowRadius:r, shadowOffset:{width:0,height:2}, elevation:Math.round(r/3) });

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserData, saveTaxProfile, getTaxProfile, clearUserData } from '../utils/storage';
import { scheduleDeadlineNotifications, requestPermissions } from '../utils/notifications';
import { t } from '../constants/translations';

const SITUATIONS = [
  { key:'particulier', label:'Particulier' },
  { key:'zzp',        label:"ZZP'er" },
  { key:'mkb',        label:'MKB / BV' },
  { key:'dga',        label:'DGA' },
];

function Toggle({ on, onToggle }) {
  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.8} style={{ width:42, height:24, borderRadius:999, backgroundColor:on?C.blue:'rgba(147,197,253,0.3)', padding:3, justifyContent:'center' }}>
      <View style={{ width:16, height:16, borderRadius:8, backgroundColor:'#fff', marginLeft:on?18:0 }} />
    </TouchableOpacity>
  );
}

function Row({ icon, label, sub, right, onPress, danger }) {
  const Wrap = onPress ? TouchableOpacity : View;
  return (
    <Wrap onPress={onPress} activeOpacity={0.75} style={s.row}>
      <View style={[s.rowIcon, { backgroundColor:danger?'rgba(239,68,68,0.1)':'rgba(59,130,246,0.1)', borderColor:danger?'rgba(239,68,68,0.2)':'rgba(59,130,246,0.15)' }]}>
        <Text style={{ fontSize:15 }}>{icon}</Text>
      </View>
      <View style={{ flex:1 }}>
        <Text style={[s.rowLabel, danger&&{ color:C.red }]}>{label}</Text>
        {sub && <Text style={s.rowSub}>{sub}</Text>}
      </View>
      {right || (onPress && <Text style={s.rowArrow}>›</Text>)}
    </Wrap>
  );
}

export default function ProfileScreen({ navigation }) {
  const [userData,   setUserData]   = useState(null);
  const [situation,  setSituation]  = useState('particulier');
  const [ownHome,    setOwnHome]    = useState(false);
  const [hasPartner, setHasPartner] = useState(false);
  const [hasKids,    setHasKids]    = useState(false);
  const [notifs,     setNotifs]     = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [user, profile] = await Promise.all([getUserData(), getTaxProfile()]);
    setUserData(user);
    if (profile) {
      setSituation(profile.situation||'particulier');
      setOwnHome(profile.ownHome||false);
      setHasPartner(profile.hasPartner||false);
      setHasKids(profile.hasKids||false);
      setNotifs(profile.notifications!==false);
    }
  };

  const saveProfile = async () => {
    const profile = { situation, ownHome, hasPartner, hasKids, notifications:notifs };
    await saveTaxProfile(profile);
    if (notifs) {
      const granted = await requestPermissions();
      if (granted) await scheduleDeadlineNotifications(profile);
    }
    Alert.alert('Opgeslagen!', 'Uw profiel is bijgewerkt.');
  };

  const resetApp = () => {
    Alert.alert('Reset', 'Weet u zeker dat u alle data wilt verwijderen?', [
      { text:'Annuleren', style:'cancel' },
      { text:'Verwijderen', style:'destructive', onPress: async () => { await clearUserData(); navigation.replace('Onboarding'); } },
    ]);
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View style={{ width:50 }} />
        <Text style={s.headerTitle}>Profiel</Text>
        <View style={{ width:50 }} />
      </View>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.avatarBlock}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{userData?.name?.charAt(0)?.toUpperCase()||'T'}</Text>
          </View>
          <Text style={s.avatarName}>{userData?.name||'Gebruiker'}</Text>
          <View style={s.planPill}><Text style={s.planText}>PREMIUM PLAN</Text></View>
        </View>

        <View style={s.statsRow}>
          {[{ val:'4', lbl:'Inzichten' },{ val:'2/4', lbl:'Taken' },{ val:'1.840 euro', lbl:'Kans' }].map((stat,i)=>(
            <View key={i} style={[s.statCell, i<2&&{ borderRightWidth:1, borderRightColor:'rgba(147,197,253,0.2)' }]}>
              <Text style={s.statVal}>{stat.val}</Text>
              <Text style={s.statLbl}>{stat.lbl}</Text>
            </View>
          ))}
        </View>

        <Text style={s.sectionLabel}>Uw situatie</Text>
        <View style={s.situGrid}>
          {SITUATIONS.map(sit=>(
            <TouchableOpacity key={sit.key} style={[s.situBtn, situation===sit.key&&s.situBtnActive]} onPress={()=>setSituation(sit.key)} activeOpacity={0.75}>
              <Text style={[s.situText, situation===sit.key&&{ color:'#fff' }]}>{sit.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.sectionLabel}>Leefomstandigheden</Text>
        <View style={s.card}>
          <Row icon="🏠" label="Eigen woning"    sub={ownHome?'Actief':'Niet ingesteld'}    right={<Toggle on={ownHome}    onToggle={()=>setOwnHome(v=>!v)} />} />
          <Row icon="💑" label="Fiscaal partner" sub={hasPartner?'Actief':'Niet ingesteld'} right={<Toggle on={hasPartner} onToggle={()=>setHasPartner(v=>!v)} />} />
          <Row icon="👶" label="Kinderen"        sub={hasKids?'Actief':'Niet ingesteld'}    right={<Toggle on={hasKids}    onToggle={()=>setHasKids(v=>!v)} />} />
        </View>

        <Text style={s.sectionLabel}>Voorkeuren</Text>
        <View style={s.card}>
          <Row icon="🔔" label="Notificaties"   sub="Deadlines en inzichten" right={<Toggle on={notifs} onToggle={()=>setNotifs(v=>!v)} />} />
          <Row icon="📅" label="Kalender"       onPress={() => navigation.navigate('Kalender')} />
          <Row icon="📁" label="Archief"        onPress={() => navigation.navigate('Favorites')} />
          <Row icon="🕐" label="Geschiedenis"   onPress={() => navigation.navigate('History')} />
        </View>

        <Text style={s.sectionLabel}>Account</Text>
        <View style={s.card}>
          <Row icon="👑" label="Upgrade plan"     sub="Bekijk Premium en Pro" onPress={() => navigation.navigate('Paywall')} />
          <Row icon="📸" label="Document scanner" onPress={() => navigation.navigate('Scanner')} />
          <Row icon="📊" label="Jaaroverzicht"    onPress={() => navigation.navigate('YearOverview')} />
          <Row icon="⚡" label="Uitloggen / Reset" danger onPress={resetApp} />
        </View>

        <TouchableOpacity style={s.saveBtn} onPress={saveProfile} activeOpacity={0.85}>
          <Text style={s.saveBtnText}>Profiel opslaan</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex:1, backgroundColor:C.pageBg },
  header: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:20, paddingVertical:12, borderBottomWidth:1, borderBottomColor:C.border, backgroundColor:'rgba(219,234,254,0.97)' },
  headerTitle: { fontSize:15, fontWeight:'700', color:C.text },
  scroll: { paddingBottom:40 },
  avatarBlock: { alignItems:'center', paddingTop:24, paddingBottom:18, borderBottomWidth:1, borderBottomColor:'rgba(147,197,253,0.2)' },
  avatar: { width:68, height:68, borderRadius:34, backgroundColor:C.blue, alignItems:'center', justifyContent:'center', marginBottom:11, borderWidth:3, borderColor:'rgba(255,255,255,0.7)', ...sh(0.35,18) },
  avatarText: { fontSize:26, fontWeight:'300', color:'#fff' },
  avatarName: { fontSize:21, fontWeight:'300', color:C.text, letterSpacing:-0.5, marginBottom:5 },
  planPill: { backgroundColor:'rgba(29,78,216,0.08)', borderRadius:999, paddingHorizontal:13, paddingVertical:4, borderWidth:1, borderColor:'rgba(29,78,216,0.15)' },
  planText: { fontSize:10, fontWeight:'700', color:C.blue, letterSpacing:1 },
  statsRow: { flexDirection:'row', borderBottomWidth:1, borderBottomColor:'rgba(147,197,253,0.2)' },
  statCell: { flex:1, alignItems:'center', paddingVertical:14 },
  statVal: { fontSize:17, fontWeight:'700', color:C.blue, letterSpacing:-0.5 },
  statLbl: { fontSize:10, color:C.textMuted, fontWeight:'500', marginTop:2 },
  sectionLabel: { fontSize:10, fontWeight:'700', color:C.textMuted, letterSpacing:1.5, textTransform:'uppercase', paddingHorizontal:20, marginTop:20, marginBottom:9 },
  situGrid: { flexDirection:'row', flexWrap:'wrap', gap:8, paddingHorizontal:20, marginBottom:4 },
  situBtn: { paddingHorizontal:13, paddingVertical:8, borderRadius:999, borderWidth:1, borderColor:C.border, backgroundColor:C.surface, ...sh() },
  situBtnActive: { backgroundColor:C.blue, borderColor:C.blue },
  situText: { fontSize:12, color:C.textMuted, fontWeight:'600' },
  card: { marginHorizontal:20, backgroundColor:C.surface, borderRadius:22, borderWidth:1, borderColor:C.border, paddingHorizontal:16, ...sh(), marginBottom:4 },
  row: { flexDirection:'row', alignItems:'center', gap:11, paddingVertical:13, borderBottomWidth:1, borderBottomColor:'rgba(147,197,253,0.15)' },
  rowIcon: { width:34, height:34, borderRadius:999, borderWidth:1, alignItems:'center', justifyContent:'center' },
  rowLabel: { fontSize:13, fontWeight:'600', color:C.text },
  rowSub: { fontSize:11, color:C.textMuted, marginTop:1 },
  rowArrow: { fontSize:16, color:C.bluePale },
  saveBtn: { marginHorizontal:20, marginTop:20, backgroundColor:C.blue, borderRadius:999, paddingVertical:14, alignItems:'center', ...sh(0.35,16) },
  saveBtnText: { color:'#fff', fontSize:15, fontWeight:'700' },
});
