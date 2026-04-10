'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ProductRecord } from '@/lib/products'
import { Trash2, Image as ImageIcon, Plus, X } from 'lucide-react'
import Image from 'next/image'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface VariantForm {
  size: string;
  color: string;
  colorValue: string;
  yards: string;
  quantity: string;
  image: File | null;
  preview: string | null;
}

export default function DashboardClient({ initialProducts }: { initialProducts: ProductRecord[] }) {
  const [products, setProducts] = useState(initialProducts)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    collection: '',
    description: '',
  })
  const [mainImage, setMainImage] = useState<File | null>(null)
  const [galleryImages, setGalleryImages] = useState<FileList | null>(null)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null)
  const [variants, setVariants] = useState<VariantForm[]>([])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const confirmDelete = (id: string) => {
    setDeleteId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const id = deleteId
    setIsDeleteDialogOpen(false)
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setProducts(prev => prev.filter(p => p._id !== id))
    } catch {
      alert('Error deleting product')
    } finally {
      setIsDeleting(null)
      setDeleteId(null)
    }
  }

  const addVariant = () => {
    setVariants([...variants, { size: '', color: '', colorValue: '#000000', yards: '', quantity: '', image: null, preview: null }])
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const updateVariant = (index: number, field: keyof VariantForm, value: string | File | null) => {
    const newVariants = [...variants]
    if (field === 'image') {
      const file = value as File | null
      newVariants[index].image = file
      newVariants[index].preview = file ? URL.createObjectURL(file) : null
    } else {
      (newVariants[index] as any)[field] = value
    }
    setVariants(newVariants)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus('')

    try {
      const data = new FormData()
      data.append('name', formData.name)
      data.append('price', formData.price)
      data.append('quantity', formData.quantity)
      data.append('collection', formData.collection)
      data.append('description', formData.description)
      
      if (mainImage) {
        data.append('image', mainImage)
      }
      
      if (galleryImages) {
        Array.from(galleryImages).forEach((file) => {
          data.append('gallery', file)
        })
      }

      // Add variants data
      data.append('variants', JSON.stringify(variants.map(v => ({
        size: v.size,
        color: v.color,
        colorValue: v.colorValue,
        yards: v.yards,
        quantity: v.quantity
      }))))

      // Add variant images
      variants.forEach((v, i) => {
        if (v.image) {
          data.append(`variant_${i}_image`, v.image)
        }
      })

      const res = await fetch('/api/products', {
        method: 'POST',
        body: data,
      })
      
      const resData = await res.json()
      
      if (!res.ok) throw new Error(resData.error || 'Failed to apply mutation')
      
      setStatus('Success! Product added to Sanity.')
      setFormData({ name: '', price: '', quantity: '', collection: '', description: '' })
      setMainImage(null)
      setMainImagePreview(null)
      setGalleryImages(null)
      setVariants([])
      
      const formNode = e.target as HTMLFormElement
      formNode.reset()
      
      // Add mock structure to list until reload
      setProducts([{...resData.product, _id: resData.product._id, price: Number(resData.product.price)}, ...products])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setStatus(`Error: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-12">
      <div className="bg-card p-8 border border-border shadow-sm h-fit">
        <h2 className="text-2xl font-black mb-6">Add New Product</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Product Name</label>
            <input
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-transparent border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="e.g. Signature Ankara Bundle"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Price (₦)</label>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-transparent border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="49.99"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Quantity</label>
              <input
                name="quantity"
                type="number"
                min="0"
                required
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-transparent border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Collection</label>
            <input
              name="collection"
              type="text"
              value={formData.collection}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-transparent border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Summer 2024 (Optional)"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold">Product Variants</label>
              <Button type="button" variant="outline" size="sm" onClick={addVariant} className="flex items-center gap-2">
                <Plus className="size-4" /> Add Variant
              </Button>
            </div>
            
            <div className="space-y-4">
              {variants.map((v, i) => (
                <div key={i} className="p-4 border border-border bg-surface-container-low relative space-y-4">
                  <button 
                    type="button" 
                    onClick={() => removeVariant(i)}
                    className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                  >
                    <X className="size-4" />
                  </button>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      placeholder="Color"
                      value={v.color}
                      onChange={(e) => updateVariant(i, 'color', e.target.value)}
                      className="px-3 py-2 bg-transparent border border-border text-sm focus:outline-none"
                    />
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={v.colorValue}
                        onChange={(e) => updateVariant(i, 'colorValue', e.target.value)}
                        className="size-9 bg-transparent border-none cursor-pointer"
                        title="Choose Edition Color Swatch"
                      />
                      <input
                        placeholder="#HEX"
                        value={v.colorValue}
                        onChange={(e) => updateVariant(i, 'colorValue', e.target.value)}
                        className="w-full px-3 py-2 bg-transparent border border-border text-xs focus:outline-none"
                      />
                    </div>
                    <input
                      placeholder="Size"
                      value={v.size}
                      onChange={(e) => updateVariant(i, 'size', e.target.value)}
                      className="px-3 py-2 bg-transparent border border-border text-sm focus:outline-none"
                    />
                    <input
                      placeholder="Yards"
                      value={v.yards}
                      onChange={(e) => updateVariant(i, 'yards', e.target.value)}
                      className="px-3 py-2 bg-transparent border border-border text-sm focus:outline-none"
                    />
                    <input
                      placeholder="Qty"
                      type="number"
                      value={v.quantity}
                      onChange={(e) => updateVariant(i, 'quantity', e.target.value)}
                      className="px-3 py-2 bg-transparent border border-border text-sm focus:outline-none"
                    />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {v.preview ? (
                      <div className="size-16 relative border border-border overflow-hidden">
                        <Image src={v.preview} alt="Variant preview" fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="size-16 border border-dashed border-border flex items-center justify-center">
                        <ImageIcon className="size-5 text-muted-foreground/30" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => updateVariant(i, 'image', e.target.files?.[0] || null)}
                      className="text-[10px] text-muted-foreground file:mr-2 file:py-1 file:px-2 file:border-0 file:bg-surface-container-highest file:text-black"
                    />
                  </div>
                </div>
              ))}
              {variants.length === 0 && (
                <p className="text-center py-4 text-xs text-muted-foreground border border-dashed border-border italic">
                  No custom variants defined. Default stock will be used.
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-6 p-4 border border-border bg-surface-container-low">
            <div className="space-y-4">
              <label className="block text-sm font-semibold mb-2">Main Image</label>
              {mainImagePreview && (
                <div className="relative aspect-square w-full overflow-hidden border border-border">
                  <Image src={mainImagePreview} alt="Preview" fill className="object-cover" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  setMainImage(file)
                  if (file) {
                    setMainImagePreview(URL.createObjectURL(file))
                  } else {
                    setMainImagePreview(null)
                  }
                }}
                className="w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-primary file:text-white hover:file:bg-primary/90"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Gallery Images</label>
              <div className="flex flex-col gap-4">
                {galleryImages && galleryImages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {Array.from(galleryImages).map((file, i) => (
                      <div key={i} className="size-12 relative overflow-hidden border border-border">
                        <Image src={URL.createObjectURL(file)} alt="Gallery" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setGalleryImages(e.target.files)}
                  className="w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-secondary file:text-white hover:file:bg-secondary/90"
                />
              </div>
            </div>
          </div>

          {status && (
            <div className={`p-4 text-sm font-medium ${status.includes('Error') ? 'bg-destructive text-white' : 'bg-surface-container border border-primary text-primary-strong'}`}>
              {status}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload Product'}
          </Button>
        </form>
      </div>

      <div className="flex flex-col gap-8">
        <div className="bg-surface-dim p-8 flex flex-col justify-center items-start">
          <p className="editorial-kicker text-primary mb-4">Instructions</p>
          <h3 className="text-3xl font-black mb-6">Managing your store</h3>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Use this panel to define new fabrics and bundles for your customers. Data entered here is securely synchronized with your Sanity backend instance in real-time.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Product images and variants should be managed via your Sanity Studio.
          </p>
        </div>

        <div className="bg-card border border-border shadow-sm p-6 overflow-hidden">
          <h3 className="text-xl font-black mb-4">Your Products</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-low text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                      No products found. Add one above.
                    </td>
                  </tr>
                ) : products.map(p => (
                  <tr key={p._id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-4">
                        <div className="size-12 bg-surface-container relative overflow-hidden border border-border flex items-center justify-center shrink-0">
                          {p.image && typeof p.image === 'string' && p.image.length > 0 ? (
                            <Image src={p.image} alt={p.name} fill className="object-cover" />
                          ) : (
                            <ImageIcon className="size-5 text-muted-foreground" />
                          )}
                        </div>
                        <span className="font-semibold truncate max-w-[120px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">₦{Number(p.price).toLocaleString("en-NG")}</td>
                    <td className="px-4 py-4 text-right">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => confirmDelete(p._id)}
                        disabled={isDeleting === p._id}
                      >
                        {isDeleting === p._id ? '...' : <Trash2 className="size-4" />}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product from the archive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete()} className="bg-destructive text-white hover:bg-destructive/90 transition-colors">
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
