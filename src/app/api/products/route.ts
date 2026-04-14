import { NextResponse } from 'next/server'
import { writeClient } from '@/sanity/lib/client'
import { getOwnerSession } from '@/lib/session'

export async function POST(request: Request) {
  try {
    const session = await getOwnerSession()
    
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const name = formData.get('name') as string
    const price = formData.get('price') as string
    const quantity = formData.get('quantity') as string
    const collection = formData.get('collection') as string
    const description = formData.get('description') as string
    const originalPrice = formData.get('originalPrice') as string

    if (!name || !originalPrice || !quantity) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    interface SanityImageReference {
      _type: string;
      asset: {
        _type: string;
        _ref: string;
      };
    }

    interface SanityVariantInput {
      _type: string;
      size?: string;
      color?: string;
      colorValue?: string;
      yards?: string;
      quantity: number;
      image?: SanityImageReference;
    }

    interface SanityProductInput {
      _type: string;
      name: string;
      price: number | undefined;
      originalPrice: number;
      collection: string;
      description?: string;
      variants: SanityVariantInput[];
      image?: SanityImageReference;
      gallery?: SanityImageReference[];
    }

    // Parse variants if provided as JSON, else use fallback
    let variants: SanityVariantInput[] = []
    const variantsData = formData.get('variants')
    if (variantsData) {
      try {
        variants = JSON.parse(variantsData as string)
      } catch (e) {
        console.error('Failed to parse variants JSON', e)
      }
    }

    const newProduct: SanityProductInput = {
      _type: 'product',
      name,
      price: price ? Number(price) : undefined,
      originalPrice: Number(originalPrice),
      collection: collection || 'General',
      description,
      variants: variants.length > 0 ? variants.map(v => ({
        _type: 'object',
        size: v.size,
        color: v.color,
        colorValue: v.colorValue,
        yards: v.yards,
        quantity: Number(v.quantity || 0)
      })) : [
        {
          _type: 'object',
          size: 'Standard',
          quantity: Number(quantity)
        }
      ]
    }

    // Process main image
    const imageFile = formData.get('image') as File | null
    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer())
      const asset = await writeClient.assets.upload('image', buffer, {
        filename: imageFile.name,
      })
      newProduct.image = {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: asset._id
        }
      }
    }

    // Process variant images
    for (let i = 0; i < newProduct.variants.length; i++) {
      const variantImageFile = formData.get(`variant_${i}_image`) as File | null
      if (variantImageFile && variantImageFile.size > 0) {
        const buffer = Buffer.from(await variantImageFile.arrayBuffer())
        const asset = await writeClient.assets.upload('image', buffer, {
          filename: variantImageFile.name,
        })
        newProduct.variants[i].image = {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: asset._id
          }
        }
      }
    }

    // Process gallery images
    const galleryFiles = formData.getAll('gallery') as File[]
    const validGalleryFiles = galleryFiles.filter(f => f.size > 0)
    if (validGalleryFiles.length > 0) {
      newProduct.gallery = []
      for (const file of validGalleryFiles) {
        const buffer = Buffer.from(await file.arrayBuffer())
        const asset = await writeClient.assets.upload('image', buffer, {
          filename: file.name,
        })
        newProduct.gallery.push({
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: asset._id
          }
        })
      }
    }

    const result = await writeClient.create(newProduct)

    return NextResponse.json({ success: true, product: result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
