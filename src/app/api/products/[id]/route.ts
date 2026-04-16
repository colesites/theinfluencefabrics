import { NextResponse } from 'next/server'
import { writeClient } from '@/sanity/lib/client'
import { getOwnerSession } from '@/lib/session'

interface Params {
  params: Promise<{ id: string }>
}

interface SanityImageReference {
  _type: string
  asset: {
    _type: string
    _ref: string
  }
}

interface SanityVariantInput {
  _type: string
  size?: string
  color?: string
  colorValue?: string
  yards?: string
  quantity: number
  image?: SanityImageReference
}

interface ExistingVariantDocument {
  image?: {
    asset?: {
      _id?: string
    }
  }
}

interface ExistingProductDocument {
  image?: {
    asset?: {
      _id?: string
    }
  }
  gallery?: Array<{
    asset?: {
      _id?: string
    }
  }>
  variants?: ExistingVariantDocument[]
}

export async function PUT(request: Request, context: Params) {
  try {
    const session = await getOwnerSession()

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing product ID' }, { status: 400 })
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

    const existingProduct = await writeClient.fetch<ExistingProductDocument>(
      `*[_type == "product" && _id == $id][0]{
        image{asset->{_id}},
        gallery[]{asset->{_id}},
        variants[]{image{asset->{_id}}}
      }`,
      { id },
    )

    if (!existingProduct) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }

    let variants: SanityVariantInput[] = []
    const variantsData = formData.get('variants')
    if (variantsData) {
      try {
        variants = JSON.parse(variantsData as string)
      } catch (e) {
        console.error('Failed to parse variants JSON', e)
      }
    }

    const normalizedVariants: SanityVariantInput[] =
      variants.length > 0
        ? variants.map((v, index) => {
            const existingRef = existingProduct.variants?.[index]?.image?.asset?._id
            const withImage: SanityVariantInput = {
              _type: 'object',
              size: v.size,
              color: v.color,
              colorValue: v.colorValue,
              yards: v.yards,
              quantity: Number(v.quantity || 0),
            }

            if (existingRef) {
              withImage.image = {
                _type: 'image',
                asset: {
                  _type: 'reference',
                  _ref: existingRef,
                },
              }
            }
            return withImage
          })
        : [
            {
              _type: 'object',
              size: 'Standard',
              quantity: Number(quantity),
            },
          ]

    for (let i = 0; i < normalizedVariants.length; i++) {
      const variantImageFile = formData.get(`variant_${i}_image`) as File | null
      if (variantImageFile && variantImageFile.size > 0) {
        const buffer = Buffer.from(await variantImageFile.arrayBuffer())
        const asset = await writeClient.assets.upload('image', buffer, {
          filename: variantImageFile.name,
        })
        normalizedVariants[i].image = {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: asset._id,
          },
        }
      }
    }

    let imageRef: SanityImageReference | undefined
    const imageFile = formData.get('image') as File | null
    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer())
      const asset = await writeClient.assets.upload('image', buffer, {
        filename: imageFile.name,
      })
      imageRef = {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: asset._id,
        },
      }
    } else if (existingProduct.image?.asset?._id) {
      imageRef = {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: existingProduct.image.asset._id,
        },
      }
    }

    const galleryFiles = formData.getAll('gallery') as File[]
    const validGalleryFiles = galleryFiles.filter((file) => file.size > 0)
    let galleryRef: SanityImageReference[] | undefined
    if (validGalleryFiles.length > 0) {
      galleryRef = []
      for (const file of validGalleryFiles) {
        const buffer = Buffer.from(await file.arrayBuffer())
        const asset = await writeClient.assets.upload('image', buffer, {
          filename: file.name,
        })
        galleryRef.push({
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: asset._id,
          },
        })
      }
    } else {
      galleryRef = (existingProduct.gallery || [])
        .map((item) => item.asset?._id)
        .filter((ref): ref is string => Boolean(ref))
        .map((ref) => ({
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: ref,
          },
        }))
    }

    const patchPayload = {
      name,
      price: price ? Number(price) : undefined,
      originalPrice: Number(originalPrice),
      collection: collection || 'General',
      description,
      variants: normalizedVariants,
      image: imageRef,
      gallery: galleryRef,
    }

    const result = await writeClient.patch(id).set(patchPayload).commit()

    return NextResponse.json({ success: true, product: result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: Params) {
  try {
    const session = await getOwnerSession()
    
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing product ID' }, { status: 400 })
    }

    await writeClient.delete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
