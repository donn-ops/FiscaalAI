
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

import React,{useState,useRef} from 'react';
import {View,Text,TextInput,TouchableOpacity,ScrollView,StyleSheet,KeyboardAvoidingView,Platform,Animated} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {saveUserData} from '../utils/storage';

const LANGS=[{code:'nl',flag:'NL'},{code:'en',flag:'EN'},{code:'de',flag:'DE'},{code:'fr',flag:'FR'}];
const SITUATIONS=[{key:'werknemer',label:'Werknemer'},{key:'zzp',label:"ZZP'er"},{key:'student',label:'Student'},{key:'gepension',label:'Gepensioneerd'},{key:'anders',label:'Anders'}];
const STEPS=[
  {sub:'Uw financiele assistent',title:'Welkom bij Taxly',body:'Taxly begrijpt uw situatie en helpt u rust te vinden in uw financien - belastingen, toeslagen, aftrekposten en meer.'},
  {sub:'AI die voor u meedenkt',title:'Slimme inzichten',body:'Taxly analyseert uw situatie en laat u kansen zien die u anders zou missen.'},
  {sub:'Stel elke vraag, altijd',title:'Altijd beschikbaar',body:'Heeft u een vraag over uw belasting? Stel hem gewoon. Geen wachttijden, geen jargon.'},
];

function OrbAnim({size=100}){
  const anim=useRef(new Animated.Value(0)).current;
  React.useEffect(()=>{Animated.loop(Animated.sequence([Animated.timing(anim,{toValue:-7,duration:2000,useNativeDriver:true}),Animated.timing(anim,{toValue:0,duration:2000,useNativeDriver:true})])).start();},[]);
  return(
    <Animated.View style={{transform:[{translateY:anim}]}}>
      <View style={{width:size,height:size,borderRadius:size/2,backgroundColor:C.blue,alignItems:'center',justifyContent:'center',borderWidth:2,borderColor:'rgba(255,255,255,0.65)',overflow:'hidden',...sh(0.4,24)}}>
        <View style={{position:'absolute',top:-size*0.1,left:-size*0.1,width:size*0.7,height:size*0.7,borderRadius:size,backgroundColor:'rgba(255,255,255,0.18)'}}/>
        <View style={{width:size*0.42,height:size*0.42,borderRadius:size,backgroundColor:'rgba(191,219,254,0.7)'}}/>
      </View>
    </Animated.View>
  );
}

export default function OnboardingScreen({navigation}){
  const [step,setStep]=useState(0);
  const [name,setName]=useState('');
  const [language,setLanguage]=useState('nl');
  const [situation,setSituation]=useState('');
  const [focus,setFocus]=useState(false);
  const isIntro=step<STEPS.length;
  const isForm=step===STEPS.length;

  const handleNext=async()=>{
    if(isIntro){setStep(s=>s+1);return;}
    if(!name.trim())return;
    await saveUserData({name:name.trim(),language,situation});
    navigation.replace('Main');
  };

  return(
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={s.dots}>
            {[...STEPS,{}].map((_,i)=>(
              <View key={i} style={[s.dot,i<=step&&s.dotActive,i===step&&s.dotCurrent]}/>
            ))}
          </View>
          <View style={{alignItems:'center',marginBottom:24}}>
            {step===0?<OrbAnim size={110}/>:<View style={[s.iconCircle,{backgroundColor:'rgba(29,78,216,0.12)'}]}><Text style={s.iconEmoji}>{step===1?'*':step===2?'o':'+'}</Text></View>}
          </View>
          {isIntro&&(
            <View style={{alignItems:'center',marginBottom:28}}>
              <Text style={s.sub}>{STEPS[step].sub}</Text>
              <Text style={s.title}>{STEPS[step].title}</Text>
              <Text style={s.body}>{STEPS[step].body}</Text>
            </View>
          )}
          {isForm&&(
            <View style={{width:'100%',marginBottom:20}}>
              <Text style={s.sub}>Vertel ons over uzelf</Text>
              <Text style={s.title}>Bijna klaar</Text>
              <Text style={s.fieldLabel}>Uw naam</Text>
              <TextInput style={[s.input,focus&&s.inputFocus]} value={name} onChangeText={setName} placeholder="Bijv. Jan de Vries" placeholderTextColor={C.bluePale} autoFocus returnKeyType="done" onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}/>
              <Text style={s.fieldLabel}>Taal</Text>
              <View style={s.langRow}>
                {LANGS.map(l=>(
                  <TouchableOpacity key={l.code} style={[s.langBtn,language===l.code&&s.langBtnActive]} onPress={()=>setLanguage(l.code)} activeOpacity={0.75}>
                    <Text style={[s.langText,language===l.code&&{color:C.blue,fontWeight:'700'}]}>{l.flag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={s.fieldLabel}>Uw situatie</Text>
              <View style={s.situGrid}>
                {SITUATIONS.map(sit=>(
                  <TouchableOpacity key={sit.key} style={[s.situBtn,situation===sit.key&&s.situBtnActive]} onPress={()=>setSituation(sit.key)} activeOpacity={0.75}>
                    <Text style={[s.situText,situation===sit.key&&{color:'#fff'}]}>{sit.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          <View style={{width:'100%',gap:10,marginBottom:16}}>
            <TouchableOpacity style={[s.btnPrimary,isForm&&!name.trim()&&{backgroundColor:C.bluePale}]} onPress={handleNext} disabled={isForm&&!name.trim()} activeOpacity={0.85}>
              <Text style={s.btnPrimaryText}>{isForm?'Account aanmaken':step<STEPS.length-1?'Verder':'Bijna klaar'}</Text>
            </TouchableOpacity>
            {isIntro&&step>0&&(
              <TouchableOpacity style={s.btnGhost} onPress={()=>setStep(STEPS.length)} activeOpacity={0.7}>
                <Text style={s.btnGhostText}>Overslaan</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={{fontSize:10,color:C.textLight,textAlign:'center',lineHeight:15}}>Uw gegevens worden lokaal opgeslagen. Nooit gedeeld met derden.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s=StyleSheet.create({
  safe:{flex:1,backgroundColor:C.pageBg},
  scroll:{flexGrow:1,alignItems:'center',paddingHorizontal:26,paddingTop:22,paddingBottom:44},
  dots:{flexDirection:'row',gap:7,marginBottom:32},
  dot:{height:5,width:7,borderRadius:999,backgroundColor:'rgba(147,197,253,0.35)'},
  dotActive:{backgroundColor:C.blueMid},
  dotCurrent:{width:22},
  iconCircle:{width:86,height:86,borderRadius:43,borderWidth:1.5,borderColor:'rgba(29,78,216,0.2)',alignItems:'center',justifyContent:'center'},
  iconEmoji:{fontSize:32,color:C.blue},
  sub:{fontSize:11,color:C.blueLight,letterSpacing:2.5,textTransform:'uppercase',fontWeight:'700',marginBottom:7,textAlign:'center'},
  title:{fontSize:27,fontWeight:'200',color:C.text,letterSpacing:-0.8,lineHeight:33,marginBottom:11,textAlign:'center'},
  body:{fontSize:14,color:C.textMuted,lineHeight:22,textAlign:'center',maxWidth:290},
  fieldLabel:{fontSize:10,fontWeight:'700',color:C.textMuted,letterSpacing:1.5,textTransform:'uppercase',marginBottom:7,marginTop:18,alignSelf:'flex-start'},
  input:{width:'100%',backgroundColor:C.surface,borderRadius:999,paddingVertical:13,paddingHorizontal:19,fontSize:14,color:C.text,borderWidth:1,borderColor:C.border,...sh()},
  inputFocus:{borderColor:'rgba(59,130,246,0.4)',backgroundColor:C.surfaceHi},
  langRow:{flexDirection:'row',gap:8},
  langBtn:{flex:1,alignItems:'center',paddingVertical:9,borderRadius:999,borderWidth:1,borderColor:C.border,backgroundColor:C.surface,...sh()},
  langBtnActive:{borderColor:'rgba(59,130,246,0.4)',backgroundColor:C.surfaceHi},
  langText:{fontSize:13,color:C.textMuted,fontWeight:'600'},
  situGrid:{flexDirection:'row',flexWrap:'wrap',gap:8},
  situBtn:{paddingHorizontal:14,paddingVertical:9,borderRadius:999,borderWidth:1,borderColor:C.border,backgroundColor:C.surface,...sh()},
  situBtnActive:{backgroundColor:C.blue,borderColor:C.blue},
  situText:{fontSize:12,color:C.textMuted,fontWeight:'600'},
  btnPrimary:{width:'100%',backgroundColor:C.blue,borderRadius:999,paddingVertical:14,alignItems:'center',...sh(0.35,16)},
  btnPrimaryText:{color:'#fff',fontSize:15,fontWeight:'700'},
  btnGhost:{width:'100%',borderRadius:999,paddingVertical:11,alignItems:'center',borderWidth:1,borderColor:'rgba(29,78,216,0.2)'},
  btnGhostText:{color:C.blue,fontSize:13,fontWeight:'600'},
});
