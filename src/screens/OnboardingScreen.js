import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveUserData } from '../utils/storage';

const LANGUAGES = [
  { code: 'nl', flag: '🇳🇱', label: 'NL' },
  { code: 'en', flag: '🇬🇧', label: 'EN' },
  { code: 'de', flag: '🇩🇪', label: 'DE' },
  { code: 'fr', flag: '🇫🇷', label: 'FR' },
];

export default function OnboardingScreen({ navigation }) {
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('nl');

  const handleStart = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await saveUserData({ name: trimmed, language });
    navigation.replace('Home');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>

          <View style={styles.logoBox}>
            <Text style={styles.logoText}>T</Text>
          </View>

          <Text style={styles.title}>Welkom bij Taxly</Text>
          <Text style={styles.subtitle}>
            Persoonlijk belastingadvies,{'\n'}altijd en overal beschikbaar.
          </Text>

          <Text style={styles.inputLabel}>Wat is uw voornaam?</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Vul uw naam in..."
            placeholderTextColor="#a0aec0"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleStart}
          />

          <Text style={styles.inputLabel}>Kies uw taal</Text>
          <View style={styles.langRow}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langBtn, language === lang.code && styles.langBtnActive]}
                onPress={() => setLanguage(lang.code)}
              >
                <Text style={styles.langFlag}>{lang.flag}</Text>
                <Text style={[styles.langLabel, language === lang.code && styles.langLabelActive]}>
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.startBtn, !name.trim() && styles.startBtnDisabled]}
            onPress={handleStart}
            disabled={!name.trim()}
          >
            <Text style={styles.startBtnText}>Aan de slag →</Text>
          </TouchableOpacity>

          <Text style={styles.privacy}>
            Uw naam wordt alleen lokaal opgeslagen op uw apparaat.{'\n'}
            Nooit gedeeld met derden.
          </Text>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'white' },
  flex: { flex: 1 },
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 28, paddingBottom: 20,
  },
  logoBox: {
    width: 76, height: 76,
    background: 'transparent',
    backgroundColor: '#154273',
    borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#154273', shadowOpacity: 0.35,
    shadowRadius: 16, elevation: 8,
  },
  logoText: {
    fontSize: 36, fontWeight: '800', color: 'white',
  },
  title: {
    fontSize: 26, fontWeight: '800', color: '#154273',
    marginBottom: 8, textAlign: 'center',
  },
  subtitle: {
    fontSize: 14, color: '#7a8fa8', textAlign: 'center',
    lineHeight: 22, marginBottom: 32,
  },
  inputLabel: {
    alignSelf: 'flex-start',
    fontSize: 12, fontWeight: '700', color: '#154273',
    textTransform: 'uppercase', letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    borderWidth: 2, borderColor: '#dde3ed',
    borderRadius: 12, padding: 14,
    fontSize: 15, color: '#2c3e50',
    marginBottom: 24,
  },
  langRow: {
    flexDirection: 'row', gap: 10,
    marginBottom: 28, alignSelf: 'flex-start',
  },
  langBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1.5, borderColor: '#dde3ed',
    borderRadius: 20, backgroundColor: 'white',
  },
  langBtnActive: {
    borderColor: '#154273', backgroundColor: '#EEF2F7',
  },
  langFlag: { fontSize: 14 },
  langLabel: { fontSize: 12, color: '#7a8fa8', fontWeight: '600' },
  langLabelActive: { color: '#154273' },
  startBtn: {
    width: '100%', backgroundColor: '#154273',
    borderRadius: 14, padding: 16,
    alignItems: 'center', marginBottom: 16,
    shadowColor: '#154273', shadowOpacity: 0.3,
    shadowRadius: 12, elevation: 5,
  },
  startBtnDisabled: { backgroundColor: '#cdd5e0' },
  startBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
  privacy: {
    fontSize: 10, color: '#a0aec0',
    textAlign: 'center', lineHeight: 16,
  },
});
