
const C = {
  pageBg:'#dbeafe',surface:'rgba(255,255,255,0.65)',surfaceHi:'rgba(255,255,255,0.85)',
  blue:'#1d4ed8',blueDeep:'#1e40af',blueMid:'#2563eb',blueLight:'#60a5fa',bluePale:'#93c5fd',
  text:'#0f172a',textMid:'#334155',textMuted:'#64748b',textLight:'#94a3b8',
  green:'#10b981',greenText:'#065f46',border:'rgba(255,255,255,0.9)',white:'#ffffff',
};
const sh=(op=0.08,r=8)=>({shadowColor:'#1d4ed8',shadowOpacity:op,shadowRadius:r,shadowOffset:{width:0,height:2},elevation:Math.round(r/3)});

import React,{useCallback,useRef,useState,useEffect} from 'react';
import {View,Text,TouchableOpacity,StyleSheet,Animated,Dimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg,{Defs,RadialGradient,Stop,Circle,Ellipse} from 'react-native-svg';
import {useFocusEffect} from '@react-navigation/native';
import {getUserData} from '../utils/storage';
import {getDailyUsage} from '../utils/freemium';
import {isPremium,isPro} from '../utils/purchases';

const {width} = Dimensions.get('window');
const getGreeting=()=>{const h=new Date().getHours();if(h<12)return'Goedemorgen';if(h<18)return'Goedemiddag';return'Goedenavond';};

const ORB = 140;

function OrbSvg(){
  return(
    <Svg width={ORB} height={ORB} viewBox="0 0 140 140">
      <Defs>
        {/* Main radial gradient */}
        <RadialGradient id="orbMain" cx="38%" cy="32%" rx="65%" ry="65%" gradientUnits="userSpaceOnUse">
          <Stop offset="0%"   stopColor="#93c5fd" stopOpacity="1"/>
          <Stop offset="30%"  stopColor="#3b82f6" stopOpacity="1"/>
          <Stop offset="65%"  stopColor="#1d4ed8" stopOpacity="1"/>
          <Stop offset="100%" stopColor="#0b2a6f" stopOpacity="1"/>
        </RadialGradient>
        {/* Top-left glass shine */}
        <RadialGradient id="orbShine" cx="32%" cy="26%" rx="38%" ry="32%" gradientUnits="userSpaceOnUse">
          <Stop offset="0%"   stopColor="#ffffff" stopOpacity="0.65"/>
          <Stop offset="50%"  stopColor="#ffffff" stopOpacity="0.15"/>
          <Stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
        </RadialGradient>
        {/* Inner sphere — volledig vloeiend, geen harde rand */}
        <RadialGradient id="innerGlow" cx="42%" cy="38%" rx="55%" ry="55%" gradientUnits="userSpaceOnUse">
          <Stop offset="0%"   stopColor="#ffffff"  stopOpacity="0.9"/>
          <Stop offset="35%"  stopColor="#dbeafe"  stopOpacity="0.7"/>
          <Stop offset="70%"  stopColor="#93c5fd"  stopOpacity="0.35"/>
          <Stop offset="100%" stopColor="#3b82f6"  stopOpacity="0"/>
        </RadialGradient>
      </Defs>
      {/* Base orb */}
      <Circle cx="70" cy="70" r="68" fill="url(#orbMain)"/>
      {/* Glass shine top-left */}
      <Circle cx="70" cy="70" r="68" fill="url(#orbShine)"/>
      {/* Inner glow — vloeiend, geen harde rand */}
      <Circle cx="70" cy="70" r="38" fill="url(#innerGlow)"/>
      {/* Subtle border */}
      <Circle cx="70" cy="70" r="67" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5"/>
    </Svg>
  );
}

function OrbView({active}){
  const float=useRef(new Animated.Value(0)).current;
  useEffect(()=>{
    Animated.loop(Animated.sequence([
      Animated.timing(float,{toValue:-9,duration:2000,useNativeDriver:true}),
      Animated.timing(float,{toValue:0,duration:2000,useNativeDriver:true}),
    ])).start();
  },[]);
  return(
    <Animated.View style={{transform:[{translateY:float}],alignItems:'center',shadowColor:'#1d4ed8',shadowOpacity:0.4,shadowRadius:32,shadowOffset:{width:0,height:8},elevation:12}}>
      <OrbSvg/>
      <Text style={[s.orbLabel,active&&{color:C.blue}]}>
        {active?'Ik luister...':'Tik om te spreken'}
      </Text>
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

  const BTN_W=(width-50)/2;

  const GRID=[
    {icon:'✦', label:'Inzichten',   onPress:()=>navigation.navigate('History')},
    {icon:'📸', label:'Scanner',    onPress:()=>navigation.navigate('Scanner')},
    {icon:'⭐', label:'Favorieten', onPress:()=>navigation.navigate('Favorites')},
    {icon:'📁', label:'Archief',    onPress:()=>navigation.navigate('Favorites')},
  ];

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

        <TouchableOpacity onPress={triggerListen} activeOpacity={0.9} style={{alignItems:'center'}}>
          <OrbView active={listening}/>
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
            {GRID.map((item)=>(
              <TouchableOpacity key={item.label} style={[s.gridBtn,{width:BTN_W}]} onPress={item.onPress} activeOpacity={0.75}>
                <Text style={s.gridIcon}>{item.icon}</Text>
                <Text style={s.gridLabel}>{item.label}</Text>
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
  screen:{flex:1,justifyContent:'space-between',paddingHorizontal:20,paddingTop:10,paddingBottom:8},
  greeting:{alignItems:'center'},
  greetSmall:{fontSize:11,color:C.blueLight,letterSpacing:2.5,textTransform:'uppercase',fontWeight:'700',marginBottom:3},
  greetName:{fontSize:36,fontWeight:'200',color:C.text,letterSpacing:-1.5,lineHeight:42,marginBottom:10},
  statusPill:{flexDirection:'row',alignItems:'center',gap:6,backgroundColor:'rgba(255,255,255,0.6)',borderRadius:999,paddingVertical:5,paddingHorizontal:13,borderWidth:1,borderColor:'rgba(16,185,129,0.25)'},
  statusDot:{width:6,height:6,borderRadius:999,backgroundColor:C.green},
  statusText:{fontSize:11,color:C.greenText,fontWeight:'600'},
  orbLabel:{fontSize:11,letterSpacing:2.2,textTransform:'uppercase',fontWeight:'600',color:C.bluePale,marginTop:10},
  actions:{gap:10},
  usageBar:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',backgroundColor:C.surface,borderRadius:999,paddingVertical:10,paddingHorizontal:16,borderWidth:1,borderColor:C.border,...sh()},
  usageText:{fontSize:12,color:C.textMuted},
  upgradeText:{fontSize:12,fontWeight:'700',color:C.blue},
  btnPrimary:{backgroundColor:C.blue,borderRadius:999,paddingVertical:14,alignItems:'center',...sh(0.38,18)},
  btnPrimaryText:{color:'#fff',fontSize:15,fontWeight:'700'},
  grid:{flexDirection:'row',flexWrap:'wrap',gap:10},
  gridBtn:{backgroundColor:C.surface,borderRadius:999,paddingVertical:13,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,borderWidth:1,borderColor:C.border,...sh()},
  gridIcon:{fontSize:15},
  gridLabel:{fontSize:13,fontWeight:'600',color:C.blue},
});
