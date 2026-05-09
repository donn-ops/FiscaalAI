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
  'Kantoorbenodigdheden': { icon: '📎', color: '#154273', deductible: 100 },
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
  safe: { flex: 1, backgroundColor: '#EEF2F7' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'white', padding: 16,
    borderBottomWidth: 1, borderBottomColor: '#dde3ed',
    shadowColor: '#154273', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  backBtn: { padding: 4 },
  backText: { color: '#154273', fontSize: 22, fontWeight: '600' },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#154273' },
  exportBtn: {
    backgroundColor: '#EEF2F7', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1, borderColor: '#dde3ed',
  },
  exportText: { fontSize: 11, fontWeight: '700', color: '#154273' },
  container: { padding: 16, gap: 12 },
  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryCard: {
    flex: 1, backgroundColor: 'white', borderRadius: 14,
    padding: 14, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: '#dde3ed',
    shadowColor: '#154273', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  summaryIcon: { fontSize: 22 },
  summaryValue: { fontSize: 18, fontWeight: '800', color: '#154273' },
  summaryLabel: { fontSize: 10, color: '#7a8fa8', textAlign: 'center' },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: '#154273',
    textTransform: 'uppercase', letterSpacing: 1.5,
  },
  catCard: {
    backgroundColor: 'white', borderRadius: 12,
    flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10,
    borderWidth: 1, borderColor: '#dde3ed',
    shadowColor: '#154273', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  catIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  catIconText: { fontSize: 20 },
  catContent: { flex: 1 },
  catName: { fontSize: 13, fontWeight: '600', color: '#2c3e50' },
  catCount: { fontSize: 11, color: '#7a8fa8' },
  catRight: { alignItems: 'flex-end' },
  catDeductible: { fontSize: 14, fontWeight: '800', color: '#16a34a' },
  catDeductibleLabel: { fontSize: 9, color: '#a0aec0' },
  emptyCard: {
    backgroundColor: 'white', borderRadius: 16, padding: 28,
    alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: '#dde3ed',
  },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#2c3e50' },
  emptyDesc: { fontSize: 13, color: '#7a8fa8', textAlign: 'center' },
  scanBtn: {
    backgroundColor: '#154273', borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 10, marginTop: 8,
  },
  scanBtnText: { color: 'white', fontSize: 13, fontWeight: '700' },
  totalCard: {
    backgroundColor: '#154273', borderRadius: 14, padding: 16, gap: 10,
  },
  totalTitle: { fontSize: 13, fontWeight: '700', color: 'white', marginBottom: 4 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalKey: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  totalVal: { fontSize: 13, fontWeight: '700', color: 'white' },
});
