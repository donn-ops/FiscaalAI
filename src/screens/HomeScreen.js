
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

import React,{useCallback,useRef,useState,useEffect} from 'react';
import {View,Text,TouchableOpacity,ScrollView,StyleSheet,Animated,Dimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {getUserData,getTaxProfile} from '../utils/storage';
import {QUICK_QUESTIONS} from '../constants/prompts';
import {getDailyUsage} from '../utils/freemium';
import {isPremium,isPro} from '../utils/purchases';

const getGreeting=()=>{const h=new Date().getHours();if(h<12)return'Goedemorgen';if(h<18)return'Goedemiddag';return'Goedenavond';};

function OrbView(){
  const anim=useRef(new Animated.Value(0)).current;
  useEffect(()=>{Animated.loop(Animated.sequence([Animated.timing(anim,{toValue:-8,duration:2000,useNativeDriver:true}),Animated.timing(anim,{toValue:0,duration:2000,useNativeDriver:true})])).start();},[]);
  return(
    <Animated.View style={{transform:[{translateY:anim}]}}>
      <View style={s.orb}>
        <View style={s.orbShine}/>
        <View style={s.orbInner}/>
      </View>
    </Animated.View>
  );
}

export default function HomeScreen({navigation}){
  const [userData,setUserData]=useState(null);
  const [dailyUsage,setDailyUsage]=useState(0);
  const [hasPremium,setHasPremium]=useState(false);
  const [hasPro,setHasPro]=useState(false);
  const [listening,setListening]=useState(false);
  useFocusEffect(useCallback(()=>{loadData();},[]) );
  const loadData=async()=>{
    const [user,usage,premium,pro]=await Promise.all([getUserData(),getDailyUsage(),isPremium(),isPro()]);
    setUserData(user);setDailyUsage(usage);setHasPremium(premium);setHasPro(pro);
  };
  const isUnlimited=hasPremium||hasPro;
  const startChat=(q=null)=>navigation.navigate('Chat',{initialQuestion:q,userData});
  const triggerListen=()=>{setListening(true);setTimeout(()=>setListening(false),3000);};

  return(
    <SafeAreaView style={s.safe}>
      <View style={s.screen}>

        <View style={s.greeting}>
          <Text style={s.greetSmall}>{getGreeting()}</Text>
          <Text style={s.greetName}>{userData?.name||'Welkom'}</Text>
          <View style={s.statusPill}>
            <View style={s.statusDot}/>
            <Text style={s.statusText}>Financien onder controle</Text>
          </View>
        </View>

        <TouchableOpacity style={s.orbSection} onPress={triggerListen} activeOpacity={0.85}>
          <OrbView/>
          <Text style={[s.orbLabel,listening&&{color:C.blue}]}>{listening?'Ik luister...':'Tik om te spreken'}</Text>
        </TouchableOpacity>

        <View style={s.actions}>
          {!isUnlimited&&(
            <TouchableOpacity style={s.usageBar} onPress={()=>navigation.navigate('Paywall')} activeOpacity={0.8}>
              <Text style={s.usageText}>{dailyUsage}/5 vragen gebruikt</Text>
              <Text style={s.upgradeText}>Upgrade</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={s.btnPrimary} onPress={()=>startChat()} activeOpacity={0.85}>
            <Text style={s.btnPrimaryText}>Vraag stellen</Text>
          </TouchableOpacity>
          <View style={s.grid}>
            {(QUICK_QUESTIONS||[]).slice(0,4).map((q)=>(
              <TouchableOpacity key={q.label} style={s.gridBtn} onPress={()=>startChat(q.question)} activeOpacity={0.75}>
                <Text style={s.gridIcon}>{q.icon}</Text>
                <Text style={s.gridLabel}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}

const s=StyleSheet.create({
  safe:{flex:1,backgroundColor:C.pageBg},
  screen:{flex:1,justifyContent:'space-between',paddingHorizontal:20,paddingTop:12,paddingBottom:8},
  greeting:{alignItems:'center'},
  greetSmall:{fontSize:11,color:C.blueLight,letterSpacing:2.5,textTransform:'uppercase',fontWeight:'700',marginBottom:3},
  greetName:{fontSize:36,fontWeight:'200',color:C.text,letterSpacing:-1.5,lineHeight:42,marginBottom:10},
  statusPill:{flexDirection:'row',alignItems:'center',gap:6,backgroundColor:'rgba(255,255,255,0.6)',borderRadius:999,paddingVertical:5,paddingHorizontal:13,borderWidth:1,borderColor:'rgba(16,185,129,0.25)'},
  statusDot:{width:6,height:6,borderRadius:999,backgroundColor:C.green},
  statusText:{fontSize:11,color:C.greenText,fontWeight:'600'},
  orbSection:{alignItems:'center',gap:10},
  orb:{width:130,height:130,borderRadius:65,backgroundColor:C.blue,overflow:'hidden',position:'relative',borderWidth:2,borderColor:'rgba(255,255,255,0.65)',...sh(0.35,28)},
  orbShine:{position:'absolute',top:-20,left:-15,width:80,height:80,borderRadius:40,backgroundColor:'rgba(255,255,255,0.18)'},
  orbInner:{position:'absolute',top:'50%',left:'50%',width:52,height:52,borderRadius:26,backgroundColor:'rgba(191,219,254,0.7)',marginLeft:-26,marginTop:-26},
  orbLabel:{fontSize:11,letterSpacing:2,textTransform:'uppercase',fontWeight:'600',color:C.bluePale},
  actions:{gap:10},
  usageBar:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',backgroundColor:C.surface,borderRadius:999,paddingVertical:10,paddingHorizontal:16,borderWidth:1,borderColor:C.border,...sh()},
  usageText:{fontSize:12,color:C.textMuted},
  upgradeText:{fontSize:12,fontWeight:'700',color:C.blue},
  btnPrimary:{backgroundColor:C.blue,borderRadius:999,paddingVertical:14,alignItems:'center',...sh(0.35,16)},
  btnPrimaryText:{color:'#fff',fontSize:15,fontWeight:'700'},
  grid:{flexDirection:'row',flexWrap:'wrap',gap:10},
  gridBtn:{flex:1,minWidth:'45%',backgroundColor:C.surface,borderRadius:999,paddingVertical:12,alignItems:'center',flexDirection:'row',justifyContent:'center',gap:7,borderWidth:1,borderColor:C.border,...sh()},
  gridIcon:{fontSize:14},
  gridLabel:{fontSize:13,fontWeight:'600',color:C.blue},
});
