import { getAppLocale, formatLocalizedDate, useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { FontFamily, FontWeight, TextSize } from '@/constants/typography';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';

const pad = (n: number) => String(n).padStart(2, '0');
export const toISO = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
export const todayISO = () => {
  const now = new Date();
  return toISO(now.getFullYear(), now.getMonth(), now.getDate());
};

const weekdays = () => Array.from({ length: 7 }, (_, index) => new Intl.DateTimeFormat(getAppLocale(), { weekday: 'short' }).format(new Date(2026, 0, 4 + index)));

const parse = (iso: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return match ? { y: Number(match[1]), m: Number(match[2]) - 1, d: Number(match[3]) } : null;
};

export const formatDisplay = (iso: string) => {
  const p = parse(iso);
  return p ? formatLocalizedDate(iso) : '';
};

type DateFieldProps = {
  label: string;
  value: string;
  onChange: (iso: string) => void;
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
  grid?: boolean;
  compact?: boolean;
};

/** A date field that opens a calendar. Value is always YYYY-MM-DD. */
export function DateField({ label, value, onChange, minDate, maxDate, placeholder = 'Select date', grid = false, compact = false }: DateFieldProps) {
  useAppLanguage();
  const min = minDate || todayISO();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState({ y: 2026, m: 0 });

  const openPicker = () => {
    const start = parse(value) ?? parse(min) ?? parse(todayISO());
    if (start) setView({ y: start.y, m: start.m });
    setOpen(true);
  };

  const shift = (delta: number) => {
    const next = new Date(view.y, view.m + delta, 1);
    setView({ y: next.getFullYear(), m: next.getMonth() });
  };

  const prevLast = new Date(view.y, view.m, 0);
  const prevDisabled = toISO(prevLast.getFullYear(), prevLast.getMonth(), prevLast.getDate()) < min;
  const nextFirst = new Date(view.y, view.m + 1, 1);
  const nextDisabled = !!maxDate && toISO(nextFirst.getFullYear(), nextFirst.getMonth(), 1) > maxDate;

  const firstWeekday = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const today = todayISO();
  const display = formatDisplay(value);

  return (
    <View style={[s.field, grid && s.grid, compact && s.compactField, grid && compact && s.compactGrid]}>
      <Text style={[s.label, compact && s.labelCompact]}>{label}</Text>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`${label} date: ${display || 'not selected'}`}
        onPress={openPicker}
        style={[s.input, compact && s.inputCompact]}
      >
        <Text style={[s.value, compact && s.valueCompact, !display && s.placeholder]} numberOfLines={1}>
          {display || placeholder}
        </Text>
        <Ionicons name="calendar-outline" size={compact ? 15 : 18} color={Colors.primary} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={s.overlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setOpen(false)} accessibilityLabel="Close calendar" />
          <View style={s.card}>
            <View style={s.head}>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Previous month" disabled={prevDisabled} onPress={() => shift(-1)} style={[s.nav, prevDisabled && s.navDisabled]}>
                <Ionicons name="chevron-back" size={18} color={Colors.primaryDark} />
              </TouchableOpacity>
              <Text style={s.title}>{new Intl.DateTimeFormat(getAppLocale(), { month: 'long' }).format(new Date(view.y, view.m, 1))} {view.y}</Text>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Next month" disabled={nextDisabled} onPress={() => shift(1)} style={[s.nav, nextDisabled && s.navDisabled]}>
                <Ionicons name="chevron-forward" size={18} color={Colors.primaryDark} />
              </TouchableOpacity>
            </View>

            <View style={s.weekRow}>
              {weekdays().map((day, index) => (
                <View key={`${day}-${index}`} style={s.cell}><Text style={s.weekday}>{day}</Text></View>
              ))}
            </View>

            <View style={s.days}>
              {cells.map((day, index) => {
                if (day === null) return <View key={`blank-${index}`} style={s.cell} />;
                const iso = toISO(view.y, view.m, day);
                const disabled = iso < min || (!!maxDate && iso > maxDate);
                const selected = iso === value;
                return (
                  <View key={iso} style={s.cell}>
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityState={{ selected, disabled }}
                      accessibilityLabel={formatDisplay(iso)}
                      disabled={disabled}
                      onPress={() => { onChange(iso); setOpen(false); }}
                      style={[s.day, iso === today && s.dayToday, selected && s.daySelected]}
                    >
                      <Text style={[s.dayText, disabled && s.dayTextDisabled, selected && s.dayTextSelected]}>{day}</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

            <TouchableOpacity accessibilityRole="button" onPress={() => setOpen(false)} style={s.closeButton}>
              <Text style={s.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  field: { flex: 1, minWidth: 0, marginBottom: 12 },
  grid: { flexBasis: '46%', flexGrow: 1, flexShrink: 0 },
  compactField: { marginBottom: 7 },
  compactGrid: { flexBasis: 0, flexGrow: 1, flexShrink: 1 },
  label: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, letterSpacing: 0.8, marginBottom: 6 },
  labelCompact: { marginBottom: 3 },
  input: { minHeight: Ui.field.minHeight, paddingHorizontal: 10, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6, borderWidth: 1, borderColor: Colors.border, borderRadius: Ui.radius.control, backgroundColor: Colors.surfaceMuted },
  inputCompact: { minHeight: 30, paddingHorizontal: 0, paddingVertical: 3, borderWidth: 0, borderBottomWidth: 1, borderRadius: 0, backgroundColor: 'transparent' },
  value: { flex: 1, color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.body },
  valueCompact: { fontSize: TextSize.caption },
  placeholder: { color: Colors.textLight },

  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: 'rgba(0,0,0,0.45)' },
  card: { width: '100%', maxWidth: 360, padding: 16, borderRadius: 20, backgroundColor: Colors.surface },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  nav: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: Colors.accentSoft },
  navDisabled: { opacity: 0.35 },
  title: { color: Colors.primaryDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold },
  weekRow: { flexDirection: 'row', marginBottom: 4 },
  weekday: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold },
  days: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.2857%', alignItems: 'center', justifyContent: 'center', paddingVertical: 2 },
  day: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18 },
  dayToday: { borderWidth: 1, borderColor: Colors.primary },
  daySelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dayText: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.bold },
  dayTextDisabled: { color: Colors.textLight, opacity: 0.4 },
  dayTextSelected: { color: Colors.white },
  closeButton: { marginTop: 12, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: Colors.surfaceMuted },
  closeText: { color: Colors.primaryDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold },
});
