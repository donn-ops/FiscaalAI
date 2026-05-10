
const C = {
  pageBg:'#dbeafe', surface:'rgba(255,255,255,0.65)', surfaceHi:'rgba(255,255,255,0.85)',
  blue:'#1d4ed8', blueMid:'#2563eb', blueLight:'#60a5fa', bluePale:'#93c5fd',
  text:'#0f172a', textMid:'#334155', textMuted:'#64748b', textLight:'#94a3b8',
  green:'#10b981', greenText:'#065f46', amber:'#f59e0b', red:'#ef4444',
  border:'rgba(255,255,255,0.9)', borderBlue:'rgba(59,130,246,0.2)', white:'#ffffff',
};
const sh = (op=0.08,r=8) => ({ shadowColor:'#1d4ed8', shadowOpacity:op, shadowRadius:r, shadowOffset:{width:0,height:2}, elevation:Math.round(r/3) });

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DEADLINES = [
  { month:'APR', day:'15', title:'BTW Q1 ingediend',  status:'ok'      },
  { month:'MEI', day:'01', title:'Aangifte 2024',     status:'action'  },
  { month:'MEI', day:'01', title:'Aangifte 2023',     status:'overdue' },
  { month:'JUL', day:'15', title:'BTW Q2 indienen',   status:'action'  },
  { month:'OKT', day:'15', title:'BTW Q3 indienen',   status:'plan'    },
];
const SC = {
  ok:      { dot:'#10b981', bg:'rgba(16,185,129,0.1)',  text:'#065f46', border:'rgba(16,185,129,0.25)',  tag:'OK'       },
  action:  { dot:'#f59e0b', bg:'rgba(245,158,11,0.12)', text:'#A25A04', border:'rgba(245,158,11,0.3)',   tag:'ACTIE'    },
  overdue: { dot:'#ef4444', bg:'rgba(239,68,68,0.1)',   text:'#B91C1C', border:'rgba(239,68,68,0.28)',   tag:'VERLOPEN' },
  plan:    { dot:'#94a3b8', bg:'rgba(148,163,184,0.14)',text:'#475569', border:'rgba(148,163,184,0.3)',  tag:'GEPLAND'  },
};
const FILTERS = ['Alles', 'Aankomend', 'Verlopen'];

export default function CalendarScreen({ navigation }) {
  const [filter, setFilter] = useState('Alles');
  const filtered = DEADLINES.filter(d => {
    if (filter === 'Aankomend') return d.status === 'action' || d.status === 'plan';
    if (filter === 'Verlopen')  return d.status === 'overdue' || d.status === 'ok';
    return true;
  });
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={s.backText}>terug</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Belastingkalender</Text>
        <View style={{ width:50 }} />
      </View>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.year}>2025</Text>
        <View style={s.filterRow}>
          {FILTERS.map(f => (
            <TouchableOpacity key={f} style={[s.filterBtn, filter===f&&s.filterBtnActive]} onPress={() => setFilter(f)} activeOpacity={0.75}>
              <Text style={[s.filterText, filter===f&&{ color:'#fff' }]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={s.list}>
          {filtered.map((d,i) => {
            const c = SC[d.status];
            return (
              <View key={i} style={[s.row, { borderColor: d.status==='action'||d.status==='overdue' ? c.border : C.border }]}>
                <View style={s.dateBlock}>
                  <Text style={s.dateDay}>{d.day}</Text>
                  <Text style={s.dateMonth}>{d.month}</Text>
                </View>
                <View style={s.divider} />
                <View style={[s.dot, { backgroundColor:c.dot }]} />
                <Text style={s.rowTitle} numberOfLines={1}>{d.title}</Text>
                <View style={[s.tag, { backgroundColor:c.bg, borderColor:c.border }]}>
                  <Text style={[s.tagText, { color:c.text }]}>{c.tag}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex:1, backgroundColor: C.pageBg },
  header: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:20, paddingVertical:12, borderBottomWidth:1, borderBottomColor:C.border, backgroundColor:'rgba(219,234,254,0.97)' },
  backBtn: { paddingHorizontal:14, paddingVertical:7, borderRadius:999, backgroundColor: C.surface, borderWidth:1, borderColor: C.border },
  backText: { fontSize:12, color: C.blue, fontWeight:'600' },
  headerTitle: { fontSize:15, fontWeight:'700', color: C.text },
  scroll: { padding:20, paddingBottom:40 },
  year: { fontSize:28, fontWeight:'300', color: C.text, letterSpacing:-0.6, marginBottom:14 },
  filterRow: { flexDirection:'row', gap:8, marginBottom:14 },
  filterBtn: { flex:1, backgroundColor: C.surface, borderRadius:999, paddingVertical:8, alignItems:'center', borderWidth:1, borderColor: C.border, ...sh() },
  filterBtnActive: { backgroundColor: C.blue, borderColor: C.blue },
  filterText: { fontSize:12, fontWeight:'600', color: C.textMuted },
  list: { gap:9 },
  row: { flexDirection:'row', alignItems:'center', gap:10, backgroundColor: C.surface, borderRadius:16, borderWidth:1, paddingVertical:12, paddingHorizontal:13, ...sh() },
  dateBlock: { minWidth:34, alignItems:'center' },
  dateDay: { fontSize:14, fontWeight:'700', color: C.text, lineHeight:17 },
  dateMonth: { fontSize:8, fontWeight:'700', color: C.textLight, letterSpacing:0.5 },
  divider: { width:1, alignSelf:'stretch', backgroundColor:'rgba(147,197,253,0.4)' },
  dot: { width:7, height:7, borderRadius:999 },
  rowTitle: { flex:1, fontSize:13, fontWeight:'600', color: C.text },
  tag: { borderRadius:999, paddingVertical:2, paddingHorizontal:8, borderWidth:1 },
  tagText: { fontSize:9, fontWeight:'700', letterSpacing:0.4 },
});
