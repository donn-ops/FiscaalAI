
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
  border:'rgba(255,255,255,0.9)',
  white:'#ffffff',
};
const sh = (op=0.08,r=8) => ({shadowColor:'#1d4ed8',shadowOpacity:op,shadowRadius:r,shadowOffset:{width:0,height:2},elevation:Math.round(r/3)});

import React,{useCallback,useRef,useState,useEffect} from 'react';
import {View,Text,TouchableOpacity,StyleSheet,Animated} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {getUserData} from '../utils/storage';
import {getDailyUsage} from '../utils/freemium';
import {isPremium,isPro} from '../utils/purchases';

const getGreeting=()=>{const h=new Date().getHours();if(h<12)return'Goedemorgen';if(h<18)return'Goedemiddag';return'Goedenavond';};

function OrbView({active}){
  const float=useRef(new Animated.Value(0)).current;
  useEffect(()=>{
    Animated.loop(Animated.sequence([
      Animated.timing(float,{toValue:-9,duration:2000,useNativeDriver:true}),
      Animated.timing(float,{toValue:0,duration:2000,useNativeDriver:true}),
    ])).start();
  },[]);
  return(
    <Animated.View style={{transform:[{translateY:float}],alignItems:'center',gap:10}}>
      <View style={s.orb}>
        {/* Shimmer sweep */}
        <View style={s.orbShimmer}/>
        {/* Top glow */}
        <View style={s.orbGlow}/>
        {/* Inner sphere */}
        <View style={s.orbInner}/>
      </View>
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

  const GRID=[
    {icon:'✦', label:'Inzichten',  onPress:()=>navigation.navigate('History')},
    {icon:'📸', label:'Scanner',   onPress:()=>navigation.navigate('Scanner')},
    {icon:'📅', label:'Kalender',  onPress:()=>navigation.navigate('Kalender')},
    {icon:'📁', label:'Archief',   onPress:()=>navigation.navigate('Favorites')},
  ];

  return(
    <SafeAreaView style={s.safe}>
      <View style={s.screen}>

        {/* Greeting */}
        <View style={s.greeting}>
          <Text style={s.greetSmall}>{getGreeting()}</Text>
          <Text style={s.greetName}>{userData?.name||'Welkom'}</Text>
          <View style={s.statusPill}>
            <View style={s.statusDot}/>
            <Text style={s.statusText}>Financien onder controle</Text>
          </View>
        </View>

        {/* Orb */}
        <TouchableOpacity onPress={triggerListen} activeOpacity={0.9}>
          <OrbView active={listening}/>
        </TouchableOpacity>

        {/* Actions */}
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
              <TouchableOpacity key={item.label} style={s.gridBtn} onPress={item.onPress} activeOpacity={0.75}>
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

  orb:{
    width:140,height:140,borderRadius:70,
    overflow:'hidden',position:'relative',
    borderWidth:2,borderColor:'rgba(255,255,255,0.65)',
    /* Radial gradient via background layers */
    backgroundColor:'#1d4ed8',
    ...sh(0.4,32),
  },
  orbShimmer:{
    position:'absolute',top:'-40%',left:'-50%',
    width:'70%',height:'180%',
    backgroundColor:'rgba(255,255,255,0)',
    borderRadius:999,
    /* Diagonal shimmer */
    transform:[{rotate:'15deg'}],
    borderLeftWidth:30,
    borderLeftColor:'rgba(255,255,255,0.14)',
    borderRightWidth:0,
    borderTopWidth:200,
    borderTopColor:'transparent',
    borderBottomWidth:0,
  },
  orbGlow:{
    position:'absolute',top:-20,left:-10,
    width:90,height:90,borderRadius:45,
    backgroundColor:'rgba(147,197,253,0.5)',
  },
  orbInner:{
    position:'absolute',
    top:'50%',left:'50%',
    width:56,height:56,borderRadius:28,
    backgroundColor:'rgba(191,219,254,0.72)',
    marginLeft:-28,marginTop:-28,
  },
  orbLabel:{fontSize:11,letterSpacing:2.2,textTransform:'uppercase',fontWeight:'600',color:C.bluePale,marginTop:10},

  actions:{gap:10},
  usageBar:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',backgroundColor:C.surface,borderRadius:999,paddingVertical:10,paddingHorizontal:16,borderWidth:1,borderColor:C.border,...sh()},
  usageText:{fontSize:12,color:C.textMuted},
  upgradeText:{fontSize:12,fontWeight:'700',color:C.blue},

  btnPrimary:{backgroundColor:C.blue,borderRadius:999,paddingVertical:14,alignItems:'center',...sh(0.38,18)},
  btnPrimaryText:{color:'#fff',fontSize:15,fontWeight:'700'},

  grid:{flexDirection:'row',flexWrap:'wrap',gap:10},
  gridBtn:{
    width:'47%',flex:1,
    backgroundColor:C.surface,
    borderRadius:999,
    paddingVertical:12,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    gap:7,
    borderWidth:1,borderColor:C.border,
    ...sh(),
  },
  gridIcon:{fontSize:15},
  gridLabel:{fontSize:13,fontWeight:'600',color:C.blue},
});
