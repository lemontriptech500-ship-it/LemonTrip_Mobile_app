import { useAppLanguage } from '@/utils/intl';
import { useClientReady } from '@/utils/useClientReady';
import { Copy, Panel, Row } from '@/components/FeatureScreen';
import { AppScreen } from '@/components/AppScreen';
import { InfoBanner } from '@/components/account/InfoBanner';
import { ServiceTopBar } from '@/components/ui/ServiceHeader';
import { SupportButton } from '@/components/support/SupportKit';
import { destinationIdeas } from '@/data/mock/destinations';
import { travelServices } from '@/constants/navigation';
import type { Destination, TravelPackage } from '@/types/content';
import { useContentItems } from '@/utils/contentApi';
import { router, useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, View } from 'react-native';

export default function DestinationScreen() {
  useAppLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const hydrated = useClientReady();
  const { items, loading } = useContentItems<Destination>('destination');
  const { items: packages } = useContentItems<TravelPackage>('package');
  const destination = hydrated ? (items.find((item) => item.id === id) ?? destinationIdeas.find((item) => item.id === id)) : undefined;
  const matching = destination ? packages.filter((item) => `${item.destination ?? ''} ${item.title}`.toLowerCase().includes(destination.name.toLowerCase())) : [];
  return (
    <AppScreen headerTone="light">
      <ServiceTopBar title={destination?.name ?? 'Destination'} fallback="/destinations" />
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        <View style={{ width: '100%', maxWidth: 760, alignSelf: 'center' }}>
          <InfoBanner title={destination?.name ?? 'Your next destination'} text="Let's make it a journey worth remembering." />
          <View style={{ paddingHorizontal: 16, gap: 12 }}>
            {!destination ? (
              <Panel title={loading || !hydrated ? 'Finding your destination...' : 'Destination unavailable'}>
                <Copy>Browse our destinations for more travel inspiration.</Copy>
                <SupportButton label="Browse destinations" icon="arrow-forward" variant="dark" onPress={() => router.push('/destinations')} />
              </Panel>
            ) : (
              <>
                <Image source={{ uri: destination.image }} style={{ height: 200, width: '100%', borderRadius: 18 }} accessibilityLabel={destination.name} />
                <Panel title={`Make your way to ${destination.name}`}>
                  <Copy>{destination.priceFrom}</Copy>
                  <Copy>Explore available travel services, curated holidays, and visa guidance for your next escape.</Copy>
                  {travelServices.filter((item) => ['Flights', 'Hotels', 'Visa'].includes(item.shortTitle)).map((item) => <Row key={item.title} title={item.title} icon={item.icon} route={item.route} />)}
                </Panel>
                <Panel title="Handpicked journeys">
                  {matching.length ? matching.map((item) => <Row key={item.id} title={item.title} detail={`${item.duration} · ${item.price}`} route={{ pathname: '/packages/[id]', params: { id: item.id } }} icon="sunny-outline" />) : <Copy>There are no published packages for this destination right now. Explore all holidays or ask us to help plan your trip.</Copy>}
                  <View style={{ gap: 10, marginTop: 8 }}>
                    <SupportButton label="Explore holiday packages" icon="arrow-forward" variant="dark" onPress={() => router.push('/packages')} />
                    <SupportButton label="Plan with our travel assistant" variant="soft" onPress={() => router.push('/assistant')} />
                  </View>
                </Panel>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

export function generateStaticParams() { return destinationIdeas.map(({ id }) => ({ id })); }
