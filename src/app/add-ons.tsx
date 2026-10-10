import { FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { Action, Copy, FeatureScreen, Panel, Row } from '@/components/FeatureScreen';
import { Colors } from '@/constants/colors';
import { getFlightSelection } from '@/components/flights/flightSelectionStore';
import { useCart } from '@/utils/cartStore';
import { getCheckoutDetails, getTravelPreferences, setTravelPreferences } from '@/utils/checkoutStore';
import { router } from 'expo-router';
import { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
export default function AddOnsScreen() {
  const cart = useCart(); const details = getCheckoutDetails(); const flight = getFlightSelection();
  const [seat, setSeat] = useState(getTravelPreferences().seat); const [note, setNote] = useState(getTravelPreferences().note);
  const isFlight = cart.some(item => item.serviceName.toLowerCase().includes('flight'));
  return <FeatureScreen title="Make the journey yours." subtitle="A few preferences before your final review." eyebrow="CHECKOUT / PREFERENCES"><Panel title="Your journey">{cart.map(item => <Copy key={item.id}>{item.itemName}</Copy>)}{!cart.length ? <Copy>Choose a journey before continuing.</Copy> : null}</Panel>{isFlight ? <Panel title="Flight seat preference"><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{['No preference', 'Window', 'Aisle'].map(option => <TouchableOpacity key={option} accessibilityRole="button" accessibilityState={{ selected: seat === option }} onPress={() => setSeat(option)} style={{ padding: 14, borderRadius: 18, backgroundColor: seat === option ? Colors.accent : Colors.surfaceMuted }}><Text style={{ fontFamily: FontFamily.sans, color: Colors.primary, fontWeight: FontWeight.bold }}>{option}</Text></TouchableOpacity>)}</View><Copy>This is a preference. Your seat is assigned by the airline; live seat reservations and paid add-ons are unavailable.</Copy>{flight?.offer.baggage ? <Copy>Baggage: {flight.fareOption?.baggage ?? flight.offer.baggage}</Copy> : null}</Panel> : null}<Panel title="Anything else to remember?"><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{['None', 'Accessibility assistance', 'Travelling with an infant'].map(option => <TouchableOpacity key={option} accessibilityRole="button" accessibilityState={{ selected: note === option }} onPress={() => setNote(option)} style={{ padding: 14, borderRadius: 18, backgroundColor: note === option ? Colors.accentSoft : Colors.surfaceMuted }}><Text style={{ fontFamily: FontFamily.sans, color: Colors.primary }}>{option}</Text></TouchableOpacity>)}</View><Copy>Preferences are saved for your review only. Contact the travel team to confirm assistance with your provider.</Copy><Row title="Talk to a travel expert" route="/contact" icon="headset-outline" /></Panel><Action label={details ? 'Review journey' : 'Add traveller details'} disabled={!cart.length} onPress={() => { setTravelPreferences({ seat, note }); router.push(details ? '/review' : '/checkout'); }} /></FeatureScreen>;
}
