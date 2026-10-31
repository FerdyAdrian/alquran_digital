import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import AppText from "../components/AppText";
import Card from "../components/Card";
import { useTheme } from "../context/ThemeContext";
import { getApiErrorMessage } from "../services/apiClient";
import {
  createTilawahNote,
  deleteTilawahNote,
  getTilawahNotes,
  updateTilawahNote,
} from "../services/tilawahApi";
import { TilawahNote } from "../types";

export default function TilawahNotesScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const request = useRef(0);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [surahName, setSurahName] = useState("");
  const [ayahCount, setAyahCount] = useState("");
  const [readDate, setReadDate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<TilawahNote[]>([]);
  const [loading, setLoading] = useState(false);

  const loadNotes = useCallback(async () => {
    const id = ++request.current;
    if (!user) { setNotes([]); setLoading(false); return; }
    setLoading(true);
    try {
      const result = await getTilawahNotes();
      if (id === request.current) { setNotes(result); setLoadedFor(user.id); }
    } catch (error) {
      if (id === request.current) Alert.alert('Gagal mengambil catatan', getApiErrorMessage(error));
    } finally { if (id === request.current) setLoading(false); }
  }, [user]);
  useEffect(() => { const requests = request; void loadNotes(); return () => { requests.current++; }; }, [loadNotes]);

  const resetForm = () => {
    setSurahName("");
    setAyahCount("");
    setReadDate("");
    setEditingId(null);
  };

  const saveNote = async () => {
    const trimmedSurahName = surahName.trim();
    const trimmedAyahCount = ayahCount.trim();
    const trimmedReadDate = readDate.trim();

    if (!trimmedSurahName || !trimmedAyahCount || !trimmedReadDate) {
      Alert.alert("Mohon lengkapi semua data");
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(trimmedReadDate)) {
      Alert.alert(
        "Format tanggal salah",
        "Gunakan format YYYY-MM-DD, misalnya 2026-06-21.",
      );
      return;
    }

    try {
      const payload = {
        surahName: trimmedSurahName,
        ayahCount: trimmedAyahCount,
        readDate: trimmedReadDate,
      };

      if (editingId) {
        await updateTilawahNote(editingId, payload);
      } else {
        await createTilawahNote(payload);
      }

      resetForm();
      await loadNotes();
      Alert.alert("Data berhasil disimpan");
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Pastikan tanggal memakai format YYYY-MM-DD dan Laravel API aktif.",
      );
      Alert.alert("Gagal menyimpan data", message);
    }
  };

  const editNote = (note: TilawahNote) => {
    setEditingId(String(note.id));
    setSurahName(note.surahName);
    setAyahCount(note.ayahCount);
    setReadDate(note.readDate ?? "");
  };

  const deleteNote = (id: string | number) => {
    Alert.alert("Hapus Catatan", "Yakin ingin menghapus catatan ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTilawahNote(id);
            await loadNotes();
          } catch {
            Alert.alert(
              "Gagal menghapus data",
              "Layanan akun belum dapat dihubungi. Periksa koneksi atau login kembali.",
            );
          }
        },
      },
    ]);
  };

  if (!user) return <View style={[styles.container, { backgroundColor: theme.colors.background, padding: 18, gap: 14 }]}>
    <AppText variant="title">Catatan Tilawah</AppText>
    <AppText>Login untuk menyimpan catatan pribadi dan membukanya kembali di perangkat lain.</AppText>
    <Pressable accessibilityRole="button" onPress={() => router.push('/login' as never)} style={[styles.button, { backgroundColor: theme.colors.primarySoft }]}><AppText>Login atau daftar akun</AppText></Pressable>
  </View>;

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <FlatList
        data={loadedFor === user?.id ? notes : []}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadNotes}
            tintColor={theme.colors.primary}
          />
        }
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={{ gap: 16 }}>
            <View>
              <AppText variant="title">Catatan Tilawah</AppText>
              <AppText color={theme.colors.muted}>
                Apk by Anisa Filzah Ghozani
              </AppText>
            </View>

            <Card style={styles.formCard}>
              <AppText variant="subtitle">
                {editingId ? "Edit Catatan" : "Form Catatan"}
              </AppText>

              <View style={styles.field}>
                <AppText style={styles.label}>Nama Surat</AppText>
                <TextInput
                  value={surahName}
                  onChangeText={setSurahName}
                  placeholder="Contoh Al-Fatihah"
                  placeholderTextColor={theme.colors.muted}
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.surfaceAlt,
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                    },
                  ]}
                />
              </View>

              <View style={styles.field}>
                <AppText style={styles.label}>Jumlah Ayat Dibaca</AppText>
                <TextInput
                  value={ayahCount}
                  onChangeText={setAyahCount}
                  placeholder="Masukkan jumlah ayat"
                  placeholderTextColor={theme.colors.muted}
                  keyboardType="numeric"
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.surfaceAlt,
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                    },
                  ]}
                />
              </View>

              <View style={styles.field}>
                <AppText style={styles.label}>Tanggal Membaca</AppText>
                <TextInput
                  value={readDate}
                  onChangeText={setReadDate}
                  placeholder="Contoh 2026-06-21"
                  placeholderTextColor={theme.colors.muted}
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.surfaceAlt,
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                    },
                  ]}
                />
              </View>

              <Pressable
                onPress={saveNote}
                style={({ pressed }) => [
                  styles.button,
                  {
                    backgroundColor: theme.colors.primaryDeep,
                    opacity: pressed ? 0.78 : 1,
                  },
                ]}
              >
                <AppText color="#FFFFFF" style={styles.buttonText}>
                  {editingId ? "Update Catatan" : "Simpan Catatan"}
                </AppText>
              </Pressable>

              {editingId ? (
                <Pressable
                  onPress={resetForm}
                  style={[
                    styles.cancelButton,
                    { borderColor: theme.colors.border },
                  ]}
                >
                  <AppText
                    color={theme.colors.muted}
                    style={styles.smallButtonText}
                  >
                    Batal Edit
                  </AppText>
                </Pressable>
              ) : null}
            </Card>

            <AppText variant="subtitle">Riwayat Catatan</AppText>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={styles.noteCard}>
            <AppText variant="subtitle">Nama Surat: {item.surahName}</AppText>
            <AppText color={theme.colors.muted} style={{ marginTop: 6 }}>
              Jumlah Ayat: {item.ayahCount}
            </AppText>
            <AppText color={theme.colors.muted} style={{ marginTop: 4 }}>
              Tanggal: {item.readDate || "-"}
            </AppText>
            <View style={styles.actions}>
              <Pressable
                onPress={() => editNote(item)}
                style={[
                  styles.smallButton,
                  { backgroundColor: theme.colors.primarySoft },
                ]}
              >
                <AppText
                  color={theme.colors.primaryDeep}
                  style={styles.smallButtonText}
                >
                  Edit Catatan
                </AppText>
              </Pressable>
              <Pressable
                onPress={() => deleteNote(item.id)}
                style={[styles.smallButton, { backgroundColor: "#FEE2E2" }]}
              >
                <AppText
                  color={theme.colors.danger}
                  style={styles.smallButtonText}
                >
                  Hapus Catatan
                </AppText>
              </Pressable>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <Card style={{ marginTop: 12 }}>
            <AppText color={theme.colors.muted}>
              Belum ada catatan tilawah.
            </AppText>
          </Card>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 18, paddingBottom: 34 },
  formCard: { padding: 20, gap: 14, borderRadius: 20 },
  field: { gap: 8 },
  label: { fontWeight: "800" },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: "600",
  },
  button: {
    minHeight: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  cancelButton: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { fontWeight: "900", fontSize: 15 },
  noteCard: { marginTop: 12, padding: 20, borderRadius: 16 },
  actions: { flexDirection: "row", gap: 10, marginTop: 14, flexWrap: "wrap" },
  smallButton: { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 },
  smallButtonText: { fontWeight: "900" },
});
