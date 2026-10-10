import { Redirect, useLocalSearchParams } from 'expo-router';
export default function OffersRedirect() {
  const params = useLocalSearchParams();
  return <Redirect href={{ pathname: '/(tabs)/explore/offers', params }} />;
}
