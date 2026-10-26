import { FontFamily, TextSize } from '@/constants/typography';
import { StyleSheet, Text as NativeText, TextInput as NativeTextInput, type TextInputProps, type TextProps } from 'react-native';
import { useAppLanguage } from '@/utils/intl';
import { translateCopy } from '@/i18n/translate';
import { Children, type ReactNode, type RefAttributes } from 'react';

export { TextSize };

/** Inter is the app font. Styles that name Manrope (or no family) are mapped to the Inter file that matches their fontWeight. */
const INTER_BY_WEIGHT: Record<string, string> = { '100': 'Regular', '200': 'Regular', '300': 'Regular', '400': 'Regular', normal: 'Regular', '500': 'Medium', '600': 'SemiBold', '700': 'Bold', bold: 'Bold', '800': 'ExtraBold', '900': 'ExtraBold' };
function interStyle(style: unknown) {
  const flat = StyleSheet.flatten(style as never) as { fontFamily?: string; fontWeight?: string | number } | undefined;
  const family = flat?.fontFamily;
  if (family && family !== 'Manrope' && family !== 'Inter') return undefined;
  const weight = String(flat?.fontWeight ?? '400');
  return { fontFamily: `Inter-${INTER_BY_WEIGHT[weight] ?? 'Regular'}`, fontWeight: 'normal' as const };
}

function localizeChildren(children: ReactNode, language: string): ReactNode {
  if (typeof children === 'string') return translateCopy(children, language);
  if (Array.isArray(children) && children.every(child => child == null || typeof child === 'boolean' || typeof child === 'string' || typeof child === 'number')) {
    return translateCopy(children.filter(child => typeof child === 'string' || typeof child === 'number').join(''), language);
  }
  return Children.map(children, child => typeof child === 'string' ? translateCopy(child, language) : child);
}

/** App text defaults to the shared Inter family. Local styles may set size, color, and weight. */
export function Text({ style, ...props }: TextProps) {
  const language = useAppLanguage();
  const children = localizeChildren(props.children, language);
  const resolvedStyle = StyleSheet.flatten(style);
  const inter = language === 'Hindi' ? undefined : interStyle(style);
  const hindiStyle = language === 'Hindi' ? { fontFamily: FontFamily.hindi, lineHeight: Math.max(resolvedStyle?.lineHeight ?? 0, (resolvedStyle?.fontSize ?? TextSize.body) * 1.4) } : undefined;
  return <NativeText {...props} accessibilityLabel={props.accessibilityLabel && translateCopy(props.accessibilityLabel, language)} accessibilityHint={props.accessibilityHint && translateCopy(props.accessibilityHint, language)} style={[{ fontFamily: FontFamily.sans }, style, inter, hindiStyle]}>{children}</NativeText>;
}

/** Text inputs use the same family and body size as other app copy. */
export function TextInput({ style, ...props }: TextInputProps & RefAttributes<NativeTextInput>) {
  const language = useAppLanguage();
  return <NativeTextInput {...props} placeholder={props.placeholder && translateCopy(props.placeholder, language)} accessibilityLabel={props.accessibilityLabel && translateCopy(props.accessibilityLabel, language)} accessibilityHint={props.accessibilityHint && translateCopy(props.accessibilityHint, language)} style={[{ fontFamily: FontFamily.sans, fontSize: TextSize.body }, style, language !== 'Hindi' && interStyle([{ fontFamily: FontFamily.sans }, style]), language === 'Hindi' && { fontFamily: FontFamily.hindi }]} />;
}