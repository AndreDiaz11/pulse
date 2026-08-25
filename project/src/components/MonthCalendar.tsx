import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppColors } from '../theme/colors';
import { dayKey } from '../lib/peruTime';

const WEEKDAY_LABELS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MONTH_LABELS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

interface Props {
  month: Date;
  selectedDay: Date;
  daysWithMatches: Set<string>;
  onSelectDay: (day: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function MonthCalendar({ month, selectedDay, daysWithMatches, onSelectDay, onPrevMonth, onNextMonth }: Props) {
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstWeekday = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const totalCells = firstWeekday + daysInMonth;
  const rows = Math.ceil(totalCells / 7);

  const label = `${MONTH_LABELS[month.getMonth()][0].toUpperCase()}${MONTH_LABELS[month.getMonth()].slice(1)} ${month.getFullYear()}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onPrevMonth} hitSlop={10}>
          <Icon name="chevron-left" size={26} color={AppColors.textPrimary} />
        </Pressable>
        <Text style={styles.monthLabel}>{label}</Text>
        <Pressable onPress={onNextMonth} hitSlop={10}>
          <Icon name="chevron-right" size={26} color={AppColors.textPrimary} />
        </Pressable>
      </View>
      <View style={styles.weekRow}>
        {WEEKDAY_LABELS.map(w => (
          <Text key={w} style={styles.weekday}>
            {w}
          </Text>
        ))}
      </View>
      {Array.from({ length: rows }).map((_, row) => (
        <View key={row} style={styles.weekRow}>
          {Array.from({ length: 7 }).map((_, col) => {
            const index = row * 7 + col;
            const dayNum = index - firstWeekday + 1;
            if (dayNum < 1 || dayNum > daysInMonth) {
              return <View key={col} style={styles.cell} />;
            }
            const day = new Date(month.getFullYear(), month.getMonth(), dayNum);
            const isSelected = dayKey(day) === dayKey(selectedDay);
            const hasMatches = daysWithMatches.has(dayKey(day));

            return (
              <Pressable key={col} style={styles.cell} onPress={() => onSelectDay(day)}>
                <View style={[styles.cellInner, isSelected ? styles.cellSelected : null]}>
                  <Text style={[styles.dayText, isSelected ? styles.dayTextSelected : null]}>{dayNum}</Text>
                  {hasMatches ? (
                    <View style={[styles.matchDot, isSelected ? { backgroundColor: '#fff' } : null]} />
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 8, paddingTop: 8, paddingBottom: 4 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  monthLabel: { color: AppColors.textPrimary, fontWeight: 'bold', fontSize: 16 },
  weekRow: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', color: AppColors.textSecondary, fontSize: 12 },
  cell: { flex: 1, padding: 2 },
  cellInner: { height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cellSelected: { backgroundColor: AppColors.accent },
  dayText: { color: AppColors.textPrimary, fontSize: 13 },
  dayTextSelected: { color: '#fff', fontWeight: 'bold' },
  matchDot: { width: 4, height: 4, borderRadius: 2, marginTop: 2, backgroundColor: AppColors.accentOnDark },
});
