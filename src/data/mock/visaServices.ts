import type { VisaCountry } from '@/types/content';

export const mockVisaServices: VisaCountry[] = [
  { id: 'visa-australia-visitor', name: 'Australia', visaType: 'Visitor Visa (Subclass 600)', processing: '20–35 working days', fee: 'INR 5,999', image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=900&q=85', documents: ['Passport', 'Bank statements', 'Travel itinerary', 'Accommodation details'] },
  { id: 'visa-france-schengen', name: 'France', visaType: 'Schengen Tourist Visa', processing: '15–25 working days', fee: 'INR 4,999', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=900&q=85', documents: ['Passport', 'Photograph', 'Travel itinerary', 'Travel insurance'] },
  { id: 'visa-singapore-tourist', name: 'Singapore', visaType: 'Tourist Visa', processing: '5–10 working days', fee: 'INR 2,499', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=900&q=85', documents: ['Passport', 'Photograph', 'Accommodation details', 'Return ticket'] },
  { id: 'visa-thailand-arrival', name: 'Thailand', visaType: 'Tourist Visa on Arrival', processing: '1–3 working days', fee: 'INR 1,499', image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=900&q=85', documents: ['Passport', 'Photograph', 'Return ticket', 'Proof of funds'] },
  { id: 'visa-uk-standard-visitor', name: 'United Kingdom', visaType: 'Standard Visitor Visa', processing: '15–30 working days', fee: 'INR 4,999', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=900&q=85', documents: ['Passport', 'Bank statement', 'Travel itinerary', 'Hotel booking'] },
  { id: 'visa-usa-b1-b2', name: 'United States', visaType: 'B1/B2 Tourist Visa', processing: '30–60 working days', fee: 'INR 6,999', image: 'https://images.unsplash.com/photo-1496588152823-86ff7695e68f?w=900&q=85', documents: ['Passport', 'Photograph', 'Travel itinerary', 'Proof of ties'] },
];
