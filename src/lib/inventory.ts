import { writeClient } from '@/sanity/lib/client'

export interface InventoryOrderItem {
  productId: string
  quantity: number
  size?: string
  color?: string
}

interface ProductVariant {
  _key?: string
  _type?: string
  size?: string
  color?: string
  quantity?: number
  image?: unknown
}

interface ProductInventoryDoc {
  _id: string
  variants?: ProductVariant[]
}

const normalize = (value?: string) => (value || '').trim().toLowerCase()

const findVariantIndex = (variants: ProductVariant[], item: InventoryOrderItem) => {
  const size = normalize(item.size)
  const color = normalize(item.color)

  const exact = variants.findIndex(
    (variant) => normalize(variant.size) === size && normalize(variant.color) === color,
  )
  if (exact >= 0) return exact

  if (size) {
    const bySize = variants.findIndex((variant) => normalize(variant.size) === size)
    if (bySize >= 0) return bySize
  }

  if (color) {
    const byColor = variants.findIndex((variant) => normalize(variant.color) === color)
    if (byColor >= 0) return byColor
  }

  return variants.length > 0 ? 0 : -1
}

export async function decrementInventoryForOrderItems(orderItems: InventoryOrderItem[]) {
  if (orderItems.length === 0) return

  const groupedByProduct = new Map<string, InventoryOrderItem[]>()

  for (const item of orderItems) {
    const quantity = Number(item.quantity || 0)
    if (!item.productId || quantity <= 0) continue

    const productItems = groupedByProduct.get(item.productId) || []
    productItems.push({
      ...item,
      quantity,
    })
    groupedByProduct.set(item.productId, productItems)
  }

  for (const [productId, items] of groupedByProduct) {
    const product = await writeClient.fetch<ProductInventoryDoc | null>(
      `*[_type == "product" && _id == $productId][0]{ _id, variants }`,
      { productId },
    )

    if (!product?.variants || product.variants.length === 0) {
      continue
    }

    const variants = [...product.variants]
    let hasChanges = false

    for (const item of items) {
      const index = findVariantIndex(variants, item)
      if (index === -1) continue

      const currentQuantity = Number(variants[index].quantity || 0)
      const nextQuantity = Math.max(0, currentQuantity - item.quantity)

      if (nextQuantity !== currentQuantity) {
        hasChanges = true
        variants[index] = {
          ...variants[index],
          quantity: nextQuantity,
        }
      }
    }

    if (hasChanges) {
      await writeClient.patch(productId).set({ variants }).commit()
    }
  }
}
