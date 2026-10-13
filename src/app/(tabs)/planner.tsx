import { useAppLanguage } from '@/utils/intl';
import { Redirect } from 'expo-router';
export default function PlannerRedirect() {
  useAppLanguage(); return <Redirect href="/assistant" />; }
