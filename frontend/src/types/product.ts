export interface Product {
  id: string;
  name: string;
  season: string;
  mrp: number;
  price: number;
  off_percentage: number;
  sku: string;
  category_id: string;
  type: string;
  sizes: string[];
  stock: number;
  images: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface IndividualProduct {
  id: string;
  name: string;
  season: string;
  mrp: number;
  price: number;
  off_percentage: number;
  sku: string;
  category_id: string;
  type: string;
  sizes: string[];
  stock: number;
  images: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}