
const C = {
  pageBg:'#dbeafe',surface:'rgba(255,255,255,0.65)',surfaceHi:'rgba(255,255,255,0.85)',
  blue:'#1d4ed8',blueDeep:'#1e40af',blueMid:'#2563eb',blueLight:'#60a5fa',bluePale:'#93c5fd',
  text:'#0f172a',textMid:'#334155',textMuted:'#64748b',textLight:'#94a3b8',
  green:'#10b981',greenText:'#065f46',amber:'#f59e0b',red:'#ef4444',
  border:'rgba(255,255,255,0.9)',white:'#ffffff',
};
const sh=(op=0.08,r=8)=>({shadowColor:'#1d4ed8',shadowOpacity:op,shadowRadius:r,shadowOffset:{width:0,height:2},elevation:Math.round(r/3)});

import React,{useState,useRef,useEffect} from 'react';
import {View,Text,TextInput,TouchableOpacity,FlatList,StyleSheet,KeyboardAvoidingView,Platform,ActivityIndicator,Alert,TouchableWithoutFeedback,Modal} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg,{Defs,RadialGradient,Stop,Circle} from 'react-native-svg';
import {SYSTEM_PROMPT} from '../constants/prompts';
import {saveConversation,saveFavorite,getUserData,getTaxProfile} from '../utils/storage';
import {exportToPDF} from '../utils/pdf';

const API_URL='https://fiscaal-ai.vercel.app/api/chat';

const SUGGESTIONS=[
  'Hoeveel belasting betaal ik dit jaar?',
  'Wat is mijn hypotheekaftrek?',
  'Hoe werkt box 3?',
  'Welke toeslagen heb ik recht op?',
];

// Strip sensitive info before sending to API (AVG)
const stripSensitiveData=(text)=>{
  return text
    .replace(/\b\d{9}\b/g,'[BSN]')
    .replace(/\bNL\d{2}[A-Z]{4}\d{10}\b/gi,'[IBAN]')
    .replace(/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g,'[KAARTNR]');
};

const ORB_SMALL=52;

function OrbSmall(){
  return(
    <Svg width={ORB_SMALL} height={ORB_SMALL} viewBox="0 0 52 52">
      <Defs>
        <RadialGradient id="orbS" cx="26" cy="26" r="26" gradientUnits="userSpaceOnUse">
          <Stop offset="0%"   stopColor="#ffffff" stopOpacity="0.95"/>
          <Stop offset="8%"   stopColor="#f0f7ff" stopOpacity="1"/>
          <Stop offset="18%"  stopColor="#dbeafe" stopOpacity="1"/>
          <Stop offset="30%"  stopColor="#bfdbfe" stopOpacity="1"/>
          <Stop offset="42%"  stopColor="#93c5fd" stopOpacity="1"/>
          <Stop offset="55%"  stopColor="#60a5fa" stopOpacity="1"/>
          <Stop offset="67%"  stopColor="#3b82f6" stopOpacity="1"/>
          <Stop offset="77%"  stopColor="#2563eb" stopOpacity="1"/>
          <Stop offset="86%"  stopColor="#1d4ed8" stopOpacity="1"/>
          <Stop offset="93%"  stopColor="#1e40af" stopOpacity="0.9"/>
          <Stop offset="97%"  stopColor="#2563eb" stopOpacity="0.55"/>
          <Stop offset="100%" stopColor="#93c5fd" stopOpacity="0.15"/>
        </RadialGradient>
        <RadialGradient id="shineS" cx="20" cy="17" r="16" gradientUnits="userSpaceOnUse">
          <Stop offset="0%"   stopColor="#ffffff" stopOpacity="0.9"/>
          <Stop offset="30%"  stopColor="#ffffff" stopOpacity="0.5"/>
          <Stop offset="65%"  stopColor="#dbeafe" stopOpacity="0.2"/>
          <Stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
        </RadialGradient>
      </Defs>
      <Circle cx="26" cy="26" r="26" fill="url(#orbS)"/>
      <Circle cx="26" cy="26" r="26" fill="url(#shineS)"/>
    </Svg>
  );
}

// AVG Privacy notice modal
function PrivacyNotice({visible,onAccept}){
  return(
    <Modal visible={visible} transparent animationType="fade">
      <View style={s.modalOverlay}>
        <View style={s.modalCard}>
          <Text style={s.modalTitle}>Privacy & AVG</Text>
          <Text style={s.modalBody}>
            Uw gesprekken worden verwerkt via een beveiligde AI-service om antwoorden te genereren. Wij slaan geen persoonlijke gegevens op onze servers op.{'\n\n'}
            Stuur nooit gevoelige gegevens zoals BSN, IBAN of wachtwoorden via de chat.{'\n\n'}
            Uw gesprekken worden alleen lokaal op uw apparaat opgeslagen.
          </Text>
          <TouchableOpacity style={s.modalBtn} onPress={onAccept} activeOpacity={0.85}>
            <Text style={s.modalBtnText}>Ik begrijp het</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function ChatScreen({navigation,route}){
  const [messages,setMessages]=useState([]);
  const [input,setInput]=useState('');
  const [loading,setLoading]=useState(false);
  const [userData,setUserData]=useState(null);
  const [taxProfile,setTaxProfile]=useState(null);
  const [focus,setFocus]=useState(false);
  const [showPrivacy,setShowPrivacy]=useState(false);
  const listRef=useRef(null);
  const convId=useRef(`conv_${Date.now()}`);
  const privacyShown=useRef(false);

  useEffect(()=>{loadUserData();},[]);

  const loadUserData=async()=>{
    const [user,profile]=await Promise.all([getUserData(),getTaxProfile()]);
    setUserData(user);setTaxProfile(profile);
    // Show privacy notice first time
    if(!privacyShown.current){
      setShowPrivacy(true);
      privacyShown.current=true;
    }
    if(route.params?.loadConversation){
      setMessages(route.params.loadConversation.messages||[]);
    } else {
      const q=route.params?.initialQuestion;
      if(q)sendMessage(q,user,profile);
    }
  };

  const buildSystem=(user,profile)=>{
    let p=SYSTEM_PROMPT||'Je bent Taxly, een Nederlandse financiele AI-assistent. Antwoord beknopt. Spreek gebruiker aan met u. Noem jezelf Taxly. Verwerk nooit gevoelige persoonsgegevens zoals BSN of IBAN.';
    if(user?.name)p+=`\n\nGebruikersnaam: ${user.name}.`;
    if(profile)p+=`\n\nProfiel: ${profile.situation}.`;
    p+='\n\nBelangrijk: Vraag nooit om BSN, IBAN, wachtwoorden of andere gevoelige gegevens.';
    return p;
  };

  const sendMessage=async(text,user=userData,profile=taxProfile)=>{
    const txt=text||input.trim();
    if(!txt||loading)return;
    // AVG: strip sensitive data before sending
    const safeTxt=stripSensitiveData(txt);
    setInput('');
    const newMsgs=[...messages,{role:'user',content:txt}];
    setMessages(newMsgs);
    setLoading(true);
    try{
      const apiMsgs=newMsgs.map(m=>({role:m.role,content:stripSensitiveData(m.content)}));
      const res=await fetch(API_URL,{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({messages:apiMsgs,system:buildSystem(user,profile)}),
      });
      const data=await res.json();
      if(!res.ok)throw new Error(data.error?.message||'API fout');
      const reply=data.content?.filter(b=>b.type==='text').map(b=>b.text).join('\n')||data.message||null;
      if(!reply)throw new Error('Geen antwoord');
      const final=[...newMsgs,{role:'assistant',content:reply}];
      setMessages(final);
      await saveConversation({id:convId.current,date:new Date().toISOString(),preview:txt,messages:final});
    }catch(err){
      Alert.alert('Fout',err.message);
      setMessages(messages);
    }
    setLoading(false);
  };

  const clearConversation=()=>{
    Alert.alert('Gesprek wissen','Weet u zeker dat u dit gesprek wilt wissen? Dit kan niet ongedaan worden gemaakt.',[
      {text:'Annuleren',style:'cancel'},
      {text:'Wissen',style:'destructive',onPress:()=>{setMessages([]);convId.current=`conv_${Date.now()}`;}},
    ]);
  };

  const handleLongPress=(item,index)=>{
    if(item.role!=='assistant')return;
    Alert.alert('Taxly Advies','Wat wilt u doen?',[
      {text:'Opslaan als favoriet',onPress:async()=>{
        const q=messages[index-1];
        await saveFavorite({id:`fav_${Date.now()}`,date:new Date().toISOString(),question:q?.content||'',answer:item.content});
        Alert.alert('Opgeslagen!');
      }},
      {text:'Exporteer als PDF',onPress:()=>exportToPDF(messages,userData?.name)},
      {text:'Annuleren',style:'cancel'},
    ]);
  };

  const renderMsg=({item,index})=>(
    <TouchableWithoutFeedback onLongPress={()=>handleLongPress(item,index)}>
      <View style={item.role==='user'?s.msgUserWrap:s.msgAiWrap}>
        {item.role==='assistant'&&<OrbSmall/>}
        <View style={item.role==='user'?s.msgUser:s.msgAi}>
          <Text style={item.role==='user'?s.msgUserText:s.msgAiText}>{item.content}</Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );

  return(
    <SafeAreaView style={s.safe}>
      <PrivacyNotice visible={showPrivacy} onAccept={()=>setShowPrivacy(false)}/>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={()=>navigation.goBack()} activeOpacity={0.7}>
          <Text style={s.backText}>terug</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <OrbSmall/>
          <Text style={s.headerTitle}>Taxly AI</Text>
        </View>
        <TouchableOpacity style={s.clearBtn} onPress={clearConversation} activeOpacity={0.7}>
          <Text style={s.clearText}>wis</Text>
        </TouchableOpacity>
      </View>

      {/* AVG banner */}
      <View style={s.avgBanner}>
        <Text style={s.avgText}>Stuur nooit BSN, IBAN of wachtwoorden</Text>
      </View>

      <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(_,i)=>i.toString()}
          renderItem={renderMsg}
          contentContainerStyle={[s.list,messages.length===0&&s.listEmpty]}
          onContentSizeChange={()=>listRef.current?.scrollToEnd({animated:true})}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.emptyState}>
              <OrbSmall/>
              <Text style={s.emptyTitle}>Waarmee kan ik helpen?</Text>
              <Text style={s.emptySub}>Stel een vraag over uw belastingen, toeslagen of financien.</Text>
              <View style={s.suggestions}>
                {SUGGESTIONS.map(sug=>(
                  <TouchableOpacity key={sug} style={s.suggBtn} onPress={()=>sendMessage(sug)} activeOpacity={0.75}>
                    <Text style={s.suggText}>{sug}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          }
          ListFooterComponent={loading?(
            <View style={s.msgAiWrap}>
              <OrbSmall/>
              <View style={s.msgAi}>
                <View style={{flexDirection:'row',gap:5,padding:4}}>
                  {[0,1,2].map(i=><View key={i} style={[s.dot,{opacity:0.4+i*0.2}]}/>)}
                </View>
              </View>
            </View>
          ):null}
        />

        {/* Input bar */}
        <View style={s.inputBar}>
          <View style={[s.inputRow,focus&&s.inputRowFocus]}>
            <TextInput
              style={s.input}
              value={input}
              onChangeText={setInput}
              placeholder="Stel een vraag..."
              placeholderTextColor={C.bluePale}
              multiline
              maxLength={1000}
              onFocus={()=>setFocus(true)}
              onBlur={()=>setFocus(false)}
              onSubmitEditing={()=>sendMessage()}
            />
            <TouchableOpacity
              style={[s.sendBtn,(!input.trim()||loading)&&s.sendBtnOff]}
              onPress={()=>sendMessage()}
              disabled={!input.trim()||loading}
              activeOpacity={0.85}
            >
              {loading
                ?<ActivityIndicator size="small" color="white"/>
                :<Text style={s.sendBtnText}>↑</Text>
              }
            </TouchableOpacity>
          </View>
          <Text style={s.localNote}>Gesprekken worden alleen lokaal opgeslagen</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s=StyleSheet.create({
  safe:{flex:1,backgroundColor:C.pageBg},
  header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,paddingVertical:10,borderBottomWidth:1,borderBottomColor:C.border,backgroundColor:'rgba(219,234,254,0.97)'},
  backBtn:{paddingHorizontal:12,paddingVertical:6,borderRadius:999,backgroundColor:C.surface,borderWidth:1,borderColor:C.border},
  backText:{fontSize:12,color:C.blue,fontWeight:'600'},
  headerCenter:{flexDirection:'row',alignItems:'center',gap:8},
  headerTitle:{fontSize:15,fontWeight:'700',color:C.text},
  clearBtn:{paddingHorizontal:12,paddingVertical:6,borderRadius:999,backgroundColor:'rgba(239,68,68,0.08)',borderWidth:1,borderColor:'rgba(239,68,68,0.2)'},
  clearText:{fontSize:12,color:C.red,fontWeight:'600'},
  avgBanner:{backgroundColor:'rgba(245,158,11,0.08)',borderBottomWidth:1,borderBottomColor:'rgba(245,158,11,0.2)',paddingVertical:6,paddingHorizontal:16},
  avgText:{fontSize:11,color:'#92400e',textAlign:'center',fontWeight:'500'},
  list:{padding:16,gap:12,flexGrow:1},
  listEmpty:{flex:1},
  emptyState:{alignItems:'center',paddingTop:20,gap:10},
  emptyTitle:{fontSize:19,fontWeight:'300',color:C.text,letterSpacing:-0.5},
  emptySub:{fontSize:13,color:C.textMuted,textAlign:'center',lineHeight:19,maxWidth:240},
  suggestions:{width:'100%',gap:8,marginTop:6},
  suggBtn:{backgroundColor:C.surface,borderRadius:999,paddingVertical:11,paddingHorizontal:16,borderWidth:1,borderColor:C.border,...sh()},
  suggText:{fontSize:13,color:C.blue,fontWeight:'500'},
  msgUserWrap:{flexDirection:'row',justifyContent:'flex-end',marginBottom:4},
  msgAiWrap:{flexDirection:'row',alignItems:'flex-end',gap:8,marginBottom:4},
  msgUser:{backgroundColor:C.blue,borderRadius:22,borderBottomRightRadius:6,paddingVertical:11,paddingHorizontal:14,maxWidth:'78%',...sh(0.3,12)},
  msgUserText:{color:'#fff',fontSize:13,lineHeight:20},
  msgAi:{backgroundColor:'rgba(255,255,255,0.82)',borderRadius:22,borderBottomLeftRadius:6,paddingVertical:11,paddingHorizontal:14,maxWidth:'78%',borderWidth:1,borderColor:C.border,...sh()},
  msgAiText:{color:C.text,fontSize:13,lineHeight:20},
  dot:{width:6,height:6,borderRadius:999,backgroundColor:C.blueLight},
  inputBar:{paddingHorizontal:14,paddingTop:8,paddingBottom:Platform.OS==='ios'?20:10,backgroundColor:'rgba(219,234,254,0.97)',borderTopWidth:1,borderTopColor:C.border},
  inputRow:{flexDirection:'row',alignItems:'flex-end',gap:7,backgroundColor:C.surface,borderRadius:999,borderWidth:1,borderColor:C.border,paddingLeft:16,paddingRight:4,paddingVertical:4,...sh()},
  inputRowFocus:{borderColor:'rgba(59,130,246,0.35)',backgroundColor:C.surfaceHi},
  input:{flex:1,fontSize:14,color:C.text,paddingVertical:8,maxHeight:100},
  sendBtn:{width:38,height:38,borderRadius:19,backgroundColor:C.blue,alignItems:'center',justifyContent:'center',...sh(0.4,10)},
  sendBtnOff:{backgroundColor:'rgba(147,197,253,0.3)',shadowOpacity:0,elevation:0},
  sendBtnText:{color:'#fff',fontSize:18,fontWeight:'700'},
  localNote:{fontSize:10,color:C.textLight,textAlign:'center',marginTop:5},
  modalOverlay:{flex:1,backgroundColor:'rgba(0,0,0,0.4)',justifyContent:'center',alignItems:'center',padding:24},
  modalCard:{backgroundColor:'#fff',borderRadius:24,padding:24,maxWidth:340,width:'100%',...sh(0.2,24)},
  modalTitle:{fontSize:17,fontWeight:'700',color:C.text,marginBottom:12},
  modalBody:{fontSize:13,color:C.textMid,lineHeight:20,marginBottom:20},
  modalBtn:{backgroundColor:C.blue,borderRadius:999,paddingVertical:13,alignItems:'center',...sh(0.35,16)},
  modalBtnText:{color:'#fff',fontSize:14,fontWeight:'700'},
});
