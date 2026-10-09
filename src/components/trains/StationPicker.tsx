import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { STATIONS, getStation } from '@/data/trains';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props { visible: boolean; title: string; exclude?: string; onSelect: (code: string) => void; onClose: () => void }

/** Bottom-sheet station search used for From / To. */
export function StationPicker({ visible, title, exclude, onSelect, onClose }: Props) {
  const [query, setQuery] = useState('');
  const insets = useSafeAreaInsets();
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return STATIONS.filter((st) => st.code !== exclude && (!q || `${st.name} ${st.city} ${st.code}`.toLowerCase().includes(q)));
  }, [query, exclude]);
  const close = () => { setQuery(''); onClose(); };
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={close}>
      <Pressable style={s.backdrop} onPress={close} accessibilityLabel="Close station picker" />
      <View style={[s.sheet, { paddingBottom: insets.bottom + 12 }]}>
        <View style={s.grab} />
        <View style={s.head}><Text style={s.title}>{title}</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel="Close" onPress={close} style={s.closeBtn}><Ionicons name="close" size={20} color={Colors.textDark} /></TouchableOpacity></View>
        <View style={s.search}><Ionicons name="search-outline" size={17} color={Colors.primary} /><TextInput autoFocus value={query} onChangeText={setQuery} placeholder="Search station, city or code" placeholderTextColor={Colors.textLight} style={s.searchInput} /></View>
        <FlatList
          data={list}
          keyExtractor={(item) => item.code}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={<Text style={s.none}>No stations match “{query}”.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity accessibilityRole="button" onPress={() => { setQuery(''); onSelect(item.code); }} style={s.item}>
              <View style={s.code}><Text style={s.codeText}>{item.code}</Text></View>
              <View style={{ flex: 1 }}><Text style={s.name}>{item.name}</Text><Text style={s.city}>{item.city}</Text></View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
}

export const stationName = (code: string) => getStation(code)?.name ?? code;

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: Colors.overlay },
  sheet: { maxHeight: '78%', minHeight: '55%', backgroundColor: Colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: Ui.space.page, paddingTop: 10 },
  grab: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.borderStrong, marginBottom: 10 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  title: { fontFamily: 'Manrope', fontSize: 18, fontWeight: '800', color: Colors.textDark },
  closeBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surfaceMuted },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 48, paddingHorizontal: 12, borderRadius: 16, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, marginBottom: 6 },
  searchInput: { flex: 1, minHeight: 48, fontFamily: 'Manrope', fontSize: 15, color: Colors.textDark },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  code: { minWidth: 54, alignItems: 'center', paddingVertical: 6, paddingHorizontal: 8, borderRadius: 10, backgroundColor: Colors.surfaceMuted },
  codeText: { fontFamily: 'Manrope', fontSize: 12, fontWeight: '800', color: Colors.primary },
  name: { fontFamily: 'Manrope', fontSize: 15, fontWeight: '700', color: Colors.textDark },
  city: { fontFamily: 'Manrope', fontSize: 12, color: Colors.textLight, marginTop: 1 },
  none: { fontFamily: 'Manrope', fontSize: 14, color: Colors.textLight, textAlign: 'center', marginTop: 30 },
});
