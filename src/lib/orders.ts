import { client } from '@/sanity/lib/client'

export type OrderItem = {
  _key: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export type OrderRecord = {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  totalPrice: number;
  status: string;
  _createdAt: string;
  items: OrderItem[];
}

export async function getOrders(): Promise<OrderRecord[]> {
  const query = `*[_type == "order"] | order(_createdAt desc) {
    _id,
    orderNumber,
    customer,
    totalPrice,
    status,
    _createdAt,
    items
  }`
  return await client.fetch(query, {}, { next: { revalidate: 0 } })
}

export async function getUserOrders(email: string): Promise<OrderRecord[]> {
  if (!email) return [];
  const query = `*[_type == "order" && customer.email == $email] | order(_createdAt desc) {
    _id,
    orderNumber,
    customer,
    totalPrice,
    status,
    _createdAt,
    items
  }`
  return await client.fetch(query, { email }, { next: { revalidate: 0 } })
}
