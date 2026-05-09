import React, { useState, useEffect } from ‘react’;
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Switch } from ‘react-native’;
import { SafeAreaView } from ‘react-native-safe-area-context’;
import { getUserData, saveTaxProfile, getTaxProfile, clearUserData } from ‘../utils/storage’;
import { scheduleDeadlineNotifications, requestPermissions } from ‘../utils/notifications’;
import { t } from ‘../constants/translations’;
import { Colors, Radii, Shadows } from ‘../constants/theme’;

const SITUATIONS = [
{ key:‘particulier’, icon:‘👤’, label:{ nl:‘Particulier’, en:‘Individual’, de:‘Privatperson’, fr:‘Particulier’ } },
{ key:‘zzp’,        icon:‘💼’, label:{ nl:“ZZP’er”,      en:‘Freelancer’, de:‘Freiberufler’, fr:‘Indépendant’ } },
{ key:‘mkb’,        icon:‘🏢’, label:{ nl:‘MKB / BV’,    en:‘SME / Ltd’,  de:‘KMU / GmbH’,   fr:‘PME / SARL’ } },
{ key:‘dga’,        icon:‘👔’, label:{ nl:‘DGA’,         en:‘Director’,   de:‘Geschäftsführer’, fr:‘Dirigeant’ } },
];

function Toggle({ on, onToggle }) {
return (
<TouchableOpacity onPress={onToggle} activeOpacity={0.8}
style={{ width:44, height:26, borderRadius:999, backgroundColor:on?Colors.blueDeep:‘rgba(147,197,253,0.3)’, padding:3, justifyContent:‘center’, shadowColor:on?Colors.blueDeep:‘transparent’, shadowOpacity:0.3, shadowRadius:6, elevation:on?3:0 }}>
<View style={{ width:18, height:18, borderRadius:9, backgroundColor:‘white’, marginLeft:on?18:0, shadowColor:’#000’, shadowOpacity:0.1, shadowRadius:2, elevation:1 }} />
</TouchableOpacity>
);
}

function Row({ icon, label, sub, right, onPress, danger }) {
const Wrap = onPress ? TouchableOpacity : View;
return (
<Wrap onPress={onPress} activeOpacity={0.75} style={s.row}>
<View style={[s.rowIcon, { backgroundColor: danger?Colors.redBg:‘rgba(59,130,246,0.1)’, borderColor: danger?‘rgba(239,68,68,0.2)’:‘rgba(59,130,246,0.15)’ }]}>
<Text style={{ fontSize:15 }}>{icon}</Text>
</View>
<View style={{ flex:1 }}>
<Text style={[s.rowLabel, danger && { color:Colors.red }]}>{label}</Text>
{sub && <Text style={s.rowSub}>{sub}</Text>}
</View>
{right || (onPress && <Text style={s.rowArrow}>›</Text>)}
</Wrap>
);
}

export default function ProfileScreen({ navigation }) {
const [userData,   setUserData]   = useState(null);
const [situation,  setSituation]  = useState(‘particulier’);
const [ownHome,    setOwnHome]    = useState(false);
const [hasPartner, setHasPartner] = useState(false);
const [hasKids,    setHasKids]    = useState(false);
const [notifs,     setNotifs]     = useState(true);
const lang = userData?.language || ‘nl’;

useEffect(() => { loadData(); }, []);
const loadData = async () => {
const user = await getUserData();
const profile = await getTaxProfile();
setUserData(user);
if (profile) {
setSituation(profile.situation || ‘particulier’);
setOwnHome(profile.ownHome || false);
setHasPartner(profile.hasPartner || false);
setHasKids(profile.hasKids || false);
setNotifs(profile.notifications !== false);
}
};

const saveProfile = async () => {
const profile = { situation, ownHome, hasPartner, hasKids, notifications: notifs };
await saveTaxProfile(profile);
if (notifs) {
const granted = await requestPermissions();
if (granted) await scheduleDeadlineNotifications(profile);
}
Alert.alert(‘✓’, t(lang, ‘profile_saved’));
};

const resetApp = () => {
Alert.alert(‘Reset’, ‘Weet u zeker dat u alle data wilt verwijderen?’, [
{ text:‘Annuleren’, style:‘cancel’ },
{ text:‘Verwijderen’, style:‘destructive’, onPress: async () => { await clearUserData(); navigation.replace(‘Onboarding’); } },
]);
};

return (
<SafeAreaView style={s.safe}>
{/* Header */}
<View style={s.header}>
<TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
<Text style={s.backText}>←</Text>
</TouchableOpacity>
<Text style={s.headerTitle}>Profiel</Text>
<View style={{ width:40 }} />
</View>

```
  <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

    {/* Avatar block */}
    <View style={s.avatarBlock}>
      <View style={s.avatar}>
        <Text style={s.avatarText}>{userData?.name?.charAt(0)?.toUpperCase() || 'T'}</Text>
      </View>
      <Text style={s.avatarName}>{userData?.name || 'Gebruiker'}</Text>
      <View style={s.planPill}>
        <Text style={s.planPillText}>PREMIUM PLAN</Text>
      </View>
    </View>

    {/* Stats */}
    <View style={s.statsRow}>
      {[{ val:'4', lbl:'Inzichten' }, { val:'2/4', lbl:'Taken' }, { val:'€1.840', lbl:'Kans' }].map((stat, i) => (
        <View key={i} style={[s.statCell, i<2 && s.statCellBorder]}>
          <Text style={s.statVal}>{stat.val}</Text>
          <Text style={s.statLbl}>{stat.lbl}</Text>
        </View>
      ))}
    </View>

    {/* Situation */}
    <Text style={s.sectionLabel}>Uw situatie</Text>
    <View style={s.situationGrid}>
      {SITUATIONS.map(sit => (
        <TouchableOpacity key={sit.key} style={[s.situationBtn, situation===sit.key&&s.situationBtnActive]} onPress={() => setSituation(sit.key)} activeOpacity={0.75}>
          <Text style={s.situationIcon}>{sit.icon}</Text>
          <Text style={[s.situationLabel, situation===sit.key&&s.situationLabelActive]}>{sit.label[lang]||sit.label.nl}</Text>
        </TouchableOpacity>
      ))}
    </View>

    {/* Life situation */}
    <Text style={s.sectionLabel}>Leefomstandigheden</Text>
    <View style={s.card}>
      <Row icon="🏠" label="Eigen woning" sub={ownHome?'Actief':'Niet ingesteld'} right={<Toggle on={ownHome} onToggle={()=>setOwnHome(v=>!v)} />} />
      <Row icon="💑" label="Fiscaal partner" sub={hasPartner?'Actief':'Niet ingesteld'} right={<Toggle on={hasPartner} onToggle={()=>setHasPartner(v=>!v)} />} />
      <Row icon="👶" label="Kinderen" sub={hasKids?'Actief':'Niet ingesteld'} right={<Toggle on={hasKids} onToggle={()=>setHasKids(v=>!v)} />} />
    </View>

    {/* Preferences */}
    <Text style={s.sectionLabel}>Voorkeuren</Text>
    <View style={s.card}>
      <Row icon="◎" label="Notificaties" sub="Deadlines & inzichten" right={<Toggle on={notifs} onToggle={()=>setNotifs(v=>!v)} />} />
      <Row icon="📅" label="Kalender" onPress={() => navigation.navigate('Calendar')} />
      <Row icon="📁" label="Archief" onPress={() => navigation.navigate('Favorites')} />
      <Row icon="🕐" label="Geschiedenis" onPress={() => navigation.navigate('History')} />
    </View>

    {/* Account */}
    <Text style={s.sectionLabel}>Account</Text>
    <View style={s.card}>
      <Row icon="👑" label="Upgrade plan" sub="Bekijk Premium & Pro" onPress={() => navigation.navigate('Paywall')} />
      <Row icon="📸" label="Document scanner" onPress={() => navigation.navigate('Scanner')} />
      <Row icon="📊" label="Jaaroverzicht" onPress={() => navigation.navigate('YearOverview')} />
      <Row icon="⚡" label="Uitloggen / Reset" danger onPress={resetApp} />
    </View>

    {/* Save button */}
    <TouchableOpacity style={s.saveBtn} onPress={saveProfile} activeOpacity={0.85}>
      <Text style={s.saveBtnText}>Profiel opslaan</Text>
    </TouchableOpacity>

  </ScrollView>
</SafeAreaView>
```

);
}

const s = StyleSheet.create({
safe:   { flex:1, backgroundColor:Colors.pageBg },
header: { flexDirection:‘row’, alignItems:‘center’, justifyContent:‘space-between’, paddingHorizontal:20, paddingVertical:13, borderBottomWidth:1, borderBottomColor:‘rgba(255,255,255,0.65)’, backgroundColor:‘rgba(219,234,254,0.97)’ },
backBtn:{ width:40, height:36, borderRadius:999, backgroundColor:‘rgba(255,255,255,0.65)’, alignItems:‘center’, justifyContent:‘center’, borderWidth:1, borderColor:‘rgba(255,255,255,0.9)’ },
backText:{ fontSize:18, color:Colors.blueDeep, fontWeight:‘600’ },
headerTitle:{ fontSize:15, fontWeight:‘700’, color:Colors.textPrimary },
scroll: { paddingBottom:40 },

avatarBlock: { alignItems:‘center’, paddingTop:28, paddingBottom:20, borderBottomWidth:1, borderBottomColor:‘rgba(147,197,253,0.2)’ },
avatar: { width:72, height:72, borderRadius:36, backgroundColor:Colors.blueDeep, alignItems:‘center’, justifyContent:‘center’, marginBottom:12, shadowColor:Colors.blueDeep, shadowOpacity:0.35, shadowRadius:20, elevation:8, borderWidth:3, borderColor:‘rgba(255,255,255,0.7)’ },
avatarText: { fontSize:28, fontWeight:‘300’, color:‘white’ },
avatarName: { fontSize:22, fontWeight:‘300’, color:Colors.textPrimary, letterSpacing:-0.5, marginBottom:6 },
planPill:   { backgroundColor:‘rgba(29,78,216,0.08)’, borderRadius:999, paddingHorizontal:14, paddingVertical:4, borderWidth:1, borderColor:‘rgba(29,78,216,0.15)’ },
planPillText:{ fontSize:10, fontWeight:‘700’, color:Colors.blueDeep, letterSpacing:1 },

statsRow: { flexDirection:‘row’, borderBottomWidth:1, borderBottomColor:‘rgba(147,197,253,0.2)’ },
statCell: { flex:1, alignItems:‘center’, paddingVertical:16 },
statCellBorder: { borderRightWidth:1, borderRightColor:‘rgba(147,197,253,0.2)’ },
statVal: { fontSize:18, fontWeight:‘700’, color:Colors.blueDeep, letterSpacing:-0.5 },
statLbl: { fontSize:10, color:Colors.textMuted, fontWeight:‘500’, marginTop:2 },

sectionLabel: { fontSize:10, fontWeight:‘700’, color:Colors.textMuted, letterSpacing:1.5, textTransform:‘uppercase’, paddingHorizontal:20, marginTop:22, marginBottom:10 },

situationGrid: { flexDirection:‘row’, flexWrap:‘wrap’, gap:8, paddingHorizontal:20, marginBottom:8 },
situationBtn:  { flexDirection:‘row’, alignItems:‘center’, gap:6, paddingHorizontal:14, paddingVertical:9, borderRadius:999, borderWidth:1, borderColor:‘rgba(255,255,255,0.9)’, backgroundColor:‘rgba(255,255,255,0.65)’, shadowColor:Colors.blueDeep, shadowOpacity:0.07, shadowRadius:6, elevation:1 },
situationBtnActive: { backgroundColor:Colors.blueDeep, borderColor:Colors.borderBlueMid },
situationIcon:  { fontSize:14 },
situationLabel: { fontSize:12, color:Colors.textMuted, fontWeight:‘600’ },
situationLabelActive: { color:‘white’ },

card: { marginHorizontal:20, backgroundColor:‘rgba(255,255,255,0.65)’, borderRadius:22, borderWidth:1, borderColor:‘rgba(255,255,255,0.9)’, paddingHorizontal:16, shadowColor:Colors.blueDeep, shadowOpacity:0.08, shadowRadius:12, elevation:2, marginBottom:4 },
row:  { flexDirection:‘row’, alignItems:‘center’, gap:12, paddingVertical:13, borderBottomWidth:1, borderBottomColor:‘rgba(147,197,253,0.15)’ },
rowIcon: { width:36, height:36, borderRadius:999, borderWidth:1, alignItems:‘center’, justifyContent:‘center’ },
rowLabel:{ fontSize:13, fontWeight:‘600’, color:Colors.textPrimary },
rowSub:  { fontSize:11, color:Colors.textMuted, marginTop:1 },
rowArrow:{ fontSize:16, color:Colors.bluePale },

saveBtn: { marginHorizontal:20, marginTop:22, backgroundColor:Colors.blueDeep, borderRadius:999, paddingVertical:14, alignItems:‘center’, shadowColor:Colors.blueDeep, shadowOpacity:0.35, shadowRadius:16, elevation:6 },
saveBtnText: { color:‘white’, fontSize:15, fontWeight:‘700’ },
});
