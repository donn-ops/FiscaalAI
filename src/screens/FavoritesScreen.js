import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFavorites, deleteFavorite, getUserData } from '../utils/storage';
import { t } from '../constants/translations';
import * as Sharing from 'expo-sharing';

export default function FavoritesScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);
  const [lang, setLang] = useState('nl');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const user = await getUserData();
    setLang(user?.language || 'nl');
    const f = await getFavorites();
    setFavorites(f);
  };

  const handleDelete = (id) => {
    Alert.alert('Verwijderen', 'Dit favoriet verwijderen?', [
      { text: 'Annuleren', style: 'cancel' },
      { text: 'Verwijderen', style: 'destructive', onPress: async () => {
        await deleteFavorite(id);
        setFavorites(prev => prev.filter(f => f.id !== id));
      }},
    ]);
  };

  const handleShare = async (item) => {
    try {
      await Sharing.shareAsync(
        `data:text/plain;base64,${btoa(unescape(encodeURIComponent(`Taxly Advies:\n\nVraag: ${item.question}\n\nAntwoord: ${item.answer}`)))}`,
        { mimeType: 'text/plain', dialogTitle: 'Taxly Advies Delen' }
      );
    } catch (e) {
      Alert.alert('Fout', 'Delen mislukt');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.cardDate}>{new Date(item.date).toLocaleDateString('nl-NL')}</Text>
        <View style={styles.cardActions}>
          <TouchableOpacity onPress={() => handleShare(item)} style={styles.actionBtn}>
            <Text style={styles.shareText}>↗</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
            <Text style={styles.deleteText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.questionRow}>
        <Text style={styles.questionLabel}>Vraag</Text>
        <Text style={styles.questionText}>{item.question}</Text>
      </View>
      <View style={styles.answerRow}>
        <Text style={styles.answerLabel}>Taxly</Text>
        <Text style={styles.answerText} numberOfLines={4}>{item.answer}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t(lang, 'favorites')}</Text>
        <View style={{ width: 34 }} />
      </View>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>{t(lang, 'no_favorites')}</Text>
        }
      />
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
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: 'white', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#dde3ed',
    shadowColor: '#154273', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  cardDate: { fontSize: 11, color: '#7a8fa8', fontWeight: '600' },
  cardActions: { flexDirection: 'row', gap: 10 },
  actionBtn: { padding: 2 },
  shareText: { color: '#154273', fontSize: 16, fontWeight: '700' },
  deleteText: { color: '#a0aec0', fontSize: 14 },
  questionRow: { marginBottom: 10 },
  questionLabel: { fontSize: 10, color: '#154273', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  questionText: { fontSize: 13, color: '#2c3e50', fontWeight: '500' },
  answerRow: {},
  answerLabel: { fontSize: 10, color: '#7a8fa8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  answerText: { fontSize: 13, color: '#4a5568', lineHeight: 19 },
  emptyText: { textAlign: 'center', color: '#a0aec0', marginTop: 60, fontSize: 14 },
});
