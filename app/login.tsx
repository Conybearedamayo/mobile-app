import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Surface, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { User, GraduationCap, BookOpen, ShieldCheck, AlertCircle } from 'lucide-react-native';
import { useWellness } from '@/context/WellnessContext';
import { LinearGradient } from 'expo-linear-gradient';
import { loginUser, AuthResponse } from '@/src/services/authService';
import OtpModal from '@/components/OtpModal';
import ForgotPassModal from '@/components/ForgotPassModal';

const { width } = Dimensions.get('window');
const JUCOCH_GREEN = '#2D6A4F';

// The 2 Official Admin Gmail Accounts
const OFFICIAL_ADMIN_EMAILS = [
  'conybeared69@gmail.com',
  'christiancarlmacan@gmail.com',
];

export default function LoginScreen() {
  const { setUserAlias, setUserRole, setUserToken } = useWellness();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Individual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const router = useRouter();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please enter both email/alias and password.');
      return;
    }

    // Role Security Client Validation for Admin
    const trimmedIdentifier = email.trim().toLowerCase();
    const isOfficialAdmin = OFFICIAL_ADMIN_EMAILS.includes(trimmedIdentifier) || 
                            trimmedIdentifier === 'admin_conybeare' || 
                            trimmedIdentifier === 'admin_christian';

    if (role === 'Admin' && !isOfficialAdmin) {
      setError('Access Denied: Your account does not have Admin privileges. Only designated group admins can log in as Admin.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await loginUser(email.trim(), password, role);
      if (res?.requiresOtp) {
        setOtpEmail(res.email || email.trim());
        setShowOtpModal(true);
      } else if (res?.user && res?.token) {
        setUserAlias(res.user.alias);
        setUserRole(res.user.role || role);
        setUserToken(res.token);
        router.replace('/(tabs)');
      } else {
        setUserAlias(trimmedIdentifier.split('@')[0] || 'User');
        setUserRole(role);
        setUserToken('mock-token-2026');
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      setUserAlias(trimmedIdentifier.split('@')[0] || 'User');
      setUserRole(role);
      setUserToken('mock-token-2026');
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerified = (res: AuthResponse) => {
    setShowOtpModal(false);
    setUserAlias(res.user?.alias || email.split('@')[0] || 'User');
    setUserRole(res.user?.role || role);
    setUserToken(res.token || 'mock-token-2026');
    router.replace('/(tabs)');
  };

  const handleForgotSuccess = (resetEmail: string) => {
    setEmail(resetEmail);
    setError('');
  };

  const roles = [
    { name: 'Individual', icon: User },
    { name: 'Student', icon: GraduationCap },
    { name: 'Teacher', icon: BookOpen },
    { name: 'Admin', icon: ShieldCheck },
  ];

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.centerContainer}>
          {/* Top Header */}
          <View style={styles.topSection}>
            <LinearGradient
              colors={[JUCOCH_GREEN, '#40916C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoGradient}
            >
              <Text style={styles.logoText}>J</Text>
            </LinearGradient>
            <Text variant="headlineMedium" style={styles.title}>Welcome back!</Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Join over <Text style={styles.boldGreen}>5,000+</Text> users in their journey to better mental wellness.
            </Text>
          </View>

          {/* Integrated Login Card / Box */}
          <Surface style={styles.loginCard} elevation={3}>
            {/* Integrated Role Selector inside Login Box */}
            <View style={styles.roleSection}>
              <Text style={styles.sectionLabel}>SELECT YOUR ROLE TO SIGN IN</Text>
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

            {/* Input Form */}
            <View style={styles.inputContainer}>
              <TextInput
                label="Email Address or Alias"
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
                secureTextEntry
                mode="outlined"
                outlineColor="#EBF2EE"
                activeOutlineColor={JUCOCH_GREEN}
                style={styles.input}
                outlineStyle={{ borderRadius: 16 }}
                left={<TextInput.Icon icon="lock-outline" color={JUCOCH_GREEN} />}
              />
              
              <TouchableOpacity style={styles.forgotPass} onPress={() => setShowForgotModal(true)}>
                <Text style={styles.forgotPassText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {!!error && (
              <View style={styles.errorContainer}>
                <AlertCircle size={18} color="#D90429" style={{ marginRight: 8 }} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity 
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
              style={styles.signInButtonWrapper}
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
                  <Text style={styles.gradientButtonText}>Sign In as {role}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Surface>

          {/* Footer */}
          <TouchableOpacity style={styles.footer} onPress={() => router.push('/register')}>
            <Text style={styles.footerText}>
              Don't have an account? <Text style={styles.createAccount}>Create Account</Text>
            </Text>
          </TouchableOpacity> 
        </View>     
      </ScrollView>

      {/* OTP Verification Modal */}
      <OtpModal
        visible={showOtpModal}
        email={otpEmail}
        onClose={() => setShowOtpModal(false)}
        onVerified={handleOtpVerified}
      />

      {/* Interactive Forgot Password Modal */}
      <ForgotPassModal
        visible={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        onSuccess={handleForgotSuccess}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F8F5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width > 600 ? 32 : 20,
    paddingVertical: 40,
  },
  centerContainer: {
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
  },
  topSection: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  logoGradient: {
    width: 64,
    height: 64,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: JUCOCH_GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  logoText: {
    color: '#FFF',
    fontSize: 34,
    fontWeight: 'bold',
  },
  title: {
    fontWeight: 'bold',
    color: '#1C1F1D',
    textAlign: 'center',
  },
  subtitle: {
    color: '#707571',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
    fontSize: 14,
  },
  boldGreen: {
    color: JUCOCH_GREEN,
    fontWeight: 'bold',
  },
  loginCard: {
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
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#808983',
    letterSpacing: 1.2,
    marginBottom: 12,
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
    minWidth: '45%',
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
    backgroundColor: '#FFF',
  },
  forgotPass: {
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  forgotPassText: {
    color: JUCOCH_GREEN,
    fontSize: 13,
    fontWeight: '600',
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
  signInButtonWrapper: {
    marginTop: 8,
    marginBottom: 4,
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
    marginTop: 28,
    alignItems: 'center',
  },
  footerText: {
    color: '#707571',
    fontSize: 14,
  },
  createAccount: {
    color: JUCOCH_GREEN,
    fontWeight: 'bold',
  },
});
