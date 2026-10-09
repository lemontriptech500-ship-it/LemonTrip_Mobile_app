import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

export type AccountArtworkName =
  | 'profile'
  | 'payment'
  | 'settings'
  | 'language'
  | 'currency'
  | 'email'
  | 'booking'
  | 'notifications'
  | 'security'
  | 'password'
  | 'device'
  | 'privacy'
  | 'document'
  | 'help'
  | 'support';

const icons: Record<AccountArtworkName, ComponentProps<typeof Ionicons>['name']> = {
  profile: 'person-outline', payment: 'card-outline', settings: 'options-outline',
  language: 'language-outline', currency: 'cash-outline', email: 'mail-outline',
  booking: 'ticket-outline', notifications: 'notifications-outline',
  security: 'shield-checkmark-outline', password: 'key-outline',
  device: 'phone-portrait-outline', privacy: 'eye-outline', document: 'document-text-outline',
  help: 'help-circle-outline', support: 'chatbubble-ellipses-outline',
};

export function AccountArtworkIcon({ name, size = 26 }: { name: AccountArtworkName; size?: number }) {
  return <Ionicons name={icons[name]} size={size} color={Colors.primary} accessible={false} />;
}
