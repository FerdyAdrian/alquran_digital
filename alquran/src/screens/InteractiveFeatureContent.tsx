import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, TextInput, View } from 'react-native';

import AppText from '../components/AppText';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { useBookmarks } from '../context/BookmarkContext';
import { useTheme } from '../context/ThemeContext';
import {
  createKhatamProgress,
  createTilawahSchedule,
  createWorshipReminder,
  getUserFeatures,
  saveKhatamTarget,
  toggleTilawahSchedule,
  toggleWorshipReminder,
} from '../services/userFeatureApi';

type Props = {
  title: string;
};

type TilawahSchedule = {
  id: number;
  title: string;
  time: string;
  doneDate?: string;
};

type KhatamTarget = {
  days: number;
  dailyPages: number;
  pagesRead: number;
  startDate: string;
};

type WorshipReminder = {
  id: number;
  title: string;
  time: string;
  enabled: boolean;
};

const totalQuranPages = 604;
const todayKey = () => new Date().toISOString().slice(0, 10);

const defaultSchedules: TilawahSchedule[] = [
  { id: 1, title: 'Tilawah setelah Subuh', time: '05:00' },
  { id: 2, title: 'Murajaah setelah Maghrib', time: '18:15' },
];

const defaultTarget: KhatamTarget = {
  days: 30,
  dailyPages: 20,
  pagesRead: 0,
  startDate: todayKey(),
};

const defaultReminders: WorshipReminder[] = [
  { id: 1, title: 'Tilawah Pagi', time: '05:00', enabled: true },
  { id: 2, title: 'Evaluasi Bacaan', time: '21:00', enabled: false },
];

export function InteractiveFeatureContent({ title }: Props) {
  const router = useRouter();
  const { theme } = useTheme();
  const { user, isPremium, updateProfile } = useAuth();
  const { bookmarks, favoriteSurah, lastRead } = useBookmarks();
  const [schedules, setSchedules] = useState<TilawahSchedule[]>([]);
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [target, setTarget] = useState<KhatamTarget>(defaultTarget);
  const [targetDays, setTargetDays] = useState(String(defaultTarget.days));
  const [targetPages, setTargetPages] = useState(String(defaultTarget.dailyPages));
  const [readPagesInput, setReadPagesInput] = useState('');
  const [reminders, setReminders] = useState<WorshipReminder[]>([]);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [profileName, setProfileName] = useState(user?.name ?? '');
  const [profileEmail, setProfileEmail] = useState(user?.email ?? '');
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    setProfileName(user?.name ?? '');
    setProfileEmail(user?.email ?? '');
  }, [user]);

  const loadUserFeatures = useCallback(async () => {
    if (!user) {
      setSchedules(defaultSchedules);
      setTarget(defaultTarget);
      setTargetDays(String(defaultTarget.days));
      setTargetPages(String(defaultTarget.dailyPages));
      setReminders(defaultReminders);
      return;
    }

    try {
      setLoadingData(true);
      const features = await getUserFeatures(user.id);
      setSchedules(features.schedules);
      setTarget(features.target);
      setTargetDays(String(features.target.days));
      setTargetPages(String(features.target.dailyPages));
      setReminders(features.reminders);
    } catch (error) {
      Alert.alert('Gagal memuat data', error instanceof Error ? error.message : 'Layanan akun belum dapat dihubungi. Periksa koneksi atau login kembali.');
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    loadUserFeatures();
  }, [loadUserFeatures]);

  const completedToday = schedules.filter((item) => item.doneDate === todayKey()).length;
  const progressPercent = Math.min(100, Math.round((target.pagesRead / totalQuranPages) * 100));
  const remainingPages = Math.max(0, totalQuranPages - target.pagesRead);

  const progressStats = useMemo(
    () => [
      { label: 'Halaman dibaca', value: `${target.pagesRead}/${totalQuranPages}` },
      { label: 'Progress', value: `${progressPercent}%` },
      { label: 'Sisa halaman', value: String(remainingPages) },
    ],
    [progressPercent, remainingPages, target.pagesRead],
  );

  const requireLogin = () => {
    if (user) return true;
    Alert.alert('Login dibutuhkan', 'Silakan login agar data tersimpan ke akun online.', [
      { text: 'Nanti dulu', style: 'cancel' },
      { text: 'Login', onPress: () => router.push('/login' as never) },
    ]);
    return false;
  };

  const addSchedule = async () => {
    if (!scheduleTitle.trim() || !scheduleTime.trim()) {
      Alert.alert('Data belum lengkap', 'Isi nama jadwal dan jam tilawah.');
      return;
    }

    if (!requireLogin() || !user) return;

    try {
      const saved = await createTilawahSchedule(user.id, scheduleTitle.trim(), scheduleTime.trim());
      setSchedules([saved, ...schedules]);
      setScheduleTitle('');
      setScheduleTime('');
    } catch (error) {
      Alert.alert('Gagal menyimpan jadwal', error instanceof Error ? error.message : 'Coba lagi beberapa saat.');
    }
  };

  const toggleSchedule = async (item: TilawahSchedule) => {
    if (!requireLogin() || !user) return;

    try {
      const updated = await toggleTilawahSchedule(user.id, item.id);
      setSchedules(schedules.map((schedule) => (schedule.id === item.id ? updated : schedule)));
    } catch (error) {
      Alert.alert('Gagal memperbarui jadwal', error instanceof Error ? error.message : 'Coba lagi beberapa saat.');
    }
  };

  const updateTarget = async () => {
    const days = Number(targetDays);
    const dailyPages = Number(targetPages);

    if (!days || !dailyPages) {
      Alert.alert('Target belum valid', 'Isi target hari dan halaman per hari dengan angka.');
      return;
    }

    if (!requireLogin() || !user) return;

    try {
      const saved = await saveKhatamTarget(user.id, days, dailyPages);
      const next = { ...target, ...saved, pagesRead: target.pagesRead };
      setTarget(next);
      setTargetDays(String(next.days));
      setTargetPages(String(next.dailyPages));
      Alert.alert('Target disimpan', 'Target khatam berhasil diperbarui.');
    } catch (error) {
      Alert.alert('Gagal menyimpan target', error instanceof Error ? error.message : 'Coba lagi beberapa saat.');
    }
  };

  const addReadPages = async () => {
    const pages = Number(readPagesInput);
    if (!pages || pages < 1) {
      Alert.alert('Jumlah belum valid', 'Masukkan jumlah halaman yang sudah dibaca.');
      return;
    }

    if (!requireLogin() || !user) return;

    try {
      await createKhatamProgress(user.id, pages);
      setTarget({ ...target, pagesRead: Math.min(totalQuranPages, target.pagesRead + pages) });
      setReadPagesInput('');
    } catch (error) {
      Alert.alert('Gagal menyimpan progress', error instanceof Error ? error.message : 'Coba lagi beberapa saat.');
    }
  };

  const addReminder = async () => {
    if (!reminderTitle.trim() || !reminderTime.trim()) {
      Alert.alert('Data belum lengkap', 'Isi nama pengingat dan jamnya.');
      return;
    }

    if (!requireLogin() || !user) return;

    try {
      const saved = await createWorshipReminder(user.id, reminderTitle.trim(), reminderTime.trim());
      setReminders([saved, ...reminders]);
      setReminderTitle('');
      setReminderTime('');
    } catch (error) {
      Alert.alert('Gagal menyimpan pengingat', error instanceof Error ? error.message : 'Coba lagi beberapa saat.');
    }
  };

  const toggleReminder = async (item: WorshipReminder) => {
    if (!requireLogin() || !user) return;

    try {
      const updated = await toggleWorshipReminder(user.id, item.id);
      setReminders(reminders.map((reminder) => (reminder.id === item.id ? updated : reminder)));
    } catch (error) {
      Alert.alert('Gagal memperbarui pengingat', error instanceof Error ? error.message : 'Coba lagi beberapa saat.');
    }
  };

  const saveProfile = async () => {
    if (!profileName.trim() || !profileEmail.trim()) {
      Alert.alert('Data belum lengkap', 'Isi nama dan email.');
      return;
    }

    if (!profileEmail.includes('@')) {
      Alert.alert('Email belum valid', 'Gunakan format email yang benar.');
      return;
    }

    try {
      await updateProfile(profileName, profileEmail);
      Alert.alert('Profil tersimpan', profileEmail.trim().toLowerCase() !== user?.email ? 'Periksa email lama dan baru untuk menyetujui perubahan alamat email.' : 'Data akun berhasil diperbarui.');
    } catch (error) {
      Alert.alert('Gagal menyimpan profil', error instanceof Error ? error.message : 'Coba lagi beberapa saat.');
    }
  };

  if (title === 'Jadwal Tilawah') {
    return (
      <>
        {loadingData ? <AppText color={theme.colors.muted}>Memuat data dari database...</AppText> : null}
        <Card style={styles.formCard}>
          <AppText variant="subtitle">Tambah Jadwal</AppText>
          <View style={styles.twoColumns}>
            <TextInput
              value={scheduleTitle}
              onChangeText={setScheduleTitle}
              placeholder="Nama jadwal"
              placeholderTextColor={theme.colors.muted}
              style={[styles.input, styles.flexInput, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.text, borderColor: theme.colors.border }]}
            />
            <TextInput
              value={scheduleTime}
              onChangeText={setScheduleTime}
              placeholder="05:00"
              placeholderTextColor={theme.colors.muted}
              style={[styles.input, styles.timeInput, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.text, borderColor: theme.colors.border }]}
            />
          </View>
          <PrimaryButton label="Tambah Jadwal" onPress={addSchedule} />
        </Card>

        <Card>
          <AppText variant="subtitle">Jadwal Hari Ini</AppText>
          <AppText color={theme.colors.muted} style={styles.helperText}>
            {completedToday} dari {schedules.length} jadwal sudah ditandai selesai.
          </AppText>
          <View style={styles.list}>
            {schedules.map((item) => (
              <Pressable key={item.id} onPress={() => toggleSchedule(item)} style={[styles.rowCard, { borderColor: theme.colors.border }]}>
                <Ionicons
                  name={item.doneDate === todayKey() ? 'checkmark-circle' : 'ellipse-outline'}
                  size={24}
                  color={item.doneDate === todayKey() ? theme.colors.primary : theme.colors.muted}
                />
                <View style={{ flex: 1 }}>
                  <AppText style={styles.bold}>{item.title}</AppText>
                  <AppText variant="caption" color={theme.colors.muted}>
                    {item.time}
                  </AppText>
                </View>
              </Pressable>
            ))}
          </View>
        </Card>
      </>
    );
  }

  if (title === 'Target Khatam') {
    return (
      <>
        {loadingData ? <AppText color={theme.colors.muted}>Memuat data dari database...</AppText> : null}
        <Card style={styles.formCard}>
          <AppText variant="subtitle">Atur Target</AppText>
          <View style={styles.twoColumns}>
            <TextInput
              value={targetDays}
              onChangeText={setTargetDays}
              keyboardType="numeric"
              placeholder="30 hari"
              placeholderTextColor={theme.colors.muted}
              style={[styles.input, styles.flexInput, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.text, borderColor: theme.colors.border }]}
            />
            <TextInput
              value={targetPages}
              onChangeText={setTargetPages}
              keyboardType="numeric"
              placeholder="20 hal"
              placeholderTextColor={theme.colors.muted}
              style={[styles.input, styles.flexInput, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.text, borderColor: theme.colors.border }]}
            />
          </View>
          <PrimaryButton label="Simpan Target" onPress={updateTarget} />
        </Card>
        <ProgressCards stats={progressStats} />
      </>
    );
  }

  if (title === 'Progress Khatam') {
    return (
      <>
        {loadingData ? <AppText color={theme.colors.muted}>Memuat data dari database...</AppText> : null}
        <ProgressCards stats={progressStats} />
        <Card style={styles.formCard}>
          <AppText variant="subtitle">Tambah Progress</AppText>
          <TextInput
            value={readPagesInput}
            onChangeText={setReadPagesInput}
            keyboardType="numeric"
            placeholder="Jumlah halaman yang dibaca hari ini"
            placeholderTextColor={theme.colors.muted}
            style={[styles.input, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.text, borderColor: theme.colors.border }]}
          />
          <PrimaryButton label="Simpan Progress Hari Ini" onPress={addReadPages} />
        </Card>
      </>
    );
  }

  if (title === 'Pengingat Ibadah') {
    return (
      <>
        {loadingData ? <AppText color={theme.colors.muted}>Memuat data dari database...</AppText> : null}
        <Card style={styles.formCard}>
          <AppText variant="subtitle">Tambah Pengingat</AppText>
          <View style={styles.twoColumns}>
            <TextInput
              value={reminderTitle}
              onChangeText={setReminderTitle}
              placeholder="Nama pengingat"
              placeholderTextColor={theme.colors.muted}
              style={[styles.input, styles.flexInput, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.text, borderColor: theme.colors.border }]}
            />
            <TextInput
              value={reminderTime}
              onChangeText={setReminderTime}
              placeholder="21:00"
              placeholderTextColor={theme.colors.muted}
              style={[styles.input, styles.timeInput, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.text, borderColor: theme.colors.border }]}
            />
          </View>
          <PrimaryButton label="Tambah Pengingat" onPress={addReminder} />
        </Card>
        <Card>
          <AppText variant="subtitle">Daftar Pengingat</AppText>
          <View style={styles.list}>
            {reminders.map((item) => (
              <View key={item.id} style={[styles.rowCard, { borderColor: theme.colors.border }]}>
                <View style={{ flex: 1 }}>
                  <AppText style={styles.bold}>{item.title}</AppText>
                  <AppText variant="caption" color={theme.colors.muted}>
                    {item.time}
                  </AppText>
                </View>
                <Switch value={item.enabled} onValueChange={() => toggleReminder(item)} />
              </View>
            ))}
          </View>
        </Card>
      </>
    );
  }

  if (title === 'Profil Pengguna') {
    return (
      <>
        <Card>
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.primarySoft }]}>
              <Ionicons name="person" size={28} color={theme.colors.primaryDeep} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="subtitle">{user?.name ?? 'Belum login'}</AppText>
              <AppText color={theme.colors.muted}>{user?.email ?? 'Login untuk menyimpan profil tilawah.'}</AppText>
            </View>
          </View>
          <View style={styles.statGrid}>
            <Stat label="Status" value={isPremium ? 'Premium' : 'Gratis'} />
            <Stat label="Bookmark" value={String(bookmarks.length)} />
            <Stat label="Surat Favorit" value={String(favoriteSurah.length)} />
          </View>
          {lastRead ? (
            <AppText color={theme.colors.muted} style={styles.helperText}>
              Terakhir dibaca: {lastRead.surahName} ayat {lastRead.ayahNumber}
            </AppText>
          ) : null}
        </Card>
        {!user ? <PrimaryButton label="Login Sekarang" onPress={() => router.push('/login' as never)} /> : null}
      </>
    );
  }

  if (title === 'Edit Profil') {
    if (!user) {
      return (
        <Card>
          <AppText variant="subtitle">Login Dibutuhkan</AppText>
          <AppText color={theme.colors.muted} style={styles.helperText}>
            Masuk atau daftar akun terlebih dahulu untuk mengubah profil.
          </AppText>
          <PrimaryButton label="Login" onPress={() => router.push('/login' as never)} />
        </Card>
      );
    }

    return (
      <Card style={styles.formCard}>
        <AppText variant="subtitle">Data Akun</AppText>
        <TextInput
          value={profileName}
          onChangeText={setProfileName}
          placeholder="Nama lengkap"
          placeholderTextColor={theme.colors.muted}
          style={[styles.input, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.text, borderColor: theme.colors.border }]}
        />
        <TextInput
          value={profileEmail}
          onChangeText={setProfileEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="Email"
          placeholderTextColor={theme.colors.muted}
          style={[styles.input, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.text, borderColor: theme.colors.border }]}
        />
        <PrimaryButton label="Simpan Profil" onPress={saveProfile} />
      </Card>
    );
  }

  return null;
}

function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { theme } = useTheme();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.primaryButton, { backgroundColor: theme.colors.primaryDeep, opacity: pressed ? 0.78 : 1 }]}>
      <AppText color="#FFFFFF" style={styles.buttonText}>
        {label}
      </AppText>
    </Pressable>
  );
}

function ProgressCards({ stats }: { stats: { label: string; value: string }[] }) {
  const { theme } = useTheme();

  return (
    <Card>
      <AppText variant="subtitle">Ringkasan Progress</AppText>
      <View style={styles.statGrid}>
        {stats.map((item) => (
          <Stat key={item.label} label={item.label} value={item.value} />
        ))}
      </View>
      <View style={[styles.progressTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
        <View style={[styles.progressFill, { width: `${Number.parseInt(stats[1]?.value ?? '0', 10)}%` as const, backgroundColor: theme.colors.primary }]} />
      </View>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const { theme } = useTheme();

  return (
    <View style={[styles.stat, { backgroundColor: theme.colors.surfaceAlt }]}>
      <AppText style={styles.statValue}>{value}</AppText>
      <AppText variant="caption" color={theme.colors.muted}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  formCard: { gap: 12 },
  twoColumns: { flexDirection: 'row', gap: 10 },
  input: { minHeight: 48, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, fontSize: 14, fontWeight: '700' },
  flexInput: { flex: 1 },
  timeInput: { width: 96 },
  primaryButton: { minHeight: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  buttonText: { fontWeight: '900' },
  helperText: { marginTop: 8 },
  list: { gap: 10, marginTop: 12 },
  rowCard: { borderWidth: 1, borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  bold: { fontWeight: '900' },
  statGrid: { flexDirection: 'row', gap: 10, marginTop: 14, flexWrap: 'wrap' },
  stat: { flexGrow: 1, flexBasis: '30%', borderRadius: 14, padding: 12 },
  statValue: { fontWeight: '900', fontSize: 18 },
  progressTrack: { height: 10, borderRadius: 99, overflow: 'hidden', marginTop: 14 },
  progressFill: { height: '100%', borderRadius: 99 },
  profileHeader: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  avatar: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
