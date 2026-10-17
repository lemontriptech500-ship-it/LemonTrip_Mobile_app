import { TouchableOpacity } from '@/components/ui/Pressable';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/colors';
import { FontFamily, FontWeight, TextSize } from '@/constants/typography';
import { Ionicons } from '@expo/vector-icons';
import { createElement, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

export function toDateString(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function fromDateString(value: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
}

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  initialDate?: Date;
};

export function DateField({ label, value, onChange, error, minimumDate, maximumDate, initialDate }: Props) {
  const [open, setOpen] = useState(false);
  const shown = fromDateString(value) ?? initialDate ?? new Date();
  const errorText = error ? <Text style={styles.error}>{error}</Text> : null;

  if (Platform.OS === 'web') {
    return <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {createElement('input', {
        type: 'date',
        value,
        min: minimumDate ? toDateString(minimumDate) : undefined,
        max: maximumDate ? toDateString(maximumDate) : undefined,
        'aria-label': label,
        onChange: (e: { target: { value: string } }) => onChange(e.target.value),
        style: webInput,
      })}
      {errorText}
    </View>;
  }

  const Picker = require('@react-native-community/datetimepicker').default;
  const handleChange = (event: { type: string }, date?: Date) => {
    if (Platform.OS === 'android') setOpen(false);
    if (event.type === 'set' && date) onChange(toDateString(date));
  };

  return <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} style={styles.input} onPress={() => setOpen(true)}>
      <Text style={[styles.value, !value && styles.placeholder]}>{value || 'Select date'}</Text>
      <Ionicons name="calendar-outline" size={20} color={Colors.textLight} />
    </TouchableOpacity>
    {open ? <Picker
      value={shown}
      mode="date"
      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      minimumDate={minimumDate}
      maximumDate={maximumDate}
      onChange={handleChange}
    /> : null}
    {open && Platform.OS === 'ios' ? <TouchableOpacity accessibilityRole="button" style={styles.done} onPress={() => { if (!value) onChange(toDateString(shown)); setOpen(false); }}>
      <Text style={styles.doneText}>Done</Text>
    </TouchableOpacity> : null}
    {errorText}
  </View>;
}

const webInput = {
  minHeight: 44,
  width: '100%',
  boxSizing: 'border-box',
  border: `1px solid ${Colors.borderStrong}`,
  borderRadius: 6,
  padding: '0 10px',
  fontSize: 16,
  fontFamily: 'inherit',
  backgroundColor: Colors.background,
  color: Colors.textDark,
};

const styles = StyleSheet.create({
  field: { marginBottom: 4 },
  label: { color: Colors.textDark, fontFamily: FontFamily.sans, fontWeight: FontWeight.bold, fontSize: TextSize.caption, marginBottom: 6 },
  input: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: Colors.borderStrong, borderRadius: 6, paddingHorizontal: 10, backgroundColor: Colors.background },
  value: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.body },
  placeholder: { color: Colors.textLight },
  done: { minHeight: 44, alignSelf: 'flex-end', justifyContent: 'center', paddingHorizontal: 8 },
  doneText: { color: Colors.secondary, fontFamily: FontFamily.sans, fontWeight: FontWeight.extraBold, fontSize: TextSize.body },
  error: { color: '#D32F2F', fontFamily: FontFamily.sans, fontSize: TextSize.caption, marginTop: 4 },
});