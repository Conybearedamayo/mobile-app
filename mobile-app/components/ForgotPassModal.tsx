import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform, Dimensions } from 'react-native';
import { Text, TextInput, Surface, IconButton } from 'react-native-paper';
import { KeyRound, ShieldCheck, AlertCircle, Lock, Mail, CheckCircle2, ArrowRight, UserCheck, Check, X as XIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { resetPasswordApi, sendOtp, verifyOtp } from '@/src/services/authService';

const { width } = Dimensions.get('window');
const JUCOCH_GREEN = '#2D6A4F';

export const validateStrongPassword = (pass: string) => {
  const hasMinLength = pass.length >= 8;
  const hasUpper = /[A-Z]/.test(pass);
  const hasLower = /[a-z]/.test(pass);
  const hasNumber = /[0-9]/.test(pass);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pass);

  const isValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;
  let message = '';
  if (!hasMinLength) message = 'Password must be at least 8 characters long.';
  else if (!hasUpper) message = 'Password must contain at least one uppercase letter (A-Z).';
  else if (!hasLower) message = 'Password must contain at least one lowercase letter (a-z).';
  else if (!hasNumber) message = 'Password must contain at least one number (0-9).';
  else if (!hasSpecial) message = 'Password must contain at least one special symbol (!@#$%^&*).';

  return { isValid, message, hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial };
};

interface ForgotPassModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export default function ForgotPassModal({ visible, onClose, onSuccess }: ForgotPassModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [timer, setTimer] = useState(30);

  // STEP 1: Send OTP to verify account
  const handleSendCode = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your registered email address.');
      return;
    }
    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await sendOtp(trimmedEmail);
      setSuccessMsg(`A 6-digit code was sent to ${trimmedEmail}`);
      setTimeout(() => {
        setSuccessMsg('');
        setStep(2);
      }, 700);
    } catch (err: any) {
      setError(err?.message || 'Failed to find account or send code.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify "This is You" (OTP Verification)
  const handleVerifyOtp = async () => {
    const trimmedCode = resetCode.trim();
    if (!trimmedCode || trimmedCode.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await verifyOtp(email.trim(), trimmedCode);
      setSuccessMsg("Identity Verified! Please set your new password.");
      setTimeout(() => {
        setSuccessMsg('');
        setStep(3);
      }, 700);
    } catch (err: any) {
      setError(err?.message || 'Invalid verification code. Please check your email and try again.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Create & Save New Password
  const handleResetPassword = async () => {
    const trimmedPass = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();

    const passCheck = validateStrongPassword(trimmedPass);
    if (!passCheck.isValid) {
      setError(passCheck.message);
      return;
    }
    if (trimmedPass !== trimmedConfirm) {
      setError('Passwords do not match. Please re-type correctly.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await resetPasswordApi(email.trim(), resetCode.trim(), trimmedPass);
      setSuccessMsg(res.message || 'Password successfully updated in database!');
      setTimeout(() => {
        onSuccess(email.trim());
        handleClose();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resending) return;
    setError('');
    setResending(true);
    try {
      await sendOtp(email.trim());
      setSuccessMsg('A new 6-digit code has been sent to your email!');
      setTimer(30);
    } catch (err: any) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setEmail('');
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccessMsg('');
    onClose();
  };

  const passAnalysis = validateStrongPassword(newPassword.trim());

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollOverlay}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Surface style={styles.card} elevation={5}>
            
            {/* Header & Step Counter */}
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                {step === 1 ? (
                  <Mail size={22} color={JUCOCH_GREEN} />
                ) : step === 2 ? (
                  <UserCheck size={22} color={JUCOCH_GREEN} />
                ) : (
                  <KeyRound size={22} color={JUCOCH_GREEN} />
                )}
              </View>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>Step {step} of 3</Text>
              </View>
              <IconButton icon="close" size={20} onPress={handleClose} style={styles.closeBtn} />
            </View>

            {/* Dynamic Titles per Step */}
            <Text variant="headlineSmall" style={styles.title}>
              {step === 1 && 'Find Your Account'}
              {step === 2 && 'Confirm It\'s You'}
              {step === 3 && 'Create New Password'}
            </Text>
            
            <Text variant="bodyMedium" style={styles.subtitle}>
              {step === 1 && 'Enter your registered email address and we will send you a 6-digit verification code.'}
              {step === 2 && `We sent a 6-digit code to ${email}. Confirm this is really your account to proceed.`}
              {step === 3 && 'Identity confirmed! Please create a strong password to protect your account.'}
            </Text>

            {/* STEP 1: ENTER EMAIL */}
            {step === 1 && (
              <View style={styles.inputContainer}>
                <TextInput
                  label="Registered Email Address"
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  outlineColor="#D8F3DC"
                  activeOutlineColor={JUCOCH_GREEN}
                  style={styles.input}
                  outlineStyle={{ borderRadius: 16 }}
                  textColor="#1C1F1D"
                  placeholderTextColor="#707571"
                  placeholder="e.g. name@gmail.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  left={<TextInput.Icon icon="email-outline" color={JUCOCH_GREEN} />}
                />
              </View>
            )}

            {/* STEP 2: CONFIRM IT'S YOU (ENTER OTP) */}
            {step === 2 && (
              <View style={styles.inputContainer}>
                <TextInput
                  label="6-Digit Verification Code"
                  value={resetCode}
                  onChangeText={setResetCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  mode="outlined"
                  outlineColor="#D8F3DC"
                  activeOutlineColor={JUCOCH_GREEN}
                  style={styles.otpInput}
                  outlineStyle={{ borderRadius: 16 }}
                  textColor="#1C1F1D"
                  placeholderTextColor="#707571"
                  placeholder="1 2 3 4 5 6"
                  left={<TextInput.Icon icon="key-outline" color={JUCOCH_GREEN} />}
                />

                <View style={styles.resendRow}>
                  <Text style={styles.resendText}>Didn't receive code? </Text>
                  <TouchableOpacity onPress={handleResend} disabled={resending}>
                    <Text style={styles.resendLink}>
                      {resending ? 'Sending...' : 'Resend Code'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* STEP 3: CREATE NEW PASSWORD */}
            {step === 3 && (
              <View style={styles.inputContainer}>
                <View style={styles.verifiedBanner}>
                  <CheckCircle2 size={16} color={JUCOCH_GREEN} style={{ marginRight: 6 }} />
                  <Text style={styles.verifiedBannerText}>Account Verified: {email}</Text>
                </View>

                <TextInput
                  label="New Strong Password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showPassword}
                  mode="outlined"
                  outlineColor="#D8F3DC"
                  activeOutlineColor={JUCOCH_GREEN}
                  style={styles.input}
                  outlineStyle={{ borderRadius: 16 }}
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

                {/* Password Criteria Checklist */}
                <View style={styles.criteriaCard}>
                  <Text style={styles.criteriaTitle}>Strong Password Requirements:</Text>
                  <View style={styles.criteriaRow}>
                    <View style={styles.criteriaItem}>
                      {passAnalysis.hasMinLength ? (
                        <Check size={12} color={JUCOCH_GREEN} />
                      ) : (
                        <XIcon size={12} color="#8A928D" />
                      )}
                      <Text style={[styles.criteriaText, passAnalysis.hasMinLength && styles.criteriaTextActive]}>
                        8+ chars
                      </Text>
                    </View>
                    <View style={styles.criteriaItem}>
                      {passAnalysis.hasUpper ? (
                        <Check size={12} color={JUCOCH_GREEN} />
                      ) : (
                        <XIcon size={12} color="#8A928D" />
                      )}
                      <Text style={[styles.criteriaText, passAnalysis.hasUpper && styles.criteriaTextActive]}>
                        Uppercase (A-Z)
                      </Text>
                    </View>
                    <View style={styles.criteriaItem}>
                      {passAnalysis.hasLower ? (
                        <Check size={12} color={JUCOCH_GREEN} />
                      ) : (
                        <XIcon size={12} color="#8A928D" />
                      )}
                      <Text style={[styles.criteriaText, passAnalysis.hasLower && styles.criteriaTextActive]}>
                        Lowercase (a-z)
                      </Text>
                    </View>
                  </View>
                  <View style={styles.criteriaRow}>
                    <View style={styles.criteriaItem}>
                      {passAnalysis.hasNumber ? (
                        <Check size={12} color={JUCOCH_GREEN} />
                      ) : (
                        <XIcon size={12} color="#8A928D" />
                      )}
                      <Text style={[styles.criteriaText, passAnalysis.hasNumber && styles.criteriaTextActive]}>
                        Number (0-9)
                      </Text>
                    </View>
                    <View style={styles.criteriaItem}>
                      {passAnalysis.hasSpecial ? (
                        <Check size={12} color={JUCOCH_GREEN} />
                      ) : (
                        <XIcon size={12} color="#8A928D" />
                      )}
                      <Text style={[styles.criteriaText, passAnalysis.hasSpecial && styles.criteriaTextActive]}>
                        Symbol (!@#$%)
                      </Text>
                    </View>
                  </View>
                </View>

                <TextInput
                  label="Confirm New Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  mode="outlined"
                  outlineColor="#D8F3DC"
                  activeOutlineColor={JUCOCH_GREEN}
                  style={styles.input}
                  outlineStyle={{ borderRadius: 16 }}
                  textColor="#1C1F1D"
                  placeholderTextColor="#707571"
                  left={<TextInput.Icon icon="lock-check-outline" color={JUCOCH_GREEN} />}
                  right={
                    <TextInput.Icon 
                      icon={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                      color={JUCOCH_GREEN}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)} 
                    />
                  }
                />
              </View>
            )}

            {/* Error Message Box */}
            {!!error && (
              <View style={styles.errorBox}>
                <AlertCircle size={16} color="#D90429" style={{ marginRight: 6 }} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Success Message Box */}
            {!!successMsg && (
              <View style={styles.successBox}>
                <ShieldCheck size={16} color={JUCOCH_GREEN} style={{ marginRight: 6 }} />
                <Text style={styles.successText}>{successMsg}</Text>
              </View>
            )}

            {/* Dynamic Action Button */}
            <TouchableOpacity
              onPress={
                step === 1 ? handleSendCode :
                step === 2 ? handleVerifyOtp :
                handleResetPassword
              }
              disabled={loading}
              activeOpacity={0.8}
              style={styles.actionBtnWrapper}
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
                    <Text style={styles.actionBtnText}>
                      {step === 1 && 'Send Verification Code'}
                      {step === 2 && 'Verify Code & Proceed'}
                      {step === 3 && 'Save & Update Password'}
                    </Text>
                    <ArrowRight size={16} color="#FFF" style={{ marginLeft: 6 }} />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

          </Surface>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scrollOverlay: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: width < 380 ? 16 : 22,
    borderWidth: 1.5,
    borderColor: '#D8F3DC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C2E6D1',
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: JUCOCH_GREEN,
  },
  closeBtn: {
    margin: -8,
  },
  title: {
    fontWeight: 'bold',
    color: '#1C1F1D',
    fontSize: width < 380 ? 18 : 20,
  },
  subtitle: {
    color: '#707571',
    marginTop: 4,
    marginBottom: 14,
    lineHeight: 18,
    fontSize: 12.5,
  },
  inputContainer: {
    marginBottom: 10,
  },
  verifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 8,
    borderRadius: 12,
    marginBottom: 10,
  },
  verifiedBannerText: {
    fontSize: 11.5,
    fontWeight: 'bold',
    color: JUCOCH_GREEN,
    flexShrink: 1,
  },
  input: {
    backgroundColor: '#FFF',
    marginBottom: 8,
    fontSize: 13.5,
  },
  otpInput: {
    backgroundColor: '#FFF',
    marginBottom: 8,
    fontSize: 18,
    letterSpacing: 4,
  },
  criteriaCard: {
    backgroundColor: '#F3F8F5',
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#D8F3DC',
  },
  criteriaTitle: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#5C6B61',
    marginBottom: 4,
  },
  criteriaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  criteriaText: {
    fontSize: 10.5,
    color: '#8A928D',
  },
  criteriaTextActive: {
    color: JUCOCH_GREEN,
    fontWeight: '600',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  resendText: {
    fontSize: 12,
    color: '#707571',
  },
  resendLink: {
    fontSize: 12,
    color: JUCOCH_GREEN,
    fontWeight: 'bold',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    borderColor: '#FF8080',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#D90429',
    fontSize: 11.5,
    fontWeight: '600',
    flex: 1,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderColor: '#A3D9A5',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  successText: {
    color: JUCOCH_GREEN,
    fontSize: 11.5,
    fontWeight: '600',
    flex: 1,
  },
  actionBtnWrapper: {
    marginTop: 4,
  },
  gradientButton: {
    height: 48,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    boxShadow: '0px 4px 8px rgba(45, 106, 79, 0.2)',
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
