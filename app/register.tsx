import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Surface, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ShieldCheck, Info, UserCheck, Lock } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const JUCOCH_GREEN = '#2D6A4F';

export default function RegisterScreen() {
  const [alias, setAlias] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <IconButton icon="arrow-left" size={24} />
            </TouchableOpacity>
            <View style={styles.privacyBadge}>
                <ShieldCheck size={16} color={JUCOCH_GREEN} />
                <Text style={styles.privacyText}>Privacy Protected</Text>
            </View>
        </View>

        <View style={styles.titleSection}>
            <Text variant="headlineMedium" style={styles.title}>Create your space</Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
                We prioritize your anonymity. Use an <Text style={styles.bold}>alias</Text> instead of your real name.
            </Text>
        </View>

        <Surface style={styles.aliasCard} elevation={1}>
            <View style={styles.infoRow}>
                <Info size={18} color={JUCOCH_GREEN} />
                <Text style={styles.infoText}>What is an Alias?</Text>
            </View>
            <Text style={styles.aliasDesc}>
                A nickname (e.g., "PeacefulRiver") that lets you use the app without sharing your identity.
            </Text>
        </Surface>

        <View style={styles.formSection}>
            <TextInput
                label="Choose an Alias"
                value={alias}
                onChangeText={setAlias}
                mode="outlined"
                outlineColor="#E0E0E0"
                activeOutlineColor={JUCOCH_GREEN}
                style={styles.input}
                placeholder="e.g. BraveHeart24"
                left={<TextInput.Icon icon="account-circle-outline" color={JUCOCH_GREEN} />}
            />

            <TextInput
                label="Email (For recovery only)"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                outlineColor="#E0E0E0"
                activeOutlineColor={JUCOCH_GREEN}
                style={styles.input}
                left={<TextInput.Icon icon="email-outline" color={JUCOCH_GREEN} />}
            />

            <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                mode="outlined"
                outlineColor="#E0E0E0"
                activeOutlineColor={JUCOCH_GREEN}
                style={styles.input}
                left={<TextInput.Icon icon="lock-outline" color={JUCOCH_GREEN} />}
            />

            <View style={styles.securityNote}>
                <Lock size={12} color="#999" />
                <Text style={styles.securityText}>Your data is end-to-end encrypted.</Text>
            </View>

            <Button 
                mode="contained" 
                onPress={() => router.replace('/(tabs)')} 
                style={styles.registerButton}
                contentStyle={styles.buttonInner}
                buttonColor={JUCOCH_GREEN}
            >
                Create Anonymous Account
            </Button>
        </View>

        <TouchableOpacity style={styles.footer} onPress={() => router.push('/login')}>
            <Text style={styles.footerText}>
                Already have an account? <Text style={styles.loginLink}>Sign In</Text>
            </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  scrollContent: { paddingHorizontal: width > 400 ? 40 : 24, paddingTop: 40, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  backButton: { marginLeft: -12 },
  privacyBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F5F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  privacyText: { fontSize: 11, color: JUCOCH_GREEN, fontWeight: 'bold', marginLeft: 6 },
  titleSection: { marginBottom: 24 },
  title: { fontWeight: 'bold', color: '#1A1A1A' },
  subtitle: { color: '#666', marginTop: 8, lineHeight: 22 },
  bold: { color: JUCOCH_GREEN, fontWeight: 'bold' },
  aliasCard: { backgroundColor: '#F8F9FA', borderRadius: 16, padding: 16, marginBottom: 32, borderLeftWidth: 4, borderLeftColor: JUCOCH_GREEN },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoText: { fontSize: 13, fontWeight: 'bold', color: JUCOCH_GREEN, marginLeft: 8 },
  aliasDesc: { fontSize: 12, color: '#666', lineHeight: 18 },
  formSection: { width: '100%' },
  input: { marginBottom: 16, backgroundColor: '#FFF' },
  securityNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  securityText: { fontSize: 11, color: '#999', marginLeft: 6 },
  registerButton: { borderRadius: 14, elevation: 4, shadowColor: JUCOCH_GREEN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  buttonInner: { height: 56 },
  footer: { marginTop: 40, alignItems: 'center' },
  footerText: { color: '#666', fontSize: 14 },
  loginLink: { color: JUCOCH_GREEN, fontWeight: 'bold' },
});
