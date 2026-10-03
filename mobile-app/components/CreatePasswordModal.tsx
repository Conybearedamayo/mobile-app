import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform, Dimensions } from 'react-native';
import { Text, TextInput, Surface, IconButton } from 'react-native-paper';
import { KeyRound, ShieldCheck, AlertCircle, ArrowRight, Check, X as XIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { resetPasswordApi } from '@/src/services/authService';
import { validateStrongPassword } from '@/components/ForgotPassModal';

const { width } = Dimensions.get('window');
const JUCOCH_GREEN = '#2D6A4F';

interface CreatePasswordModalProps {
  visible: boolean;
  email: string;
  code: string;
  onClose: () => void;
  onSuccess: (password: string) => void;
}

export default function CreatePasswordModal({
  visible,
  email,
  code,
  onClose,
  onSuccess,
}: CreatePasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const passAnalysis = validateStrongPassword(newPassword);

  const handleSubmit = async () => {
    const trimmedPass = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!passAnalysis.isValid) {
      setError(passAnalysis.message);
      return;
    }

    if (trimmedPass !== trimmedConfirm) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await resetPasswordApi(email, code, trimmedPass);
      setSuccessMsg('Account created with your strong password!');
      setTimeout(() => {
        onSuccess(trimmedPass);
      }, 800);
    } catch (err: any) {
      setError(err?.message || 'Failed to save password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollOverlay}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Surface style={styles.card} elevation={5}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <KeyRound size={22} color={JUCOCH_GREEN} />
              </View>
              <IconButton icon="close" size={20} onPress={onClose} style={styles.closeBtn} />
            </View>

            <Text variant="headlineSmall" style={styles.title}>
              Create your strong password
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Set a secure password for your Jucoch account. This ensures your mental health logs and private journal remain encrypted and protected.
            </Text>

            {/* Email Account Indicator */}
            <View style={styles.emailBadge}>
              <ShieldCheck size={14} color={JUCOCH_GREEN} style={{ marginRight: 6 }} />
              <Text style={styles.emailBadgeText} numberOfLines={1}>
                Account: <Text style={{ fontWeight: 'bold' }}>{email}</Text>
              </Text>
            </View>

            {/* Form Inputs */}
            <View style={styles.formContainer}>
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

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
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
                    <Text style={styles.actionBtnText}>Complete Registration & Login 🌿</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
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
  closeBtn: {
    margin: -6,
  },
  title: {
    fontWeight: 'bold',
    color: '#1C1F1D',
    fontSize: width < 380 ? 19 : 22,
    marginBottom: 6,
  },
  subtitle: {
    color: '#707571',
    lineHeight: 19,
    fontSize: 13,
    marginBottom: 14,
  },
  emailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 14,
    maxWidth: '100%',
  },
  emailBadgeText: {
    fontSize: 12,
    color: JUCOCH_GREEN,
  },
  formContainer: {
    marginBottom: 8,
  },
  input: {
    marginBottom: 10,
    backgroundColor: '#FFF',
    fontSize: 14,
  },
  criteriaCard: {
    backgroundColor: '#F8FAF9',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2EFE7',
    marginBottom: 10,
  },
  criteriaTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B554E',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  criteriaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 4,
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  criteriaText: {
    fontSize: 11,
    color: '#8A928D',
  },
  criteriaTextActive: {
    color: JUCOCH_GREEN,
    fontWeight: '600',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD6D6',
    marginBottom: 12,
  },
  errorText: {
    color: '#D90429',
    fontSize: 12,
    flex: 1,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    marginBottom: 12,
  },
  successText: {
    color: JUCOCH_GREEN,
    fontSize: 12,
    fontWeight: 'bold',
    flex: 1,
  },
  actionBtnWrapper: {
    marginTop: 6,
    borderRadius: 18,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
