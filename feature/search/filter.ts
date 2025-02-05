export interface FilterOption {
  name: string;
  count: number;
}

export interface FilterCategory {
  카테고리: FilterOption[];
  가격: string[];
  할인율: string[];
  배송: string[];
}

export interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  imageUrls: string[];
  mainCategory: string;
  subCategory: string;
  category: string;
  discount?: number | null;
  delivery: string[];
}
