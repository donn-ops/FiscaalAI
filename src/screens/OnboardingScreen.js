import React, { useState, useRef } from ‘react’;
import {
View, Text, TextInput, TouchableOpacity, ScrollView,
StyleSheet, KeyboardAvoidingView, Platform, Animated,
} from ‘react-native’;
import { SafeAreaView } from ‘react-native-safe-area-context’;
import { saveUserData } from ‘../utils/storage’;
import { Colors, Shadows, Radii, Spacing } from ‘../constants/theme’;

const LANGUAGES = [
{ code: ‘nl’, flag: ‘🇳🇱’, label: ‘NL’ },
{ code: ‘en’, flag: ‘🇬🇧’, label: ‘EN’ },
{ code: ‘de’, flag: ‘🇩🇪’, label: ‘DE’ },
{ code: ‘fr’, flag: ‘🇫🇷’, label: ‘FR’ },
];
const SITUATIONS = [
{ key: ‘werknemer’, icon: ‘💼’, label: ‘Werknemer’ },
{ key: ‘zzp’,      icon: ‘⚡’, label: “ZZP’er” },
{ key: ‘student’,  icon: ‘🎓’, label: ‘Student’ },
{ key: ‘gepension’,icon: ‘☀️’, label: ‘Gepensioneerd’ },
{ key: ‘anders’,   icon: ‘◎’,  label: ‘Anders’ },
];
const STEPS = [
{ sub: ‘Uw financiële assistent’,  title: ‘Welkom bij Taxly’,     body: ‘Taxly begrijpt uw situatie en helpt u rust te vinden in uw financiën — belastingen, toeslagen, aftrekposten en meer.’ },
{ sub: ‘AI die voor u meedenkt’,   title: ‘Slimme inzichten’,     body: ‘Taxly analyseert uw situatie en laat u kansen zien die u anders zou missen. Hypotheekaftrek, toeslagen, aftrekposten — wij vinden het voor u.’ },
{ sub: ‘Stel elke vraag, altijd’,  title: ‘Altijd beschikbaar’,   body: ‘Heeft u een vraag over uw belasting? Stel hem gewoon. Geen wachttijden, geen jargon — gewoon duidelijk antwoord.’ },
];

function OrbView({ size = 110 }) {
const anim = useRef(new Animated.Value(0)).current;
React.useEffect(() => {
Animated.loop(Animated.sequence([
Animated.timing(anim, { toValue: -8, duration: 2000, useNativeDriver: true }),
Animated.timing(anim, { toValue: 0,  duration: 2000, useNativeDriver: true }),
])).start();
}, []);
return (
<Animated.View style={{ transform: [{ translateY: anim }] }}>
<View style={{ width: size, height: size, borderRadius: size/2, backgroundColor: Colors.blueDeep, alignItems: ‘center’, justifyContent: ‘center’, borderWidth: 2, borderColor: ‘rgba(255,255,255,0.65)’, shadowColor: Colors.blueDeep, shadowOpacity: 0.4, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 10, overflow: ‘hidden’ }}>
<View style={{ position: ‘absolute’, top: -size*0.1, left: -size*0.1, width: size*0.7, height: size*0.7, borderRadius: size, backgroundColor: ‘rgba(255,255,255,0.15)’ }} />
<View style={{ width: size*0.45, height: size*0.45, borderRadius: size, backgroundColor: ‘rgba(191,219,254,0.7)’ }} />
</View>
</Animated.View>
);
}

export default function OnboardingScreen({ navigation }) {
const [step, setStep] = useState(0);
const [name, setName] = useState(’’);
const [language, setLanguage] = useState(‘nl’);
const [situation, setSituation] = useState(’’);
const [inputFocus, setInputFocus] = useState(false);
const isIntro = step < STEPS.length;
const isForm  = step === STEPS.length;

const handleNext = async () => {
if (isIntro) { setStep(s => s + 1); return; }
const trimmed = name.trim();
if (!trimmed) return;
await saveUserData({ name: trimmed, language, situation });
navigation.replace(‘Home’);
};

return (
<SafeAreaView style={s.safe}>
<KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS===‘ios’?‘padding’:undefined}>
<ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

```
      {/* Progress dots */}
      <View style={s.dots}>
        {[...STEPS,{}].map((_,i) => (
          <View key={i} style={[s.dot, i<=step&&s.dotActive, i===step&&s.dotCurrent]} />
        ))}
      </View>

      {/* Orb / Icon */}
      <View style={s.iconWrap}>
        {step===0
          ? <OrbView size={110} />
          : <View style={s.iconCircle}><Text style={s.iconEmoji}>{step===1?'✦':step===2?'◎':'⬡'}</Text></View>
        }
      </View>

      {/* Intro text */}
      {isIntro && (
        <View style={s.textBlock}>
          <Text style={s.sub}>{STEPS[step].sub}</Text>
          <Text style={s.title}>{STEPS[step].title}</Text>
          <Text style={s.body}>{STEPS[step].body}</Text>
        </View>
      )}

      {/* Form */}
      {isForm && (
        <View style={s.form}>
          <Text style={s.sub}>Vertel ons over uzelf</Text>
          <Text style={s.title}>Bijna klaar</Text>
          <Text style={s.fieldLabel}>Uw naam</Text>
          <TextInput
            style={[s.input, inputFocus&&s.inputFocus]}
            value={name} onChangeText={setName}
            placeholder="Bijv. Jan de Vries" placeholderTextColor={Colors.bluePale}
            autoFocus returnKeyType="done"
            onFocus={()=>setInputFocus(true)} onBlur={()=>setInputFocus(false)}
          />
          <Text style={s.fieldLabel}>Taal</Text>
          <View style={s.langRow}>
            {LANGUAGES.map(l=>(
              <TouchableOpacity key={l.code} style={[s.langBtn,language===l.code&&s.langBtnActive]} onPress={()=>setLanguage(l.code)} activeOpacity={0.75}>
                <Text style={s.langFlag}>{l.flag}</Text>
                <Text style={[s.langLabel,language===l.code&&s.langLabelActive]}>{l.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.fieldLabel}>Uw situatie</Text>
          <View style={s.situationGrid}>
            {SITUATIONS.map(sit=>(
              <TouchableOpacity key={sit.key} style={[s.situationBtn,situation===sit.key&&s.situationBtnActive]} onPress={()=>setSituation(sit.key)} activeOpacity={0.75}>
                <Text style={s.situationIcon}>{sit.icon}</Text>
                <Text style={[s.situationLabel,situation===sit.key&&s.situationLabelActive]}>{sit.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={s.actions}>
        <TouchableOpacity style={[s.btnPrimary,isForm&&!name.trim()&&s.btnDisabled]} onPress={handleNext} disabled={isForm&&!name.trim()} activeOpacity={0.85}>
          <Text style={s.btnPrimaryText}>{isForm?'Account aanmaken →':step<STEPS.length-1?'Verder →':'Bijna klaar →'}</Text>
        </TouchableOpacity>
        {isIntro && step>0 && (
          <TouchableOpacity style={s.btnGhost} onPress={()=>setStep(STEPS.length)} activeOpacity={0.7}>
            <Text style={s.btnGhostText}>Overslaan</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={s.privacy}>Uw gegevens worden lokaal opgeslagen.{'\n'}Nooit gedeeld met derden.</Text>
    </ScrollView>
  </KeyboardAvoidingView>
</SafeAreaView>
```

);
}

const s = StyleSheet.create({
safe:   { flex:1, backgroundColor: Colors.pageBg },
scroll: { flexGrow:1, alignItems:‘center’, paddingHorizontal:28, paddingTop:24, paddingBottom:48 },
dots:   { flexDirection:‘row’, gap:7, marginBottom:36 },
dot:    { height:5, width:7, borderRadius:999, backgroundColor:‘rgba(147,197,253,0.35)’ },
dotActive:  { backgroundColor: Colors.blueBright },
dotCurrent: { width:22 },
iconWrap:   { marginBottom:28, alignItems:‘center’ },
iconCircle: { width:88, height:88, borderRadius:44, borderWidth:1.5, borderColor:`${Colors.blueBright}30`, backgroundColor:`${Colors.blueBright}18`, alignItems:‘center’, justifyContent:‘center’ },
iconEmoji:  { fontSize:34, color:Colors.blueDeep },
textBlock:  { width:‘100%’, alignItems:‘center’, marginBottom:32 },
sub:   { fontSize:11, color:Colors.blueLight, letterSpacing:2.5, textTransform:‘uppercase’, fontWeight:‘700’, marginBottom:8, textAlign:‘center’ },
title: { fontSize:28, fontWeight:‘200’, color:Colors.textPrimary, letterSpacing:-0.8, lineHeight:34, marginBottom:12, textAlign:‘center’ },
body:  { fontSize:14, color:Colors.textMuted, lineHeight:22, textAlign:‘center’, maxWidth:300 },
form:  { width:‘100%’, marginBottom:24 },
fieldLabel: { fontSize:10, fontWeight:‘700’, color:Colors.textMuted, letterSpacing:1.5, textTransform:‘uppercase’, marginBottom:8, marginTop:20 },
input: { width:‘100%’, backgroundColor:‘rgba(255,255,255,0.65)’, borderRadius:999, paddingVertical:13, paddingHorizontal:20, fontSize:14, color:Colors.textPrimary, borderWidth:1, borderColor:‘rgba(255,255,255,0.9)’, shadowColor:Colors.blueDeep, shadowOpacity:0.08, shadowRadius:8, elevation:2 },
inputFocus: { borderColor:‘rgba(59,130,246,0.35)’, backgroundColor:‘rgba(255,255,255,0.85)’ },
langRow:    { flexDirection:‘row’, gap:8 },
langBtn:    { flexDirection:‘row’, alignItems:‘center’, gap:5, paddingHorizontal:14, paddingVertical:9, borderRadius:999, borderWidth:1, borderColor:‘rgba(255,255,255,0.9)’, backgroundColor:‘rgba(255,255,255,0.65)’, shadowColor:Colors.blueDeep, shadowOpacity:0.07, shadowRadius:6, elevation:1 },
langBtnActive: { borderColor:‘rgba(59,130,246,0.35)’, backgroundColor:‘rgba(255,255,255,0.85)’ },
langFlag:   { fontSize:14 },
langLabel:  { fontSize:12, color:Colors.textMuted, fontWeight:‘600’ },
langLabelActive: { color:Colors.blueDeep },
situationGrid: { flexDirection:‘row’, flexWrap:‘wrap’, gap:8 },
situationBtn:  { flexDirection:‘row’, alignItems:‘center’, gap:6, paddingHorizontal:14, paddingVertical:9, borderRadius:999, borderWidth:1, borderColor:‘rgba(255,255,255,0.9)’, backgroundColor:‘rgba(255,255,255,0.65)’, shadowColor:Colors.blueDeep, shadowOpacity:0.07, shadowRadius:6, elevation:1 },
situationBtnActive: { borderColor: Colors.borderBlueMid, backgroundColor: Colors.blueDeep },
situationIcon:  { fontSize:14 },
situationLabel: { fontSize:12, color:Colors.textMuted, fontWeight:‘600’ },
situationLabelActive: { color:Colors.white },
actions:       { width:‘100%’, gap:10, marginBottom:20 },
btnPrimary:    { width:‘100%’, backgroundColor:Colors.blueDeep, borderRadius:999, paddingVertical:14, alignItems:‘center’, shadowColor:Colors.blueDeep, shadowOpacity:0.35, shadowRadius:16, elevation:6 },
btnDisabled:   { backgroundColor:Colors.bluePale },
btnPrimaryText:{ color:Colors.white, fontSize:15, fontWeight:‘700’ },
btnGhost:      { width:‘100%’, borderRadius:999, paddingVertical:11, alignItems:‘center’, borderWidth:1, borderColor:‘rgba(29,78,216,0.2)’ },
btnGhostText:  { color:Colors.blueDeep, fontSize:13, fontWeight:‘600’ },
privacy:       { fontSize:10, color:Colors.textLight, textAlign:‘center’, lineHeight:16 },
});
