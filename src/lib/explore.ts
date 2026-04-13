import { client } from '@/sanity/lib/client'

export type ExploreItem = {
  _id: string;
  title: string;
  content: string;
  image: string;
  _createdAt: string;
};

export async function getExploreItems(): Promise<ExploreItem[]> {
  const query = `*[_type == "explore"] | order(_createdAt desc) {
    _id,
    title,
    content,
    "image": image.asset->url,
    _createdAt
  }`
  return await client.fetch(query, {}, { next: { revalidate: 0 } })
}
