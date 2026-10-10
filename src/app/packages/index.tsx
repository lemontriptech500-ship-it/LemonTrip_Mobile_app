import { Redirect, useLocalSearchParams } from 'expo-router';
export default function PackagesRedirect() {
  const params = useLocalSearchParams();
  return <Redirect href={{ pathname: '/(tabs)/explore/packages', params }} />;
}
