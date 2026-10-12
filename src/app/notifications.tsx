import { useAppLanguage } from '@/utils/intl';
import { Redirect } from 'expo-router';
export default function Notifications() {
  useAppLanguage(); return <Redirect href="/manage/notifications" />; }
