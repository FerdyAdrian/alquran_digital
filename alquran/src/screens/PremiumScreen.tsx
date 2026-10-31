import { ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import AppText from '../components/AppText';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const premiumFeatures = [
  'Tafsir ringkas premium',
  'Statistik tilawah lengkap',
  'Target khatam lanjutan',
  'Pengingat ibadah khusus',
  'Artikel Islam premium',
];

export default function PremiumScreen() {
  const { theme } = useTheme();
  const { user, isPremium } = useAuth();

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.container}>
      <Card style={[styles.hero, { backgroundColor: theme.colors.primaryDeep }]}>
        <Ionicons name="diamond-outline" size={34} color={theme.colors.gold} />
        <AppText variant="title" color="#FFFFFF">
          {"Al-Qur'an Premium"}
        </AppText>
        <AppText color="#E7FFF4">
          {"Akun gratis tetap bisa membaca Al-Qur'an. Akun premium membuka fitur belajar dan statistik yang lebih lengkap."}
        </AppText>
      </Card>

      <Card>
        <AppText variant="subtitle">Status Akun</AppText>
        <AppText color={theme.colors.muted} style={{ marginTop: 8 }}>
          {user ? `${user.name} - ${isPremium ? 'Premium' : 'Gratis'}` : 'Belum login - mode gratis'}
        </AppText>
      </Card>

      <Card>
        <AppText variant="subtitle">Pembelian belum tersedia</AppText>
        <AppText color={theme.colors.muted} style={{ marginTop: 8 }}>
          Pembelian premium belum dibuka. Kamu tetap bisa membaca Al-Qur’an, melihat jadwal salat, dan menggunakan arah kiblat secara gratis.
        </AppText>
      </Card>

      <Card>
        <AppText variant="subtitle">Fitur Premium</AppText>
        <View style={styles.list}>
          {premiumFeatures.map((item) => (
            <View key={item} style={styles.row}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
              <AppText style={{ flex: 1 }}>{item}</AppText>
            </View>
          ))}
        </View>
      </Card>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, gap: 14, paddingBottom: 34 },
  hero: { gap: 12, borderRadius: 20 },
  list: { gap: 12, marginTop: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },

});
