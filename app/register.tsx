import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, IconButton, Surface, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ShieldCheck, Info, Lock, GraduationCap, User, BookOpen, AlertCircle, Key } from 'lucide-react-native';
import { useWellness } from '@/context/WellnessContext';
import { LinearGradient } from 'expo-linear-gradient';
import { registerUser, AuthResponse } from '@/src/services/authService';
import OtpModal from '@/components/OtpModal';

const { width } = Dimensions.get('window');
const JUCOCH_GREEN = '#2D6A4F';

export default function RegisterScreen() {
  const { setUserAlias, setUserRole, setUserToken } = useWellness();
  const [alias, setAlias] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Individual');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    const trimmedAlias = alias.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedAlias || !trimmedEmail || !trimmedPassword) {
      setError('Invalid input: Alias, email, and password cannot be empty or contain only spaces.');
      return;
    }

    if (trimmedAlias.length < 3) {
      setError('Alias must be at least 3 characters long.');
      return;
    }

    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (trimmedPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await registerUser(trimmedAlias, trimmedEmail, password, role);
      if (res.requiresOtp) {
        setOtpEmail(res.email || trimmedEmail);
        setShowOtpModal(true);
      } else if (res.user && res.token) {
        setUserAlias(res.user.alias);
        setUserRole(res.user.role || role);
        setUserToken(res.token);
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerified = (res: AuthResponse) => {
    setShowOtpModal(false);
    if (res.user && res.token) {
      setUserAlias(res.user.alias);
      setUserRole(res.user.role || role);
      setUserToken(res.token);
      router.replace('/(tabs)');
    }
  };

  const roles = [
    { name: 'Individual', icon: User },
    { name: 'Student', icon: GraduationCap },
  ];

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.centerContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <IconButton icon="arrow-left" size={24} iconColor="#1C1F1D" />
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
              <View style={styles.infoIconBg}>
                <Info size={16} color={JUCOCH_GREEN} />
              </View>
              <Text style={styles.infoText}>What is an Alias?</Text>
            </View>
            <Text style={styles.aliasDesc}>
              A nickname (e.g., "PeacefulRiver") that lets you use the app without sharing your identity.
            </Text>
          </Surface>

          {/* Integrated Registration Card */}
          <Surface style={styles.registerCard} elevation={3}>
            <View style={styles.roleSection}>
              <Text style={styles.sectionLabel}>SELECT YOUR ROLE</Text>
              <View style={styles.roleChipGrid}>
                {roles.map((r) => {
                  const Icon = r.icon;
                  const isSelected = role === r.name;
                  return (
                    <TouchableOpacity 
                      key={r.name} 
                      style={[styles.roleChip, isSelected && styles.selectedRoleChip]}
                      onPress={() => setRole(r.name)}
                      activeOpacity={0.75}
                    >
                      <Icon size={16} color={isSelected ? '#FFF' : JUCOCH_GREEN} style={styles.roleIcon} />
                      <Text style={[styles.roleChipText, isSelected && styles.selectedRoleChipText]}>
                        {r.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                label="Choose an Alias"
                value={alias}
                onChangeText={setAlias}
                mode="outlined"
                outlineColor="#EBF2EE"
                activeOutlineColor={JUCOCH_GREEN}
                style={styles.input}
                outlineStyle={{ borderRadius: 16 }}
                placeholder="e.g. BraveHeart24"
                left={<TextInput.Icon icon="account-circle-outline" color={JUCOCH_GREEN} />}
              />

              <TextInput
                label="Email (For recovery only)"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                outlineColor="#EBF2EE"
                activeOutlineColor={JUCOCH_GREEN}
                style={styles.input}
                outlineStyle={{ borderRadius: 16 }}
                left={<TextInput.Icon icon="email-outline" color={JUCOCH_GREEN} />}
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                mode="outlined"
                outlineColor="#EBF2EE"
                activeOutlineColor={JUCOCH_GREEN}
                style={styles.input}
                outlineStyle={{ borderRadius: 16 }}
                left={<TextInput.Icon icon="lock-outline" color={JUCOCH_GREEN} />}
                right={
                  <TextInput.Icon 
                    icon={showPassword ? "eye-off-outline" : "eye-outline"} 
                    color={JUCOCH_GREEN}
                    onPress={() => setShowPassword(!showPassword)} 
                  />
                }
              />
            </View>

            <View style={styles.securityNote}>
              <Lock size={12} color="#909591" />
              <Text style={styles.securityText}>Your data is end-to-end encrypted.</Text>
            </View>

            {!!error && (
              <View style={styles.errorContainer}>
                <AlertCircle size={18} color="#D90429" style={{ marginRight: 8 }} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity 
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
              style={styles.registerButtonWrapper}
            >
              <LinearGradient
                colors={[JUCOCH_GREEN, '#1B4332']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.gradientButtonText}>Create Account ({role})</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Surface>

          <TouchableOpacity style={styles.footer} onPress={() => router.push('/login')}>
            <Text style={styles.footerText}>
              Already have an account? <Text style={styles.loginLink}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <OtpModal
        visible={showOtpModal}
        email={otpEmail}
        onClose={() => setShowOtpModal(false)}
        onVerified={handleOtpVerified}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F3F8F5' 
  },
  scrollContent: { 
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width > 600 ? 32 : 20, 
    paddingVertical: 40 
  },
  centerContainer: {
    width: '100%',
    maxWidth: 480,
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  backButton: { 
    marginLeft: -12,
    backgroundColor: '#FFF',
    borderRadius: 14,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#EBF2EE',
  },
  privacyBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#E8F5E9', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20 
  },
  privacyText: { 
    fontSize: 11, 
    color: JUCOCH_GREEN, 
    fontWeight: 'bold', 
    marginLeft: 6 
  },
  titleSection: { 
    marginBottom: 18 
  },
  title: { 
    fontWeight: 'bold', 
    color: '#1C1F1D' 
  },
  subtitle: { 
    color: '#707571', 
    marginTop: 6, 
    lineHeight: 20,
    fontSize: 14,
  },
  bold: { 
    color: JUCOCH_GREEN, 
    fontWeight: 'bold' 
  },
  aliasCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    padding: 16, 
    marginBottom: 20, 
    borderLeftWidth: 5, 
    borderLeftColor: JUCOCH_GREEN,
    borderWidth: 1,
    borderColor: '#EBF2EE',
  },
  infoRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 6 
  },
  infoIconBg: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  infoText: { 
    fontSize: 13, 
    fontWeight: 'bold', 
    color: JUCOCH_GREEN 
  },
  aliasDesc: { 
    fontSize: 12, 
    color: '#707571', 
    lineHeight: 18 
  },
  registerCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: width > 400 ? 24 : 18,
    borderWidth: 1,
    borderColor: '#E2EFE7',
    shadowColor: JUCOCH_GREEN,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  roleSection: { 
    marginBottom: 20 
  },
  sectionLabel: { 
    fontSize: 11, 
    fontWeight: 'bold', 
    color: '#808983', 
    letterSpacing: 1.2, 
    marginBottom: 12 
  },
  roleChipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F8F5',
    borderColor: '#E2EFE7',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexGrow: 1,
    justifyContent: 'center',
    minWidth: '28%',
  },
  selectedRoleChip: {
    backgroundColor: JUCOCH_GREEN,
    borderColor: JUCOCH_GREEN,
    elevation: 2,
    shadowColor: JUCOCH_GREEN,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  roleIcon: {
    marginRight: 6,
  },
  roleChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B554E',
  },
  selectedRoleChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: { 
    marginBottom: 14, 
    backgroundColor: '#FFF' 
  },
  securityNote: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 20 
  },
  securityText: { 
    fontSize: 11, 
    color: '#909591', 
    marginLeft: 6 
  },
  registerButtonWrapper: {
    marginBottom: 8,
  },
  gradientButton: {
    height: 54,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: JUCOCH_GREEN,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  gradientButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  footer: { 
    marginTop: 24, 
    alignItems: 'center' 
  },
  footerText: { 
    color: '#707571', 
    fontSize: 14 
  },
  loginLink: { 
    color: JUCOCH_GREEN, 
    fontWeight: 'bold' 
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    borderColor: '#FF8080',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#D90429',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
});
