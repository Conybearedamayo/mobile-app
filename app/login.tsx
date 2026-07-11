import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Surface, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GraduationCap, Briefcase, Building2, User, ChevronRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const JUCOCH_GREEN = '#2D6A4F';
const ACCENT_GREEN = '#1B4332';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Individual');
  const router = useRouter();

  const roles = [
    { name: 'Individual', icon: User },
    { name: 'Student', icon: GraduationCap },
    { name: 'Professional', icon: Briefcase },
    { name: 'Institution', icon: Building2 },
  ];

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topSection}>
            <Surface style={styles.logoPlaceholder} elevation={1}>
                <Text style={styles.logoText}>J</Text>
            </Surface>
            <Text variant="headlineMedium" style={styles.title}>Welcome back!</Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
                Join over <Text style={styles.boldGreen}>5,000+</Text> users in their journey to better mental wellness.
            </Text>
        </View>

        <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>SELECT YOUR ROLE</Text>
            <View style={styles.roleGrid}>
                {roles.map((r) => {
                    const Icon = r.icon;
                    const isSelected = role === r.name;
                    return (
                        <TouchableOpacity 
                            key={r.name} 
                            style={[styles.roleCard, isSelected && styles.selectedRoleCard]}
                            onPress={() => setRole(r.name)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconCircle, isSelected && styles.selectedIconCircle]}>
                                <Icon size={20} color={isSelected ? '#FFF' : JUCOCH_GREEN} />
                            </View>
                            <Text style={[styles.roleText, isSelected && styles.selectedRoleText]}>{r.name}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    label="Email Address"
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    outlineColor="#E0E0E0"
                    activeOutlineColor={JUCOCH_GREEN}
                    style={styles.input}
                    left={<TextInput.Icon icon="email" color={JUCOCH_GREEN} />}
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
                    left={<TextInput.Icon icon="lock" color={JUCOCH_GREEN} />}
                />
                
                <TouchableOpacity style={styles.forgotPass}>
                    <Text style={styles.forgotPassText}>Forgot password?</Text>
                </TouchableOpacity>
            </View>

            <Button 
                mode="contained" 
                onPress={() => router.replace('/(tabs)')} 
                style={styles.signInButton}
                contentStyle={styles.buttonInner}
                buttonColor={JUCOCH_GREEN}
            >
                Sign In
            </Button>

            <View style={styles.dividerRow}>
                <View style={styles.line} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.line} />
            </View>

            <Button 
                mode="outlined" 
                style={styles.googleButton} 
                textColor="#333" 
                icon="google"
                onPress={() => {}}
            >
                Continue with Google
            </Button>
        </View>

        <TouchableOpacity style={styles.footer} onPress={() => router.push('/register')}>
        <Text style={styles.footerText}>
            Don't have an account? <Text style={styles.createAccount}>Create Alias</Text>
        </Text>
        </TouchableOpacity>      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: width > 400 ? 40 : 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  topSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: JUCOCH_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  title: {
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  subtitle: {
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  boldGreen: {
    color: JUCOCH_GREEN,
    fontWeight: 'bold',
  },
  formSection: {
    width: '100%',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999',
    letterSpacing: 1,
    marginBottom: 16,
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  roleCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  selectedRoleCard: {
    backgroundColor: '#FFF',
    borderColor: JUCOCH_GREEN,
    borderWidth: 2,
    elevation: 4,
    shadowColor: JUCOCH_GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedIconCircle: {
    backgroundColor: JUCOCH_GREEN,
  },
  roleText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  selectedRoleText: {
    color: JUCOCH_GREEN,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFF',
  },
  forgotPass: {
    alignSelf: 'flex-end',
  },
  forgotPassText: {
    color: JUCOCH_GREEN,
    fontSize: 13,
    fontWeight: '600',
  },
  signInButton: {
    borderRadius: 14,
    elevation: 4,
    shadowColor: JUCOCH_GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 24,
  },
  buttonInner: {
    height: 56,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#EEE',
  },
  orText: {
    marginHorizontal: 16,
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  googleButton: {
    borderRadius: 14,
    height: 56,
    justifyContent: 'center',
    borderColor: '#E0E0E0',
    borderWidth: 1.5,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  createAccount: {
    color: JUCOCH_GREEN,
    fontWeight: 'bold',
  },
});
