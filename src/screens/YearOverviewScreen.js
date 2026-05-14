import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFavorites, getUserData } from '../utils/storage';
import { exportToPDF } from '../utils/pdf';
import { isPro } from '../utils/purchases';

const CATEGORIES = {
  'Zakelijke lunch': { icon: '🍽', color: '#e17000', deductible: 80 },
  'Kantoorbenodigdheden': { icon: '📎', color: '#1d4ed8', deductible: 100 },
  'Reiskosten': { icon: '🚗', color: '#16a34a', deductible: 100 },
  'Software': { icon: '💻', color: '#7c3aed', deductible: 100 },
  'Marketing': { icon: '📢', color: '#dc2626', deductible: 100 },
  'Overig': { icon: '📦', color: '#7a8fa8', deductible: 100 },
};

export default function YearOverviewScreen({ navigation }) {
  const [scans, setScans] = useState([]);
  const [userData, setUserData] = useState(null);
  const [proAccess, setProAccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const user = await getUserData();
    const pro = await isPro();
    setUserData(user);
    setProAccess(pro);

    const favs = await getFavorites();
    const scanItems = favs.filter(f => f.type === 'scan').map(f => {
      try {
        return { ...f, data: JSON.parse(f.answer) };
      } catch {
        return { ...f, data: {} };
      }
    });
    setScans(scanItems);
  };

  const totalAmount = scans.reduce((sum, s) => {
    const amt = parseFloat(s.data?.amount || 0);
    return sum + amt;
  }, 0);

  const totalDeductible = scans.reduce((sum, s) => {
    const amt = parseFloat(s.data?.deductible_amount || 0);
    return sum + amt;
  }, 0);

  const totalVat = scans.reduce((sum, s) => {
    const vat = parseFloat(s.data?.vat || 0);
    return sum + vat;
  }, 0);

  const byCategory = scans.reduce((acc, s) => {
    const cat = s.data?.category || 'Overig';
    if (!acc[cat]) acc[cat] = { count: 0, total: 0, deductible: 0 };
    acc[cat].count++;
    acc[cat].total += parseFloat(s.data?.amount || 0);
    acc[cat].deductible += parseFloat(s.data?.deductible_amount || 0);
    return acc;
  }, {});

  const handleExport = async () => {
    if (!proAccess) {
      navigation.navigate('Paywall');
      return;
    }
    const messages = scans.map(s => ({
      role: 'assistant',
      content: `${s.data?.vendor || 'Onbekend'} - €${s.data?.amount} - ${s.data?.category} - Aftrekbaar: €${s.data?.deductible_amount}`,
    }));
    await exportToPDF(messages, userData?.name);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Jaaroverzicht {new Date().getFullYear()}</Text>
        <TouchableOpacity onPress={handleExport} style={styles.exportBtn}>
          <Text style={styles.exportText}>PDF</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>🧾</Text>
            <Text style={styles.summaryValue}>{scans.length}</Text>
            <Text style={styles.summaryLabel}>Bonnetjes</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>💰</Text>
            <Text style={styles.summaryValue}>€{totalDeductible.toFixed(0)}</Text>
            <Text style={styles.summaryLabel}>Aftrekbaar</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>🏦</Text>
            <Text style={styles.summaryValue}>€{totalVat.toFixed(0)}</Text>
            <Text style={styles.summaryLabel}>BTW terug</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Per categorie</Text>
        {Object.entries(byCategory).map(([cat, data]) => {
          const catInfo = CATEGORIES[cat] || CATEGORIES['Overig'];
          return (
            <View key={cat} style={styles.catCard}>
              <View style={[styles.catIcon, { backgroundColor: `${catInfo.color}15` }]}>
                <Text style={styles.catIconText}>{catInfo.icon}</Text>
              </View>
              <View style={styles.catContent}>
                <Text style={styles.catName}>{cat}</Text>
                <Text style={styles.catCount}>{data.count} bonnetjes · €{data.total.toFixed(2)}</Text>
              </View>
              <View style={styles.catRight}>
                <Text style={styles.catDeductible}>€{data.deductible.toFixed(0)}</Text>
                <Text style={styles.catDeductibleLabel}>aftrekbaar</Text>
              </View>
            </View>
          );
        })}

        {scans.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📸</Text>
            <Text style={styles.emptyTitle}>Nog geen bonnetjes</Text>
            <Text style={styles.emptyDesc}>Scan uw eerste bonnetje via de Document Scanner</Text>
            <TouchableOpacity
              style={styles.scanBtn}
              onPress={() => navigation.navigate('Scanner')}
            >
              <Text style={styles.scanBtnText}>Scanner openen →</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.totalCard}>
          <Text style={styles.totalTitle}>Totaaloverzicht {new Date().getFullYear()}</Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalKey}>Totaal uitgaven</Text>
            <Text style={styles.totalVal}>€{totalAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalKey}>Totaal aftrekbaar</Text>
            <Text style={[styles.totalVal, { color: '#16a34a' }]}>€{totalDeductible.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalKey}>BTW terug te vragen</Text>
            <Text style={[styles.totalVal, { color: '#16a34a' }]}>€{totalVat.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex:1, backgroundColor:'#dbeafe' },
  scroll: { padding:20, paddingBottom:40 },

  header: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:20, paddingVertical:13, borderBottomWidth:1, borderBottomColor:'rgba(255,255,255,0.65)', backgroundColor:'rgba(219,234,254,0.97)' },
  backBtn:{ paddingHorizontal:14, paddingVertical:7, borderRadius:999, backgroundColor:'rgba(255,255,255,0.65)', borderWidth:1, borderColor:'rgba(255,255,255,0.9)' },
  backText:{ fontSize:12, color:'#1d4ed8', fontWeight:'600' },
  headerTitle:{ fontSize:15, fontWeight:'700', color:'#0f172a' },
  pdfBtn:{ paddingHorizontal:14, paddingVertical:7, borderRadius:999, backgroundColor:'#1d4ed8', borderWidth:0 },
  pdfText:{ fontSize:12, color:'#fff', fontWeight:'700' },

  statsRow: { flexDirection:'row', gap:10, marginBottom:20 },
  statCard: { flex:1, backgroundColor:'rgba(255,255,255,0.65)', borderRadius:18, borderWidth:1, borderColor:'rgba(255,255,255,0.9)', padding:14, alignItems:'center', shadowColor:'#1d4ed8', shadowOpacity:0.08, shadowRadius:8, elevation:2 },
  statIcon: { fontSize:22, marginBottom:6 },
  statValue:{ fontSize:20, fontWeight:'700', color:'#1d4ed8', letterSpacing:-0.5 },
  statLabel:{ fontSize:11, color:'#64748b', marginTop:2 },

  sectionLabel:{ fontSize:11, fontWeight:'700', color:'#64748b', letterSpacing:1.5, textTransform:'uppercase', marginBottom:12 },

  emptyCard:{ backgroundColor:'rgba(255,255,255,0.65)', borderRadius:22, borderWidth:1, borderColor:'rgba(255,255,255,0.9)', padding:32, alignItems:'center', marginBottom:20, shadowColor:'#1d4ed8', shadowOpacity:0.08, shadowRadius:12, elevation:2 },
  emptyIcon:{ fontSize:40, marginBottom:12 },
  emptyTitle:{ fontSize:16, fontWeight:'700', color:'#0f172a', marginBottom:6 },
  emptyText:{ fontSize:13, color:'#64748b', textAlign:'center', lineHeight:19, marginBottom:20 },
  scannerBtn:{ backgroundColor:'#1d4ed8', borderRadius:999, paddingVertical:13, paddingHorizontal:24, shadowColor:'#1d4ed8', shadowOpacity:0.35, shadowRadius:16, elevation:6 },
  scannerBtnText:{ color:'#fff', fontSize:14, fontWeight:'700' },

  categoryCard:{ backgroundColor:'rgba(255,255,255,0.65)', borderRadius:18, borderWidth:1, borderColor:'rgba(255,255,255,0.9)', padding:14, marginBottom:10, shadowColor:'#1d4ed8', shadowOpacity:0.07, shadowRadius:8, elevation:2 },
  categoryRow:{ flexDirection:'row', alignItems:'center', gap:10 },
  categoryIcon:{ fontSize:20, width:32 },
  categoryInfo:{ flex:1 },
  categoryName:{ fontSize:13, fontWeight:'600', color:'#0f172a' },
  categoryCount:{ fontSize:11, color:'#64748b', marginTop:1 },
  categoryAmount:{ alignItems:'flex-end' },
  categoryTotal:{ fontSize:14, fontWeight:'700', color:'#1d4ed8' },
  categoryDeduct:{ fontSize:11, color:'#10b981', marginTop:1 },

  summaryCard:{ backgroundColor:'#1d4ed8', borderRadius:22, padding:20, marginTop:8, shadowColor:'#1d4ed8', shadowOpacity:0.35, shadowRadius:20, elevation:8 },
  summaryTitle:{ fontSize:15, fontWeight:'700', color:'#fff', marginBottom:14 },
  summaryRow:{ flexDirection:'row', justifyContent:'space-between', marginBottom:10 },
  summaryLabel:{ fontSize:13, color:'rgba(255,255,255,0.7)' },
  summaryValue:{ fontSize:13, fontWeight:'600', color:'#fff' },
  summaryValueGreen:{ fontSize:13, fontWeight:'700', color:'#4ade80' },
});
