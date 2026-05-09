import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getHistory, deleteConversation, getUserData } from '../utils/storage';
import { t } from '../constants/translations';

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [lang, setLang] = useState('nl');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const user = await getUserData();
    setLang(user?.language || 'nl');
    const h = await getHistory();
    setHistory(h);
  };

  const handleDelete = (id) => {
    Alert.alert('Verwijderen', 'Dit gesprek verwijderen?', [
      { text: 'Annuleren', style: 'cancel' },
      { text: 'Verwijderen', style: 'destructive', onPress: async () => {
        await deleteConversation(id);
        setHistory(prev => prev.filter(c => c.id !== id));
      }},
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Chat', { loadConversation: item })}
    >
      <View style={styles.cardTop}>
        <Text style={styles.cardDate}>{new Date(item.date).toLocaleDateString('nl-NL')}</Text>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
          <Text style={styles.deleteText}>✕</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.cardPreview} numberOfLines={2}>{item.preview}</Text>
      <Text style={styles.cardCount}>{item.messages?.length || 0} berichten</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t(lang, 'history')}</Text>
        <View style={{ width: 34 }} />
      </View>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>{t(lang, 'no_history')}</Text>
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
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardDate: { fontSize: 11, color: '#7a8fa8', fontWeight: '600' },
  deleteBtn: { padding: 2 },
  deleteText: { color: '#a0aec0', fontSize: 14 },
  cardPreview: { fontSize: 14, color: '#2c3e50', lineHeight: 20, marginBottom: 6 },
  cardCount: { fontSize: 11, color: '#a0aec0' },
  emptyText: { textAlign: 'center', color: '#a0aec0', marginTop: 60, fontSize: 14 },
});
