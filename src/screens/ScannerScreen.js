
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
import {View,Text,TouchableOpacity,StyleSheet,Alert,Animated} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

export default function ScannerScreen({navigation}){
  const [scanning,setScanning]=useState(false);
  const scanAnim=useRef(new Animated.Value(0)).current;

  const startScan=()=>{
    setScanning(true);
    Animated.loop(Animated.sequence([
      Animated.timing(scanAnim,{toValue:1,duration:1800,useNativeDriver:true}),
      Animated.timing(scanAnim,{toValue:0,duration:0,useNativeDriver:true}),
    ])).start();
  };

  const pickImage=async()=>{
    const {status}=await ImagePicker.requestMediaLibraryPermissionsAsync();
    if(status!=='granted'){Alert.alert('Toegang nodig','Sta toegang toe tot je fotobibliotheek.');return;}
    const result=await ImagePicker.launchImageLibraryAsync({quality:0.8});
    if(!result.canceled)startScan();
  };

  const takePhoto=async()=>{
    const {status}=await ImagePicker.requestCameraPermissionsAsync();
    if(status!=='granted'){Alert.alert('Camera nodig','Sta toegang toe tot je camera.');return;}
    const result=await ImagePicker.launchCameraAsync({quality:0.8});
    if(!result.canceled)startScan();
  };

  const scanY=scanAnim.interpolate({inputRange:[0,1],outputRange:[0,220]});

  return(
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={()=>navigation.goBack()} activeOpacity={0.7}>
          <Text style={s.backText}>terug</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Bonnetje scannen</Text>
        <View style={{width:60}}/>
      </View>
      <View style={s.body}>
        <View style={s.viewfinder}>
          <View style={[s.corner,s.cTL]}/><View style={[s.corner,s.cTR]}/>
          <View style={[s.corner,s.cBL]}/><View style={[s.corner,s.cBR]}/>
          <View style={s.receipt}>
            <Text style={s.rStore}>ALBERT HEIJN</Text>
            <View style={s.rDiv}/>
            {[['Koffiebonen','8,49'],['Kantoor','24,90'],['Lunch','18,75']].map(([a,b],i)=>(
              <View key={i} style={{flexDirection:'row',justifyContent:'space-between'}}>
                <Text style={s.rItem}>{a}</Text><Text style={s.rItem}>{b}</Text>
              </View>
            ))}
            <View style={s.rDiv}/>
            <View style={{flexDirection:'row',justifyContent:'space-between'}}>
              <Text style={s.rTotal}>TOTAAL</Text><Text style={s.rTotal}>52,14</Text>
            </View>
          </View>
          {scanning&&<Animated.View style={[s.scanLine,{transform:[{translateY:scanY}]}]}/>}
        </View>
        <Text style={s.hint}>Plaats het bonnetje in het kader</Text>
        <View style={s.controls}>
          <TouchableOpacity style={s.ctrlBtn} onPress={pickImage} activeOpacity={0.75}>
            <Text style={{fontSize:22}}>📁</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.shutter} onPress={takePhoto} activeOpacity={0.85}>
            <View style={s.shutterInner}/>
          </TouchableOpacity>
          <TouchableOpacity style={s.ctrlBtn} activeOpacity={0.75}>
            <Text style={{fontSize:20}}>⚡</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s=StyleSheet.create({
  safe:{flex:1,backgroundColor:C.pageBg},
  header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:20,paddingVertical:12,borderBottomWidth:1,borderBottomColor:C.border,backgroundColor:'rgba(219,234,254,0.97)'},
  backBtn:{paddingHorizontal:14,paddingVertical:7,borderRadius:999,backgroundColor:C.surface,borderWidth:1,borderColor:C.border},
  backText:{fontSize:12,color:C.blue,fontWeight:'600'},
  headerTitle:{fontSize:15,fontWeight:'700',color:C.text},
  body:{flex:1,alignItems:'center',justifyContent:'space-evenly',padding:20},
  viewfinder:{width:'100%',height:280,backgroundColor:C.surface,borderRadius:24,borderWidth:1,borderColor:C.border,overflow:'hidden',alignItems:'center',justifyContent:'center',...sh(0.12,16)},
  corner:{position:'absolute',width:24,height:24,borderColor:C.blue,borderRadius:4},
  cTL:{top:12,left:12,borderTopWidth:3,borderLeftWidth:3},
  cTR:{top:12,right:12,borderTopWidth:3,borderRightWidth:3},
  cBL:{bottom:12,left:12,borderBottomWidth:3,borderLeftWidth:3},
  cBR:{bottom:12,right:12,borderBottomWidth:3,borderRightWidth:3},
  receipt:{backgroundColor:'#fff',borderRadius:6,padding:11,width:'54%',transform:[{rotate:'-2deg'}],...sh(0.12,14)},
  rStore:{textAlign:'center',fontWeight:'700',fontSize:10,color:C.text,marginBottom:6},
  rDiv:{height:1,borderTopWidth:1,borderColor:'#CBD5E1',borderStyle:'dashed',marginVertical:5},
  rItem:{fontSize:9,color:C.textMid},
  rTotal:{fontSize:9,fontWeight:'700',color:C.text},
  scanLine:{position:'absolute',left:'6%',right:'6%',height:2,backgroundColor:C.blue,opacity:0.65},
  hint:{fontSize:13,color:C.textMuted,textAlign:'center'},
  controls:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',width:'100%',paddingHorizontal:20},
  ctrlBtn:{width:48,height:48,borderRadius:14,backgroundColor:C.surface,borderWidth:1,borderColor:C.border,alignItems:'center',justifyContent:'center',...sh()},
  shutter:{width:64,height:64,borderRadius:32,borderWidth:3,borderColor:'rgba(29,78,216,0.3)',alignItems:'center',justifyContent:'center'},
  shutterInner:{width:52,height:52,borderRadius:26,backgroundColor:C.blue,...sh(0.4,14)},
});
