
const C = {
  pageBg:      '#dbeafe',
  surface:     'rgba(255,255,255,0.65)',
  surfaceHi:   'rgba(255,255,255,0.85)',
  blue:        '#1d4ed8',
  blueMid:     '#2563eb',
  blueLight:   '#60a5fa',
  bluePale:    '#93c5fd',
  text:        '#0f172a',
  textMid:     '#334155',
  textMuted:   '#64748b',
  textLight:   '#94a3b8',
  green:       '#10b981',
  greenText:   '#065f46',
  amber:       '#f59e0b',
  red:         '#ef4444',
  border:      'rgba(255,255,255,0.9)',
  borderBlue:  'rgba(59,130,246,0.2)',
  white:       '#ffffff',
};
const sh = (op=0.08,r=8) => ({ shadowColor:'#1d4ed8', shadowOpacity:op, shadowRadius:r, shadowOffset:{width:0,height:2}, elevation:Math.round(r/3) });

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getUserData, getTaxProfile } from '../utils/storage';
import { QUICK_QUESTIONS } from '../constants/prompts';
import { t } from '../constants/translations';
import { getDailyUsage } from '../utils/freemium';
import { isPremium, isPro } from '../utils/purchases';

const { width } = Dimensions.get('window');

const getGreeting = (lang) => {
  const h = new Date().getHours();
  if (h < 12) return 'Goedemorgen';
  if (h < 18) return 'Goedemiddag';
  return 'Goedenavond';
};

const INSIGHTS = [
  { icon:'◈', body:'U komt mogelijk in aanmerking voor 1.840 euro hypotheekaftrek.', tag:'Kans',  tc:'#2563eb' },
  { icon:'⚡', body:'Box 3 vermogensopgave moet voor 1 mei ingediend worden.',         tag:'Actie', tc:'#f59e0b' },
  { icon:'✦',  body:'3.200 euro zelfstandigenaftrek staat nog open dit jaar.',          tag:'Tip',   tc:'#10b981' },
];

const TASKS = [
  { label:'Jaaropgave', done:true },
  { label:'Zorgtoeslag', done:true },
  { label:'Box 3', done:false },
  { label:'Hypotheek', done:false },
];

function OrbButton({ onPress, active }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(anim, { toValue:-7, duration:2000, useNativeDriver:true }),
      Animated.timing(anim, { toValue:0,  duration:2000, useNativeDriver:true }),
    ])).start();
  }, []);
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={{ alignItems:'center' }}>
      <Animated.View style={{ transform:[{ translateY:anim }] }}>
        <View style={s.orb}>
          <View style={s.orbInner} />
        </View>
      </Animated.View>
      <Text style={[s.orbLabel, active && { color: C.blue }]}>
        {active ? 'Ik luister...' : 'Tik om te spreken'}
      </Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const [userData,   setUserData]   = useState(null);
  const [dailyUsage, setDailyUsage] = useState(0);
  const [hasPremium, setHasPremium] = useState(false);
  const [hasPro,     setHasPro]     = useState(false);
  const [listening,  setListening]  = useState(false);

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const loadData = async () => {
    const [user, usage, premium, pro] = await Promise.all([
      getUserData(), getDailyUsage(), isPremium(), isPro(),
    ]);
    setUserData(user); setDailyUsage(usage);
    setHasPremium(premium); setHasPro(pro);
  };

  const lang = userData?.language || 'nl';
  const isUnlimited = hasPremium || hasPro;
  const doneTasks = TASKS.filter(t => t.done).length;

  const triggerListen = () => { setListening(true); setTimeout(() => setListening(false), 3000); };
  const startChat = (q = null) => navigation.navigate('Chat', { initialQuestion: q, userData });

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        
        <View style={s.greeting}>
          <Text style={s.greetSmall}>{getGreeting(lang)}</Text>
          <Text style={s.greetName}>{userData?.name || 'Welkom'}</Text>
          <View style={s.statusPill}>
            <View style={s.statusDot} />
            <Text style={s.statusText}>Financien onder controle</Text>
          </View>
        </View>

        <View style={s.orbSection}>
          <OrbButton onPress={triggerListen} active={listening} />
        </View>

        {!isUnlimited && (
          <TouchableOpacity style={s.usageCard} onPress={() => navigation.navigate('Paywall')} activeOpacity={0.8}>
            <View style={{ flex:1 }}>
              <Text style={s.usageText}>{dailyUsage}/5 vragen gebruikt vandaag</Text>
              <View style={s.usageTrack}>
                <View style={[s.usageFill, { width:`${(dailyUsage/5)*100}%` }]} />
              </View>
            </View>
            <Text style={s.upgradeText}>Upgrade</Text>
          </TouchableOpacity>
        )}

        <View style={s.card}>
          <View style={s.cardRow}>
            <Text style={s.cardTitle}>Voortgang belastingen</Text>
            <Text style={s.cardScore}>{doneTasks}/{TASKS.length}</Text>
          </View>
          <View style={s.progressBg}>
            <View style={[s.progressFill, { width:`${(doneTasks/TASKS.length)*100}%` }]} />
          </View>
          <View style={s.taskRow}>
            {TASKS.map((task,i) => (
              <View key={i} style={[s.taskChip, task.done && s.taskChipDone]}>
                <Text style={[s.taskChipIcon, task.done && s.taskChipIconDone]}>{task.done?'v':'o'}</Text>
                <Text style={[s.taskChipText, task.done && s.taskChipTextDone]}>{task.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.insightList}>
          {INSIGHTS.map((ins,i) => (
            <View key={i} style={s.chip}>
              <Text style={[s.chipIcon, { color:ins.tc }]}>{ins.icon}</Text>
              <Text style={s.chipBody}>{ins.body}</Text>
              <View style={[s.chipTag, { backgroundColor:`${ins.tc}18`, borderColor:`${ins.tc}35` }]}>
                <Text style={[s.chipTagText, { color:ins.tc }]}>{ins.tag}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={s.grid}>
          <TouchableOpacity style={s.btnPrimary} onPress={() => startChat()} activeOpacity={0.85}>
            <Text style={s.btnPrimaryText}>Vraag stellen</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnSec} onPress={() => navigation.navigate('Scanner')} activeOpacity={0.8}>
            <Text style={s.btnSecText}>Scan bonnetje</Text>
          </TouchableOpacity>
          {QUICK_QUESTIONS && QUICK_QUESTIONS.slice(0,4).map((q) => (
            <TouchableOpacity key={q.label||q} style={s.quickCard} onPress={() => startChat(q.question||q)} activeOpacity={0.75}>
              <Text style={s.quickIcon}>{q.icon||'◎'}</Text>
              <Text style={s.quickLabel}>{q.label||q}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.disclaimer}>Taxly geeft geen juridisch of fiscaal advies. Raadpleeg een belastingadviseur voor uw specifieke situatie.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex:1, backgroundColor: C.pageBg },
  scroll: { paddingBottom:40 },
  greeting: { alignItems:'center', paddingTop:20, paddingBottom:16, paddingHorizontal:24 },
  greetSmall: { fontSize:11, color: C.blueLight, letterSpacing:2.5, textTransform:'uppercase', fontWeight:'700', marginBottom:4 },
  greetName:  { fontSize:36, fontWeight:'200', color: C.text, letterSpacing:-1.5, lineHeight:42, marginBottom:10 },
  statusPill: { flexDirection:'row', alignItems:'center', gap:7, backgroundColor:'rgba(255,255,255,0.6)', borderRadius:999, paddingVertical:5, paddingHorizontal:14, borderWidth:1, borderColor:'rgba(16,185,129,0.25)' },
  statusDot:  { width:6, height:6, borderRadius:999, backgroundColor: C.green },
  statusText: { fontSize:12, color: C.greenText, fontWeight:'600' },
  orbSection: { alignItems:'center', marginBottom:16 },
  orb: { width:120, height:120, borderRadius:60, backgroundColor: C.blue, alignItems:'center', justifyContent:'center', borderWidth:2, borderColor:'rgba(255,255,255,0.65)', ...sh(0.3,28) },
  orbInner: { width:52, height:52, borderRadius:26, backgroundColor:'rgba(191,219,254,0.75)' },
  orbLabel: { marginTop:10, fontSize:11, letterSpacing:2, textTransform:'uppercase', fontWeight:'600', color: C.bluePale },
  usageCard: { flexDirection:'row', alignItems:'center', marginHorizontal:20, marginBottom:14, backgroundColor: C.surface, borderRadius:999, borderWidth:1, borderColor: C.border, padding:13, ...sh() },
  usageText: { fontSize:11, color: C.textMuted, marginBottom:5 },
  usageTrack:{ height:4, backgroundColor:'rgba(147,197,253,0.3)', borderRadius:999, overflow:'hidden' },
  usageFill: { height:4, backgroundColor: C.blue, borderRadius:999 },
  upgradeText:{ fontSize:12, fontWeight:'700', color: C.blue, marginLeft:12 },
  card: { marginHorizontal:20, marginBottom:14, backgroundColor: C.surface, borderRadius:22, borderWidth:1, borderColor: C.border, padding:16, ...sh() },
  cardRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:10 },
  cardTitle:{ fontSize:13, fontWeight:'700', color: C.text },
  cardScore:{ fontSize:12, fontWeight:'700', color: C.blue },
  progressBg:  { height:5, backgroundColor:'rgba(147,197,253,0.3)', borderRadius:999, overflow:'hidden', marginBottom:10 },
  progressFill:{ height:5, backgroundColor: C.blue, borderRadius:999 },
  taskRow: { flexDirection:'row', flexWrap:'wrap', gap:6 },
  taskChip: { flexDirection:'row', alignItems:'center', gap:4, backgroundColor:'rgba(147,197,253,0.15)', borderRadius:999, paddingVertical:4, paddingHorizontal:9, borderWidth:1, borderColor:'rgba(147,197,253,0.3)' },
  taskChipDone: { backgroundColor:'rgba(16,185,129,0.1)', borderColor:'rgba(16,185,129,0.25)' },
  taskChipIcon: { fontSize:9, color: C.bluePale },
  taskChipIconDone: { color: C.green },
  taskChipText: { fontSize:10, color: C.textMuted, fontWeight:'500' },
  taskChipTextDone: { color: C.greenText },
  insightList: { paddingHorizontal:20, marginBottom:14, gap:8 },
  chip: { flexDirection:'row', alignItems:'center', gap:10, backgroundColor: C.surface, borderRadius:999, borderWidth:1, borderColor: C.border, paddingVertical:10, paddingHorizontal:15, ...sh() },
  chipIcon:{ fontSize:13 },
  chipBody:{ flex:1, fontSize:12, color: C.textMid, lineHeight:17 },
  chipTag: { borderRadius:999, paddingVertical:2, paddingHorizontal:8, borderWidth:1 },
  chipTagText:{ fontSize:9, fontWeight:'700', letterSpacing:0.5 },
  grid: { paddingHorizontal:20, gap:10, marginBottom:20 },
  btnPrimary: { backgroundColor: C.blue, borderRadius:999, paddingVertical:14, alignItems:'center', ...sh(0.35,16) },
  btnPrimaryText: { color:'#fff', fontSize:14, fontWeight:'700' },
  btnSec: { backgroundColor: C.surface, borderRadius:999, paddingVertical:12, alignItems:'center', borderWidth:1, borderColor: C.border, ...sh() },
  btnSecText: { color: C.blue, fontSize:14, fontWeight:'600' },
  quickCard: { backgroundColor: C.surface, borderRadius:18, borderWidth:1, borderColor: C.border, padding:16, ...sh() },
  quickIcon: { fontSize:22, marginBottom:7 },
  quickLabel: { fontSize:13, color: C.text, fontWeight:'500' },
  disclaimer: { color: C.textLight, fontSize:11, textAlign:'center', lineHeight:16, paddingHorizontal:24 },
});
