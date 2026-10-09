import type { FlightSearchRequest, FlightOffer } from '@/components/flights/types';

function dateTime(date: string, time: string) {
  const safeDate = /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : '2030-01-01';
  return new Date(`${safeDate}T${time}:00`).toISOString();
}

function makeOffer(request: FlightSearchRequest, details: {
  id: string;
  airline: string;
  code: string;
  flightNumber: string;
  departure: string;
  durationMinutes: number;
  stops: number;
  price: number;
}) : FlightOffer {
  const departure = dateTime(request.departureDate, details.departure);
  const arrival = new Date(new Date(departure).getTime() + details.durationMinutes * 60_000).toISOString();
  const flexPrice = details.price + 2_200;

  return {
    id: `sample-${details.id}`,
    isDemo: true,
    airline: { name: details.airline, code: details.code },
    flightNumber: details.flightNumber,
    departure: { time: departure, airportCode: request.origin.slice(0, 3).toUpperCase(), airportName: request.origin },
    arrival: { time: arrival, airportCode: request.destination.slice(0, 3).toUpperCase(), airportName: request.destination },
    durationMinutes: details.durationMinutes,
    stops: details.stops,
    baggage: '15 kg · sample allowance',
    price: { amount: details.price, currency: 'INR' },
    fareInfo: 'Sample fare · not bookable',
    refundable: false,
    fareOptions: [
      {
        id: `sample-${details.id}-standard`,
        name: 'Economy Saver · sample',
        cabin: request.cabinClass,
        price: { total: details.price, baseFare: Math.round(details.price * 0.78), taxes: Math.round(details.price * 0.2), fees: Math.round(details.price * 0.02), currency: 'INR' },
        baggage: '15 kg · sample allowance',
        cancellation: 'Sample policy · confirm with airline',
        dateChange: 'Sample policy · confirm with airline',
        seatSelection: 'Not included',
        refundable: false,
      },
      {
        id: `sample-${details.id}-flex`,
        name: 'Economy Flex · sample',
        cabin: request.cabinClass,
        price: { total: flexPrice, currency: 'INR' },
        baggage: '20 kg · sample allowance',
        cancellation: 'Sample policy · confirm with airline',
        dateChange: 'Sample policy · confirm with airline',
        seatSelection: 'Included · sample',
        refundable: true,
      },
    ],
  };
}

/** Demo inventory for visualizing the flight flow when no search service is configured. */
export function getMockFlights(request: FlightSearchRequest): FlightOffer[] {
  const from = request.origin.trim();
  const to = request.destination.trim();
  if (!from || !to || from.toLowerCase() === to.toLowerCase()) return [];

  return [
    makeOffer(request, { id: 'air-india', airline: 'Air India', code: 'AI', flightNumber: 'AI 267', departure: '10:15', durationMinutes: 230, stops: 0, price: 22_480 }),
    makeOffer(request, { id: 'indigo', airline: 'IndiGo', code: '6E', flightNumber: '6E 267', departure: '08:40', durationMinutes: 285, stops: 1, price: 19_860 }),
    makeOffer(request, { id: 'srilankan', airline: 'SriLankan Airlines', code: 'UL', flightNumber: 'UL 267', departure: '18:45', durationMinutes: 385, stops: 1, price: 34_220 }),
  ];
}
