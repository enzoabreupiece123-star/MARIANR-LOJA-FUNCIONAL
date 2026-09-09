export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  original_price?: number | null;
  images: string[];
  description: string;
  details?: string[];
  sizes: string[];
  colors: string[];
  in_stock: boolean;
  is_new?: boolean;
  is_featured?: boolean;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface CartItem {
  id: string; // unique cart item id (e.g. productId_size_color)
  product: Product;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

export type DeliveryType = 'pickup' | 'delivery';

export interface CustomerOrderData {
  name: string;
  phone: string;
  deliveryType: DeliveryType;
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  notes?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  whatsapp: string; // digits only with country code, e.g. 5511999999999
  pixKey: string;
  pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  pixBeneficiary: string;
  pixCity: string;
  instagram: string;
  address: string;
  adminPin: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  freeShippingAbove?: number;
}
