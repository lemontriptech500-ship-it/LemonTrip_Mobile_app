import { Colors } from '@/constants/colors';
import { StatusBar } from 'expo-status-bar';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AppScreenProps = ComponentProps<typeof SafeAreaView>;

/** Keeps the status area and page canvas consistent on every app route. */
export function AppScreen({ children, style, edges = ['top'], ...props }: AppScreenProps) {
  return (
    <SafeAreaView {...props} edges={edges} style={[styles.safe, style, { backgroundColor: Colors.primaryDark }]}>
      <StatusBar style="light" />
      <View style={styles.canvas}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primaryDark },
  canvas: { flex: 1, backgroundColor: Colors.background },
});
