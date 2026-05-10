import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserData } from '../utils/storage';
import { Colors, Radii, Shadows } from '../constants/theme';

const DEADLINES = [
  { date:'15 APR', month:'APR', day:'15', title:'BTW Q1 ingediend',  status:'ok',      tag:'OK' },
  { date:'01 MEI', month:'MEI', day:'01', title:'Aangifte 2024',     status:'action',  tag:'ACTIE' },
  { date:'01 MEI', month:'MEI', day:'01', title:'Aangifte 2023',     status:'overdue', tag:'VERLOPEN' },
  { date:'15 JUL', month:'JUL', day:'15', title:'BTW Q2 indienen',   status:'action',  tag:'ACTIE' },
  { date:'15 OKT', month:'OKT', day:'15', title:'BTW Q3 indienen',   status:'plan',    tag:'GEPLAND' },
];

const STATUS_COLORS = {
  ok:      { dot:'#10b981', bg:'rgba(16,185,129,0.1)',  text:'#065f46', border:'rgba(16,185,129,0.25)' },
  action:  { dot:'#f59e0b', bg:'rgba(245,158,11,0.12)', text:'#A25A04', border:'rgba(245,158,11,0.3)'  },
  overdue: { dot:'#ef4444', bg:'rgba(239,68,68,0.1)',   text:'#B91C1C', border:'rgba(239,68,68,0.28)'  },
  plan:    { dot:'#94a3b8', bg:'rgba(148,163,184,0.14)',text:'#475569', border:'rgba(148,163,184,0.3)'  },
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
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Belastingkalender</Text>
        <View style={{ width:40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.year}>2025</Text>

        <View style={s.filterRow}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[s.filterBtn, filter === f && s.filterBtnActive]}
              onPress={() => setFilter(f)}
              activeOpacity={0.75}
            >
              <Text style={[s.filterText, filter === f && s.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.list}>
          {filtered.map((d, i) => {
            const c = STATUS_COLORS[d.status];
            return (
              <View key={i} style={[s.row, { borderColor: d.status !== 'ok' && d.status !== 'plan' ? c.border : 'rgba(255,255,255,0.9)' }]}>
                <View style={s.dateBlock}>
                  <Text style={s.dateDay}>{d.day}</Text>
                  <Text style={s.dateMonth}>{d.month}</Text>
                </View>
                <View style={s.divider} />
                <View style={[s.dot, { backgroundColor: c.dot }]} />
                <Text style={s.rowTitle} numberOfLines={1}>{d.title}</Text>
                <View style={[s.tag, { backgroundColor: c.bg, borderColor: c.border }]}>
                  <Text style={[s.tagText, { color: c.text }]}>{d.tag}</Text>
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
  safe:   { flex:1, backgroundColor: Colors.pageBg },
  header: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:20, paddingVertical:13, borderBottomWidth:1, borderBottomColor:'rgba(255,255,255,0.65)', backgroundColor:'rgba(219,234,254,0.97)' },
  backBtn:{ width:40, height:36, borderRadius:999, backgroundColor:'rgba(255,255,255,0.65)', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.9)' },
  backText:{ fontSize:18, color: Colors.blueDeep, fontWeight:'600' },
  headerTitle:{ fontSize:15, fontWeight:'700', color: Colors.textPrimary },
  scroll: { padding:20, paddingBottom:40 },
  year:   { fontSize:28, fontWeight:'300', color: Colors.textPrimary, letterSpacing:-0.6, marginBottom:16 },
  filterRow:{ flexDirection:'row', gap:8, marginBottom:16 },
  filterBtn:{ flex:1, backgroundColor:'rgba(255,255,255,0.65)', borderRadius:999, paddingVertical:9, alignItems:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.9)', ...Shadows.sm },
  filterBtnActive:{ backgroundColor: Colors.blueDeep, borderColor: Colors.blueDeep },
  filterText:{ fontSize:12, fontWeight:'600', color: Colors.textMuted },
  filterTextActive:{ color:'#fff' },
  list:   { gap:10 },
  row:    { flexDirection:'row', alignItems:'center', gap:10, backgroundColor:'rgba(255,255,255,0.65)', borderRadius:16, borderWidth:1, padding:'12px 14px', paddingVertical:12, paddingHorizontal:14, ...Shadows.sm },
  dateBlock:{ minWidth:36, alignItems:'center' },
  dateDay:  { fontSize:15, fontWeight:'700', color: Colors.textPrimary, lineHeight:18 },
  dateMonth:{ fontSize:8,  fontWeight:'700', color: Colors.textLight,   letterSpacing:0.6 },
  divider:  { width:1, alignSelf:'stretch', backgroundColor:'rgba(147,197,253,0.4)' },
  dot:      { width:7, height:7, borderRadius:999 },
  rowTitle: { flex:1, fontSize:13, fontWeight:'600', color: Colors.textPrimary },
  tag:      { borderRadius:999, paddingVertical:2, paddingHorizontal:8, borderWidth:1 },
  tagText:  { fontSize:9, fontWeight:'700', letterSpacing:0.5 },
});
