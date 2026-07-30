import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Surface, IconButton, Avatar } from 'react-native-paper';
import { ShieldCheck, CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const JUCOCH_GREEN = '#2D6A4F';

interface GoogleAuthModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (email: string, alias: string) => void;
}

export default function GoogleAuthModal({ visible, onClose, onSuccess }: GoogleAuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const googleAccounts = [
    { name: 'User Google Account', email: 'user.jucoch@gmail.com', alias: 'MindfulUser2026' },
    { name: 'Student Google Account', email: 'student.jucoch@gmail.com', alias: 'StudentRiver99' },
  ];

  const handleSelectAccount = (acc: typeof googleAccounts[0]) => {
    setSelectedAccount(acc.email);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess(acc.email, acc.alias);
      onClose();
    }, 1200);
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
            <View style={styles.googleIconCircle}>
              <Text style={styles.googleG}>G</Text>
            </View>
            <IconButton icon="close" size={20} onPress={onClose} style={styles.closeBtn} />
          </View>

          <Text variant="headlineSmall" style={styles.title}>Sign in with Google</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Choose an account to continue to <Text style={{ fontWeight: 'bold', color: JUCOCH_GREEN }}>Jucoch Wellness</Text>.
          </Text>

          <View style={styles.accountList}>
            {googleAccounts.map((acc) => (
              <TouchableOpacity
                key={acc.email}
                style={styles.accountItem}
                onPress={() => handleSelectAccount(acc)}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Avatar.Text 
                  size={40} 
                  label={acc.name.slice(0, 1).toUpperCase()} 
                  style={{ backgroundColor: JUCOCH_GREEN }} 
                />
                <View style={styles.accountDetails}>
                  <Text style={styles.accountName}>{acc.name}</Text>
                  <Text style={styles.accountEmail}>{acc.email}</Text>
                </View>
                {selectedAccount === acc.email && loading ? (
                  <ActivityIndicator color={JUCOCH_GREEN} size="small" />
                ) : (
                  <CheckCircle size={18} color="#CCC" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.privacyNote}>
            <ShieldCheck size={14} color={JUCOCH_GREEN} style={{ marginRight: 6 }} />
            <Text style={styles.privacyText}>Your real identity is protected with an anonymous alias.</Text>
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
  googleIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EA4335',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleG: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
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
    marginBottom: 20,
    fontSize: 13,
  },
  accountList: {
    marginBottom: 16,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F8F5',
    borderColor: '#EBF2EE',
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 12,
    marginBottom: 10,
  },
  accountDetails: {
    flex: 1,
    marginLeft: 12,
  },
  accountName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1C1F1D',
  },
  accountEmail: {
    fontSize: 12,
    color: '#707571',
    marginTop: 1,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 14,
  },
  privacyText: {
    fontSize: 11,
    color: JUCOCH_GREEN,
    fontWeight: '600',
  },
});
