import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { getUserData, saveFavorite } from '../utils/storage';
import { isPro } from '../utils/purchases';

const API_URL = 'https://fiscaal-ai.vercel.app/api/chat';

export default function ScannerScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async (useCamera = false) => {
    const proAccess = await isPro();
    if (!proAccess) {
      Alert.alert(
        '👑 Pro functie',
        'De document scanner is beschikbaar voor Pro gebruikers.',
        [
          { text: 'Annuleren', style: 'cancel' },
          { text: 'Upgrade naar Pro', onPress: () => navigation.navigate('Paywall') },
        ]
      );
      return;
    }

    const permission = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Geen toegang', 'Geef toestemming voor camera/galerij in uw instellingen.');
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ base64: true, quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.8 });

    if (!result.canceled) {
      setImage(result.assets[0]);
      setResult(null);
      analyzeImage(result.assets[0]);
    }
  };

  const analyzeImage = async (imageAsset) => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: imageAsset.mimeType || 'image/jpeg',
                    data: imageAsset.base64,
                  },
                },
                {
                  type: 'text',
                  text: 'Analyseer dit bonnetje of factuur en geef het resultaat als JSON met deze velden: type ("scan_result"), amount, date, vendor, category, deductible_pct, deductible_amount, vat, notes. Geef ALLEEN de JSON terug, niets anders.',
                },
              ],
            },
          ],
        }),
      });

      const data = await response.json();
      const text = data.content?.filter(b => b.type === 'text').map(b => b.text).join('') || '';

      try {
        const clean = text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(clean);
        setResult(parsed);
      } catch (e) {
        setResult({ raw: text });
      }
    } catch (err) {
      Alert.alert('Fout', 'Scan mislukt: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveToArchive = async () => {
    if (!result) return;
    const user = await getUserData();
    await saveFavorite({
      id: `scan_${Date.now()}`,
      date: new Date().toISOString(),
      type: 'scan',
      question: `Scan: ${result.vendor || 'Onbekend'} - ${result.amount || ''}`,
      answer: JSON.stringify(result),
      imageUri: image?.uri,
    });
    Alert.alert('✓', 'Opgeslagen in bonnetjes archief');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Document Scanner</Text>
        <View style={styles.proBadge}>
          <Text style={styles.proBadgeText}>⭐ Pro</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.preview} />
        ) : (
          <View style={styles.viewfinder}>
            <Text style={styles.vfIcon}>📄</Text>
            <Text style={styles.vfHint}>Scan een bonnetje of factuur</Text>
          </View>
        )}

        <View style={styles.uploadRow}>
          <TouchableOpacity style={[styles.uploadBtn, styles.uploadBtnPrimary]} onPress={() => pickImage(true)}>
            <Text style={styles.uploadIcon}>📸</Text>
            <Text style={styles.uploadLabel}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.uploadBtn} onPress={() => pickImage(false)}>
            <Text style={styles.uploadIcon}>🖼</Text>
            <Text style={styles.uploadLabel}>Galerij</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingCard}>
            <ActivityIndicator color="#154273" />
            <Text style={styles.loadingText}>Taxly analyseert uw document...</Text>
          </View>
        )}

        {result && !loading && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View style={styles.resultCheck}>
                <Text style={styles.resultCheckText}>✓</Text>
              </View>
              <View>
                <Text style={styles.resultTitle}>
                  {result.vendor || 'Document herkend'}
                </Text>
                <Text style={styles.resultSub}>{result.date || ''}</Text>
              </View>
            </View>

            {result.raw ? (
              <Text style={styles.rawText}>{result.raw}</Text>
            ) : (
              <View style={styles.resultRows}>
                {result.amount && (
                  <View style={styles.resultRow}>
                    <Text style={styles.resultKey}>Bedrag</Text>
                    <Text style={styles.resultVal}>€ {result.amount}</Text>
                  </View>
                )}
                {result.category && (
                  <View style={styles.resultRow}>
                    <Text style={styles.resultKey}>Categorie</Text>
                    <Text style={[styles.resultVal, styles.resultValBlue]}>{result.category}</Text>
                  </View>
                )}
                {result.deductible_pct !== undefined && (
                  <View style={styles.resultRow}>
                    <Text style={styles.resultKey}>Aftrekbaar</Text>
                    <Text style={[styles.resultVal, styles.resultValGreen]}>
                      ✓ {result.deductible_pct}% · € {result.deductible_amount}
                    </Text>
                  </View>
                )}
                {result.vat && (
                  <View style={styles.resultRow}>
                    <Text style={styles.resultKey}>BTW terug</Text>
                    <Text style={[styles.resultVal, styles.resultValGreen]}>€ {result.vat}</Text>
                  </View>
                )}
                {result.notes && (
                  <View style={styles.resultRow}>
                    <Text style={styles.resultKey}>Notitie</Text>
                    <Text style={styles.resultVal}>{result.notes}</Text>
                  </View>
                )}
              </View>
            )}

            <TouchableOpacity style={styles.saveBtn} onPress={saveToArchive}>
              <Text style={styles.saveBtnText}>📁 Opslaan in archief</Text>
            </TouchableOpacity>
          </View>
        )}
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
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#154273' },
  proBadge: {
    backgroundColor: '#154273', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  proBadgeText: { fontSize: 10, fontWeight: '800', color: 'white' },
  container: { padding: 16, gap: 12 },
  viewfinder: {
    backgroundColor: '#154273', borderRadius: 16,
    height: 200, alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  vfIcon: { fontSize: 40, opacity: 0.4 },
  vfHint: { fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 },
  preview: { width: '100%', height: 200, borderRadius: 16, resizeMode: 'cover' },
  uploadRow: { flexDirection: 'row', gap: 10 },
  uploadBtn: {
    flex: 1, backgroundColor: 'white',
    borderWidth: 1.5, borderColor: '#dde3ed',
    borderRadius: 12, padding: 14,
    alignItems: 'center', gap: 4,
  },
  uploadBtnPrimary: { borderColor: '#154273', backgroundColor: 'rgba(21,66,115,0.04)' },
  uploadIcon: { fontSize: 22 },
  uploadLabel: { fontSize: 12, fontWeight: '600', color: '#2c3e50' },
  loadingCard: {
    backgroundColor: 'white', borderRadius: 14,
    padding: 20, alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: '#dde3ed',
  },
  loadingText: { fontSize: 13, color: '#7a8fa8' },
  resultCard: {
    backgroundColor: 'white', borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1, borderColor: '#dde3ed',
    shadowColor: '#154273', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  resultHeader: {
    backgroundColor: '#154273', padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  resultCheck: {
    width: 28, height: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 50, alignItems: 'center', justifyContent: 'center',
  },
  resultCheckText: { color: 'white', fontWeight: '700' },
  resultTitle: { fontSize: 14, fontWeight: '700', color: 'white' },
  resultSub: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  resultRows: { padding: 12, gap: 8 },
  resultRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 10,
    backgroundColor: '#EEF2F7', borderRadius: 8,
    borderWidth: 1, borderColor: '#dde3ed',
  },
  resultKey: { fontSize: 12, color: '#7a8fa8' },
  resultVal: { fontSize: 12, fontWeight: '700', color: '#2c3e50' },
  resultValBlue: { color: '#154273' },
  resultValGreen: { color: '#16a34a' },
  rawText: { padding: 14, fontSize: 13, color: '#2c3e50', lineHeight: 20 },
  saveBtn: {
    backgroundColor: '#EEF2F7', margin: 12,
    borderRadius: 10, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: '#dde3ed',
  },
  saveBtnText: { fontSize: 13, fontWeight: '700', color: '#154273' },
});
