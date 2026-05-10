
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

import React,{useState} from 'react';
import {View,Text,TouchableOpacity,StyleSheet,Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {purchasePremium,purchasePro,restorePurchases} from '../utils/purchases';

const FEATURES=['Onbeperkt vragen aan Taxly','Bonnetjes scannen - automatisch geboekt','Belastingkalender met deadlines','Jaaroverzicht en rapportage'];

function AppIcon({size=72}){
  return(
    <View style={{width:size,height:size,borderRadius:size*0.22,backgroundColor:'#c7d9f8',alignItems:'center',justifyContent:'center',overflow:'hidden',...sh(0.25,24)}}>
      <View style={{position:'absolute',inset:0,backgroundColor:'rgba(255,255,255,0.3)'}}/>
      <View style={{width:size*0.62,height:size*0.62,borderRadius:size*0.31,backgroundColor:'rgba(255,255,255,0.45)',borderWidth:1,borderColor:'rgba(255,255,255,0.7)',alignItems:'center',justifyContent:'center'}}>
        <Text style={{fontSize:size*0.28,fontWeight:'300',color:C.blue}}>T</Text>
      </View>
    </View>
  );
}

export default function PaywallScreen({navigation}){
  const [selected,setSelected]=useState('premium');
  const [loading,setLoading]=useState(false);

  const handlePurchase=async()=>{
    setLoading(true);
    try{
      if(selected==='premium')await purchasePremium();else await purchasePro();
      Alert.alert('Welkom bij Taxly Premium!','Uw abonnement is geactiveerd.');
      navigation.goBack();
    }catch{Alert.alert('Fout','Aankoop mislukt. Probeer opnieuw.');}
    setLoading(false);
  };

  return(
    <SafeAreaView style={s.safe}>
      <View style={s.screen}>
        <TouchableOpacity style={s.closeBtn} onPress={()=>navigation.goBack()} activeOpacity={0.7}>
          <Text style={s.closeBtnText}>x</Text>
        </TouchableOpacity>

        <View style={s.top}>
          <AppIcon size={68}/>
          <Text style={s.badge}>TAXLY PREMIUM</Text>
          <Text style={s.title}>Onbeperkt advies,{'\n'}een vast bedrag</Text>
        </View>

        <View style={s.planRow}>
          <TouchableOpacity style={[s.planCard,selected==='free'&&s.planSel]} onPress={()=>setSelected('free')} activeOpacity={0.8}>
            <Text style={s.planLabel}>BASIS</Text>
            <Text style={s.planPrice}>Gratis</Text>
            <Text style={s.planSub}>3 vragen / mnd</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.planCard,s.planPremium,selected==='premium'&&s.planSel]} onPress={()=>setSelected('premium')} activeOpacity={0.8}>
            <View style={s.popularBadge}><Text style={s.popularText}>POPULAIRST</Text></View>
            <Text style={[s.planLabel,{color:C.blue}]}>PREMIUM</Text>
            <Text style={s.planPrice}>6,99 euro</Text>
            <Text style={s.planSub}>per maand</Text>
          </TouchableOpacity>
        </View>

        <View style={s.featCard}>
          {FEATURES.map((f,i)=>(
            <View key={i} style={s.featRow}>
              <View style={s.featCheck}><Text style={{color:'#fff',fontSize:10,fontWeight:'700'}}>v</Text></View>
              <Text style={s.featText}>{f}</Text>
            </View>
          ))}
        </View>

        <View style={s.bottom}>
          <TouchableOpacity style={s.cta} onPress={handlePurchase} disabled={loading} activeOpacity={0.88}>
            <Text style={s.ctaText}>{loading?'Laden...':'Start 14 dagen gratis'}</Text>
          </TouchableOpacity>
          <Text style={s.subText}>Daarna 6,99 euro/mnd - Altijd opzegbaar</Text>
          <TouchableOpacity onPress={restorePurchases} activeOpacity={0.7}>
            <Text style={s.restore}>Aankoop herstellen</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s=StyleSheet.create({
  safe:{flex:1,backgroundColor:C.pageBg},
  screen:{flex:1,paddingHorizontal:22,paddingTop:12,justifyContent:'space-between'},
  closeBtn:{alignSelf:'flex-end',width:32,height:32,borderRadius:999,backgroundColor:C.surface,borderWidth:1,borderColor:C.border,alignItems:'center',justifyContent:'center'},
  closeBtnText:{fontSize:14,color:C.textMuted},
  top:{alignItems:'center',gap:8},
  badge:{fontSize:11,fontWeight:'700',letterSpacing:2.5,textTransform:'uppercase',color:C.blueLight},
  title:{fontSize:22,fontWeight:'200',color:C.text,letterSpacing:-0.8,lineHeight:28,textAlign:'center'},
  planRow:{flexDirection:'row',gap:10},
  planCard:{flex:1,backgroundColor:C.surface,borderRadius:18,borderWidth:1,borderColor:C.border,padding:13,...sh()},
  planPremium:{backgroundColor:C.surfaceHi},
  planSel:{borderWidth:2,borderColor:C.blue,...sh(0.2,16)},
  popularBadge:{position:'absolute',top:-9,left:9,backgroundColor:C.blue,borderRadius:6,paddingHorizontal:7,paddingVertical:2},
  popularText:{fontSize:7,fontWeight:'700',color:'#fff',letterSpacing:0.5},
  planLabel:{fontSize:9,fontWeight:'700',letterSpacing:1.2,color:C.textMuted,textTransform:'uppercase',marginTop:4},
  planPrice:{fontSize:19,fontWeight:'200',color:C.text,marginTop:2,letterSpacing:-0.5},
  planSub:{fontSize:10,color:C.textMuted,marginTop:1},
  featCard:{backgroundColor:C.surface,borderRadius:20,borderWidth:1,borderColor:C.border,padding:14,gap:10,...sh()},
  featRow:{flexDirection:'row',alignItems:'center',gap:10},
  featCheck:{width:19,height:19,borderRadius:999,backgroundColor:C.blue,alignItems:'center',justifyContent:'center',flexShrink:0,...sh(0.3,6)},
  featText:{fontSize:13,color:C.textMid,flex:1},
  bottom:{gap:8,paddingBottom:8},
  cta:{backgroundColor:C.blueDeep,borderRadius:999,paddingVertical:14,alignItems:'center',...sh(0.45,20)},
  ctaText:{color:'#fff',fontSize:15,fontWeight:'700'},
  subText:{fontSize:11,color:C.blue,fontWeight:'500',textAlign:'center',opacity:0.65},
  restore:{fontSize:12,color:C.textMuted,textAlign:'center',textDecorationLine:'underline'},
});
