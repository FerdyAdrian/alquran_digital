import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import AppText from '../components/AppText';
import Card from '../components/Card';
import { useTheme } from '../context/ThemeContext';

const gregorianMonths = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const hijriMonths = [
  'Muharram',
  'Safar',
  'Rabiul Awal',
  'Rabiul Akhir',
  'Jumadil Awal',
  'Jumadil Akhir',
  'Rajab',
  'Syaban',
  'Ramadhan',
  'Syawal',
  'Dzulqadah',
  'Dzulhijjah',
];

const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

type HijriDate = {
  day: number;
  month: number;
  year: number;
};

type CalendarCell = {
  key: string;
  gregorianDay?: number;
  hijri?: HijriDate;
  isToday?: boolean;
};

type CalendarEvent = {
  title: string;
  type: 'islam' | 'national';
};

const islamicEvents = [
  { day: 1, month: 0, title: 'Tahun Baru Islam' },
  { day: 10, month: 0, title: 'Hari Asyura' },
  { day: 12, month: 2, title: 'Maulid Nabi Muhammad SAW' },
  { day: 27, month: 6, title: 'Isra Mikraj' },
  { day: 1, month: 8, title: 'Awal Ramadhan' },
  { day: 17, month: 8, title: 'Nuzulul Quran' },
  { day: 1, month: 9, title: 'Idul Fitri' },
  { day: 9, month: 11, title: 'Hari Arafah' },
  { day: 10, month: 11, title: 'Idul Adha' },
  { day: 11, month: 11, title: 'Hari Tasyrik' },
  { day: 12, month: 11, title: 'Hari Tasyrik' },
  { day: 13, month: 11, title: 'Hari Tasyrik' },
];

const nationalEvents = [
  { day: 1, month: 0, title: 'Tahun Baru Masehi' },
  { day: 21, month: 3, title: 'Hari Kartini' },
  { day: 1, month: 4, title: 'Hari Buruh' },
  { day: 20, month: 4, title: 'Hari Kebangkitan Nasional' },
  { day: 1, month: 5, title: 'Hari Lahir Pancasila' },
  { day: 17, month: 7, title: 'Hari Kemerdekaan RI' },
  { day: 1, month: 9, title: 'Hari Kesaktian Pancasila' },
  { day: 2, month: 9, title: 'Hari Batik Nasional' },
  { day: 28, month: 9, title: 'Hari Sumpah Pemuda' },
  { day: 10, month: 10, title: 'Hari Pahlawan' },
  { day: 22, month: 11, title: 'Hari Ibu' },
  { day: 25, month: 11, title: 'Hari Natal' },
];

function gregorianToJulianDay(year: number, month: number, day: number) {
  let y = year;
  let m = month + 1;

  if (m <= 2) {
    y -= 1;
    m += 12;
  }

  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);

  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524;
}

function julianDayToHijri(julianDay: number): HijriDate {
  let l = julianDay - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) +
    Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l =
    l -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const month = Math.floor((24 * l) / 709);
  const day = l - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;

  return { day, month: month - 1, year };
}

function getHijriDate(date: Date) {
  return julianDayToHijri(gregorianToJulianDay(date.getFullYear(), date.getMonth(), date.getDate()));
}

function buildCalendar(year: number, month: number): CalendarCell[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const cells: CalendarCell[] = [];

  for (let index = 0; index < firstDay; index += 1) {
    cells.push({ key: `empty-${index}` });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    cells.push({
      key: `${year}-${month}-${day}`,
      gregorianDay: day,
      hijri: getHijriDate(date),
      isToday: today.getFullYear() === year && today.getMonth() === month && today.getDate() === day,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ key: `tail-${cells.length}` });
  }

  return cells;
}

function getEvents(date: Date, hijri?: HijriDate): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const national = nationalEvents.filter((item) => item.day === date.getDate() && item.month === date.getMonth());

  national.forEach((item) => {
    events.push({ title: item.title, type: 'national' });
  });

  if (hijri) {
    const islamic = islamicEvents.filter((item) => item.day === hijri.day && item.month === hijri.month);
    islamic.forEach((item) => {
      events.push({ title: item.title, type: 'islam' });
    });
  }

  return events;
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export default function HijriCalendarScreen() {
  const { theme } = useTheme();
  const now = new Date();
  const [visibleDate, setVisibleDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(now);
  const year = visibleDate.getFullYear();
  const month = visibleDate.getMonth();

  const cells = useMemo(() => buildCalendar(year, month), [year, month]);
  const firstHijri = cells.find((cell) => cell.hijri)?.hijri;
  const lastHijri = [...cells].reverse().find((cell) => cell.hijri)?.hijri;

  const moveMonth = (amount: number) => {
    setVisibleDate((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  };

  const resetToToday = () => {
    setVisibleDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now);
  };

  const selectedHijri = getHijriDate(selectedDate);
  const selectedEvents = getEvents(selectedDate, selectedHijri);
  const monthEvents = cells
    .filter((cell) => cell.gregorianDay)
    .flatMap((cell) => {
      const date = new Date(year, month, cell.gregorianDay);
      return getEvents(date, cell.hijri).map((event) => ({ ...event, date, hijri: cell.hijri }));
    });

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.container}>
      <Card style={[styles.hero, { backgroundColor: theme.colors.primaryDeep }]}>
        <View style={[styles.iconWrap, { backgroundColor: theme.colors.primary }]}>
          <Ionicons name="moon-outline" size={28} color="#FFFFFF" />
        </View>
        <AppText variant="title" color="#FFFFFF">
          Kalender Hijriah
        </AppText>
        <AppText color="#E7FFF4">
          Kalender Masehi dan Hijriah ditampilkan berdampingan untuk memudahkan perencanaan ibadah.
        </AppText>
      </Card>

      <Card>
        <View style={styles.monthHeader}>
          <Pressable onPress={() => moveMonth(-1)} style={[styles.navButton, { backgroundColor: theme.colors.surfaceAlt }]}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.primaryDeep} />
          </Pressable>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <AppText variant="subtitle">
              {gregorianMonths[month]} {year}
            </AppText>
            {firstHijri && lastHijri ? (
              <AppText variant="caption" color={theme.colors.muted} style={{ textAlign: 'center' }}>
                {hijriMonths[firstHijri.month]} {firstHijri.year} H - {hijriMonths[lastHijri.month]} {lastHijri.year} H
              </AppText>
            ) : null}
          </View>

          <Pressable onPress={() => moveMonth(1)} style={[styles.navButton, { backgroundColor: theme.colors.surfaceAlt }]}>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.primaryDeep} />
          </Pressable>
        </View>

        <View style={styles.weekRow}>
          {weekDays.map((day) => (
            <View key={day} style={styles.weekCell}>
              <AppText variant="caption" color={theme.colors.muted} style={styles.weekText}>
                {day}
              </AppText>
            </View>
          ))}
        </View>

        <View style={styles.grid}>
          {cells.map((cell) => (
            <View key={cell.key} style={styles.cellSlot}>
              <Pressable
                disabled={!cell.gregorianDay}
                onPress={() => {
                  if (cell.gregorianDay) setSelectedDate(new Date(year, month, cell.gregorianDay));
                }}
                style={[
                  styles.cell,
                  {
                    backgroundColor: cell.gregorianDay
                      ? formatDateKey(selectedDate) === `${year}-${month}-${cell.gregorianDay}`
                        ? theme.colors.primaryDeep
                        : cell.isToday
                          ? theme.colors.primary
                          : theme.colors.surfaceAlt
                      : 'transparent',
                    borderColor: cell.gregorianDay ? (cell.isToday ? theme.colors.primary : theme.colors.border) : 'transparent',
                  },
                ]}>
                {cell.gregorianDay ? (
                  <>
                    <AppText
                      color={formatDateKey(selectedDate) === `${year}-${month}-${cell.gregorianDay}` || cell.isToday ? '#FFFFFF' : theme.colors.text}
                      style={styles.gregorianDay}>
                      {cell.gregorianDay}
                    </AppText>
                    <AppText
                      variant="caption"
                      color={formatDateKey(selectedDate) === `${year}-${month}-${cell.gregorianDay}` || cell.isToday ? '#E7FFF4' : theme.colors.muted}
                      style={styles.hijriDay}>
                      {cell.hijri?.day} H
                    </AppText>
                    {getEvents(new Date(year, month, cell.gregorianDay), cell.hijri).length ? (
                      <View style={styles.eventDots}>
                        {getEvents(new Date(year, month, cell.gregorianDay), cell.hijri)
                          .slice(0, 2)
                          .map((event, index) => (
                            <View
                              key={`${event.title}-${index}`}
                              style={[styles.eventDot, { backgroundColor: event.type === 'islam' ? theme.colors.gold : '#60A5FA' }]}
                            />
                          ))}
                      </View>
                    ) : null}
                  </>
                ) : null}
              </Pressable>
            </View>
          ))}
        </View>

        <Pressable onPress={resetToToday} style={[styles.todayButton, { backgroundColor: theme.colors.primaryDeep }]}>
          <AppText color="#FFFFFF" style={{ fontWeight: '900' }}>
            Kembali ke Bulan Ini
          </AppText>
        </Pressable>
      </Card>

      <Card>
        <AppText variant="subtitle">Tanggal Dipilih</AppText>
        <View style={styles.todayInfo}>
          <View style={[styles.todayBadge, { backgroundColor: theme.colors.primarySoft }]}>
            <AppText variant="title" color={theme.colors.primaryDeep}>
              {selectedDate.getDate()}
            </AppText>
            <AppText variant="caption" color={theme.colors.primaryDeep}>
              {gregorianMonths[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </AppText>
          </View>
          <View style={{ flex: 1 }}>
            <AppText style={{ fontWeight: '900' }}>
              {selectedHijri.day} {hijriMonths[selectedHijri.month]} {selectedHijri.year} H
            </AppText>
            {selectedEvents.length ? (
              <View style={styles.eventList}>
                {selectedEvents.map((event) => (
                  <View key={`${event.type}-${event.title}`} style={styles.eventRow}>
                    <View style={[styles.eventDot, { backgroundColor: event.type === 'islam' ? theme.colors.gold : '#60A5FA' }]} />
                    <AppText color={theme.colors.text} style={{ flex: 1, fontWeight: '800' }}>
                      {event.title}
                    </AppText>
                  </View>
                ))}
              </View>
            ) : (
              <AppText color={theme.colors.muted} style={{ marginTop: 6 }}>
                Tidak ada peringatan besar pada tanggal ini.
              </AppText>
            )}
          </View>
        </View>
      </Card>

      <Card>
        <AppText variant="subtitle">Peringatan Bulan Ini</AppText>
        <View style={styles.legendRow}>
          <View style={styles.eventRow}>
            <View style={[styles.eventDot, { backgroundColor: theme.colors.gold }]} />
            <AppText variant="caption" color={theme.colors.muted}>
              Islam
            </AppText>
          </View>
          <View style={styles.eventRow}>
            <View style={[styles.eventDot, { backgroundColor: '#60A5FA' }]} />
            <AppText variant="caption" color={theme.colors.muted}>
              Nasional
            </AppText>
          </View>
        </View>
        <View style={styles.monthEventList}>
          {monthEvents.length ? (
            monthEvents.map((event) => (
              <Pressable key={`${event.title}-${event.date.toISOString()}`} onPress={() => setSelectedDate(event.date)} style={[styles.monthEvent, { borderColor: theme.colors.border }]}>
                <View style={[styles.monthEventDate, { backgroundColor: theme.colors.surfaceAlt }]}>
                  <AppText style={{ fontWeight: '900' }}>{event.date.getDate()}</AppText>
                  <AppText variant="caption" color={theme.colors.muted}>
                    {event.hijri?.day} H
                  </AppText>
                </View>
                <View style={{ flex: 1 }}>
                  <AppText style={{ fontWeight: '900' }}>{event.title}</AppText>
                  <AppText variant="caption" color={theme.colors.muted}>
                    {event.type === 'islam' ? 'Hari besar Islam' : 'Hari nasional'}
                  </AppText>
                </View>
              </Pressable>
            ))
          ) : (
            <AppText color={theme.colors.muted} style={{ marginTop: 10 }}>
              Tidak ada peringatan besar di bulan ini.
            </AppText>
          )}
        </View>
        <AppText variant="caption" color={theme.colors.muted} style={{ marginTop: 12 }}>
          Tanggal Hijriah menggunakan perhitungan tabular, sehingga bisa sedikit berbeda dari rukyat atau keputusan resmi pemerintah.
        </AppText>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, gap: 14, paddingBottom: 34 },
  hero: { gap: 12, borderRadius: 20 },
  iconWrap: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  monthHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  navButton: { width: 42, height: 42, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  weekRow: { flexDirection: 'row', marginBottom: 8 },
  weekCell: { width: '14.2857%', alignItems: 'center' },
  weekText: { textAlign: 'center', fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cellSlot: { width: '14.2857%', padding: 3 },
  cell: {
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
  },
  gregorianDay: { fontSize: 17, lineHeight: 21, fontWeight: '900' },
  hijriDay: { marginTop: 2, fontWeight: '800' },
  eventDots: { flexDirection: 'row', gap: 3, marginTop: 4 },
  eventDot: { width: 7, height: 7, borderRadius: 4 },
  todayButton: { minHeight: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  todayInfo: { flexDirection: 'row', gap: 14, marginTop: 12, alignItems: 'center' },
  todayBadge: { width: 104, minHeight: 86, borderRadius: 18, alignItems: 'center', justifyContent: 'center', padding: 10 },
  eventList: { gap: 8, marginTop: 10 },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendRow: { flexDirection: 'row', gap: 16, marginTop: 10 },
  monthEventList: { gap: 10, marginTop: 12 },
  monthEvent: { minHeight: 62, borderWidth: 1, borderRadius: 16, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  monthEventDate: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
