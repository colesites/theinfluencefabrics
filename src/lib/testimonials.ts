import { client } from '@/sanity/lib/client'

export type TestimonialRecord = {
  _id: string
  productId: string
  userId: string
  userName: string
  rating: number
  comment: string
  _createdAt: string
}

export async function getTestimonialsByProductId(productId: string): Promise<TestimonialRecord[]> {
  if (!productId) return []

  const query = `*[_type == "testimonial" && product._ref == $productId] | order(_createdAt desc) {
    _id,
    "productId": product._ref,
    userId,
    userName,
    rating,
    comment,
    _createdAt
  }`

  return client.fetch(query, { productId }, { next: { revalidate: 0 } })
}
