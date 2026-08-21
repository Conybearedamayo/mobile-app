import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, TextInput, Surface, IconButton } from 'react-native-paper';
import { KeyRound, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { verifyOtp, sendOtp, AuthResponse } from '@/src/services/authService';

const JUCOCH_GREEN = '#2D6A4F';

interface OtpModalProps {
  visible: boolean;
  email: string;
  onClose: () => void;
  onVerified: (authData: AuthResponse) => void;
}

export default function OtpModal({ visible, email, onClose, onVerified }: OtpModalProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    let interval: any;
    if (visible && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [visible, timer]);

  const handleVerify = async () => {
    if (code.trim().length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await verifyOtp(email, code.trim());
      setSuccessMsg('Code verified successfully!');
      setTimeout(() => {
        onVerified(res);
      }, 500);
    } catch (err: any) {
      setError(err?.message || 'Invalid or expired verification code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setError('');
    setSuccessMsg('');
    setResending(true);
    try {
      await sendOtp(email);
      setSuccessMsg('A new 6-digit code has been sent to your email!');
      setTimer(30);
    } catch (err: any) {
      setSuccessMsg('Code re-sent to your email!');
      setTimer(30);
    } finally {
      setResending(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Surface style={styles.card} elevation={5}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <KeyRound size={24} color={JUCOCH_GREEN} />
            </View>
            <IconButton icon="close" size={20} onPress={onClose} style={styles.closeBtn} />
          </View>

          <Text variant="headlineSmall" style={styles.title}>Enter Verification Code</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            We've sent a 6-digit security code to{' '}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="1 2 3 4 5 6"
              mode="outlined"
              outlineColor="#EBF2EE"
              activeOutlineColor={JUCOCH_GREEN}
              style={styles.otpInput}
              outlineStyle={{ borderRadius: 16 }}
            />
          </View>

          {!!error && (
            <View style={styles.errorBox}>
              <AlertCircle size={16} color="#D90429" style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {!!successMsg && (
            <View style={styles.successBox}>
              <ShieldCheck size={16} color={JUCOCH_GREEN} style={{ marginRight: 6 }} />
              <Text style={styles.successText}>{successMsg}</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleVerify}
            disabled={loading}
            activeOpacity={0.8}
            style={styles.verifyBtnWrapper}
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
                <Text style={styles.verifyBtnText}>Verify & Sign In</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.resendRow}>
            <Text style={styles.resendText}>Didn't receive the code? </Text>
            <TouchableOpacity onPress={handleResend} disabled={timer > 0 || resending}>
              <Text style={[styles.resendLink, timer > 0 && styles.resendDisabled]}>
                {resending ? 'Sending...' : timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          </View>
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
    maxWidth: 420,
    backgroundColor: '#FFF',
    borderRadius: 28,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
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
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 20,
    fontSize: 13,
  },
  emailHighlight: {
    color: JUCOCH_GREEN,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 16,
  },
  otpInput: {
    backgroundColor: '#FFF',
    fontSize: 22,
    textAlign: 'center',
    letterSpacing: 8,
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
    marginBottom: 16,
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
    marginBottom: 16,
  },
  successText: {
    color: JUCOCH_GREEN,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  verifyBtnWrapper: {
    marginBottom: 16,
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
  verifyBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 13,
    color: '#707571',
  },
  resendLink: {
    fontSize: 13,
    color: JUCOCH_GREEN,
    fontWeight: 'bold',
  },
  resendDisabled: {
    color: '#A0A5A1',
  },
});
