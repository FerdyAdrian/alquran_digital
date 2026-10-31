import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { deleteAccount } from '../services/authApi';
import AppText from '../components/AppText';
import Card from '../components/Card';
import Toast from '../components/Toast';
import { useTheme } from '../context/ThemeContext';
import { useQari } from '../hooks/useQari';
import { QARI_OPTIONS } from '../services/qariAudio';
import { cancelDailyReminder, scheduleDailyReminder } from '../utils/notifications';

export default function SettingsScreen() {
  const { theme, mode, setMode } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const { selectedQari, setSelectedQari } = useQari();
  const [reminder, setReminder] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 1800);
  };

  const toggleReminder = async (value: boolean) => {
    setReminder(value);
    if (value) {
      await scheduleDailyReminder(5, 0);
      showToast('Reminder harian diaktifkan');
    } else {
      await cancelDailyReminder();
      showToast('Reminder harian dimatikan');
    }
  };

  const requestDeletion = () => Alert.alert('Hapus akun dan data?', 'Akun, catatan tilawah, jadwal, target dan pengingat yang tersimpan di server akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.', [
    { text: 'Batal', style: 'cancel' },
    { text: 'Hapus akun saya', style: 'destructive', onPress: async () => {
      setDeleting(true);
      try { await deleteAccount(); Alert.alert('Akun dihapus', 'Akun dan data server sudah dihapus. Cache bacaan dan bookmark lokal tetap ada di perangkat.'); }
      catch (error) { Alert.alert('Penghapusan belum berhasil', error instanceof Error ? error.message : 'Hubungi dukungan.'); }
      finally { setDeleting(false); }
    } },
  ]);
  const modes = [
    { label: 'System', value: 'system' as const, icon: 'phone-portrait-outline' as const },
    { label: 'Light', value: 'light' as const, icon: 'sunny-outline' as const },
    { label: 'Dark', value: 'dark' as const, icon: 'moon-outline' as const },
  ];

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.container}>
      <AppText variant="title">Setelan</AppText>
      <Card>
        <AppText variant="subtitle">Tema aplikasi</AppText>
        <View style={styles.modeRow}>
          {modes.map((item) => {
            const active = mode === item.value;
            return (
              <Pressable
                key={item.value}
                onPress={() => setMode(item.value)}
                style={[styles.mode, { backgroundColor: active ? theme.colors.primary : theme.colors.surfaceAlt }]}>
                <Ionicons name={item.icon} size={18} color={active ? '#FFFFFF' : theme.colors.primary} />
                <AppText color={active ? '#FFFFFF' : theme.colors.text}>{item.label}</AppText>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <AppText variant="subtitle">Daily reminder Islami</AppText>
            <AppText color={theme.colors.muted}>Pengingat tilawah setiap pukul 05:00.</AppText>
          </View>
          <Switch value={reminder} onValueChange={toggleReminder} trackColor={{ true: theme.colors.primarySoft }} thumbColor={reminder ? theme.colors.primary : '#F8FAFC'} />
        </View>
      </Card>

      <Card>
        <AppText variant="subtitle">Pilih Qari</AppText>
        <AppText color={theme.colors.muted} style={{ marginTop: 6 }}>
          Audio surat dan ayat akan mengikuti qari yang dipilih.
        </AppText>
        <View style={styles.qariList}>
          {QARI_OPTIONS.map((item) => {
            const active = selectedQari === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={async () => {
                  await setSelectedQari(item.id);
                  showToast(`Qari dipilih: ${item.label}`);
                }}
                style={[
                  styles.qariItem,
                  {
                    backgroundColor: active ? theme.colors.primarySoft : theme.colors.surfaceAlt,
                    borderColor: active ? theme.colors.primary : theme.colors.border,
                  },
                ]}>
                <View style={{ flex: 1 }}>
                  <AppText style={{ fontWeight: '900' }} color={active ? theme.colors.primaryDeep : theme.colors.text}>
                    {item.label}
                  </AppText>
                  <AppText variant="caption" color={theme.colors.muted}>
                    {item.description}
                  </AppText>
                </View>
                {active ? <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} /> : null}
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card>
        <AppText variant="subtitle">Offline cache</AppText>
        <AppText color={theme.colors.muted}>
          Data surah yang pernah dibuka disimpan otomatis di AsyncStorage sehingga tetap bisa dibaca saat koneksi kurang stabil.
        </AppText>
      </Card>
      <Card style={{ gap: 12 }}>
        <AppText variant="subtitle">Bantuan dan akun</AppText>
        <Pressable accessibilityRole="button" onPress={() => router.push('/kebijakan-privasi' as never)} style={{ minHeight: 44, justifyContent: 'center' }}><AppText>Kebijakan privasi</AppText></Pressable>
        <Pressable accessibilityRole="link" onPress={() => Linking.openURL('mailto:copawork0@gmail.com')} style={{ minHeight: 44, justifyContent: 'center' }}><AppText>Hubungi dukungan</AppText></Pressable>
        {user ? <Pressable accessibilityRole="button" disabled={deleting} onPress={requestDeletion} style={{ minHeight: 48, justifyContent: 'center' }}><AppText color={theme.colors.danger}>{deleting ? 'Menghapus…' : 'Hapus akun dan data server'}</AppText></Pressable> : null}
      </Card>
      <Toast message={toast} visible={Boolean(toast)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, paddingBottom: 40, gap: 14 },
  modeRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  mode: { flex: 1, minHeight: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qariList: { gap: 10, marginTop: 14 },
  qariItem: {
    minHeight: 64,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
