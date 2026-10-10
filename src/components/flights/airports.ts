export type Airport = { code: string; name: string; city: string };

export const AIRPORTS: Airport[] = [
  { code: 'DEL', name: 'Indira Gandhi International', city: 'New Delhi' },
  { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International', city: 'Mumbai' },
  { code: 'BLR', name: 'Kempegowda International', city: 'Bengaluru' },
  { code: 'MAA', name: 'Chennai International', city: 'Chennai' },
  { code: 'HYD', name: 'Rajiv Gandhi International', city: 'Hyderabad' },
  { code: 'CCU', name: 'Netaji Subhas Chandra Bose International', city: 'Kolkata' },
  { code: 'GOI', name: 'Manohar International', city: 'Goa' },
  { code: 'COK', name: 'Cochin International', city: 'Kochi' },
  { code: 'AMD', name: 'Sardar Vallabhbhai Patel International', city: 'Ahmedabad' },
  { code: 'PNQ', name: 'Pune Airport', city: 'Pune' },
  { code: 'JAI', name: 'Jaipur International', city: 'Jaipur' },
  { code: 'CMB', name: 'Bandaranaike International', city: 'Colombo' },
  { code: 'DXB', name: 'Dubai International', city: 'Dubai' },
  { code: 'SIN', name: 'Changi Airport', city: 'Singapore' },
  { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok' },
  { code: 'LHR', name: 'Heathrow Airport', city: 'London' },
];

export const POPULAR_FLIGHT_ROUTES: { from: string; to: string }[] = [
  { from: 'DEL', to: 'BOM' }, { from: 'BLR', to: 'DEL' }, { from: 'MAA', to: 'DEL' },
  { from: 'BOM', to: 'GOI' }, { from: 'DEL', to: 'DXB' }, { from: 'MAA', to: 'CMB' },
];

export const getAirport = (code?: string) => AIRPORTS.find((a) => a.code === (code ?? '').toUpperCase());

/** Resolve typed text ("delhi", "DEL", "New Delhi") to a known airport. */
export const resolveAirport = (value?: string) => {
  const q = (value ?? '').trim().toLowerCase();
  if (!q) return undefined;
  return AIRPORTS.find((a) => a.code.toLowerCase() === q || a.city.toLowerCase() === q) ?? AIRPORTS.find((a) => a.city.toLowerCase().includes(q) || q.includes(a.city.toLowerCase()));
};

export const airportLabel = (code?: string) => { const a = getAirport(code); return a ? `${a.city} (${a.code})` : code ?? ''; };
