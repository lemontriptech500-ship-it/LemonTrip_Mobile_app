import { useClientReady } from '@/utils/useClientReady';
import { Action, Copy, Empty, FeatureScreen, Panel, Row } from '@/components/FeatureScreen';
import { destinationIdeas } from '@/constants/destinations';
import { travelServices } from '@/constants/navigation';
import type { Destination, TravelPackage } from '@/types/content';
import { useContentItems } from '@/utils/contentApi';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'react-native';
export default function DestinationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); const hydrated = useClientReady(); const { items, loading } = useContentItems<Destination>('destination'); const { items: packages } = useContentItems<TravelPackage>('package');
  const destination = hydrated ? [...items, ...destinationIdeas].find(item => item.id === id) : undefined;
  const matching = destination ? packages.filter(item => `${item.destination ?? ''} ${item.title}`.toLowerCase().includes(destination.name.toLowerCase())) : [];
  return <FeatureScreen title={destination?.name ?? 'Your next destination'} subtitle="Let’s make it a journey worth remembering." eyebrow="DESTINATION GUIDE">{!destination ? <Empty title={loading ? 'Finding your destination…' : 'Destination unavailable'} copy="Browse our destinations for more travel inspiration." action="Browse destinations" route="/destinations" /> : <><Image source={{ uri: destination.image }} style={{ height: 250, width: '100%', borderRadius: 28 }} accessibilityLabel={destination.name} /><Panel title={`Make your way to ${destination.name}`}><Copy>{destination.priceFrom}</Copy><Copy>Explore available travel services, curated holidays, and visa guidance for your next escape.</Copy>{travelServices.filter(item => ['Flights', 'Hotels', 'Visa'].includes(item.shortTitle)).map(item => <Row key={item.title} title={item.title} icon={item.icon} route={item.route} />)}</Panel><Panel title="Handpicked journeys">{matching.length ? matching.map(item => <Row key={item.id} title={item.title} detail={`${item.duration} · ${item.price}`} route={{ pathname: '/packages/[id]', params: { id: item.id } }} icon="sunny-outline" />) : <Copy>There are no published packages for this destination right now. Explore all holidays or ask us to help plan your trip.</Copy>}<Action label="Explore holiday packages" onPress={() => router.push('/packages')} /><Action label="Plan with our travel assistant" secondary onPress={() => router.push('/assistant')} /></Panel></>}</FeatureScreen>;
}

export function generateStaticParams() { return destinationIdeas.map(({ id }) => ({ id })); }
