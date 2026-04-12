export type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  alt: string;
  category: "Electronics" | "Fashion" | "Home" | "Sports";
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isNew?: boolean;
  isDeal?: boolean;
  /** Set when product comes from API (used for sorting on /shop). */
  createdAt?: string;
};

function formatPrice(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export function getFormattedPrice(p: Product) {
  if (p.originalPrice && p.originalPrice > p.price) {
    return { current: formatPrice(p.price), original: formatPrice(p.originalPrice) };
  }
  return { current: formatPrice(p.price), original: null };
}

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Wireless Over-Ear Headphones",
    price: 4999,
    originalPrice: 6999,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop",
    alt: "Wireless over-ear headphones in matte black",
    category: "Electronics",
    rating: 4.5,
    reviewCount: 128,
    inStock: true,
    isNew: true,
    isDeal: true,
  },
  {
    id: "2",
    name: "Minimalist Running Shoes",
    price: 6499,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
    alt: "White and red minimalist running shoes",
    category: "Sports",
    rating: 4.8,
    reviewCount: 256,
    inStock: true,
    isNew: true,
  },
  {
    id: "3",
    name: "Ceramic Table Lamp",
    price: 2299,
    originalPrice: 2999,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&h=600&fit=crop",
    alt: "Modern ceramic table lamp",
    category: "Home",
    rating: 4.2,
    reviewCount: 84,
    inStock: true,
    isDeal: true,
  },
  {
    id: "4",
    name: "Smart Watch Pro",
    price: 12999,
    originalPrice: 15999,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop",
    alt: "Smart watch with black strap and round face",
    category: "Electronics",
    rating: 4.6,
    reviewCount: 312,
    inStock: true,
    isDeal: true,
  },
  {
    id: "5",
    name: "Organic Cotton T-Shirt",
    price: 1299,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop",
    alt: "Plain organic cotton t-shirt in heather grey",
    category: "Fashion",
    rating: 4.4,
    reviewCount: 92,
    inStock: true,
  },
  {
    id: "6",
    name: "Wooden Desk Organiser",
    price: 1799,
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&h=600&fit=crop",
    alt: "Wooden desk organiser with compartments",
    category: "Home",
    rating: 4.0,
    reviewCount: 45,
    inStock: true,
  },
  {
    id: "7",
    name: "Portable Bluetooth Speaker",
    price: 3499,
    originalPrice: 4499,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop",
    alt: "Compact portable Bluetooth speaker",
    category: "Electronics",
    rating: 4.5,
    reviewCount: 167,
    inStock: true,
    isNew: true,
    isDeal: true,
  },
  {
    id: "8",
    name: "Lightweight Backpack",
    price: 2499,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop",
    alt: "Grey minimalist backpack",
    category: "Fashion",
    rating: 4.3,
    reviewCount: 203,
    inStock: true,
  },
  {
    id: "9",
    name: "Yoga Mat Premium",
    price: 1899,
    image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b2f?w=600&h=600&fit=crop",
    alt: "Non-slip yoga mat",
    category: "Sports",
    rating: 4.7,
    reviewCount: 89,
    inStock: true,
    isNew: true,
  },
  {
    id: "10",
    name: "Linen Curtain Set",
    price: 4299,
    originalPrice: 5499,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop",
    alt: "Natural linen curtains",
    category: "Home",
    rating: 4.1,
    reviewCount: 56,
    inStock: true,
    isDeal: true,
  },
  {
    id: "11",
    name: "Mechanical Keyboard",
    price: 7999,
    image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=600&h=600&fit=crop",
    alt: "RGB mechanical gaming keyboard",
    category: "Electronics",
    rating: 4.6,
    reviewCount: 421,
    inStock: true,
  },
  {
    id: "12",
    name: "Denim Jacket",
    price: 4599,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop",
    alt: "Classic blue denim jacket",
    category: "Fashion",
    rating: 4.2,
    reviewCount: 78,
    inStock: true,
    isNew: true,
  },
  {
    id: "13",
    name: "Resistance Bands Set",
    price: 999,
    originalPrice: 1499,
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=600&fit=crop",
    alt: "Set of 5 resistance bands",
    category: "Sports",
    rating: 4.4,
    reviewCount: 234,
    inStock: true,
    isDeal: true,
  },
  {
    id: "14",
    name: "Scented Candle Trio",
    price: 1499,
    image: "https://images.unsplash.com/photo-1602874801006-4e411eaa710d?w=600&h=600&fit=crop",
    alt: "Three luxury scented candles",
    category: "Home",
    rating: 4.5,
    reviewCount: 112,
    inStock: true,
  },
  {
    id: "15",
    name: "Wireless Earbuds",
    price: 2999,
    image: "https://images.unsplash.com/photo-1598331668826-20cecc596b86?w=600&h=600&fit=crop",
    alt: "True wireless earbuds in case",
    category: "Electronics",
    rating: 4.3,
    reviewCount: 289,
    inStock: false,
  },
  {
    id: "16",
    name: "Cotton Socks Pack",
    price: 699,
    image: "https://images.unsplash.com/photo-1586352860917-c8928e0b2c7c?w=600&h=600&fit=crop",
    alt: "Pack of 5 cotton socks",
    category: "Fashion",
    rating: 4.0,
    reviewCount: 345,
    inStock: true,
  },
  {
    id: "17",
    name: "Running Arm Band",
    price: 499,
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=600&fit=crop",
    alt: "Phone arm band for running",
    category: "Sports",
    rating: 3.8,
    reviewCount: 67,
    inStock: true,
  },
  {
    id: "18",
    name: "Throw Pillow Cover Set",
    price: 1199,
    image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&h=600&fit=crop",
    alt: "Set of 4 decorative throw pillow covers",
    category: "Home",
    rating: 4.6,
    reviewCount: 98,
    inStock: true,
  },
];

export const CATEGORIES = [
  { slug: "electronics", name: "Electronics" },
  { slug: "fashion", name: "Fashion" },
  { slug: "home", name: "Home" },
  { slug: "sports", name: "Sports" },
] as const;

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getNewArrivals(limit = 8) {
  return [...PRODUCTS].filter((p) => p.isNew).slice(0, limit);
}

export function getDeals(limit = 6) {
  return [...PRODUCTS].filter((p) => p.isDeal).slice(0, limit);
}

export function getTrending(limit = 8) {
  return [...PRODUCTS]
    .sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount)
    .slice(0, limit);
}
