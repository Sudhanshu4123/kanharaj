export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  propertyType: 'HOUSE' | 'APARTMENT' | 'VILLA' | 'FLAT' | 'PLOT' | 'PG' | 'HOTEL' | 'COMMERCIAL' | 'RESIDENTIAL PROJECT' | 'PLOTS/LAND';
  listingType: 'BUY' | 'RENT';
  address: string;
  city: string;
  state: string;
  pincode: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  yearBuilt: number;
  amenities: string[];
  images: string[];
  latitude: number;
  longitude: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SOLD';
  featured: boolean;
  userId: string;
  user?: User;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'USER' | 'ADMIN' | 'SELLER' | 'user' | 'admin' | 'seller';
  avatar?: string;
  profileImage?: string;
  description?: string;
  experienceYears?: string;
  subscriptionPlan?: string;
  subscriptionExpiry?: string;
}

export interface Inquiry {
  id: string;
  propertyId: string | null;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'PENDING' | 'CONTACTED' | 'RESOLVED';
  createdAt: string;
}

export const amenitiesList = [
  'Parking', 'Garden', 'Gym', 'Pool', 'Lift', 'Security', 
  'Power Backup', 'Club House', 'Play Area', 'Tennis Court',
  'Badminton Court', 'Cricket Ground', 'Steam Room', 'Sauna'
]