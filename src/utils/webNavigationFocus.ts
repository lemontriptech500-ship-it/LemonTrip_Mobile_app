import { Platform } from 'react-native';

/** Release browser focus before a native-stack route hides its current screen. */
export function blurWebNavigationFocus() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  const activeElement = document.activeElement;
  if (activeElement instanceof HTMLElement && activeElement !== document.body) {
    activeElement.blur();
  }
}
