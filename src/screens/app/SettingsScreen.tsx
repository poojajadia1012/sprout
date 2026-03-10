import React, { useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppStack';
import { useAuth } from '../../hooks/useAuth';
import PrimaryButton from '../../components/common/PrimaryButton';
import SecondaryButton from '../../components/common/SecondaryButton';
import FormError from '../../components/auth/FormError';

type Props = NativeStackScreenProps<AppStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const { dbUser, signOut, deleteAccount } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDeleteConfirm() {
    setDeleteError(null);
    setIsDeleting(true);
    const { error } = await deleteAccount();
    setIsDeleting(false);
    if (error) {
      setDeleteError(error);
    } else {
      setShowDeleteModal(false);
      // RootNavigator will redirect to AuthStack automatically via onAuthStateChange
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Health Profile section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Profile</Text>
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('EditHealthProfile')}
          >
            <Text style={styles.label}>My profile</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Account section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>
            {dbUser ? `${dbUser.first_name} ${dbUser.last_name}` : '—'}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{dbUser?.email ?? '—'}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Sign-in method</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {dbUser?.auth_provider === 'google' ? 'Google' : 'Email'}
            </Text>
          </View>
        </View>
        </View>

        <View style={styles.footer}>
          <SecondaryButton title="Sign out" onPress={signOut} />
          <TouchableOpacity onPress={() => setShowDeleteModal(true)} style={styles.deleteLink}>
            <Text style={styles.deleteLinkText}>Delete account</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Delete account?</Text>
            <Text style={styles.modalBody}>
              Your account and data will be permanently deleted after 30 days. You can reactivate
              by logging back in within that period.
            </Text>
            <FormError message={deleteError} />
            <PrimaryButton
              title="Delete my account"
              onPress={handleDeleteConfirm}
              isLoading={isDeleting}
              style={styles.deleteBtn}
            />
            <SecondaryButton title="Cancel" onPress={() => setShowDeleteModal(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingBottom: 48 },
  section: {
    marginTop: 24,
    marginHorizontal: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: '#F9FAFB',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  label: { fontSize: 15, color: '#6B7280' },
  value: { fontSize: 15, color: '#1A1A1A', fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
  chevron: { fontSize: 20, color: '#9CA3AF' },
  badge: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: { fontSize: 13, color: '#FF6B35', fontWeight: '600' },
  footer: { marginTop: 32, marginHorizontal: 24, gap: 4 },
  deleteLink: { alignItems: 'center', paddingVertical: 12 },
  deleteLinkText: { color: '#EF4444', fontSize: 14, fontWeight: '500' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 24,
    width: '100%',
    maxWidth: 360,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 10 },
  modalBody: { fontSize: 15, color: '#6B7280', lineHeight: 22, marginBottom: 20 },
  deleteBtn: { backgroundColor: '#EF4444', marginBottom: 4 },
});
