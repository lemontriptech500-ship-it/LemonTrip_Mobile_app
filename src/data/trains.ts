/**
 * Dummy rail catalogue for the LemonTrip mobile app.
 * Everything here is local sample data: no network, no real inventory.
 * Swap `searchTrains` / `getClassOptions` for API calls when a rail provider is connected.
 */

export type ClassCode = '1A' | '2A' | '3A' | 'SL' | 'CC' | 'EC' | '2S';
export type Quota = 'GN' | 'TQ';

export interface Station { code: string; name: string; city: string; lat: number; lng: number }
export interface Stop { code: string; arr: string | null; dep: string | null; day: number; km: number }
export interface Train {
  id: string;
  number: string;
  name: string;
  type: 'Rajdhani' | 'Shatabdi' | 'Superfast' | 'Express';
  classes: ClassCode[];
  /** 0 = Sunday … 6 = Saturday */
  runsOn: number[];
  pantry: boolean;
  route: Stop[];
}

export const CLASS_INFO: Record<ClassCode, { name: string; short: string; ac: boolean; rate: number; reservation: number }> = {
  '1A': { name: 'First AC', short: 'AC First Class', ac: true, rate: 4.0, reservation: 60 },
  '2A': { name: 'AC 2 Tier', short: 'AC 2-Tier', ac: true, rate: 2.35, reservation: 50 },
  '3A': { name: 'AC 3 Tier', short: 'AC 3-Tier', ac: true, rate: 1.6, reservation: 40 },
  SL: { name: 'Sleeper', short: 'Sleeper Class', ac: false, rate: 0.6, reservation: 20 },
  CC: { name: 'AC Chair Car', short: 'AC Chair Car', ac: true, rate: 1.8, reservation: 40 },
  EC: { name: 'Exec. Chair Car', short: 'Executive Chair Car', ac: true, rate: 3.6, reservation: 60 },
  '2S': { name: 'Second Sitting', short: 'Second Sitting', ac: false, rate: 0.45, reservation: 15 },
};

export const STATIONS: Station[] = [
  { code: 'NDLS', name: 'New Delhi', city: 'Delhi', lat: 28.64, lng: 77.22 },
  { code: 'BCT', name: 'Mumbai Central', city: 'Mumbai', lat: 18.97, lng: 72.82 },
  { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata', lat: 22.58, lng: 88.34 },
  { code: 'MAS', name: 'Chennai Central', city: 'Chennai', lat: 13.08, lng: 80.27 },
  { code: 'SBC', name: 'KSR Bengaluru City', city: 'Bengaluru', lat: 12.98, lng: 77.57 },
  { code: 'JP', name: 'Jaipur Junction', city: 'Jaipur', lat: 26.92, lng: 75.79 },
  { code: 'ADI', name: 'Ahmedabad Junction', city: 'Ahmedabad', lat: 23.03, lng: 72.6 },
  { code: 'PUNE', name: 'Pune Junction', city: 'Pune', lat: 18.53, lng: 73.87 },
  { code: 'LKO', name: 'Lucknow Charbagh', city: 'Lucknow', lat: 26.83, lng: 80.92 },
  { code: 'BPL', name: 'Bhopal Junction', city: 'Bhopal', lat: 23.27, lng: 77.41 },
  { code: 'NGP', name: 'Nagpur Junction', city: 'Nagpur', lat: 21.15, lng: 79.09 },
  { code: 'CNB', name: 'Kanpur Central', city: 'Kanpur', lat: 26.45, lng: 80.35 },
  { code: 'AGC', name: 'Agra Cantt', city: 'Agra', lat: 27.16, lng: 78.01 },
  { code: 'KOTA', name: 'Kota Junction', city: 'Kota', lat: 25.18, lng: 75.84 },
  { code: 'BRC', name: 'Vadodara Junction', city: 'Vadodara', lat: 22.31, lng: 73.18 },
  { code: 'ST', name: 'Surat', city: 'Surat', lat: 21.2, lng: 72.84 },
  { code: 'PNBE', name: 'Patna Junction', city: 'Patna', lat: 25.6, lng: 85.14 },
  { code: 'MGS', name: 'Pt DD Upadhyaya Jn', city: 'Mughal Sarai', lat: 25.28, lng: 83.12 },
  { code: 'BSB', name: 'Varanasi Junction', city: 'Varanasi', lat: 25.32, lng: 83.01 },
];

export const POPULAR_ROUTES: { from: string; to: string }[] = [
  { from: 'NDLS', to: 'BCT' },
  { from: 'NDLS', to: 'JP' },
  { from: 'MAS', to: 'SBC' },
  { from: 'BCT', to: 'PUNE' },
  { from: 'HWH', to: 'NDLS' },
];

const s = (code: string, arr: string | null, dep: string | null, day: number, km: number): Stop => ({ code, arr, dep, day, km });
const DAILY = [0, 1, 2, 3, 4, 5, 6];

export const TRAINS: Train[] = [
  {
    id: 't12951', number: '12951', name: 'Mumbai Rajdhani Express', type: 'Rajdhani', classes: ['1A', '2A', '3A'], runsOn: DAILY, pantry: true,
    route: [s('BCT', null, '17:00', 0, 0), s('ST', '19:15', '19:20', 0, 263), s('BRC', '20:50', '20:55', 0, 392), s('KOTA', '02:55', '03:00', 1, 920), s('NDLS', '08:35', null, 1, 1384)],
  },
  {
    id: 't12952', number: '12952', name: 'New Delhi Rajdhani Express', type: 'Rajdhani', classes: ['1A', '2A', '3A'], runsOn: DAILY, pantry: true,
    route: [s('NDLS', null, '16:55', 0, 0), s('KOTA', '22:10', '22:15', 0, 465), s('BRC', '05:05', '05:10', 1, 993), s('ST', '06:45', '06:50', 1, 1121), s('BCT', '08:35', null, 1, 1384)],
  },
  {
    id: 't12301', number: '12301', name: 'Howrah Rajdhani Express', type: 'Rajdhani', classes: ['1A', '2A', '3A'], runsOn: [0, 1, 3, 4, 5, 6], pantry: true,
    route: [s('HWH', null, '16:50', 0, 0), s('PNBE', '23:00', '23:05', 0, 530), s('MGS', '02:20', '02:25', 1, 680), s('CNB', '06:30', '06:35', 1, 1010), s('NDLS', '10:05', null, 1, 1450)],
  },
  {
    id: 't12621', number: '12621', name: 'Tamil Nadu Express', type: 'Superfast', classes: ['2A', '3A', 'SL'], runsOn: DAILY, pantry: true,
    route: [s('NDLS', null, '22:30', 0, 0), s('AGC', '01:45', '01:50', 1, 195), s('BPL', '07:30', '07:40', 1, 701), s('NGP', '13:20', '13:30', 1, 1091), s('MAS', '07:10', null, 2, 2182)],
  },
  {
    id: 't12007', number: '12007', name: 'Chennai–Bengaluru Shatabdi', type: 'Shatabdi', classes: ['CC', 'EC'], runsOn: [0, 1, 2, 3, 5, 6], pantry: true,
    route: [s('MAS', null, '06:00', 0, 0), s('SBC', '10:50', null, 0, 362)],
  },
  {
    id: 't12608', number: '12608', name: 'Lalbagh Express', type: 'Superfast', classes: ['CC', '2S'], runsOn: DAILY, pantry: false,
    route: [s('SBC', null, '06:30', 0, 0), s('MAS', '11:35', null, 0, 362)],
  },
  {
    id: 't12607', number: '12607', name: 'Lalbagh Express (Return)', type: 'Superfast', classes: ['CC', '2S'], runsOn: DAILY, pantry: false,
    route: [s('MAS', null, '15:30', 0, 0), s('SBC', '21:00', null, 0, 362)],
  },
  {
    id: 't12009', number: '12009', name: 'Mumbai–Ahmedabad Shatabdi', type: 'Shatabdi', classes: ['CC', 'EC'], runsOn: [1, 2, 3, 4, 5, 6], pantry: true,
    route: [s('BCT', null, '06:20', 0, 0), s('ST', '08:50', '08:55', 0, 263), s('BRC', '10:05', '10:08', 0, 392), s('ADI', '12:30', null, 0, 491)],
  },
  {
    id: 't12957', number: '12957', name: 'Swarna Jayanti Rajdhani', type: 'Rajdhani', classes: ['1A', '2A', '3A'], runsOn: [0, 2, 4, 6], pantry: true,
    route: [s('ADI', null, '19:00', 0, 0), s('JP', '02:25', '02:30', 1, 625), s('NDLS', '07:50', null, 1, 934)],
  },
  {
    id: 't12015', number: '12015', name: 'Ajmer Shatabdi', type: 'Shatabdi', classes: ['CC', 'EC'], runsOn: [0, 1, 2, 3, 4, 6], pantry: true,
    route: [s('NDLS', null, '06:05', 0, 0), s('JP', '10:40', '10:45', 0, 308)],
  },
  {
    id: 't12123', number: '12123', name: 'Deccan Queen', type: 'Superfast', classes: ['CC', '2S'], runsOn: DAILY, pantry: true,
    route: [s('BCT', null, '17:10', 0, 0), s('PUNE', '20:25', null, 0, 192)],
  },
  {
    id: 't12124', number: '12124', name: 'Deccan Queen (Return)', type: 'Superfast', classes: ['CC', '2S'], runsOn: DAILY, pantry: true,
    route: [s('PUNE', null, '07:15', 0, 0), s('BCT', '10:25', null, 0, 192)],
  },
  {
    id: 't12559', number: '12559', name: 'Shiv Ganga Express', type: 'Superfast', classes: ['2A', '3A', 'SL'], runsOn: DAILY, pantry: false,
    route: [s('NDLS', null, '18:45', 0, 0), s('CNB', '00:15', '00:20', 1, 440), s('MGS', '04:50', '04:55', 1, 760), s('BSB', '07:00', null, 1, 764)],
  },
  {
    id: 't12003', number: '12003', name: 'Lucknow Shatabdi', type: 'Shatabdi', classes: ['CC', 'EC'], runsOn: [0, 1, 2, 3, 4, 5], pantry: true,
    route: [s('NDLS', null, '06:10', 0, 0), s('CNB', '11:00', '11:05', 0, 440), s('LKO', '12:40', null, 0, 512)],
  },
];

/* ---------- helpers ---------- */

const stationMap = new Map(STATIONS.map((st) => [st.code, st]));
export const getStation = (code: string) => stationMap.get(code);
export const stationLabel = (code: string) => { const st = getStation(code); return st ? `${st.name} (${st.code})` : code; };
export const getTrain = (id?: string): Train | undefined => {
  if (!id) return undefined;
  if (id.startsWith('gen-')) { const [, from, to, slot] = id.split('-'); return generateTrains(from, to)[Number(slot)]; }
  return TRAINS.find((t) => t.id === id);
};

/* Sample trains generated for any station pair that has no hand-written train, so every search returns results. */
function roadKm(a: Station, b: Station) {
  const R = 6371; const r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r; const dLng = (b.lng - a.lng) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return Math.max(40, Math.round(2 * R * Math.asin(Math.sqrt(h)) * 1.28));
}
export function generateTrains(fromCode: string, toCode: string): Train[] {
  const a = getStation(fromCode); const b = getStation(toCode);
  if (!a || !b || fromCode === toCode) return [];
  const km = roadKm(a, b);
  const seed = hash(`${fromCode}${toCode}`);
  const defs: { name: string; type: Train['type']; classes: ClassCode[]; speed: number; hours: number[] }[] = [
    km > 600
      ? { name: `${a.city}–${b.city} Rajdhani`, type: 'Rajdhani', classes: ['1A', '2A', '3A'], speed: 68, hours: [16, 17, 19, 20] }
      : { name: `${a.city}–${b.city} Shatabdi`, type: 'Shatabdi', classes: ['CC', 'EC'], speed: 62, hours: [6, 7, 14, 15] },
    { name: `${a.city}–${b.city} Superfast`, type: 'Superfast', classes: km < 450 ? ['2A', '3A', 'SL', '2S'] : ['1A', '2A', '3A', 'SL'], speed: 55, hours: [5, 9, 13, 22] },
    { name: `${b.city} Mail`, type: 'Express', classes: km < 450 ? ['3A', 'SL', '2S', 'CC'] : ['2A', '3A', 'SL'], speed: 46, hours: [8, 11, 18, 23] },
  ];
  return defs.map((d, slot) => {
    const dh = d.hours[(seed >> (slot * 2)) % d.hours.length]; const dm = ((seed >> (slot + 3)) % 12) * 5;
    const depMin = dh * 60 + dm;
    const dur = Math.max(45, Math.round((km / d.speed) * 60 / 5) * 5);
    const arrAbs = depMin + dur; const day = Math.floor(arrAbs / 1440); const am = arrAbs % 1440;
    const hh = (n: number) => `${pad(Math.floor(n / 60))}:${pad(n % 60)}`;
    return {
      id: `gen-${fromCode}-${toCode}-${slot}`, number: String(10000 + ((seed + slot * 37) % 8000) + 1000), name: d.name, type: d.type, classes: d.classes,
      runsOn: slot === 2 ? DAILY : DAILY.filter((x) => (x + slot) % 7 !== 3), pantry: d.type !== 'Express',
      route: [s(fromCode, null, hh(depMin), 0, 0), s(toCode, hh(am), null, day, km)],
    };
  });
}

export const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

const pad = (n: number) => String(n).padStart(2, '0');
export const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromISO = (iso: string) => new Date(`${iso}T00:00:00`);
export const addDaysISO = (iso: string, days: number) => { const d = fromISO(iso); d.setDate(d.getDate() + days); return toISO(d); };
export const upcomingDates = (count = 14) => { const out: string[] = []; const base = new Date(); base.setHours(0, 0, 0, 0); for (let i = 0; i < count; i += 1) { const d = new Date(base); d.setDate(base.getDate() + i); out.push(toISO(d)); } return out; };
export const defaultTravelDate = () => upcomingDates(2)[1];
export const formatLongDate = (iso: string) => fromISO(iso).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
export const formatShortDate = (iso: string) => fromISO(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
export const isRealDate = (iso: string) => /^\d{4}-\d{2}-\d{2}$/.test(iso) && !Number.isNaN(fromISO(iso).getTime());

const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
export const formatDuration = (mins: number) => `${Math.floor(mins / 60)}h ${pad(mins % 60)}m`;
export const timeOfDay = (t: string): 'morning' | 'afternoon' | 'evening' | 'night' => { const h = Number(t.slice(0, 2)); return h >= 5 && h < 12 ? 'morning' : h >= 12 && h < 17 ? 'afternoon' : h >= 17 && h < 21 ? 'evening' : 'night'; };

export interface TrainResult {
  train: Train;
  from: Stop;
  to: Stop;
  departure: string;
  arrival: string;
  arrivalDayOffset: number;
  durationMin: number;
  distanceKm: number;
}

function segment(train: Train, fromCode?: string, toCode?: string): TrainResult | null {
  const route = train.route;
  const fi = fromCode ? route.findIndex((x) => x.code === fromCode) : 0;
  const ti = toCode ? route.findIndex((x) => x.code === toCode) : route.length - 1;
  if (fi < 0 || ti < 0 || fi >= ti) return null;
  const a = route[fi]; const b = route[ti];
  const dep = a.dep ?? '00:00'; const arr = b.arr ?? '00:00';
  const durationMin = (b.day * 1440 + toMin(arr)) - (a.day * 1440 + toMin(dep));
  return { train, from: a, to: b, departure: dep, arrival: arr, arrivalDayOffset: b.day - a.day, durationMin, distanceKm: b.km - a.km };
}

export function searchTrains(params: { from?: string; to?: string; date?: string }): TrainResult[] {
  if (params.from && params.to && !TRAINS.some((t) => segment(t, params.from, params.to))) {
    const gdow = params.date && isRealDate(params.date) ? fromISO(params.date).getDay() : null;
    return generateTrains(params.from, params.to).filter((t) => gdow === null || t.runsOn.includes(gdow)).map((t) => segment(t, params.from, params.to)).filter((r): r is TrainResult => r !== null);
  }
  const dow = params.date && isRealDate(params.date) ? fromISO(params.date).getDay() : null;
  return TRAINS
    .filter((t) => dow === null || (!params.from && !params.to) || t.runsOn.includes(dow))
    .map((t) => segment(t, params.from || undefined, params.to || undefined))
    .filter((r): r is TrainResult => r !== null);
}

export const resolveStation = (text: string) => {
  const q = text.trim().toLowerCase();
  if (!q) return undefined;
  return STATIONS.find((st) => st.code.toLowerCase() === q || st.name.toLowerCase() === q || st.city.toLowerCase() === q)
    ?? STATIONS.find((st) => `${st.name} ${st.city} ${st.code}`.toLowerCase().includes(q));
};

/* ---------- availability & fare ---------- */

function hash(text: string) { let h = 2166136261; for (let i = 0; i < text.length; i += 1) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); } return Math.abs(h); }

export interface Availability { status: 'AVL' | 'RAC' | 'WL'; count: number; label: string; tone: 'good' | 'warn' | 'bad' }

export function getAvailability(trainId: string, cls: ClassCode, date: string, quota: Quota = 'GN'): Availability {
  const seed = hash(`${trainId}|${cls}|${date}|${quota}`);
  const bucket = seed % 100;
  if (bucket < 14) { const n = (seed >> 3) % 38 + 1; return { status: 'WL', count: n, label: `WL ${n}`, tone: 'bad' }; }
  if (bucket < 26) { const n = (seed >> 3) % 18 + 1; return { status: 'RAC', count: n, label: `RAC ${n}`, tone: 'warn' }; }
  const n = ((seed >> 3) % 110) + (quota === 'TQ' ? 2 : 6);
  return { status: 'AVL', count: n, label: `AVL ${String(n).padStart(3, '0')}`, tone: 'good' };
}

export interface FareBreakdown { base: number; reservation: number; tatkal: number; gst: number; convenience: number; perPassenger: number; passengers: number; subtotal: number; discount: number; total: number }

export function computeFare(train: Train, cls: ClassCode, km: number, quota: Quota, passengers: number, discount = 0): FareBreakdown {
  const info = CLASS_INFO[cls];
  const premium = train.type === 'Rajdhani' ? 1.25 : train.type === 'Shatabdi' ? 1.2 : 1;
  const superfast = train.type === 'Express' ? 0 : 45;
  const base = Math.round(km * info.rate * premium);
  const reservation = info.reservation + superfast;
  const tatkal = quota === 'TQ' ? Math.round(base * (info.ac ? 0.3 : 0.2)) : 0;
  const gst = info.ac ? Math.round((base + reservation + tatkal) * 0.05) : 0;
  const perPassenger = base + reservation + tatkal + gst;
  const convenience = 24;
  const subtotal = perPassenger * passengers + convenience;
  return { base: base * passengers, reservation: reservation * passengers, tatkal: tatkal * passengers, gst: gst * passengers, convenience, perPassenger, passengers, subtotal, discount, total: Math.max(0, subtotal - discount) };
}

export interface ClassOption { code: ClassCode; info: (typeof CLASS_INFO)[ClassCode]; fare: number; availability: Availability }
export function getClassOptions(result: TrainResult, date: string, quota: Quota = 'GN'): ClassOption[] {
  return result.train.classes.map((code) => ({ code, info: CLASS_INFO[code], fare: computeFare(result.train, code, result.distanceKm, quota, 1).perPassenger, availability: getAvailability(result.train.id, code, date, quota) }));
}
export const lowestFare = (options: ClassOption[]) => Math.min(...options.map((o) => o.fare));

/* ---------- passengers / berths ---------- */

export const berthOptions = (cls: ClassCode): string[] => {
  if (cls === 'SL' || cls === '3A') return ['No preference', 'Lower', 'Middle', 'Upper', 'Side Lower', 'Side Upper'];
  if (cls === '2A') return ['No preference', 'Lower', 'Upper', 'Side Lower', 'Side Upper'];
  if (cls === '1A') return ['No preference', 'Lower', 'Upper'];
  return ['No preference', 'Window', 'Aisle', 'Middle'];
};

export const COACH_PREFIX: Record<ClassCode, string> = { '1A': 'H', '2A': 'A', '3A': 'B', SL: 'S', CC: 'C', EC: 'E', '2S': 'D' };

/* ---------- coupons & payment ---------- */

export interface Coupon { code: string; label: string; min: number; compute: (amount: number) => number }
export const COUPONS: Coupon[] = [
  { code: 'LEMON10', label: '10% off up to ₹150', min: 500, compute: (a) => Math.min(150, Math.round(a * 0.1)) },
  { code: 'RAIL50', label: 'Flat ₹50 off', min: 300, compute: () => 50 },
  { code: 'FIRSTRAIL', label: '15% off up to ₹250', min: 800, compute: (a) => Math.min(250, Math.round(a * 0.15)) },
];
export function validateCoupon(code: string, amount: number): { ok: true; coupon: Coupon; discount: number } | { ok: false; error: string } {
  const coupon = COUPONS.find((c) => c.code === code.trim().toUpperCase());
  if (!coupon) return { ok: false, error: 'This coupon code is not valid.' };
  if (amount < coupon.min) return { ok: false, error: `Add ₹${coupon.min - Math.round(amount)} more to use ${coupon.code}.` };
  return { ok: true, coupon, discount: coupon.compute(amount) };
}

export const BANKS = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank', 'Punjab National Bank', 'Bank of Baroda', 'Other bank'];
export const WALLET_BALANCE = 5000;
