/**
 * Dummy bus catalogue for the LemonTrip mobile app.
 * Everything here is local sample data: no network, no real inventory.
 * Swap `searchBuses` / `getBookedSeats` for API calls when a bus provider is connected.
 */
import { isRealDate, toISO } from '@/data/trains';

export { BANKS, WALLET_BALANCE, addDaysISO, defaultTravelDate, formatLongDate, formatShortDate, fromISO, inr, isRealDate, timeOfDay, upcomingDates } from '@/data/trains';

export interface City { code: string; name: string; state: string; lat: number; lng: number }
export type DeckId = 'Lower' | 'Upper' | 'Seater';

export interface Bus {
  id: string;
  operator: string;
  type: string;
  ac: boolean;
  sleeper: boolean;
  rating: number;
  reviews: number;
  ratePerKm: number;
  fromCode: string;
  toCode: string;
  departure: string;
  arrival: string;
  arrivalDayOffset: number;
  durationMin: number;
  distanceKm: number;
  amenities: string[];
}

export const CITIES: City[] = [
  { code: 'DEL', name: 'Delhi', state: 'Delhi', lat: 28.61, lng: 77.21 },
  { code: 'JAI', name: 'Jaipur', state: 'Rajasthan', lat: 26.91, lng: 75.79 },
  { code: 'AGR', name: 'Agra', state: 'Uttar Pradesh', lat: 27.18, lng: 78.01 },
  { code: 'MNL', name: 'Manali', state: 'Himachal Pradesh', lat: 32.24, lng: 77.19 },
  { code: 'SHM', name: 'Shimla', state: 'Himachal Pradesh', lat: 31.10, lng: 77.17 },
  { code: 'CHD', name: 'Chandigarh', state: 'Chandigarh', lat: 30.73, lng: 76.78 },
  { code: 'DDN', name: 'Dehradun', state: 'Uttarakhand', lat: 30.32, lng: 78.03 },
  { code: 'LKO', name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.85, lng: 80.95 },
  { code: 'VNS', name: 'Varanasi', state: 'Uttar Pradesh', lat: 25.32, lng: 82.97 },
  { code: 'UDR', name: 'Udaipur', state: 'Rajasthan', lat: 24.59, lng: 73.71 },
  { code: 'AMD', name: 'Ahmedabad', state: 'Gujarat', lat: 23.02, lng: 72.57 },
  { code: 'BOM', name: 'Mumbai', state: 'Maharashtra', lat: 19.08, lng: 72.88 },
  { code: 'PNQ', name: 'Pune', state: 'Maharashtra', lat: 18.52, lng: 73.86 },
  { code: 'GOI', name: 'Goa', state: 'Goa', lat: 15.50, lng: 73.83 },
  { code: 'HYD', name: 'Hyderabad', state: 'Telangana', lat: 17.39, lng: 78.49 },
  { code: 'BLR', name: 'Bengaluru', state: 'Karnataka', lat: 12.97, lng: 77.59 },
  { code: 'MAA', name: 'Chennai', state: 'Tamil Nadu', lat: 13.08, lng: 80.27 },
  { code: 'PNY', name: 'Pondicherry', state: 'Puducherry', lat: 11.94, lng: 79.81 },
  { code: 'TIR', name: 'Tirupati', state: 'Andhra Pradesh', lat: 13.63, lng: 79.42 },
  { code: 'CJB', name: 'Coimbatore', state: 'Tamil Nadu', lat: 11.02, lng: 76.96 },
  { code: 'IXM', name: 'Madurai', state: 'Tamil Nadu', lat: 9.92, lng: 78.12 },
  { code: 'COK', name: 'Kochi', state: 'Kerala', lat: 9.93, lng: 76.27 },
  { code: 'CCU', name: 'Kolkata', state: 'West Bengal', lat: 22.57, lng: 88.36 },
];

export const POPULAR_ROUTES: { from: string; to: string }[] = [
  { from: 'DEL', to: 'JAI' }, { from: 'DEL', to: 'AGR' }, { from: 'DEL', to: 'MNL' },
  { from: 'MAA', to: 'BLR' }, { from: 'MAA', to: 'PNY' }, { from: 'MAA', to: 'CJB' },
  { from: 'BOM', to: 'PNQ' }, { from: 'BOM', to: 'GOI' },
];

/* ---------- helpers ---------- */

const cityMap = new Map(CITIES.map((c) => [c.code, c]));
export const getCity = (code: string) => cityMap.get(code);
export const cityLabel = (code: string) => { const c = getCity(code); return c ? `${c.name} (${c.code})` : code; };

export const resolveCity = (text: string) => {
  const q = text.trim().toLowerCase();
  if (!q) return undefined;
  return CITIES.find((c) => c.code.toLowerCase() === q || c.name.toLowerCase() === q)
    ?? CITIES.find((c) => `${c.name} ${c.state} ${c.code}`.toLowerCase().includes(q));
};

const pad = (n: number) => String(n).padStart(2, '0');
const hhmm = (mins: number) => `${pad(Math.floor(mins / 60) % 24)}:${pad(mins % 60)}`;
const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
function hash(text: string) { let h = 2166136261; for (let i = 0; i < text.length; i += 1) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); } return Math.abs(h); }

export const formatDuration = (mins: number) => `${Math.floor(mins / 60)}h ${pad(mins % 60)}m`;
/** Shifts a HH:MM clock time by N minutes, reporting whether it rolled over a day boundary. */
export function shiftTime(time: string, minutes: number) {
  const total = toMin(time) + minutes;
  return { time: hhmm(((total % 1440) + 1440) % 1440), dayOffset: Math.floor(total / 1440) };
}

function roadKm(a: City, b: City) {
  const R = 6371; const r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r; const dLng = (b.lng - a.lng) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return Math.max(40, Math.round(2 * R * Math.asin(Math.sqrt(h)) * 1.28));
}

/* ---------- buses ---------- */

interface BusDef { operator: string; type: string; ac: boolean; sleeper: boolean; rate: number; speed: number; hours: number[]; extras: string[] }

/** Sample buses generated for any city pair, so every search returns results. Sleepers only on longer routes. */
export function generateBuses(fromCode: string, toCode: string): Bus[] {
  const a = getCity(fromCode); const b = getCity(toCode);
  if (!a || !b || fromCode === toCode) return [];
  const km = roadKm(a, b);
  const seed = hash(`${fromCode}${toCode}`);
  const defs: BusDef[] = km >= 300 ? [
    { operator: 'GreenLine Travels', type: 'AC Sleeper (2+1)', ac: true, sleeper: true, rate: 1.9, speed: 48, hours: [20, 21, 22], extras: ['Reading light', 'Curtains'] },
    { operator: 'Royal Express', type: 'Volvo AC Multi-Axle Seater (2+2)', ac: true, sleeper: false, rate: 1.7, speed: 55, hours: [18, 19, 21], extras: ['Pushback seats'] },
    { operator: 'Sharma Travels', type: 'Non-AC Sleeper (2+1)', ac: false, sleeper: true, rate: 1.2, speed: 44, hours: [19, 20, 23], extras: ['Curtains'] },
    { operator: 'City Connect', type: 'AC Seater (2+2)', ac: true, sleeper: false, rate: 1.4, speed: 52, hours: [6, 7, 8, 14], extras: ['Pushback seats'] },
    { operator: 'Lemon Travels', type: 'AC Sleeper (2+1) Premium', ac: true, sleeper: true, rate: 2.2, speed: 50, hours: [22, 23], extras: ['WiFi', 'Snacks', 'Reading light'] },
  ] : [
    { operator: 'City Connect', type: 'AC Seater (2+2)', ac: true, sleeper: false, rate: 1.5, speed: 45, hours: [6, 7, 8, 9], extras: ['Pushback seats'] },
    { operator: 'Royal Express', type: 'Volvo AC Seater (2+2)', ac: true, sleeper: false, rate: 1.8, speed: 50, hours: [10, 12, 14], extras: ['Pushback seats', 'WiFi'] },
    { operator: 'Sharma Travels', type: 'Non-AC Seater (2+2)', ac: false, sleeper: false, rate: 1.0, speed: 38, hours: [7, 11, 15, 17], extras: [] },
    { operator: 'Lemon Travels', type: 'AC Seater (2+2) Premium', ac: true, sleeper: false, rate: 2.0, speed: 52, hours: [16, 18, 20], extras: ['WiFi', 'Snacks'] },
  ];
  return defs.map((d, slot) => {
    const dh = d.hours[(seed >> (slot * 2)) % d.hours.length]; const dm = ((seed >> (slot + 3)) % 12) * 5;
    const depMin = dh * 60 + dm;
    const dur = Math.max(60, Math.round((km / d.speed) * 60 / 5) * 5);
    const arrAbs = depMin + dur;
    return {
      id: `bus-${fromCode}-${toCode}-${slot}`, operator: d.operator, type: d.type, ac: d.ac, sleeper: d.sleeper,
      rating: Math.round((4.0 + ((seed >> slot) % 9) / 10) * 10) / 10, reviews: 120 + ((seed >> (slot + 2)) % 1900),
      ratePerKm: d.rate, fromCode, toCode, departure: hhmm(depMin), arrival: hhmm(arrAbs), arrivalDayOffset: Math.floor(arrAbs / 1440),
      durationMin: dur, distanceKm: km,
      amenities: ['Live tracking', 'Charging point', ...(d.ac ? ['Blanket', 'Water bottle'] : ['Water bottle']), ...d.extras],
    };
  });
}

export const getBus = (id?: string): Bus | undefined => {
  if (!id) return undefined;
  const [, from, to, slot] = id.split('-');
  return generateBuses(from, to)[Number(slot)];
};

export function searchBuses(params: { from: string; to: string; date: string }): Bus[] {
  let list = generateBuses(params.from, params.to);
  // Hide buses that have already left when searching for today.
  if (isRealDate(params.date) && params.date === toISO(new Date())) {
    const now = new Date(); const nowMin = now.getHours() * 60 + now.getMinutes();
    list = list.filter((bus) => toMin(bus.departure) > nowMin + 30);
  }
  return list;
}

/* ---------- seats ---------- */

export interface SeatLayout { id: DeckId; label: string; hint: string; rows: (string | null)[][] }

export function getLayout(bus: Bus): SeatLayout[] {
  if (bus.sleeper) {
    const deck = (id: 'Lower' | 'Upper', prefix: string): SeatLayout => ({
      id, label: `${id} deck`, hint: `${id} deck · sleeper berths`,
      rows: Array.from({ length: 5 }, (_, r) => [`${prefix}${r * 3 + 1}`, null, `${prefix}${r * 3 + 2}`, `${prefix}${r * 3 + 3}`]),
    });
    return [deck('Lower', 'L'), deck('Upper', 'U')];
  }
  return [{ id: 'Seater', label: 'Seater', hint: 'Seater · 2+2 layout', rows: Array.from({ length: 10 }, (_, r) => [`${r + 1}A`, `${r + 1}B`, null, `${r + 1}C`, `${r + 1}D`]) }];
}

export const allSeats = (bus: Bus) => getLayout(bus).flatMap((d) => d.rows.flat().filter((s): s is string => !!s));
export const deckOf = (seat: string): DeckId => (seat.startsWith('L') ? 'Lower' : seat.startsWith('U') ? 'Upper' : 'Seater');

/** Deterministic "already booked" seats for a bus on a date. */
export function getBookedSeats(bus: Bus, date: string): Set<string> {
  const occupancy = 22 + (hash(`${bus.id}|${date}`) % 45);
  return new Set(allSeats(bus).filter((seat) => hash(`${bus.id}|${date}|${seat}`) % 100 < occupancy));
}

export interface DeckInfo { id: DeckId; label: string; free: number; total: number; fromFare: number; tone: 'good' | 'warn' | 'bad'; text: string }
export function getDeckInfo(bus: Bus, date: string): DeckInfo[] {
  const booked = getBookedSeats(bus, date);
  return getLayout(bus).map((deck) => {
    const seats = deck.rows.flat().filter((s): s is string => !!s);
    const free = seats.filter((s) => !booked.has(s)).length;
    const fares = seats.filter((s) => !booked.has(s)).map((s) => seatPrice(bus, s));
    return { id: deck.id, label: deck.id === 'Seater' ? 'Seater' : deck.id, free, total: seats.length, fromFare: fares.length ? Math.min(...fares) : seatPrice(bus, seats[0]), tone: free === 0 ? 'bad' : free <= 8 ? 'warn' : 'good', text: free === 0 ? 'Sold out' : `${free} seat${free > 1 ? 's' : ''} left` };
  });
}
export const seatsLeft = (infos: DeckInfo[]) => infos.reduce((n, d) => n + d.free, 0);

/* ---------- fares ---------- */

/** Per-seat base fare. Upper berths are a little cheaper; window seats on seaters carry a small premium. */
export function seatPrice(bus: Bus, seat: string) {
  const base = Math.max(199, Math.round((bus.distanceKm * bus.ratePerKm) / 10) * 10);
  if (bus.sleeper) return seat.startsWith('U') ? Math.max(179, base - 40) : base;
  return /[AD]$/.test(seat) ? base + 15 : base;
}
export const lowestFare = (bus: Bus, date: string) => Math.min(...getDeckInfo(bus, date).filter((d) => d.free > 0).map((d) => d.fromFare), seatPrice(bus, allSeats(bus)[0]));

export interface FareBreakdown { base: number; gst: number; insurance: number; convenience: number; seats: number; subtotal: number; discount: number; total: number }
export const INSURANCE_PER_SEAT = 20;

export function computeFare(bus: Bus, seats: string[], insurance: boolean, discount = 0): FareBreakdown {
  const base = seats.reduce((sum, seat) => sum + seatPrice(bus, seat), 0);
  const gst = bus.ac ? Math.round(base * 0.05) : 0;
  const ins = insurance ? INSURANCE_PER_SEAT * seats.length : 0;
  const convenience = seats.length ? 24 : 0;
  const subtotal = base + gst + ins + convenience;
  return { base, gst, insurance: ins, convenience, seats: seats.length, subtotal, discount, total: Math.max(0, subtotal - discount) };
}

/* ---------- boarding & dropping points ---------- */

export interface Point { id: string; name: string; landmark: string; offsetMin: number }
const boardingTemplate = (city: string): Point[] => [
  { id: 'main', name: `${city} Bus Stand`, landmark: 'Main terminal · Platform area', offsetMin: 0 },
  { id: 'metro', name: `${city} Metro Station`, landmark: 'Pick-up near Gate 2', offsetMin: 15 },
  { id: 'bypass', name: `${city} Bypass Junction`, landmark: 'Highway pick-up point', offsetMin: 30 },
];
const droppingTemplate = (city: string): Point[] => [
  { id: 'bypass', name: `${city} Bypass Junction`, landmark: 'Highway drop point', offsetMin: -30 },
  { id: 'metro', name: `${city} Metro Station`, landmark: 'Drop near Gate 2', offsetMin: -15 },
  { id: 'main', name: `${city} Bus Stand`, landmark: 'Main terminal', offsetMin: 0 },
];
export const getBoardingPoints = (bus: Bus) => boardingTemplate(getCity(bus.fromCode)?.name ?? bus.fromCode);
export const getDroppingPoints = (bus: Bus) => droppingTemplate(getCity(bus.toCode)?.name ?? bus.toCode);
export const DEFAULT_BOARDING = 'main';
export const DEFAULT_DROPPING = 'main';

/* ---------- coupons & policies ---------- */

export interface Coupon { code: string; label: string; min: number; compute: (amount: number) => number }
export const COUPONS: Coupon[] = [
  { code: 'LEMON10', label: '10% off up to ₹150', min: 500, compute: (a) => Math.min(150, Math.round(a * 0.1)) },
  { code: 'BUS50', label: 'Flat ₹50 off', min: 300, compute: () => 50 },
  { code: 'FIRSTBUS', label: '15% off up to ₹250', min: 800, compute: (a) => Math.min(250, Math.round(a * 0.15)) },
];
export function validateCoupon(code: string, amount: number): { ok: true; coupon: Coupon; discount: number } | { ok: false; error: string } {
  const coupon = COUPONS.find((c) => c.code === code.trim().toUpperCase());
  if (!coupon) return { ok: false, error: 'This coupon code is not valid.' };
  if (amount < coupon.min) return { ok: false, error: `Add ₹${coupon.min - Math.round(amount)} more to use ${coupon.code}.` };
  return { ok: true, coupon, discount: coupon.compute(amount) };
}

export const CANCELLATION_POLICY = [
  { window: 'More than 24 hours before departure', refund: '90% refund' },
  { window: '12 – 24 hours before departure', refund: '60% refund' },
  { window: '4 – 12 hours before departure', refund: '30% refund' },
  { window: 'Less than 4 hours before departure', refund: 'No refund' },
];

