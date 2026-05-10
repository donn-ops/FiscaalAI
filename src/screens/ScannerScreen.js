import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { getUserData, saveFavorite } from '../utils/storage';
import { isPro } from '../utils/purchases';
import { Colors, Radii, Shadows } from '../constants/theme';

export default function ScannerScreen({ navigation }) {
  const [scanning, setScanning] = useState(false);
  const scanAnim = useRef(new Animated.Value(0)).current;

  const startScan = () => {
    setScanning(true);
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue:1, duration:1800, useNativeDriver:true }),
        Animated.timing(scanAnim, { toValue:0, duration:0,    useNativeDriver:true }),
      ])
    ).start();
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Toegang nodig', 'Sta toegang toe tot je fotobibliotheek.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled) startScan();
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Camera nodig', 'Sta toegang toe tot je camera.'); return; }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) startScan();
  };

  const scanY = scanAnim.interpolate({ inputRange:[0,1], outputRange:[-2, 260] });

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Bonnetje scannen</Text>
        <View style={{ width:40 }} />
      </View>

      <View style={s.body}>
        {/* Viewfinder */}
        <View style={s.viewfinder}>
          {/* Corner brackets */}
          <View style={[s.corner, s.cornerTL]} />
          <View style={[s.corner, s.cornerTR]} />
          <View style={[s.corner, s.cornerBL]} />
          <View style={[s.corner, s.cornerBR]} />

          {/* Receipt mockup */}
          <View style={s.receipt}>
            <Text style={s.receiptStore}>ALBERT HEIJN</Text>
            <View style={s.receiptDivider} />
            {[['Koffiebonen','8,49'],['Kantoor','24,90'],['Lunch','18,75']].map(([a,b],i) => (
              <View key={i} style={s.receiptRow}>
                <Text style={s.receiptItem}>{a}</Text>
                <Text style={s.receiptItem}>{b}</Text>
              </View>
            ))}
            <View style={s.receiptDivider} />
            <View style={s.receiptRow}>
              <Text style={s.receiptTotal}>TOTAAL</Text>
              <Text style={s.receiptTotal}>52,14</Text>
            </View>
          </View>

          {/* Scan line */}
          {scanning && (
            <Animated.View style={[s.scanLine, { transform:[{ translateY: scanY }] }]} />
          )}
        </View>

        <Text style={s.hint}>Plaats het bonnetje in het kader</Text>

        {/* Controls */}
        <View style={s.controls}>
          <TouchableOpacity style={s.controlBtn} onPress={pickImage} activeOpacity={0.75}>
            <Text style={s.controlBtnIcon}>📁</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.shutterBtn} onPress={takePhoto} activeOpacity={0.85}>
            <View style={s.shutterInner} />
          </TouchableOpacity>

          <TouchableOpacity style={s.controlBtn} activeOpacity={0.75}>
            <Text style={s.controlBtnIcon}>⚡</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const BLUE = Colors.blueDeep;

const s = StyleSheet.create({
  safe:   { flex:1, backgroundColor: Colors.pageBg },
  header: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:20, paddingVertical:13, borderBottomWidth:1, borderBottomColor:'rgba(255,255,255,0.65)', backgroundColor:'rgba(219,234,254,0.97)' },
  backBtn:{ width:40, height:36, borderRadius:999, backgroundColor:'rgba(255,255,255,0.65)', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.9)' },
  backText:{ fontSize:18, color:BLUE, fontWeight:'600' },
  headerTitle:{ fontSize:15, fontWeight:'700', color: Colors.textPrimary },

  body: { flex:1, alignItems:'center', justifyContent:'center', padding:24 },

  viewfinder: {
    width:'100%', height:300,
    backgroundColor:'rgba(255,255,255,0.5)',
    borderRadius:20, borderWidth:1,
    borderColor:'rgba(255,255,255,0.9)',
    overflow:'hidden', marginBottom:16,
    alignItems:'center', justifyContent:'center',
    ...Shadows.md,
  },

  corner: { position:'absolute', width:24, height:24, borderColor:BLUE, borderRadius:4 },
  cornerTL: { top:12, left:12,  borderTopWidth:3, borderLeftWidth:3  },
  cornerTR: { top:12, right:12, borderTopWidth:3, borderRightWidth:3 },
  cornerBL: { bottom:12, left:12,  borderBottomWidth:3, borderLeftWidth:3  },
  cornerBR: { bottom:12, right:12, borderBottomWidth:3, borderRightWidth:3 },

  receipt: { backgroundColor:'#fff', borderRadius:6, padding:12, width:'55%', transform:[{rotate:'-2deg'}], ...Shadows.md },
  receiptStore:   { textAlign:'center', fontWeight:'700', fontSize:10, letterSpacing:0.6, color:'#0F172A', marginBottom:6 },
  receiptDivider: { height:1, borderTopWidth:1, borderColor:'#CBD5E1', borderStyle:'dashed', marginVertical:5 },
  receiptRow:     { flexDirection:'row', justifyContent:'space-between' },
  receiptItem:    { fontSize:9, color:'#334155' },
  receiptTotal:   { fontSize:9, fontWeight:'700', color:'#0F172A' },

  scanLine: {
    position:'absolute', left:'6%', right:'6%', height:2,
    backgroundColor: BLUE, opacity:0.7,
    shadowColor:BLUE, shadowOpacity:0.5, shadowRadius:6,
  },

  hint: { fontSize:13, color: Colors.textMuted, marginBottom:28, textAlign:'center' },

  controls: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', width:'100%', paddingHorizontal:20 },
  controlBtn: {
    width:48, height:48, borderRadius:12,
    backgroundColor:'rgba(255,255,255,0.65)',
    borderWidth:1, borderColor:'rgba(255,255,255,0.9)',
    alignItems:'center', justifyContent:'center',
    ...Shadows.sm,
  },
  controlBtnIcon: { fontSize:20 },
  shutterBtn: {
    width:64, height:64, borderRadius:32,
    borderWidth:3, borderColor:`rgba(29,78,216,0.3)`,
    alignItems:'center', justifyContent:'center',
  },
  shutterInner: {
    width:52, height:52, borderRadius:26,
    backgroundColor: BLUE,
    shadowColor:BLUE, shadowOpacity:0.4, shadowRadius:12, elevation:6,
  },
});
