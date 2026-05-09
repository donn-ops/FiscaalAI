import React, { useCallback, useRef } from ‘react’;
import {
View, Text, TouchableOpacity, ScrollView,
StyleSheet, Animated, Dimensions,
} from ‘react-native’;
import { SafeAreaView } from ‘react-native-safe-area-context’;
import { useState, useEffect } from ‘react’;
import { useFocusEffect } from ‘@react-navigation/native’;
import { getUserData, getTaxProfile } from ‘../utils/storage’;
import { QUICK_QUESTIONS } from ‘../constants/prompts’;
import { t } from ‘../constants/translations’;
import { getDailyUsage } from ‘../utils/freemium’;
import { isPremium, isPro } from ‘../utils/purchases’;
import { Colors, Shadows, Radii } from ‘../constants/theme’;

const { width } = Dimensions.get(‘window’);

const getGreeting = (lang) => {
const hour = new Date().getHours();
if (hour < 12) return t(lang, ‘greeting_morning’);
if (hour < 18) return t(lang, ‘greeting_afternoon’);
return t(lang, ‘greeting_evening’);
};

const INSIGHTS = [
{ icon:‘◈’, body:‘U komt mogelijk in aanmerking voor €1.840 hypotheekaftrek.’,  tag:‘Kans’,  tc:’#2563eb’ },
{ icon:‘⚡’, body:‘Box 3 vermogensopgave moet vóór 1 mei ingediend worden.’,      tag:‘Actie’, tc:’#f59e0b’ },
{ icon:‘✦’,  body:‘€3.200 zelfstandigenaftrek staat nog open dit jaar.’,          tag:‘Tip’,   tc:’#10b981’ },
];

function OrbButton({ onPress, active }) {
const anim = useRef(new Animated.Value(0)).current;
const ring1 = useRef(new Animated.Value(0)).current;
useEffect(() => {
Animated.loop(Animated.sequence([
Animated.timing(anim, { toValue:-7, duration:2000, useNativeDriver:true }),
Animated.timing(anim, { toValue:0,  duration:2000, useNativeDriver:true }),
])).start();
}, []);
useEffect(() => {
if (active) {
Animated.loop(Animated.sequence([
Animated.timing(ring1, { toValue:1, duration:1500, useNativeDriver:true }),
Animated.timing(ring1, { toValue:0, duration:0,    useNativeDriver:true }),
])).start();
} else { ring1.setValue(0); }
}, [active]);

const ringScale = ring1.interpolate({ inputRange:[0,1], outputRange:[1,1.8] });
const ringOp    = ring1.interpolate({ inputRange:[0,0.5,1], outputRange:[0.6,0.3,0] });

return (
<TouchableOpacity onPress={onPress} activeOpacity={0.85} style={{ alignItems:‘center’ }}>
{active && (
<Animated.View style={{ position:‘absolute’, width:130, height:130, borderRadius:65, borderWidth:1, borderColor:‘rgba(59,130,246,0.4)’, transform:[{scale:ringScale}], opacity:ringOp }} />
)}
<Animated.View style={{ transform:[{translateY:anim}] }}>
<View style={[styles.orb, active && styles.orbActive]}>
<View style={styles.orbInner} />
</View>
</Animated.View>
<Text style={[styles.orbLabel, active && styles.orbLabelActive]}>
{active ? ‘Ik luister…’ : ‘Tik om te spreken’}
</Text>
</TouchableOpacity>
);
}

export default function HomeScreen({ navigation }) {
const [userData,   setUserData]   = useState(null);
const [taxProfile, setTaxProfile] = useState(null);
const [dailyUsage, setDailyUsage] = useState(0);
const [hasPremium, setHasPremium] = useState(false);
const [hasPro,     setHasPro]     = useState(false);
const [listening,  setListening]  = useState(false);

useFocusEffect(useCallback(() => { loadData(); }, []));

const loadData = async () => {
const [user, profile, usage, premium, pro] = await Promise.all([
getUserData(), getTaxProfile(), getDailyUsage(), isPremium(), isPro(),
]);
setUserData(user); setTaxProfile(profile);
setDailyUsage(usage); setHasPremium(premium); setHasPro(pro);
};

const lang = userData?.language || ‘nl’;
const isUnlimited = hasPremium || hasPro;
const doneTasks = 2; const totalTasks = 4; // derive from real data later

const startChat = (q = null) => navigation.navigate(‘Chat’, { initialQuestion: q, userData });

const triggerListen = () => {
setListening(true);
setTimeout(() => setListening(false), 3000);
};

return (
<SafeAreaView style={styles.safe}>
<ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

```
    {/* ── Greeting ── */}
    <View style={styles.greeting}>
      <Text style={styles.greetSmall}>{getGreeting(lang)}</Text>
      <Text style={styles.greetName}>
        {userData?.name || 'Welkom'}
      </Text>
      <View style={styles.statusPill}>
        <View style={styles.statusDot} />
        <Text style={styles.statusPillText}>Financiën onder controle</Text>
      </View>
    </View>

    {/* ── Orb ── */}
    <View style={styles.orbSection}>
      <OrbButton onPress={triggerListen} active={listening} />
    </View>

    {/* ── Freemium bar ── */}
    {!isUnlimited && (
      <TouchableOpacity style={styles.usageCard} onPress={() => navigation.navigate('Paywall')} activeOpacity={0.8}>
        <View style={{ flex:1 }}>
          <Text style={styles.usageText}>{dailyUsage}/5 vragen gebruikt vandaag</Text>
          <View style={styles.usageTrack}>
            <View style={[styles.usageFill, { width:`${(dailyUsage/5)*100}%` }]} />
          </View>
        </View>
        <Text style={styles.upgradeText}>Upgrade →</Text>
      </TouchableOpacity>
    )}
    {isUnlimited && (
      <View style={styles.premiumPill}>
        <Text style={styles.premiumText}>{hasPro?'👑 Pro':'⭐ Premium'} · Onbeperkt</Text>
      </View>
    )}

    {/* ── Progress card ── */}
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Text style={styles.cardTitle}>Voortgang belastingen</Text>
        <Text style={styles.cardScore}>{doneTasks}/{totalTasks}</Text>
      </View>
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width:`${(doneTasks/totalTasks)*100}%` }]} />
      </View>
      <View style={styles.taskChips}>
        {['Jaaropgave','Zorgtoeslag','Box 3','Hypotheek'].map((task,i) => (
          <View key={i} style={[styles.taskChip, i<2 && styles.taskChipDone]}>
            <Text style={[styles.taskChipIcon, i<2 && styles.taskChipIconDone]}>{i<2?'✓':'○'}</Text>
            <Text style={[styles.taskChipText, i<2 && styles.taskChipTextDone]}>{task}</Text>
          </View>
        ))}
      </View>
    </View>

    {/* ── AI Insights ── */}
    <View style={styles.section}>
      {INSIGHTS.map((ins,i) => (
        <View key={i} style={styles.chip}>
          <Text style={[styles.chipIcon, { color:ins.tc }]}>{ins.icon}</Text>
          <Text style={styles.chipBody}>{ins.body}</Text>
          <View style={[styles.chipTag, { backgroundColor:`${ins.tc}15`, borderColor:`${ins.tc}28` }]}>
            <Text style={[styles.chipTagText, { color:ins.tc }]}>{ins.tag}</Text>
          </View>
        </View>
      ))}
    </View>

    {/* ── Action grid ── */}
    <View style={styles.grid}>
      <TouchableOpacity style={styles.btnPrimary} onPress={() => startChat()} activeOpacity={0.85}>
        <Text style={styles.btnPrimaryText}>⬡  Vraag stellen</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btnSec} onPress={() => navigation.navigate('Profile')} activeOpacity={0.8}>
        <Text style={styles.btnSecText}>✦  Inzichten</Text>
      </TouchableOpacity>
      {QUICK_QUESTIONS.slice(0,4).map((q) => (
        <TouchableOpacity key={q.label} style={styles.quickCard} onPress={() => startChat(q.question)} activeOpacity={0.75}>
          <Text style={styles.quickIcon}>{q.icon}</Text>
          <Text style={styles.quickLabel}>{q.label}</Text>
        </TouchableOpacity>
      ))}
    </View>

    {/* Pro shortcuts */}
    {hasPro && (
      <View style={styles.proRow}>
        {[{icon:'📸',label:'Scanner',screen:'Scanner'},{icon:'📊',label:'Overzicht',screen:'YearOverview'},{icon:'📅',label:'Kalender',screen:'Calendar'},{icon:'📁',label:'Archief',screen:'Favorites'}].map(p=>(
          <TouchableOpacity key={p.screen} style={styles.proCard} onPress={()=>navigation.navigate(p.screen)} activeOpacity={0.75}>
            <Text style={styles.proIcon}>{p.icon}</Text>
            <Text style={styles.proLabel}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    )}

    <Text style={styles.disclaimer}>{t(lang,'disclaimer')}</Text>
  </ScrollView>
</SafeAreaView>
```

);
}

const styles = StyleSheet.create({
safe:   { flex:1, backgroundColor:Colors.pageBg },
scroll: { paddingBottom:40 },

greeting: { alignItems:‘center’, paddingTop:20, paddingBottom:18, paddingHorizontal:24 },
greetSmall: { fontSize:11, color:Colors.blueLight, letterSpacing:2.5, textTransform:‘uppercase’, fontWeight:‘700’, marginBottom:5 },
greetName:  { fontSize:38, fontWeight:‘200’, color:Colors.textPrimary, letterSpacing:-1.5, lineHeight:42, marginBottom:12 },
statusPill: { flexDirection:‘row’, alignItems:‘center’, gap:7, backgroundColor:‘rgba(255,255,255,0.6)’, borderRadius:999, paddingVertical:6, paddingHorizontal:16, borderWidth:1, borderColor:‘rgba(16,185,129,0.25)’ },
statusDot:  { width:7, height:7, borderRadius:999, backgroundColor:Colors.green, shadowColor:Colors.green, shadowOpacity:0.8, shadowRadius:4, elevation:2 },
statusPillText: { fontSize:12, color:Colors.greenText, fontWeight:‘600’ },

orbSection: { alignItems:‘center’, marginBottom:18 },
orb: { width:126, height:126, borderRadius:63, backgroundColor:Colors.blueDeep, alignItems:‘center’, justifyContent:‘center’, borderWidth:2, borderColor:‘rgba(255,255,255,0.65)’, shadowColor:Colors.blueDeep, shadowOpacity:0.28, shadowRadius:28, shadowOffset:{width:0,height:8}, elevation:10, overflow:‘hidden’ },
orbActive: { borderColor:‘rgba(255,255,255,1)’, shadowOpacity:0.45 },
orbInner:  { width:56, height:56, borderRadius:28, backgroundColor:‘rgba(191,219,254,0.75)’ },
orbLabel:  { marginTop:11, fontSize:11, letterSpacing:2.2, textTransform:‘uppercase’, fontWeight:‘600’, color:Colors.bluePale },
orbLabelActive: { color:Colors.blueDeep },

usageCard: { flexDirection:‘row’, alignItems:‘center’, marginHorizontal:20, marginBottom:14, backgroundColor:‘rgba(255,255,255,0.65)’, borderRadius:999, borderWidth:1, borderColor:‘rgba(255,255,255,0.9)’, padding:14, shadowColor:Colors.blueDeep, shadowOpacity:0.07, shadowRadius:8, elevation:2 },
usageText: { fontSize:11, color:Colors.textMuted, marginBottom:6 },
usageTrack:{ height:4, backgroundColor:‘rgba(147,197,253,0.3)’, borderRadius:999, overflow:‘hidden’ },
usageFill: { height:4, backgroundColor:Colors.blueDeep, borderRadius:999 },
upgradeText:{ fontSize:12, fontWeight:‘700’, color:Colors.blueDeep, marginLeft:12 },
premiumPill:{ alignSelf:‘center’, backgroundColor:‘rgba(29,78,216,0.08)’, borderRadius:999, paddingHorizontal:16, paddingVertical:6, marginBottom:14, borderWidth:1, borderColor:‘rgba(29,78,216,0.18)’ },
premiumText:{ fontSize:12, color:Colors.blueDeep, fontWeight:‘700’ },

card: { marginHorizontal:20, marginBottom:16, backgroundColor:‘rgba(255,255,255,0.65)’, borderRadius:22, borderWidth:1, borderColor:‘rgba(255,255,255,0.9)’, padding:16, shadowColor:Colors.blueDeep, shadowOpacity:0.1, shadowRadius:16, elevation:3 },
cardRow:  { flexDirection:‘row’, justifyContent:‘space-between’, alignItems:‘center’, marginBottom:10 },
cardTitle:{ fontSize:13, fontWeight:‘700’, color:Colors.textPrimary },
cardScore:{ fontSize:12, fontWeight:‘700’, color:Colors.blueDeep },
progressBg:  { height:5, backgroundColor:‘rgba(147,197,253,0.3)’, borderRadius:999, overflow:‘hidden’, marginBottom:10 },
progressFill:{ height:5, backgroundColor:Colors.blueDeep, borderRadius:999 },
taskChips: { flexDirection:‘row’, flexWrap:‘wrap’, gap:6 },
taskChip:  { flexDirection:‘row’, alignItems:‘center’, gap:4, backgroundColor:‘rgba(147,197,253,0.15)’, borderRadius:999, paddingVertical:4, paddingHorizontal:10, borderWidth:1, borderColor:‘rgba(147,197,253,0.3)’ },
taskChipDone: { backgroundColor:‘rgba(16,185,129,0.1)’, borderColor:‘rgba(16,185,129,0.25)’ },
taskChipIcon: { fontSize:9, color:Colors.bluePale },
taskChipIconDone: { color:Colors.green },
taskChipText: { fontSize:10, color:Colors.textMuted, fontWeight:‘500’ },
taskChipTextDone: { color:Colors.greenText },

section: { paddingHorizontal:20, marginBottom:16, gap:8, flexDirection:‘column’ },
chip:    { flexDirection:‘row’, alignItems:‘center’, gap:10, backgroundColor:‘rgba(255,255,255,0.65)’, borderRadius:999, borderWidth:1, borderColor:‘rgba(255,255,255,0.9)’, paddingVertical:10, paddingHorizontal:16, shadowColor:Colors.blueDeep, shadowOpacity:0.07, shadowRadius:8, elevation:1 },
chipIcon:{ fontSize:13 },
chipBody:{ flex:1, fontSize:12, color:Colors.textSecond, lineHeight:18 },
chipTag: { borderRadius:999, paddingVertical:2, paddingHorizontal:9, borderWidth:1 },
chipTagText:{ fontSize:9, fontWeight:‘700’, letterSpacing:0.5 },

grid:    { paddingHorizontal:20, flexDirection:‘row’, flexWrap:‘wrap’, gap:10, marginBottom:20 },
btnPrimary: { width:‘100%’, backgroundColor:Colors.blueDeep, borderRadius:999, paddingVertical:14, alignItems:‘center’, shadowColor:Colors.blueDeep, shadowOpacity:0.35, shadowRadius:16, elevation:6 },
btnPrimaryText: { color:‘white’, fontSize:14, fontWeight:‘700’ },
btnSec:  { width:‘100%’, backgroundColor:‘rgba(255,255,255,0.65)’, borderRadius:999, paddingVertical:12, alignItems:‘center’, borderWidth:1, borderColor:‘rgba(255,255,255,0.9)’, shadowColor:Colors.blueDeep, shadowOpacity:0.08, shadowRadius:8, elevation:2 },
btnSecText:{ color:Colors.blueDeep, fontSize:14, fontWeight:‘600’ },
quickCard: { width:(width-50)/2, backgroundColor:‘rgba(255,255,255,0.65)’, borderRadius:18, borderWidth:1, borderColor:‘rgba(255,255,255,0.9)’, padding:16, shadowColor:Colors.blueDeep, shadowOpacity:0.07, shadowRadius:8, elevation:2 },
quickIcon: { fontSize:22, marginBottom:8 },
quickLabel:{ fontSize:13, color:Colors.textPrimary, fontWeight:‘500’ },

proRow:  { flexDirection:‘row’, gap:10, paddingHorizontal:20, marginBottom:20 },
proCard: { flex:1, backgroundColor:‘rgba(255,255,255,0.65)’, borderRadius:16, padding:12, alignItems:‘center’, gap:4, borderWidth:1, borderColor:‘rgba(255,255,255,0.9)’, shadowColor:Colors.blueDeep, shadowOpacity:0.06, shadowRadius:6, elevation:1 },
proIcon: { fontSize:20 },
proLabel:{ fontSize:10, fontWeight:‘600’, color:Colors.blueDeep },

disclaimer: { color:Colors.textLight, fontSize:11, textAlign:‘center’, lineHeight:16, paddingHorizontal:24 },
});
