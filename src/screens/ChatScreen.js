import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SYSTEM_PROMPT } from '../constants/prompts';

const API_URL = 'https://fiscaal-ai.vercel.app/api/chat';

export default function ChatScreen({ navigation, route }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);
  const userData = route.params?.userData || null;
  const userName = userData?.name || null;

  useEffect(() => {
    const initial = route.params?.initialQuestion;
    if (initial) sendMessage(initial);
  }, []);

  const buildSystemPrompt = () => {
    let prompt = SYSTEM_PROMPT;
    if (userName) {
      prompt += `\n\nDe naam van de gebruiker is ${userName}. Gebruik deze naam natuurlijk in je antwoorden.`;
    }
    return prompt;
  };

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
        body: JSON.stringify({
          messages: newMessages,
          system: buildSystemPrompt(),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'API fout');
      const assistantText =
        data.content?.filter(b => b.type === 'text').map(b => b.text).join('\n') ||
        data.message || data.text || data.response ||
        data.choices?.[0]?.message?.content || null;
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
      {item.role === 'assistant' && <Text style={styles.aiLabel}>Taxly</Text>}
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
          <View style={styles.headerCenter}>
            <View style={styles.headerIcon}>
              <Text style={styles.headerIconText}>T</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>Taxly</Text>
              <Text style={styles.headerSub}>
                {userName ? `Spreekt u aan als "${userName}"` : 'Belastingadvies'}
              </Text>
            </View>
          </View>
          <View style={styles.onlineDot} />
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(_, i) => String(i)}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {userName ? `Goedendag ${userName}, stel uw belastingvraag hieronder.` : 'Stel uw belastingvraag hieronder...'}
            </Text>
          }
          ListFooterComponent={loading ? (
            <View style={styles.typingRow}>
              <ActivityIndicator size="small" color="#154273" />
              <Text style={styles.typingText}>Taxly zoekt op...</Text>
            </View>
          ) : null}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Stel uw vraag..."
            placeholderTextColor="#a0aec0"
            multiline maxLength={500}
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
  safe: { flex: 1, backgroundColor: '#EEF2F7' },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#dde3ed',
    shadowColor: '#154273', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  backBtn: { marginRight: 10, padding: 4 },
  backText: { color: '#154273', fontSize: 22, fontWeight: '600' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIcon: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: '#154273',
    alignItems: 'center', justifyContent: 'center',
  },
  headerIconText: { fontSize: 16, fontWeight: '800', color: 'white' },
  headerTitle: { color: '#154273', fontSize: 15, fontWeight: '700' },
  headerSub: { color: '#7a8fa8', fontSize: 10 },
  onlineDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#2ecc71',
    shadowColor: '#2ecc71', shadowOpacity: 0.4, shadowRadius: 4,
  },
  messageList: { padding: 16, paddingBottom: 8 },
  emptyText: { color: '#a0aec0', textAlign: 'center', marginTop: 60, fontSize: 14, paddingHorizontal: 20 },
  msgRow: { marginBottom: 16 },
  msgRight: { alignItems: 'flex-end' },
  msgLeft: { alignItems: 'flex-start' },
  aiLabel: { color: '#154273', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase' },
  bubble: { maxWidth: '85%', borderRadius: 4, padding: 14 },
  bubbleUser: {
    backgroundColor: '#154273', borderRadius: 12, borderBottomRightRadius: 4,
    shadowColor: '#154273', shadowOpacity: 0.2, shadowRadius: 8, elevation: 3,
  },
  bubbleAI: {
    backgroundColor: 'white', borderRadius: 4, borderBottomLeftRadius: 12,
    borderWidth: 1, borderColor: '#dde3ed',
    shadowColor: '#154273', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  bubbleText: { color: '#2c3e50', fontSize: 14, lineHeight: 21 },
  bubbleTextUser: { color: 'white' },
  typingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12,
    backgroundColor: 'white', borderRadius: 12, marginBottom: 8,
    borderWidth: 1, borderColor: '#dde3ed', alignSelf: 'flex-start',
  },
  typingText: { color: '#7a8fa8', fontSize: 13 },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', padding: 12,
    borderTopWidth: 1, borderTopColor: '#dde3ed', backgroundColor: 'white', gap: 8,
  },
  input: {
    flex: 1, backgroundColor: '#EEF2F7', borderWidth: 1, borderColor: '#dde3ed',
    borderRadius: 20, padding: 12, color: '#2c3e50', fontSize: 14, maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: '#154273', borderRadius: 50,
    width: 46, height: 46, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#154273', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  sendBtnDisabled: { backgroundColor: '#cdd5e0' },
  sendIcon: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  footerDisclaimer: {
    color: '#a0aec0', fontSize: 10, textAlign: 'center',
    paddingBottom: 8, paddingHorizontal: 16, backgroundColor: 'white',
  },
});
