
const C = {
  pageBg:'#dbeafe',surface:'rgba(255,255,255,0.65)',surfaceHi:'rgba(255,255,255,0.85)',
  blue:'#1d4ed8',blueDeep:'#1e40af',blueLight:'#60a5fa',bluePale:'#93c5fd',
  text:'#0f172a',textMid:'#334155',textMuted:'#64748b',
  green:'#10b981',border:'rgba(255,255,255,0.9)',white:'#ffffff',
};
const sh=(op=0.08,r=8)=>({shadowColor:'#1d4ed8',shadowOpacity:op,shadowRadius:r,shadowOffset:{width:0,height:2},elevation:Math.round(r/3)});

import React,{useState,useEffect} from 'react';
import {View,Text,TouchableOpacity,ScrollView,StyleSheet,Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {getFavorites,getUserData} from '../utils/storage';
import {exportToPDF} from '../utils/pdf';
import {isPro} from '../utils/purchases';

const CATEGORIES={
  'Zakelijke lunch':      {icon:'🍽', deductible:80},
  'Kantoorbenodigdheden': {icon:'📎', deductible:100},
  'Reiskosten':           {icon:'🚗', deductible:100},
  'Software':             {icon:'💻', deductible:100},
  'Marketing':            {icon:'📢', deductible:100},
  'Overig':               {icon:'📦', deductible:100},
};

const year = new Date().getFullYear();

export default function YearOverviewScreen({navigation}){
  const [scans,setScans]=useState([]);
  const [userData,setUserData]=useState(null);
  const [proAccess,setProAccess]=useState(false);

  useEffect(()=>{loadData();},[]);

  const loadData=async()=>{
    const [user,pro,favs]=await Promise.all([getUserData(),isPro(),getFavorites()]);
    setUserData(user);setProAccess(pro);
    const scanItems=favs.filter(f=>f.type==='scan').map(f=>{
      try{return{...f,data:JSON.parse(f.answer)};}catch{return{...f,data:{}};}
    });
    setScans(scanItems);
  };

  const totalAmount   =scans.reduce((s,i)=>s+parseFloat(i.data?.amount||0),0);
  const totalDeduct   =scans.reduce((s,i)=>{const cat=CATEGORIES[i.data?.category]||{deductible:100};return s+(parseFloat(i.data?.amount||0)*cat.deductible/100);},0);
  const totalBTW      =scans.reduce((s,i)=>s+parseFloat(i.data?.btw||0),0);

  const byCategory=Object.entries(CATEGORIES).map(([name,{icon,deductible}])=>{
    const items=scans.filter(s=>s.data?.category===name);
    const total=items.reduce((s,i)=>s+parseFloat(i.data?.amount||0),0);
    return{name,icon,deductible,count:items.length,total};
  }).filter(c=>c.count>0);

  return(
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={()=>navigation.goBack()} activeOpacity={0.7}>
          <Text style={s.backText}>terug</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Jaaroverzicht {year}</Text>
        <TouchableOpacity style={s.pdfBtn} onPress={()=>exportToPDF(scans,userData?.name)} activeOpacity={0.85}>
          <Text style={s.pdfText}>PDF</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Stats row */}
        <View style={s.statsRow}>
          {[
            {icon:'🧾', value:String(scans.length),  label:'Bonnetjes'},
            {icon:'💶', value:`€${totalDeduct.toFixed(0)}`, label:'Aftrekbaar'},
            {icon:'🏦', value:`€${totalBTW.toFixed(0)}`,    label:'BTW terug'},
          ].map((stat,i)=>(
            <View key={i} style={s.statCard}>
              <Text style={s.statIcon}>{stat.icon}</Text>
              <Text style={s.statValue}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Categories */}
        <Text style={s.sectionLabel}>Per categorie</Text>

        {byCategory.length===0?(
          <View style={s.emptyCard}>
            <Text style={s.emptyIcon}>📸</Text>
            <Text style={s.emptyTitle}>Nog geen bonnetjes</Text>
            <Text style={s.emptyText}>Scan uw eerste bonnetje via de Document Scanner</Text>
            <TouchableOpacity style={s.scannerBtn} onPress={()=>navigation.navigate('Scanner')} activeOpacity={0.85}>
              <Text style={s.scannerBtnText}>Scanner openen →</Text>
            </TouchableOpacity>
          </View>
        ):(
          byCategory.map((cat,i)=>(
            <View key={i} style={s.catCard}>
              <View style={s.catRow}>
                <Text style={s.catIcon}>{cat.icon}</Text>
                <View style={s.catInfo}>
                  <Text style={s.catName}>{cat.name}</Text>
                  <Text style={s.catCount}>{cat.count} bonnetje{cat.count!==1?'s':''}</Text>
                </View>
                <View style={s.catRight}>
                  <Text style={s.catTotal}>€{cat.total.toFixed(2)}</Text>
                  <Text style={s.catDeduct}>{cat.deductible}% aftrekbaar</Text>
                </View>
              </View>
              {/* Progress bar showing deductible % */}
              <View style={s.catBar}>
                <View style={[s.catBarFill,{width:`${cat.deductible}%`}]}/>
              </View>
            </View>
          ))
        )}

        {/* Summary card */}
        <View style={s.summaryCard}>
          <Text style={s.summaryTitle}>Totaaloverzicht {year}</Text>
          <View style={s.summaryDivider}/>
          {[
            {label:'Totaal uitgaven',      value:`€${totalAmount.toFixed(2)}`,  green:false},
            {label:'Totaal aftrekbaar',    value:`€${totalDeduct.toFixed(2)}`,  green:true},
            {label:'BTW terug te vragen',  value:`€${totalBTW.toFixed(2)}`,     green:true},
          ].map((row,i)=>(
            <View key={i} style={s.summaryRow}>
              <Text style={s.summaryLabel}>{row.label}</Text>
              <Text style={row.green?s.summaryValueGreen:s.summaryValue}>{row.value}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s=StyleSheet.create({
  safe:{flex:1,backgroundColor:C.pageBg},
  header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:20,paddingVertical:12,borderBottomWidth:1,borderBottomColor:C.border,backgroundColor:'rgba(219,234,254,0.97)'},
  backBtn:{paddingHorizontal:14,paddingVertical:7,borderRadius:999,backgroundColor:C.surface,borderWidth:1,borderColor:C.border},
  backText:{fontSize:12,color:C.blue,fontWeight:'600'},
  headerTitle:{fontSize:15,fontWeight:'700',color:C.text},
  pdfBtn:{paddingHorizontal:14,paddingVertical:7,borderRadius:999,backgroundColor:C.blue,...sh(0.35,12)},
  pdfText:{fontSize:12,color:'#fff',fontWeight:'700'},
  scroll:{padding:20,paddingBottom:40},

  statsRow:{flexDirection:'row',gap:10,marginBottom:20},
  statCard:{flex:1,backgroundColor:C.surface,borderRadius:18,borderWidth:1,borderColor:C.border,padding:14,alignItems:'center',...sh()},
  statIcon:{fontSize:22,marginBottom:6},
  statValue:{fontSize:20,fontWeight:'700',color:C.blue,letterSpacing:-0.5},
  statLabel:{fontSize:11,color:C.textMuted,marginTop:2,fontWeight:'500'},

  sectionLabel:{fontSize:10,fontWeight:'700',color:C.textMuted,letterSpacing:1.5,textTransform:'uppercase',marginBottom:12},

  emptyCard:{backgroundColor:C.surface,borderRadius:22,borderWidth:1,borderColor:C.border,padding:32,alignItems:'center',marginBottom:20,...sh()},
  emptyIcon:{fontSize:40,marginBottom:12},
  emptyTitle:{fontSize:16,fontWeight:'700',color:C.text,marginBottom:6},
  emptyText:{fontSize:13,color:C.textMuted,textAlign:'center',lineHeight:19,marginBottom:20},
  scannerBtn:{backgroundColor:C.blue,borderRadius:999,paddingVertical:13,paddingHorizontal:24,...sh(0.35,16)},
  scannerBtnText:{color:'#fff',fontSize:14,fontWeight:'700'},

  catCard:{backgroundColor:C.surface,borderRadius:18,borderWidth:1,borderColor:C.border,padding:14,marginBottom:10,...sh()},
  catRow:{flexDirection:'row',alignItems:'center',gap:12,marginBottom:10},
  catIcon:{fontSize:22,width:32},
  catInfo:{flex:1},
  catName:{fontSize:13,fontWeight:'600',color:C.text},
  catCount:{fontSize:11,color:C.textMuted,marginTop:1},
  catRight:{alignItems:'flex-end'},
  catTotal:{fontSize:14,fontWeight:'700',color:C.blue},
  catDeduct:{fontSize:11,color:C.green,marginTop:1,fontWeight:'500'},
  catBar:{height:4,backgroundColor:'rgba(147,197,253,0.3)',borderRadius:999,overflow:'hidden'},
  catBarFill:{height:4,backgroundColor:C.blue,borderRadius:999},

  summaryCard:{backgroundColor:C.blue,borderRadius:22,padding:20,marginTop:8,...sh(0.4,24)},
  summaryTitle:{fontSize:15,fontWeight:'700',color:'#fff',marginBottom:12},
  summaryDivider:{height:1,backgroundColor:'rgba(255,255,255,0.2)',marginBottom:12},
  summaryRow:{flexDirection:'row',justifyContent:'space-between',marginBottom:10},
  summaryLabel:{fontSize:13,color:'rgba(255,255,255,0.75)'},
  summaryValue:{fontSize:13,fontWeight:'600',color:'#fff'},
  summaryValueGreen:{fontSize:13,fontWeight:'700',color:'#4ade80'},
});
