import { SupportScreen, SupportRow, supportStyles as s } from '@/components/support/SupportScreen';
import { Text, View } from 'react-native';
export default function TravelDocumentsScreen() {
  return <SupportScreen title="Travel Documents"><View style={s.card}><Text style={s.title}>Find your travel documents</Text><Text style={s.body}>Open a trip for its available booking details, or a visa application for your uploaded passport documents.</Text><SupportRow title="My trips & booking details" icon="briefcase-outline" route="/(tabs)/bookings" /><SupportRow title="Visa application documents" icon="document-text-outline" route="/(tabs)/explore/visa/applications" /></View></SupportScreen>;
}
