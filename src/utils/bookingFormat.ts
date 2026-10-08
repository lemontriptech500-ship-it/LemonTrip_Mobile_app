import { Brand } from '@/constants/colors';
import Ionicons from '@expo/vector-icons/Ionicons';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];
export type NormalizedStatus = 'upcoming' | 'completed' | 'cancelled';

export const normalizeStatus = (status?: string): NormalizedStatus => {
  if (status === 'cancelled') return 'cancelled';
  if (status === 'completed') return 'completed';
  return 'upcoming'; // upcoming, confirmed or missing
};

export const statusStyles: Record<NormalizedStatus, { label: string; bg: string; fg: string; icon: IconName }> = {
  upcoming: { label: 'CONFIRMED', bg: Brand.lemon, fg: Brand.forest, icon: 'checkmark-circle' },
  completed: { label: 'COMPLETED', bg: '#E6EAE8', fg: '#56616F', icon: 'flag' },
  cancelled: { label: 'CANCELLED', bg: '#FDECEC', fg: '#C62828', icon: 'close-circle' },
};

export const serviceIcon = (serviceName?: string): IconName => {
  const name = (serviceName ?? '').toLowerCase();
  if (name.includes('flight')) return 'airplane-outline';
  if (name.includes('hotel') || name.includes('stay')) return 'bed-outline';
  if (name.includes('bus')) return 'bus-outline';
  if (name.includes('train')) return 'train-outline';
  if (name.includes('visa')) return 'document-text-outline';
  if (name.includes('package') || name.includes('holiday')) return 'umbrella-outline';
  return 'ticket-outline';
};

export const formatDate = (value?: string) => {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return value;
  }
};

export const shortId = (id: string) => `LT-${String(id).slice(-6).toUpperCase()}`;