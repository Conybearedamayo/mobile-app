import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, TextInput, Surface, IconButton } from 'react-native-paper';
import { KeyRound, ShieldCheck, AlertCircle, Lock, Mail, CheckCircle2, ArrowRight, UserCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { resetPasswordApi, sendOtp, verifyOtp } from '@/src/services/authService';

const JUCOCH_GREEN = '#2D6A4F';

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

    if (!trimmedPass || trimmedPass.length < 4) {
      setError('New password must be at least 4 characters long.');
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
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
            {step === 3 && 'Identity confirmed! Enter your new secure password below.'}
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
                placeholder="e.g. name@gmail.com"
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
                label="New Password (min 4 characters)"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
                mode="outlined"
                outlineColor="#D8F3DC"
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
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFF',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#D8F3DC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
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
  },
  subtitle: {
    color: '#707571',
    marginTop: 4,
    marginBottom: 18,
    lineHeight: 18,
    fontSize: 13,
  },
  inputContainer: {
    marginBottom: 14,
  },
  demoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    borderColor: '#C2E6D1',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  demoBadgeText: {
    fontSize: 12,
    color: JUCOCH_GREEN,
    fontWeight: '600',
  },
  verifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  verifiedBannerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: JUCOCH_GREEN,
  },
  input: {
    backgroundColor: '#FFF',
    marginBottom: 10,
    fontSize: 14,
  },
  otpInput: {
    backgroundColor: '#FFF',
    marginBottom: 10,
    fontSize: 18,
    letterSpacing: 4,
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
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  errorText: {
    color: '#D90429',
    fontSize: 12,
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
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  successText: {
    color: JUCOCH_GREEN,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  actionBtnWrapper: {
    marginTop: 6,
  },
  gradientButton: {
    height: 52,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: JUCOCH_GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
