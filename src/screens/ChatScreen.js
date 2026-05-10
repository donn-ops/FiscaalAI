import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert, TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SYSTEM_PROMPT } from '../constants/prompts';
import { t } from '../constants/translations';
import { saveConversation, saveFavorite, getUserData, getTaxProfile } from '../utils/storage';
import { exportToPDF } from '../utils/pdf';
import { Colors, Radii, Shadows } from '../constants/theme';

const API_URL = 'https://fiscaal-ai.vercel.app/api/chat';

export default function ChatScreen({ navigation, route }) {
  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [userData,  setUserData]  = useState(null);
  const [taxProfile,setTaxProfile]= useState(null);
  const [inputFocus,setInputFocus]= useState(false);
  const listRef = useRef(null);
  const conversationId = useRef(`conv_${Date.now()}`);

  useEffect(() => { loadUserData(); }, []);

  const loadUserData = async () => {
    const user    = await getUserData();
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

  const lang     = userData?.language || 'nl';
  const userName = userData?.name || null;

  const buildSystemPrompt = () => {
    let prompt = SYSTEM_PROMPT;
    if (userName) prompt += `\n\nDe naam van de gebruiker is ${userName}.`;
    if (taxProfile) prompt += `\n\nBelastingprofiel: ${taxProfile.situation}, eigen woning: ${taxProfile.ownHome?'ja':'nee'}, partner: ${taxProfile.hasPartner?'ja':'nee'}, kinderen: ${taxProfile.hasKids?'ja':'nee'}.`;
    return prompt;
  };

  const sendMessage = async (text, user = userData, profile = taxProfile) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput('');
    const newMessages = [...messages, { role:'user', content:userText }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ messages:newMessages, system:buildSystemPrompt() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'API fout');
      const assistantText =
        data.content?.filter(b=>b.type==='text').map(b=>b.text).join('\n') ||
        data.message || data.text || data.response ||
        data.choices?.[0]?.message?.content || null;
      if (!assistantText) throw new Error(t(lang,'no_answer'));
      const finalMessages = [...newMessages, { role:'assistant', content:assistantText }];
      setMessages(finalMessages);
      await saveConversation({ id:conversationId.current, date:new Date().toISOString(), preview:userText, messages:finalMessages });
    } catch (err) {
      Alert.alert(t(lang,'error'), t(lang,'error_msg') + err.message);
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  };

  const handleLongPress = (item, index) => {
    if (item.role !== 'assistant') return;
    Alert.alert('Taxly Advies', 'Wat wilt u doen?', [
      { text:'⭐ Opslaan als favoriet', onPress: async () => {
        const userMsg = messages[index-1];
        await saveFavorite({ id:`fav_${Date.now()}`, date:new Date().toISOString(), question:userMsg?.content||'', answer:item.content });
        Alert.alert('✓', t(lang,'save_favorite'));
      }},
      { text:'📄 Exporteer als PDF', onPress:() => exportToPDF(messages, userName) },
      { text:'Annuleren', style:'cancel' },
    ]);
  };

  const renderMessage = ({ item, index }) => (
    <TouchableWithoutFeedback onLongPress={() => handleLongPress(item, index)}>
      <View style={item.role==='user' ? s.msgUserWrap : s.msgAiWrap}>
        {item.role==='assistant' && (
          <View style={s.aiDot} />
        )}
        <View style={item.role==='user' ? s.msgUser : s.msgAi}>
          <Text style={item.role==='user' ? s.msgUserText : s.msgAiText}>{item.content}</Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );

  const SUGGESTIONS = [
    'Hoeveel belasting betaal ik dit jaar?',
    'Wat is mijn hypotheekaftrek?',
    'Hoe werkt box 3?',
    'Welke toeslagen kom ik voor in aanmerking?',
  ];

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <View style={s.headerOrb} />
          <Text style={s.headerTitle}>Taxly AI</Text>
        </View>
        <View style={{ width:40 }} />
      </View>

      <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS==='ios'?'padding':undefined} keyboardVerticalOffset={0}>
        {/* Messages */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(_,i)=>i.toString()}
          renderItem={renderMessage}
          contentContainerStyle={[s.list, messages.length===0&&s.listEmpty]}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated:true })}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.emptyState}>
              <View style={s.emptyOrb} />
              <Text style={s.emptyTitle}>Waarmee kan ik helpen?</Text>
              <Text style={s.emptySub}>Stel een vraag over uw belastingen, toeslagen of financiën.</Text>
              <View style={s.suggestions}>
                {SUGGESTIONS.map(sug => (
                  <TouchableOpacity key={sug} style={s.suggestionBtn} onPress={() => sendMessage(sug)} activeOpacity={0.75}>
                    <Text style={s.suggestionText}>{sug}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          }
          ListFooterComponent={loading ? (
            <View style={s.msgAiWrap}>
              <View style={s.aiDot} />
              <View style={s.msgAi}>
                <View style={s.typingDots}>
                  {[0,1,2].map(i=><View key={i} style={[s.dot, {opacity:0.4+i*0.2}]} />)}
                </View>
              </View>
            </View>
          ) : null}
        />

        {/* Input bar */}
        <View style={s.inputBar}>
          <View style={[s.inputRow, inputFocus&&s.inputRowFocus]}>
            <TextInput
              style={s.input}
              value={input}
              onChangeText={setInput}
              placeholder={t(lang,'ask_question')||'Stel een vraag…'}
              placeholderTextColor={Colors.bluePale}
              multiline
              maxLength={1000}
              returnKeyType="default"
              onFocus={()=>setInputFocus(true)}
              onBlur={()=>setInputFocus(false)}
            />
            <TouchableOpacity
              style={[s.sendBtn, (!input.trim()||loading)&&s.sendBtnDisabled]}
              onPress={() => sendMessage()}
              disabled={!input.trim()||loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator size="small" color="white" />
                : <Text style={s.sendBtnText}>↑</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex:1, backgroundColor:Colors.pageBg },
  header: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:20, paddingVertical:13, borderBottomWidth:1, borderBottomColor:'rgba(255,255,255,0.65)', backgroundColor:'rgba(219,234,254,0.97)' },
  backBtn:{ width:40, height:36, borderRadius:999, backgroundColor:'rgba(255,255,255,0.65)', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.9)' },
  backText:{ fontSize:18, color:Colors.blueDeep, fontWeight:'600' },
  headerCenter:{ flexDirection:'row', alignItems:'center', gap:8 },
  headerOrb:{ width:24, height:24, borderRadius:12, backgroundColor:Colors.blueDeep, shadowColor:Colors.blueDeep, shadowOpacity:0.4, shadowRadius:8, elevation:4 },
  headerTitle:{ fontSize:15, fontWeight:'700', color:Colors.textPrimary },

  list:      { padding:20, gap:12, flexGrow:1 },
  listEmpty: { flex:1, justifyContent:'flex-start' },

  emptyState: { alignItems:'center', paddingTop:20, gap:10 },
  emptyOrb:   { width:72, height:72, borderRadius:36, backgroundColor:Colors.blueDeep, shadowColor:Colors.blueDeep, shadowOpacity:0.3, shadowRadius:20, elevation:8, borderWidth:2, borderColor:'rgba(255,255,255,0.65)', marginBottom:4 },
  emptyTitle: { fontSize:20, fontWeight:'300', color:Colors.textPrimary, letterSpacing:-0.5 },
  emptySub:   { fontSize:13, color:Colors.textMuted, textAlign:'center', lineHeight:20, maxWidth:240 },
  suggestions:{ width:'100%', gap:8, marginTop:8 },
  suggestionBtn: { backgroundColor:'rgba(255,255,255,0.65)', borderRadius:999, paddingVertical:11, paddingHorizontal:18, borderWidth:1, borderColor:'rgba(255,255,255,0.9)', shadowColor:Colors.blueDeep, shadowOpacity:0.07, shadowRadius:6, elevation:1 },
  suggestionText:{ fontSize:13, color:Colors.blueDeep, fontWeight:'500' },

  msgUserWrap: { flexDirection:'row', justifyContent:'flex-end', marginBottom:4 },
  msgAiWrap:   { flexDirection:'row', alignItems:'flex-end', gap:8, marginBottom:4 },
  aiDot: { width:26, height:26, borderRadius:13, backgroundColor:Colors.blueDeep, flexShrink:0, shadowColor:Colors.blueDeep, shadowOpacity:0.35, shadowRadius:8, elevation:4 },
  msgUser: { backgroundColor:Colors.blueDeep, borderRadius:22, borderBottomRightRadius:6, paddingVertical:11, paddingHorizontal:15, maxWidth:'78%', shadowColor:Colors.blueDeep, shadowOpacity:0.3, shadowRadius:12, elevation:4 },
  msgUserText: { color:'white', fontSize:13, lineHeight:20 },
  msgAi:  { backgroundColor:'rgba(255,255,255,0.82)', borderRadius:22, borderBottomLeftRadius:6, paddingVertical:11, paddingHorizontal:15, maxWidth:'78%', borderWidth:1, borderColor:'rgba(255,255,255,0.9)', shadowColor:Colors.blueDeep, shadowOpacity:0.08, shadowRadius:10, elevation:2 },
  msgAiText: { color:Colors.textPrimary, fontSize:13, lineHeight:20 },

  typingDots: { flexDirection:'row', gap:5, paddingVertical:4 },
  dot: { width:7, height:7, borderRadius:999, backgroundColor:Colors.blueLight },

  inputBar: { paddingHorizontal:16, paddingVertical:10, paddingBottom: Platform.OS==='ios'?20:12, backgroundColor:'rgba(219,234,254,0.97)', borderTopWidth:1, borderTopColor:'rgba(255,255,255,0.65)' },
  inputRow: { flexDirection:'row', alignItems:'flex-end', gap:8, backgroundColor:'rgba(255,255,255,0.65)', borderRadius:999, borderWidth:1, borderColor:'rgba(255,255,255,0.9)', paddingLeft:18, paddingRight:5, paddingVertical:5, shadowColor:Colors.blueDeep, shadowOpacity:0.08, shadowRadius:8, elevation:2 },
  inputRowFocus: { borderColor:'rgba(59,130,246,0.35)', backgroundColor:'rgba(255,255,255,0.85)' },
  input: { flex:1, fontSize:14, color:Colors.textPrimary, paddingVertical:9, maxHeight:100 },
  sendBtn: { width:40, height:40, borderRadius:20, backgroundColor:Colors.blueDeep, alignItems:'center', justifyContent:'center', shadowColor:Colors.blueDeep, shadowOpacity:0.4, shadowRadius:10, elevation:5 },
  sendBtnDisabled: { backgroundColor:'rgba(147,197,253,0.3)', shadowOpacity:0 },
  sendBtnText:{ color:'white', fontSize:18, fontWeight:'700' },
});
