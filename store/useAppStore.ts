import { create } from "zustand";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  _id: string;
}

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

export interface Order {
  _id: string;
  storeId: string;
  customer: CustomerDetails;
  items: OrderItem[];
  totalAmount: number;
  paymentReference: string;
  status: 'pending' | 'cancelled' | 'failed' | 'paid' | 'completed';
  createdAt: string; // ISO Date string
  updatedAt: string;
}


// Analytics to track, with views in a stack
export interface Analytics {
  totalViews: number;
  viewsToday: number;
  viewsThisWeek: number;
  productViews: Record<string, number>;
  lastReset: Date | string;
}

export interface CreateStoreBody {
  name: string;
  slug: string;
  description?: string;
  primaryColor?: string;
  secondaryColor?: string;
  font?: string;
  template?: string;
  currency?: string;
  domain?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  shipping: {
    enabled: boolean;
    locations: {
      area: string;
      fee: number;
      note?: string;
    }[];
  };
  pickup?: {
    enabled: boolean;
    note?: string;
  };
  policies?: {
    returns?: string;
    terms?: string;
  };
}





// Store holds the name, with details to claim
export interface Store {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  currency: string;
  domain?: string;
  orders?: Order[]
  socialLinks?: { instagram?: string; facebook?: string; twitter?: string; tiktok?: string };
  contact?: { email?: string; phone?: string; address?: string };
  shipping?: {
    enabled: boolean;
    locations: { area: string; fee: number; note?: string }[];
  };
  pickup?: {
    enabled: boolean;
    note?: string;
  };
  policies?: {
    returns?: string;
    terms?: string;
  };
  createdAt?: Date;
  isPublished: boolean;
  products?: Product[];
  template?: string;
  font?: string;
  analytics?: any
}
// Product's the key, for sales to fly free
export interface Product {
  _id: string;
  name: string;
  price: number;
  description?: string;
  images?: string[];
  isAvailable: boolean;
  createdAt: string;
  discountPrice?: number;
  stockCount?: number;
  tags?: string[];
  template?: string
}

interface PayoutAccount {
  _id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
  status: 'pending' | 'active' | 'suspended';
  createdAt: string;
  isDefault: boolean;
  updatedAt: string;
  userId: string;
}

// Profile for user, with stores to peruse
export interface UserProfile {
  _id: string;
  email: string;
  name: string;
  avatar: string;
  role: string;
  stores: Store[];
  lastLogin: string;
  isVerified: boolean;
  subscription: { plan: string; status: string }
  wallet: {
    payoutAccounts: PayoutAccount[]
  }
}

// Nav items align, with icons that shine
export interface NavItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Action cards guide, with tasks to abide
export interface ActionCard {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'available' | 'disabled' | 'coming-soon';
  primary?: boolean;
}

// Quick stats to show, for insights to grow
export interface QuickStat {
  label: string;
  value: any;
  change?: string | null;
}

// Form data to store, for shops to explore
export interface FormData {
  name: string;
  slug: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  currency: string;
  domain: string;
  socialLinks: { instagram: string; facebook: string; twitter: string; tiktok: string };
  contact: { email: string; phone: string; address: string };
  shipping: { methods: string; cost: string };
  pickup: { location: string };
  policies: { returnPolicy: string; privacyPolicy: string; termsOfService: string };
}

export interface ProductFormData {
  name: string;
  price: number;
  description: string;
  images: File[];
  existingImages?: string[];
  isAvailable: boolean;
  discountPrice?: number;
  stockCount?: number;
  tags?: string[];
}

// Notification to send, with messages to mend
export interface NotificationData {
  id: string;
  message: string;
  type: 'success' | 'error';
  isOpen: boolean;
  duration?: number;
}

type AppState = {
  userProfile: UserProfile | null
  setUserProfile: (profile: UserProfile | null) => void;

}


export const useAppStore = create<AppState>((set)=>({
 userProfile: null,
 setUserProfile: (profile) => set({ userProfile: profile }),
}))
