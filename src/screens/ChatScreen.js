import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, SafeAreaView, KeyboardAvoidingView,
  Platform, ActivityIndicator, Alert
} from 'react-native';

const API_URL = 'https://fiscaal-ai.vercel.app/api/chat';

export default function ChatScreen({ navigation, route }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    const initial = route.params?.initialQuestion;
    if (initial) sendMessage(initial);
  }, []);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await response.json();
      console.log('API response:', JSON.stringify(data));
      if (!response.ok) throw new Error(data.error?.message || 'API fout');

      // Ondersteun meerdere response-formaten (Claude, OpenAI, custom)
      const assistantText =
        data.content?.filter(b => b.type === 'text').map(b => b.text).join('\n') ||
        data.message ||
        data.text ||
        data.response ||
        data.choices?.[0]?.message?.content ||
        null;

      if (!assistantText) throw new Error('Geen antwoord ontvangen');
      setMessages([...newMessages, { role: 'assistant', content: assistantText }]);
    } catch (err) {
      Alert.alert('Fout', 'Er ging iets mis: ' + err.message);
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item, index }) => (
    <View key={index} style={[styles.msgRow, item.role === 'user' ? styles.msgRight : styles.msgLeft]}>
      {item.role === 'assistant' && <Text style={styles.aiLabel}>⚖ FiscaalAI</Text>}
      <View style={[styles.bubble, item.role === 'user' ? styles.bubbleUser : styles.bubbleAI]}>
        <Text style={[styles.bubbleText, item.role === 'user' && styles.bubbleTextUser]}>
          {item.content}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>⚖ FiscaalAI</Text>
          <View style={styles.onlineDot} />
        </View>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(_, i) => String(i)}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={<Text style={styles.emptyText}>Stel uw belastingvraag hieronder...</Text>}
          ListFooterComponent={loading ? (
            <View style={styles.typingRow}>
              <ActivityIndicator size="small" color="#ffd700" />
              <Text style={styles.typingText}>FiscaalAI zoekt op...</Text>
            </View>
          ) : null}
        />
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Stel uw vraag..."
            placeholderTextColor="#5a4a3a"
            multiline
            maxLength={500}
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            <Text style={styles.sendIcon}>→</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.footerDisclaimer}>
          Informatief advies — geen vervanging voor een gecertificeerde belastingadviseur
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0a1628' },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,165,0,0.15)',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backBtn: { marginRight: 12, padding: 4 },
  backText: { color: '#ffd700', fontSize: 22 },
  headerTitle: { flex: 1, color: '#ffd700', fontSize: 17, fontWeight: 'bold' },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4a8' },
  messageList: { padding: 16, paddingBottom: 8 },
  emptyText: { color: '#5a4a3a', textAlign: 'center', marginTop: 60, fontSize: 14 },
  msgRow: { marginBottom: 16 },
  msgRight: { alignItems: 'flex-end' },
  msgLeft: { alignItems: 'flex-start' },
  aiLabel: { color: '#a08060', fontSize: 11, letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase' },
  bubble: { maxWidth: '85%', borderRadius: 16, padding: 14 },
  bubbleUser: { backgroundColor: '#ff8c00', borderBottomRightRadius: 4 },
  bubbleAI: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,165,0,0.15)', borderBottomLeftRadius: 4,
  },
  bubbleText: { color: '#e8dcc8', fontSize: 14, lineHeight: 21 },
  bubbleTextUser: { color: '#fff' },
  typingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8 },
  typingText: { color: '#a08060', fontSize: 13 },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', padding: 12,
    borderTopWidth: 1, borderTopColor: 'rgba(255,165,0,0.15)',
    backgroundColor: 'rgba(0,0,0,0.4)', gap: 8,
  },
  input: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,165,0,0.25)',
    borderRadius: 12, padding: 12, color: '#e8dcc8', fontSize: 14, maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: '#ff8c00', borderRadius: 12,
    width: 46, height: 46, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: 'rgba(255,140,0,0.15)' },
  sendIcon: { color: '#0a1628', fontSize: 20, fontWeight: 'bold' },
  footerDisclaimer: {
    color: '#3a2a1a', fontSize: 10, textAlign: 'center',
    paddingBottom: 8, paddingHorizontal: 16, backgroundColor: 'rgba(0,0,0,0.4)',
  },
});
