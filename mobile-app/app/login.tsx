import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Surface, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { User, GraduationCap, Sparkles, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react-native';
import { useWellness } from '@/context/WellnessContext';
import { LinearGradient } from 'expo-linear-gradient';
import { loginUser, AuthResponse } from '@/src/services/authService';
import OtpModal from '@/components/OtpModal';
import ForgotPassModal from '@/components/ForgotPassModal';

const { width } = Dimensions.get('window');
const JUCOCH_GREEN = '#2D6A4F';

export default function LoginScreen() {
  const { setUserAlias, setUserRole, setUserToken } = useWellness();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const router = useRouter();

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError('Email and password cannot be empty.');
      return;
    }

    if (trimmedEmail.length < 3 || !trimmedEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await loginUser(trimmedEmail, password);
      if (res?.requiresOtp) {
        setOtpEmail(res.email || trimmedEmail);
        setShowOtpModal(true);
      } else if (res?.user && res?.token) {
        setUserAlias(res.user.alias);
        setUserRole(res.user.role || 'Individual');
        setUserToken(res.token);
        router.replace('/(tabs)');
      } else {
        setError('Login failed. Unable to authenticate account.');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerified = (res: AuthResponse) => {
    setShowOtpModal(false);
    const verifiedRole = res.user?.role || res.role || 'Individual';
    setUserAlias(res.user?.alias || email.split('@')[0] || 'User');
    setUserRole(verifiedRole);
    setUserToken(res.token || 'jwt-user-token');
    router.replace('/(tabs)');
  };

  const handleForgotSuccess = (resetEmail: string) => {
    setEmail(resetEmail);
    setError('');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      {/* Background Gradient Mesh */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={['#E8F5E9', '#F3F8F5', '#EAF4EF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {/* Ambient Top Glow Circle */}
        <View style={styles.ambientGlowTop} />
        {/* Ambient Bottom Glow Circle */}
        <View style={styles.ambientGlowBottom} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.centerContainer}>
          
          {/* Top Hero Pill & Brand Header */}
          <View style={styles.topSection}>
            <View style={styles.systemBadge}>
              <Sparkles size={13} color={JUCOCH_GREEN} style={{ marginRight: 6 }} />
              <Text style={styles.systemBadgeText}>JUCOCH WELLNESS PLATFORM</Text>
            </View>

            <View style={styles.logoWrapper}>
              <LinearGradient
                colors={['#1B4332', JUCOCH_GREEN, '#40916C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoGradient}
              >
                <Text style={styles.logoText}>J</Text>
              </LinearGradient>
            </View>

            <Text variant="headlineMedium" style={styles.title}>WELCOME</Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Sign in to track your mental wellness, AI insights, and daily progress.
            </Text>
          </View>

          {/* Premium Glassmorphism Login Card */}
          <Surface style={styles.loginCard} elevation={4}>
            
            {/* Input Form Fields */}
            <View style={styles.inputContainer}>
              <TextInput
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                outlineColor="#D8F3DC"
                activeOutlineColor={JUCOCH_GREEN}
                style={styles.input}
                outlineStyle={{ borderRadius: 18 }}
                keyboardType="email-address"
                autoCapitalize="none"
                textColor="#1C1F1D"
                placeholderTextColor="#707571"
                left={<TextInput.Icon icon="email-outline" color={JUCOCH_GREEN} />}
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                mode="outlined"
                outlineColor="#D8F3DC"
                activeOutlineColor={JUCOCH_GREEN}
                style={styles.input}
                outlineStyle={{ borderRadius: 18 }}
                textColor="#1C1F1D"
                placeholderTextColor="#707571"
                left={<TextInput.Icon icon="lock-outline" color={JUCOCH_GREEN} />}
                right={
                  <TextInput.Icon 
                    icon={showPassword ? "eye-off-outline" : "eye-outline"} 
                    color={JUCOCH_GREEN}
                    onPress={() => setShowPassword(!showPassword)} 
                  />
                }
              />
              
              <TouchableOpacity style={styles.forgotPass} onPress={() => setShowForgotModal(true)} activeOpacity={0.7}>
                <Text style={styles.forgotPassText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {/* Error Banner */}
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
              activeOpacity={0.85}
              style={styles.signInButtonWrapper}
            >
              <LinearGradient
                colors={['#1B4332', JUCOCH_GREEN, '#2D6A4F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.gradientButtonText}>Log In to Your Account</Text>
                    <ArrowRight size={18} color="#FFF" style={{ marginLeft: 8 }} />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Trust & Security Footer */}
            <View style={styles.trustBadgeRow}>
              <ShieldCheck size={14} color={JUCOCH_GREEN} style={{ marginRight: 6 }} />
              <Text style={styles.trustBadgeText}>Protected by 256-Bit Anonymized OTP Encryption</Text>
            </View>

          </Surface>

          {/* Create Account Link Footer */}
          <TouchableOpacity style={styles.footer} onPress={() => router.push('/register' as any)} activeOpacity={0.7}>
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

      {/* Forgot Password Modal */}
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
  ambientGlowTop: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(45, 106, 79, 0.12)',
  },
  ambientGlowBottom: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(64, 145, 108, 0.1)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  centerContainer: {
    width: '100%',
    maxWidth: 440,
  },
  topSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  systemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D8F3DC',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 16,
    elevation: 2,
    shadowColor: JUCOCH_GREEN,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  systemBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: JUCOCH_GREEN,
    letterSpacing: 1,
  },
  logoWrapper: {
    marginBottom: 12,
    borderRadius: 24,
    elevation: 8,
    shadowColor: JUCOCH_GREEN,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  logoGradient: {
    width: 64,
    height: 64,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  title: {
    fontWeight: '800',
    color: '#1C1F1D',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#5C6B61',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
    fontSize: 13,
    maxWidth: 320,
  },
  loginCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 32,
    padding: width > 400 ? 26 : 20,
    borderWidth: 1.5,
    borderColor: '#D8F3DC',
    shadowColor: JUCOCH_GREEN,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
  roleSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#708275',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  roleChipGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F8F5',
    borderColor: '#D8F3DC',
    borderWidth: 1.5,
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flex: 1,
  },
  selectedRoleChip: {
    backgroundColor: JUCOCH_GREEN,
    borderColor: JUCOCH_GREEN,
    elevation: 3,
    shadowColor: JUCOCH_GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  roleIconBg: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  selectedRoleIconBg: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  roleChipText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2D3A31',
  },
  selectedRoleChipText: {
    color: '#FFFFFF',
  },
  roleSubText: {
    fontSize: 10,
    color: '#708275',
    marginTop: 1,
  },
  selectedRoleSubText: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    fontSize: 14,
  },
  forgotPass: {
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  forgotPassText: {
    color: JUCOCH_GREEN,
    fontSize: 13,
    fontWeight: '700',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    borderColor: '#FF8080',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#D90429',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  signInButtonWrapper: {
    marginTop: 6,
    marginBottom: 16,
  },
  gradientButton: {
    height: 56,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: JUCOCH_GREEN,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  gradientButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  trustBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EBF4EE',
  },
  trustBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#708275',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    color: '#5C6B61',
    fontSize: 14,
  },
  createAccount: {
    color: JUCOCH_GREEN,
    fontWeight: 'bold',
  },
});
