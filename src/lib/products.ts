import { client } from '@/sanity/lib/client'

export type ProductVariant = {
  _key?: string;
  size?: string;
  color?: string;
  colorValue?: string; // hex code
  yards?: string;
  quantity: number;
  image?: string;
};

export type ProductRecord = {
  _id: string;
  name: string;
  subtitle?: string;
  price: number;
  collection: string;
  image: string;
  gallery?: string[];
  description?: string;
  variants?: ProductVariant[];
  badge?: string; 
};

export async function getProducts(): Promise<ProductRecord[]> {
  const query = `*[_type == "product"] | order(_createdAt desc) {
    _id,
    name,
    subtitle,
    price,
    collection,
    "image": image.asset->url,
    "gallery": gallery[].asset->url,
    description,
    variants
  }`
  return await client.fetch(query, {}, { next: { revalidate: 0 } })
}

export async function getPaginatedProducts(options: { 
  category?: string; 
  color?: string; 
  query?: string;
  page?: number; 
  limit?: number;
}): Promise<ProductRecord[]> {
  const { category, color, query: searchTerm, page = 1, limit = 6 } = options;
  const start = (page - 1) * limit;
  const end = start + limit;

  let filters = `_type == "product"`;
  if (category && category !== "All Archives") filters += ` && collection == $category`;
  if (color) filters += ` && $color in variants[].colorValue`;
  if (searchTerm) filters += ` && (name match $searchTerm || collection match $searchTerm || subtitle match $searchTerm)`;

  const queryGroq = `* [${filters}] | order(_createdAt desc) [${start}...${end}] {
    _id,
    name,
    subtitle,
    price,
    collection,
    "image": image.asset->url,
    "gallery": gallery[].asset->url,
    description,
    variants
  }`

  return await client.fetch(queryGroq, { category, color, searchTerm: `*${searchTerm || ''}*` }, { next: { revalidate: 0 } })
}

export async function getTotalProductCount(category?: string, color?: string, searchTerm?: string): Promise<number> {
  let filters = `_type == "product"`;
  if (category && category !== "All Archives") filters += ` && collection == $category`;
  if (color) filters += ` && $color in variants[].colorValue`;
  if (searchTerm) filters += ` && (name match $searchTerm || collection match $searchTerm || subtitle match $searchTerm)`;

  const groq = `count(*[${filters}])`
  return await client.fetch(groq, { category, color, searchTerm: `*${searchTerm || ''}*` }, { next: { revalidate: 0 } })
}

export async function getAvailableColors(): Promise<string[]> {
  const query = `array::unique(*[_type == "product"].variants[].colorValue)`
  const colors = await client.fetch(query, {}, { next: { revalidate: 0 } })
  return (colors || []).filter((c: unknown) => typeof c === 'string' && c.startsWith('#'))
}

export async function getFeaturedProducts(): Promise<ProductRecord[]> {
  const query = `*[_type == "product"] | order(_createdAt asc)[0...3] {
    _id,
    name,
    subtitle,
    price,
    collection,
    "image": image.asset->url,
    "gallery": gallery[].asset->url,
    description,
    variants
  }`
  return await client.fetch(query, {}, { next: { revalidate: 0 } })
}

export async function getProductById(id: string): Promise<ProductRecord | null> {
  const query = `*[_type == "product" && _id == $id][0] {
    _id,
    name,
    subtitle,
    price,
    collection,
    "image": image.asset->url,
    "gallery": gallery[].asset->url,
    description,
    variants
  }`
  return await client.fetch(query, { id }, { next: { revalidate: 0 } })
}
