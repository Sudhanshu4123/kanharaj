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
  role: 'USER' | 'ADMIN' | 'user' | 'admin';
  avatar?: string;
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

// Properties are now managed via Admin Panel and stored in the database
export const mockProperties: Property[] = []

export const mockTestimonials = [
  {
    id: '1',
    name: 'Priya Sharma',
    location: 'Gurgaon',
    rating: 5,
    text: 'Kanharaj helped us find our dream home within weeks. The team was extremely professional and understood exactly what we were looking for.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  },
  {
    id: '2',
    name: 'Rahul Verma',
    location: 'South Delhi',
    rating: 5,
    text: 'Excellent service! The property listings were accurate and the team made the entire process seamless. Highly recommended.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    id: '3',
    name: 'Anjali Patel',
    location: 'Noida',
    rating: 5,
    text: 'As a first-time buyer, I was nervous about the process. Kanharaj team guided me through every step and found me the perfect apartment.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
  },
]

export const amenitiesList = [
  'Parking', 'Garden', 'Gym', 'Pool', 'Lift', 'Security', 
  'Power Backup', 'Club House', 'Play Area', 'Tennis Court',
  'Badminton Court', 'Cricket Ground', 'Steam Room', 'Sauna'
]