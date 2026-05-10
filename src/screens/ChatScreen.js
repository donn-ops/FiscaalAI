
const C = {
  pageBg:'#dbeafe',
  surface:'rgba(255,255,255,0.65)',
  surfaceHi:'rgba(255,255,255,0.85)',
  blue:'#1d4ed8',
  blueDeep:'#1e40af',
  blueMid:'#2563eb',
  blueLight:'#60a5fa',
  bluePale:'#93c5fd',
  text:'#0f172a',
  textMid:'#334155',
  textMuted:'#64748b',
  textLight:'#94a3b8',
  green:'#10b981',
  greenText:'#065f46',
  amber:'#f59e0b',
  red:'#ef4444',
  border:'rgba(255,255,255,0.9)',
  white:'#ffffff',
};
const sh = (op=0.08,r=8) => ({shadowColor:'#1d4ed8',shadowOpacity:op,shadowRadius:r,shadowOffset:{width:0,height:2},elevation:Math.round(r/3)});

import React,{useState,useRef,useEffect} from 'react';
import {View,Text,TextInput,TouchableOpacity,FlatList,StyleSheet,KeyboardAvoidingView,Platform,ActivityIndicator,Alert,TouchableWithoutFeedback} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SYSTEM_PROMPT} from '../constants/prompts';
import {saveConversation,saveFavorite,getUserData,getTaxProfile} from '../utils/storage';
import {exportToPDF} from '../utils/pdf';

const API_URL='https://fiscaal-ai.vercel.app/api/chat';
const SUGGESTIONS=['Hoeveel belasting betaal ik dit jaar?','Wat is mijn hypotheekaftrek?','Hoe werkt box 3?','Welke toeslagen heb ik recht op?'];

export default function ChatScreen({navigation,route}){
  const [messages,setMessages]=useState([]);
  const [input,setInput]=useState('');
  const [loading,setLoading]=useState(false);
  const [userData,setUserData]=useState(null);
  const [taxProfile,setTaxProfile]=useState(null);
  const [focus,setFocus]=useState(false);
  const listRef=useRef(null);
  const convId=useRef(`conv_${Date.now()}`);

  useEffect(()=>{loadUserData();},[]);
  const loadUserData=async()=>{
    const [user,profile]=await Promise.all([getUserData(),getTaxProfile()]);
    setUserData(user);setTaxProfile(profile);
    if(route.params?.loadConversation){setMessages(route.params.loadConversation.messages||[]);}
    else{const q=route.params?.initialQuestion;if(q)sendMessage(q,user,profile);}
  };

  const buildSystem=(user,profile)=>{
    let p=SYSTEM_PROMPT||'Je bent Taxly, een Nederlandse financiele AI-assistent. Antwoord beknopt. Spreek gebruiker aan met u. Noem jezelf Taxly.';
    if(user?.name)p+=`\n\nGebruikersnaam: ${user.name}.`;
    if(profile)p+=`\n\nProfiel: ${profile.situation}.`;
    return p;
  };

  const sendMessage=async(text,user=userData,profile=taxProfile)=>{
    const txt=text||input.trim();if(!txt||loading)return;
    setInput('');
    const newMsgs=[...messages,{role:'user',content:txt}];
    setMessages(newMsgs);setLoading(true);
    try{
      const res=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:newMsgs,system:buildSystem(user,profile)})});
      const data=await res.json();
      if(!res.ok)throw new Error(data.error?.message||'API fout');
      const reply=data.content?.filter(b=>b.type==='text').map(b=>b.text).join('\n')||data.message||null;
      if(!reply)throw new Error('Geen antwoord');
      const final=[...newMsgs,{role:'assistant',content:reply}];
      setMessages(final);
      await saveConversation({id:convId.current,date:new Date().toISOString(),preview:txt,messages:final});
    }catch(err){Alert.alert('Fout',err.message);setMessages(messages);}
    setLoading(false);
  };

  const handleLongPress=(item,index)=>{
    if(item.role!=='assistant')return;
    Alert.alert('Taxly Advies','Wat wilt u doen?',[
      {text:'Opslaan als favoriet',onPress:async()=>{const q=messages[index-1];await saveFavorite({id:`fav_${Date.now()}`,date:new Date().toISOString(),question:q?.content||'',answer:item.content});Alert.alert('Opgeslagen!');}},
      {text:'Exporteer als PDF',onPress:()=>exportToPDF(messages,userData?.name)},
      {text:'Annuleren',style:'cancel'},
    ]);
  };

  const renderMsg=({item,index})=>(
    <TouchableWithoutFeedback onLongPress={()=>handleLongPress(item,index)}>
      <View style={item.role==='user'?s.msgUserWrap:s.msgAiWrap}>
        {item.role==='assistant'&&<View style={s.aiDot}/>}
        <View style={item.role==='user'?s.msgUser:s.msgAi}>
          <Text style={item.role==='user'?s.msgUserText:s.msgAiText}>{item.content}</Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );

  return(
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={()=>navigation.goBack()} activeOpacity={0.7}>
          <Text style={s.backText}>terug</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <View style={s.headerOrb}/>
          <Text style={s.headerTitle}>Taxly AI</Text>
        </View>
        <View style={{width:60}}/>
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
              <View style={s.emptyOrb}/>
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
              <View style={s.aiDot}/>
              <View style={s.msgAi}>
                <View style={{flexDirection:'row',gap:5,padding:4}}>
                  {[0,1,2].map(i=><View key={i} style={[s.dot,{opacity:0.4+i*0.2}]}/>)}
                </View>
              </View>
            </View>
          ):null}
        />
        <View style={s.inputBar}>
          <View style={[s.inputRow,focus&&s.inputRowFocus]}>
            <TextInput style={s.input} value={input} onChangeText={setInput} placeholder="Stel een vraag..." placeholderTextColor={C.bluePale} multiline maxLength={1000} onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)} onSubmitEditing={()=>sendMessage()}/>
            <TouchableOpacity style={[s.sendBtn,(!input.trim()||loading)&&s.sendBtnOff]} onPress={()=>sendMessage()} disabled={!input.trim()||loading} activeOpacity={0.85}>
              {loading?<ActivityIndicator size="small" color="white"/>:<Text style={s.sendBtnText}>up</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s=StyleSheet.create({
  safe:{flex:1,backgroundColor:C.pageBg},
  header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:20,paddingVertical:12,borderBottomWidth:1,borderBottomColor:C.border,backgroundColor:'rgba(219,234,254,0.97)'},
  backBtn:{paddingHorizontal:14,paddingVertical:7,borderRadius:999,backgroundColor:C.surface,borderWidth:1,borderColor:C.border},
  backText:{fontSize:12,color:C.blue,fontWeight:'600'},
  headerCenter:{flexDirection:'row',alignItems:'center',gap:8},
  headerOrb:{width:22,height:22,borderRadius:11,backgroundColor:C.blue,...sh(0.4,8)},
  headerTitle:{fontSize:15,fontWeight:'700',color:C.text},
  list:{padding:18,gap:10,flexGrow:1},
  listEmpty:{flex:1},
  emptyState:{alignItems:'center',paddingTop:16,gap:10},
  emptyOrb:{width:68,height:68,borderRadius:34,backgroundColor:C.blue,borderWidth:2,borderColor:'rgba(255,255,255,0.65)',...sh(0.3,18)},
  emptyTitle:{fontSize:19,fontWeight:'300',color:C.text,letterSpacing:-0.5},
  emptySub:{fontSize:13,color:C.textMuted,textAlign:'center',lineHeight:19,maxWidth:230},
  suggestions:{width:'100%',gap:8,marginTop:6},
  suggBtn:{backgroundColor:C.surface,borderRadius:999,paddingVertical:10,paddingHorizontal:16,borderWidth:1,borderColor:C.border,...sh()},
  suggText:{fontSize:13,color:C.blue,fontWeight:'500'},
  msgUserWrap:{flexDirection:'row',justifyContent:'flex-end'},
  msgAiWrap:{flexDirection:'row',alignItems:'flex-end',gap:8},
  aiDot:{width:24,height:24,borderRadius:12,backgroundColor:C.blue,flexShrink:0,...sh(0.35,8)},
  msgUser:{backgroundColor:C.blue,borderRadius:22,borderBottomRightRadius:6,paddingVertical:11,paddingHorizontal:14,maxWidth:'78%',...sh(0.3,12)},
  msgUserText:{color:'#fff',fontSize:13,lineHeight:20},
  msgAi:{backgroundColor:'rgba(255,255,255,0.82)',borderRadius:22,borderBottomLeftRadius:6,paddingVertical:11,paddingHorizontal:14,maxWidth:'78%',borderWidth:1,borderColor:C.border,...sh()},
  msgAiText:{color:C.text,fontSize:13,lineHeight:20},
  dot:{width:6,height:6,borderRadius:999,backgroundColor:C.blueLight},
  inputBar:{paddingHorizontal:14,paddingVertical:8,paddingBottom:Platform.OS==='ios'?18:10,backgroundColor:'rgba(219,234,254,0.97)',borderTopWidth:1,borderTopColor:C.border},
  inputRow:{flexDirection:'row',alignItems:'flex-end',gap:7,backgroundColor:C.surface,borderRadius:999,borderWidth:1,borderColor:C.border,paddingLeft:16,paddingRight:4,paddingVertical:4,...sh()},
  inputRowFocus:{borderColor:'rgba(59,130,246,0.35)',backgroundColor:C.surfaceHi},
  input:{flex:1,fontSize:14,color:C.text,paddingVertical:8,maxHeight:100},
  sendBtn:{width:38,height:38,borderRadius:19,backgroundColor:C.blue,alignItems:'center',justifyContent:'center',...sh(0.4,10)},
  sendBtnOff:{backgroundColor:'rgba(147,197,253,0.3)',shadowOpacity:0,elevation:0},
  sendBtnText:{color:'#fff',fontSize:16,fontWeight:'700'},
});
