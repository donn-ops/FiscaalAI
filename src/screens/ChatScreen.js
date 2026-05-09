import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert, TouchableWithoutFeedback
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SYSTEM_PROMPT } from '../constants/prompts';
import { t } from '../constants/translations';
import { saveConversation, saveFavorite, getUserData, getTaxProfile } from '../utils/storage';
import { exportToPDF } from '../utils/pdf';

const API_URL = 'https://fiscaal-ai.vercel.app/api/chat';

export default function ChatScreen({ navigation, route }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [userData, setUserData] = useState(null);
  const [taxProfile, setTaxProfile] = useState(null);
  const listRef = useRef(null);
  const conversationId = useRef(`conv_${Date.now()}`);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const user = await getUserData();
    const profile = await getTaxProfile();
    setUserData(user);
    setTaxProfile(profile);

    if (route.params?.loadConversation) {
      setMessages(route.params.loadConversation.messages || []);
    } else {
      const initial = route.params?.initialQuestion;
      if (initial) sendMessage(initial, user, profile);
    }
  };

  const lang = userData?.language || 'nl';
  const userName = userData?.name || null;

  const buildSystemPrompt = () => {
    let prompt = SYSTEM_PROMPT;
    if (userName) prompt += `\n\nDe naam van de gebruiker is ${userName}.`;
    if (taxProfile) {
      prompt += `\n\nBelastingprofiel: ${taxProfile.situation}, eigen woning: ${taxProfile.ownHome ? 'ja' : 'nee'}, fiscaal partner: ${taxProfile.hasPartner ? 'ja' : 'nee'}, kinderen: ${taxProfile.hasKids ? 'ja' : 'nee'}.`;
    }
    return prompt;
  };

  const sendMessage = async (text, user = userData, profile = taxProfile) => {
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
        body: JSON.stringify({ messages: newMessages, system: buildSystemPrompt() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'API fout');
      const assistantText =
        data.content?.filter(b => b.type === 'text').map(b => b.text).join('\n') ||
        data.message || data.text || data.response ||
        data.choices?.[0]?.message?.content || null;
      if (!assistantText) throw new Error(t(lang, 'no_answer'));
      const finalMessages = [...newMessages, { role: 'assistant', content: assistantText }];
      setMessages(finalMessages);

      // Auto-save conversation
      await saveConversation({
        id: conversationId.current,
        date: new Date().toISOString(),
        preview: userText,
        messages: finalMessages,
      });
    } catch (err) {
      Alert.alert(t(lang, 'error'), t(lang, 'error_msg') + err.message);
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  };

  const handleLongPress = (item, index) => {
    if (item.role !== 'assistant') return;
    setSelectedMsg(index);
    Alert.alert('Taxly Advies', 'Wat wilt u doen?', [
      {
        text: '⭐ Opslaan als favoriet',
        onPress: async () => {
          const userMsg = messages[index - 1];
          await saveFavorite({
            id: `fav_${Date.now()}`,
            date: new Date().toISOString(),
            question: userMsg?.content || '',
            answer: item.content,
          });
          Alert.alert('✓', t(lang, 'save_favorite'));
        },
      },
      {
        text: '📄 Exporteer als PDF',
        onPress: () => exportToPDF(messages, userName),
      },
      { text: 'Annuleren', style: 'cancel' },
    ]);
    setSelectedMsg(null);
  };

  const renderMessage = ({ item, index }) => (
    <TouchableWithoutFeedback onLongPress={() => handleLongPress(item, index)}>
      <View style={[styles.msgRow, item.role === 'user' ? styles.msgRight : styles.msgLeft]}>
        {item.role === 'assistant' && <Text style={styles.aiLabel}>Taxly</Text>}
        <View style={[styles.bubble, item.role === 'user' ? styles.bubbleUser : styles.bubbleAI]}>
          <Text style={[styles.bubbleText, item.role === 'user' && styles.bubbleTextUser]}>
            {item.content}
          </Text>
        </View>
        {item.role === 'assistant' && (
          <Text style={styles.longPressHint}>Houd vast om op te slaan of te exporteren</Text>
        )}
      </View>
    </TouchableWithoutFeedback>
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
                {userName ? `${userName}` : t(lang, 'tax_profile')}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => exportToPDF(messages, userName)} style={styles.pdfBtn}>
            <Text style={styles.pdfText}>PDF</Text>
          </TouchableOpacity>
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
              {userName ? `${t(lang, 'greeting_afternoon')} ${userName}, ${t(lang, 'empty_chat')}` : t(lang, 'empty_chat')}
            </Text>
          }
          ListFooterComponent={loading ? (
            <View style={styles.typingRow}>
              <ActivityIndicator size="small" color="#154273" />
              <Text style={styles.typingText}>{t(lang, 'searching')}</Text>
            </View>
          ) : null}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={t(lang, 'ask_question')}
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
        <Text style={styles.footerDisclaimer}>{t(lang, 'disclaimer')}</Text>
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
    backgroundColor: '#154273', alignItems: 'center', justifyContent: 'center',
  },
  headerIconText: { fontSize: 16, fontWeight: '800', color: 'white' },
  headerTitle: { color: '#154273', fontSize: 15, fontWeight: '700' },
  headerSub: { color: '#7a8fa8', fontSize: 10 },
  pdfBtn: {
    backgroundColor: '#EEF2F7', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1, borderColor: '#dde3ed',
  },
  pdfText: { color: '#154273', fontSize: 11, fontWeight: '700' },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2ecc71' },
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
  longPressHint: { fontSize: 9, color: '#c0cad5', marginTop: 3, marginLeft: 2 },
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
