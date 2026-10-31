import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { AppState, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import AppText from '../components/AppText';
import Card from '../components/Card';
import { useAudioPlayer } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import { getPrayerDay, INDONESIAN_PRAYER_CITIES, PrayerDay } from '../services/prayerTimes';
import { cancelPrayerReminders, schedulePrayerReminders } from '../services/prayerReminders';
import { STORAGE_KEYS } from '../storage/keys';
import { localDate, prayerInstant, qiblaBearing } from '../utils/prayer';

type Place = { city: string } | { latitude: number; longitude: number };
export default function PrayerScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const { stop } = useAudioPlayer();
  const preview = useRef<Audio.Sound | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [city, setCity] = useState('Jakarta');
  const [place, setPlace] = useState<Place>({ city: 'Jakarta' });
  const [days, setDays] = useState<PrayerDay[]>([]);
  const [now, setNow] = useState(new Date());
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [bearing, setBearing] = useState<number | null>(null);
  const [heading, setHeading] = useState<Location.LocationHeadingObject | null>(null);
  const [compassError, setCompassError] = useState('Gunakan lokasi untuk menghitung arah kiblat.');
  const watcher = useRef<Location.LocationSubscription | null>(null);
  const request = useRef(0);
  const alive = useRef(true);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    alive.current = true;
    const interval = setInterval(() => setNow(new Date()), 1000);
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') setRefresh(v => v + 1); });
    return () => { alive.current = false; clearInterval(interval); subscription.remove(); watcher.current?.remove(); void preview.current?.unloadAsync(); };
  }, []);
  useEffect(() => { AsyncStorage.getItem(STORAGE_KEYS.prayerCity).then(saved => { if (saved) { setCity(saved); setPlace({ city: saved }); } }).catch(() => {}); }, []);
  const date = localDate(now, days[0]?.timezone ?? 'Asia/Jakarta');
  useEffect(() => {
    const id = ++request.current;
    setDays([]); setBusy(true); setMessage('');
    const tomorrow = new Date(`${date}T12:00:00Z`); tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    Promise.all([getPrayerDay(place, date), getPrayerDay(place, tomorrow.toISOString().slice(0, 10))])
      .then(result => { if (alive.current && id === request.current) setDays(result); })
      .catch(() => { if (alive.current && id === request.current) setMessage('Jadwal belum dapat dimuat. Periksa internet, lalu coba lagi.'); })
      .finally(() => { if (alive.current && id === request.current) setBusy(false); });
  }, [place, date, refresh]);
  const next = days.flatMap(day => day.times.map(prayer => ({ ...prayer, instant: prayerInstant(day, prayer.time) }))).find(p => p.instant > now);
  const minutes = next ? Math.ceil((next.instant.getTime() - now.getTime()) / 60000) : 0;
  const locate = async () => {
    setBusy(true); setMessage('');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) throw new Error('Izin lokasi diperlukan untuk kiblat. Jadwal tetap bisa dicari berdasarkan kota.');
      const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      if (!alive.current) return;
      setBearing(qiblaBearing(coords.latitude, coords.longitude));
      setPlace({ latitude: coords.latitude, longitude: coords.longitude });
      watcher.current?.remove(); watcher.current = null; setHeading(null);
      setCompassError('Kompas belum tersedia. Arah derajat dihitung dari utara sejati.');
      if (Platform.OS !== 'web') {
        const subscription = await Location.watchHeadingAsync(value => { if (alive.current) setHeading(value); });
        if (alive.current) watcher.current = subscription; else subscription.remove();
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Lokasi atau kompas belum dapat dibaca.'); }
    finally { setBusy(false); }
  };
  const button = (label: string, action: () => void, disabled = busy) => (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={action} style={[styles.button, { backgroundColor: c.primarySoft, opacity: disabled ? 0.5 : 1 }]}>
      <AppText style={{ fontWeight: '800' }}>{label}</AppText>
    </Pressable>
  );
  const previewAdhan = async () => {
    try {
      if (preview.current) { await preview.current.unloadAsync(); preview.current = null; setPreviewing(false); return; }
      await stop();
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, allowsRecordingIOS: false });
      const { sound } = await Audio.Sound.createAsync(require('../../assets/audio/adzan.wav'), { shouldPlay: true }, status => {
        if (status.isLoaded && status.didJustFinish) { const finished = preview.current; preview.current = null; void finished?.unloadAsync(); if (alive.current) setPreviewing(false); }
      });
      if (alive.current) { preview.current = sound; setPreviewing(true); } else await sound.unloadAsync();
    } catch { setMessage('Audio adzan belum dapat diputar. Coba lagi.'); }
  };
  const reminder = async () => {
    setBusy(true); setMessage('');
    try {
      const additional = await Promise.all([2, 3, 4, 5, 6].map(offset => {
        const target = new Date(`${days[0].date}T12:00:00Z`);
        target.setUTCDate(target.getUTCDate() + offset);
        return getPrayerDay(place, target.toISOString().slice(0, 10));
      }));
      const count = await schedulePrayerReminders([...days, ...additional]);
      setMessage(`${count} pengingat disiapkan untuk 7 hari. Aktifkan ulang sebelum jadwal habis. ${Constants.expoConfig?.extra?.adhanSound ? 'Pengingat memakai potongan adzan 25 detik.' : 'Bunyi memakai nada notifikasi ponsel; audio adzan belum dipasang.'}`);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Pengingat gagal disimpan.'); }
    finally { setBusy(false); }
  };
  const validHeading = heading && heading.trueHeading >= 0 && heading.accuracy >= 2;
  return (
    <ScrollView style={{ backgroundColor: c.background }} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={[styles.hero, { backgroundColor: '#0B3D2E' }]}>
        <Ionicons name="moon-outline" color="#D8B45A" size={28} />
        <AppText variant="title" color="#FFFFFF">Jaga waktu, tenangkan hati.</AppText>
        <AppText color="#D1FAE5">{next ? `${next.name} pukul ${next.time}` : 'Jadwal salat hari ini'}</AppText>
        {next ? <AppText color="#FFFFFF" style={styles.countdown}>{Math.floor(minutes / 60)} jam {minutes % 60} menit lagi</AppText> : null}
      </View>
      <Card style={styles.section}>
        <AppText variant="subtitle">Lokasi salat</AppText>
        <AppText color={c.muted}>{'city' in place ? place.city : 'Menggunakan lokasi GPS'} · {days[0]?.timezone ?? 'Memuat zona waktu'}</AppText>
        <TextInput accessibilityLabel="Nama kota di Indonesia" value={city} onChangeText={setCity} placeholder="Cari kota di Indonesia" placeholderTextColor={c.muted} style={[styles.input, { color: c.text, borderColor: c.border }]} />
        {button('Tampilkan jadwal kota', () => { if (city.trim()) { setPlace({ city: city.trim() }); AsyncStorage.setItem(STORAGE_KEYS.prayerCity, city.trim()).catch(() => {}); } })}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {INDONESIAN_PRAYER_CITIES.filter(name => name.toLowerCase().includes(city.toLowerCase())).slice(0, 6).map(name => <Pressable accessibilityRole="button" key={name} onPress={() => { setCity(name); setPlace({ city: name }); }} style={[styles.chip, { borderColor: c.border }]}><AppText>{name}</AppText></Pressable>)}
        </ScrollView>
        {button('Gunakan lokasi & aktifkan kiblat', locate)}
      </Card>
      {message ? <AppText accessibilityLiveRegion="polite" style={{ padding: 8 }}>{message}</AppText> : null}
      <Card style={styles.section}>
        <AppText variant="subtitle">{busy ? 'Memuat…' : 'Lima waktu hari ini'}</AppText>
        <AppText variant="caption" color={c.muted}>{date} · Perhitungan Kemenag via AlAdhan. Cocokkan dengan masjid setempat.</AppText>
        {days[0]?.times.map(prayer => <View key={prayer.name} style={[styles.row, { borderBottomColor: c.border, backgroundColor: next?.name === prayer.name ? c.primarySoft : 'transparent' }]}><AppText style={{ fontWeight: '700' }}>{prayer.name}</AppText><AppText style={styles.time}>{prayer.time}</AppText></View>)}
        {button('Muat ulang jadwal', () => setRefresh(v => v + 1))}
        {button(previewing ? 'Hentikan contoh adzan' : 'Dengarkan contoh adzan (25 detik)', previewAdhan)}
        <AppText variant="caption" color={c.muted}>Audio: Beautiful adhan — Adam-synagda, CC0. Potongan pembuka untuk pengingat, bukan adzan lengkap.</AppText>
        {button('Aktifkan pengingat 7 hari', reminder, busy || !days.length)}
        {button('Matikan pengingat salat', () => { setBusy(true); cancelPrayerReminders().then(() => setMessage('Pengingat salat dimatikan.')).catch(() => setMessage('Pengingat belum berhasil dimatikan. Coba lagi.')).finally(() => setBusy(false)); })}
        <AppText variant="caption" color={c.muted}>Pengingat mengikuti lokasi saat diaktifkan. Aktifkan ulang setelah berpindah kota. Mode senyap dan penghemat baterai dapat memengaruhi bunyi atau ketepatan waktu.</AppText>
      </Card>
      <Card style={styles.section}>
        <AppText variant="subtitle">Arah kiblat</AppText>
        <View style={[styles.compass, { borderColor: c.border }]}>
          <AppText color={c.muted}>{validHeading ? 'Arahkan ponsel mengikuti panah' : 'Utara sejati di bagian atas'}</AppText>
          <View style={{ transform: [{ rotate: `${bearing === null ? 0 : bearing - (validHeading ? heading.trueHeading : 0)}deg` }] }}><Ionicons name="arrow-up" size={100} color={c.primaryDeep} /></View>
          <AppText style={styles.time}>{bearing === null ? '—' : `${bearing.toFixed(1)}°`}</AppText>
        </View>
        <AppText color={c.muted}>{bearing === null ? compassError : validHeading ? 'Letakkan ponsel mendatar, jauhkan dari logam dan magnet.' : `${compassError} Gerakkan ponsel membentuk angka 8 untuk kalibrasi. Panah belum mengikuti putaran ponsel.`}</AppText>
      </Card>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { padding: 18, gap: 16, paddingBottom: 48 },
  hero: { padding: 24, borderRadius: 24, gap: 12 },
  countdown: { fontSize: 26, lineHeight: 36, fontWeight: '800' },
  section: { gap: 12 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16, minHeight: 48 },
  button: { minHeight: 48, padding: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  chip: { borderWidth: 1, borderRadius: 20, padding: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderRadius: 8 },
  time: { fontSize: 24, lineHeight: 32, fontWeight: '800' },
  compass: { alignSelf: 'center', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', maxWidth: 290, aspectRatio: 1, borderRadius: 145, borderWidth: 2, padding: 16 },
});
