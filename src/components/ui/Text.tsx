import { FontFamily, TextSize } from '@/constants/typography';
import { Text as NativeText, TextInput as NativeTextInput, type TextInputProps, type TextProps } from 'react-native';

export { TextSize };

/** App text defaults to the shared Manrope family. Local styles may set size, color, and weight. */
export function Text({ style, ...props }: TextProps) {
  return <NativeText {...props} style={[{ fontFamily: FontFamily.sans }, style]} />;
}

/** Text inputs use the same family and body size as other app copy. */
export function TextInput({ style, ...props }: TextInputProps) {
  return <NativeTextInput {...props} style={[{ fontFamily: FontFamily.sans, fontSize: TextSize.body }, style]} />;
}
