import { useAppLanguage } from '@/utils/intl';
import { Redirect, useLocalSearchParams } from 'expo-router';
export default function PackagesRedirect() {
  useAppLanguage();
  const params = useLocalSearchParams();
  return <Redirect href={{ pathname: '/(tabs)/explore/packages', params }} />;
}
