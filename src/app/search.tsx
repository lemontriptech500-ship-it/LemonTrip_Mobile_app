import { useAppLanguage } from '@/utils/intl';
import { Redirect } from 'expo-router';
export default function Search() {
  useAppLanguage(); return <Redirect href="/manage/search" />; }
