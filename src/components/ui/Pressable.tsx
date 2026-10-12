import { useAppLanguage } from '@/utils/intl';
import { translateCopy } from '@/i18n/translate';
import { Pressable as NativePressable, TouchableOpacity as NativeTouchableOpacity, type AccessibilityProps } from 'react-native';
import type { ComponentPropsWithRef } from 'react';

function accessibility(props: AccessibilityProps, language: string): AccessibilityProps {
  return {
    accessibilityLabel: props.accessibilityLabel && translateCopy(props.accessibilityLabel, language),
    accessibilityHint: props.accessibilityHint && translateCopy(props.accessibilityHint, language),
    accessibilityValue: props.accessibilityValue && {
      ...props.accessibilityValue,
      text: props.accessibilityValue.text && translateCopy(props.accessibilityValue.text, language),
    },
  };
}

export function TouchableOpacity(props: ComponentPropsWithRef<typeof NativeTouchableOpacity>) {
  const language = useAppLanguage();
  return <NativeTouchableOpacity {...props} {...accessibility(props, language)} />;
}

export function Pressable(props: ComponentPropsWithRef<typeof NativePressable>) {
  const language = useAppLanguage();
  return <NativePressable {...props} {...accessibility(props, language)} />;
}
