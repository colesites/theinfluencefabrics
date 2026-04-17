'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ProductRecord } from '@/lib/products'
import { ExploreItem } from '@/lib/explore'
import { StoreSettings } from '@/lib/settings'
import { Trash2, Image as ImageIcon, Plus, X, LayoutGrid, Compass, Settings, Pencil } from 'lucide-react'
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

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "One Size"] as const

export default function DashboardClient({ 
  initialProducts, 
  initialExploreItems,
  initialSettings
}: { 
  initialProducts: ProductRecord[],
  initialExploreItems: ExploreItem[],
  initialSettings: StoreSettings
}) {
  const [activeTab, setActiveTab] = useState<'products' | 'explore' | 'settings'>('products')
  
  // Product State
  const [products, setProducts] = useState(initialProducts)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    collection: '',
    description: '',
    originalPrice: '',
  })
  const [mainImage, setMainImage] = useState<File | null>(null)
  const [existingGalleryImages, setExistingGalleryImages] = useState<string[]>([])
  const [galleryImages, setGalleryImages] = useState<File[]>([])
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null)
  const [variants, setVariants] = useState<VariantForm[]>([])
  const [editingProductId, setEditingProductId] = useState<string | null>(null)

  // Explore State
  const [exploreItems, setExploreItems] = useState(initialExploreItems)
  const [exploreFormData, setExploreFormData] = useState({
    title: '',
    content: '',
  })
  const [exploreImage, setExploreImage] = useState<File | null>(null)
  const [exploreImagePreview, setExploreImagePreview] = useState<string | null>(null)
  const [editingExploreId, setEditingExploreId] = useState<string | null>(null)

  // Settings State
  const [settingsForm, setSettingsForm] = useState(initialSettings)
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setSettingsForm(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }))
  }

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingSettings(true)
    setStatus('')

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      })
      
      const resData = await res.json()
      if (!res.ok) throw new Error(resData.error || 'Failed to update settings')
      
      setStatus('Success! Store settings updated.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setStatus(`Error: ${message}`)
    } finally {
      setIsSavingSettings(false)
    }
  }

  // Shared State
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteType, setDeleteType] = useState<'product' | 'explore'>('product')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Product Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
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
    } else if (field !== 'preview') {
      // Narrow the key to string-only fields to avoid type conflicts
      const key = field as Extract<keyof VariantForm, 'size' | 'color' | 'colorValue' | 'yards' | 'quantity'>;
      newVariants[index][key] = value as string;
    }
    setVariants(newVariants)
  }

  const resetProductForm = () => {
    setFormData({ name: '', price: '', quantity: '', collection: '', description: '', originalPrice: '' })
    setMainImage(null)
    setMainImagePreview(null)
    setExistingGalleryImages([])
    setGalleryImages([])
    setVariants([])
    setEditingProductId(null)
  }

  const handleEditProduct = (product: ProductRecord) => {
    setActiveTab('products')
    setStatus('')
    setEditingProductId(product._id)
    setFormData({
      name: product.name || '',
      price: product.salePrice ? String(product.salePrice) : '',
      quantity: String(product.variants?.[0]?.quantity ?? 0),
      collection: product.collection || '',
      description: product.description || '',
      originalPrice: String(product.originalPrice || product.price || 0),
    })
    setMainImage(null)
    setExistingGalleryImages(product.gallery || [])
    setGalleryImages([])
    setMainImagePreview(product.image || null)
    setVariants(
      (product.variants || []).map((variant) => ({
        size: variant.size || '',
        color: variant.color || '',
        colorValue: variant.colorValue || '#000000',
        yards: variant.yards || '',
        quantity: String(variant.quantity || 0),
        image: null,
        preview: variant.image || null,
      })),
    )
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
      data.append('originalPrice', formData.originalPrice)
      
      if (mainImage) {
        data.append('image', mainImage)
      }
      data.append('retainGallery', JSON.stringify(existingGalleryImages))

      galleryImages.forEach((file) => {
        data.append('gallery', file)
      })

      data.append('variants', JSON.stringify(variants.map(v => ({
        size: v.size,
        color: v.color,
        colorValue: v.colorValue,
        yards: v.yards,
        quantity: v.quantity
      }))))

      variants.forEach((v, i) => {
        if (v.image) {
          data.append(`variant_${i}_image`, v.image)
        }
      })

      const endpoint = editingProductId ? `/api/products/${editingProductId}` : '/api/products'
      const method = editingProductId ? 'PUT' : 'POST'
      const res = await fetch(endpoint, {
        method,
        body: data,
      })
      
      const resData = await res.json()
      
      if (!res.ok) throw new Error(resData.error || 'Failed to apply mutation')
      
      setStatus(editingProductId ? 'Success! Product updated.' : 'Success! Product added to Sanity.')
      resetProductForm()
      
      const formNode = e.target as HTMLFormElement
      formNode.reset()
      
      if (editingProductId) {
        setProducts((prev) =>
          prev.map((p) =>
            p._id === editingProductId
              ? {
                  ...p,
                  name: formData.name,
                  price: Number(formData.price || formData.originalPrice || p.price || 0),
                  originalPrice: Number(formData.originalPrice || p.originalPrice || 0),
                  salePrice: formData.price ? Number(formData.price) : undefined,
                  collection: formData.collection || p.collection,
                  description: formData.description || '',
                  variants: variants.map((v) => ({
                    size: v.size,
                    color: v.color,
                    colorValue: v.colorValue,
                    yards: v.yards,
                    quantity: Number(v.quantity || 0),
                    image: v.preview || undefined,
                  })),
                  image: mainImagePreview || p.image,
                }
              : p,
          ),
        )
      } else {
        setProducts((prev) => [
          {
            _id: resData.product._id,
            name: formData.name,
            price: Number(formData.price || formData.originalPrice || 0),
            originalPrice: Number(formData.originalPrice || 0),
            salePrice: formData.price ? Number(formData.price) : undefined,
            collection: formData.collection || 'General',
            description: formData.description || '',
            image: mainImagePreview || '',
            variants: variants.map((v) => ({
              size: v.size,
              color: v.color,
              colorValue: v.colorValue,
              yards: v.yards,
              quantity: Number(v.quantity || 0),
              image: v.preview || undefined,
            })),
          },
          ...prev,
        ])
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setStatus(`Error: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  // Explore Handlers
  const handleExploreChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setExploreFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const resetExploreForm = () => {
    setExploreFormData({ title: '', content: '' })
    setExploreImage(null)
    setExploreImagePreview(null)
    setEditingExploreId(null)
  }

  const handleEditExplore = (item: ExploreItem) => {
    setActiveTab('explore')
    setStatus('')
    setEditingExploreId(item._id)
    setExploreFormData({
      title: item.title || '',
      content: item.content || '',
    })
    setExploreImage(null)
    setExploreImagePreview(item.image || null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleExploreSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus('')

    try {
      const data = new FormData()
      data.append('title', exploreFormData.title)
      data.append('content', exploreFormData.content)
      
      if (exploreImage) {
        data.append('image', exploreImage)
      } else if (!editingExploreId) {
        throw new Error('Image is required for Explore items')
      }

      const endpoint = editingExploreId ? `/api/explore/${editingExploreId}` : '/api/explore'
      const method = editingExploreId ? 'PUT' : 'POST'
      const res = await fetch(endpoint, {
        method,
        body: data,
      })
      
      const resData = await res.json()
      
      if (!res.ok) throw new Error(resData.error || 'Failed to upload explore item')
      
      setStatus(editingExploreId ? 'Success! Explore item updated.' : 'Success! Explore item added.')
      resetExploreForm()
      
      const formNode = e.target as HTMLFormElement
      formNode.reset()
      
      const newItem = {
        _id: resData.item._id,
        title: resData.item.title,
        content: resData.item.content,
        image: resData.item.image?.asset?.url || exploreImagePreview || '',
        _createdAt: resData.item._createdAt || new Date().toISOString()
      }
      if (editingExploreId) {
        setExploreItems((prev) => prev.map((item) => (item._id === editingExploreId ? { ...item, ...newItem } : item)))
      } else {
        setExploreItems((prev) => [newItem, ...prev])
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setStatus(`Error: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  // Delete Logic
  const confirmDelete = (id: string, type: 'product' | 'explore') => {
    setDeleteId(id)
    setDeleteType(type)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const id = deleteId
    setIsDeleteDialogOpen(false)
    setIsDeleting(id)
    
    try {
      const endpoint = deleteType === 'product' ? `/api/products/${id}` : `/api/explore/${id}`
      const res = await fetch(endpoint, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      
      if (deleteType === 'product') {
        setProducts(prev => prev.filter(p => p._id !== id))
      } else {
        setExploreItems(prev => prev.filter(p => p._id !== id))
      }
    } catch {
      alert(`Error deleting ${deleteType}`)
    } finally {
      setIsDeleting(null)
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-12">
      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => { setActiveTab('products'); setStatus(''); }}
          className={`flex items-center gap-2 px-8 py-4 text-sm font-black uppercase tracking-widest transition-colors ${activeTab === 'products' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-black'}`}
        >
          <LayoutGrid className="size-4" />
          Products
        </button>
        <button
          onClick={() => { setActiveTab('explore'); setStatus(''); }}
          className={`flex items-center gap-2 px-8 py-4 text-sm font-black uppercase tracking-widest transition-colors ${activeTab === 'explore' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-black'}`}
        >
          <Compass className="size-4" />
          Explore
        </button>
        <button
          onClick={() => { setActiveTab('settings'); setStatus(''); }}
          className={`flex items-center gap-2 px-8 py-4 text-sm font-black uppercase tracking-widest transition-colors ${activeTab === 'settings' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-black'}`}
        >
          <Settings className="size-4" />
          Settings
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {activeTab === 'products' ? (
          <>
            <div className="bg-card p-8 border border-border shadow-sm h-fit">
              <h2 className="text-2xl font-black mb-6">{editingProductId ? 'Edit Product' : 'Add New Product'}</h2>
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
                    <label className="block text-sm font-semibold mb-2">Original Price (₦)</label>
                    <input
                      name="originalPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={formData.originalPrice}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-transparent border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Mandatory (e.g. 10000)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Discount Price (₦)</label>
                    <input
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-transparent border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Optional (e.g. 8000)"
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

                <div>
                  <label className="block text-sm font-semibold mb-2">Product Description</label>
                  <textarea
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-transparent border border-border focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    placeholder="Describe the fabric quality, style, and what buyers should know."
                  />
                </div>

                <div>
                   <label className="block text-sm font-semibold mb-2">Default Base Quantity</label>
                   <input
                     name="quantity"
                     type="number"
                     min="0"
                     required
                     value={formData.quantity}
                     onChange={handleChange}
                     className="w-full px-4 py-3 bg-transparent border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                     placeholder="Total stock (if no variants)"
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
                          <select
                            value={v.size}
                            onChange={(e) => updateVariant(i, 'size', e.target.value)}
                            className="px-3 py-2 bg-transparent border border-border text-sm focus:outline-none"
                          >
                            <option value="">Select Size</option>
                            {SIZE_OPTIONS.map((size) => (
                              <option key={size} value={size}>
                                {size}
                              </option>
                            ))}
                          </select>
                          <input
                            placeholder="Yards (e.g. 6)"
                            type="number"
                            min={1}
                            step="0.5"
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
                      {existingGalleryImages.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {existingGalleryImages.map((url, i) => (
                            <div key={`${url}-${i}`} className="size-12 relative overflow-hidden border border-border">
                              <Image src={url} alt="Gallery" fill className="object-cover" />
                              <button
                                type="button"
                                onClick={() => setExistingGalleryImages((prev) => prev.filter((_, index) => index !== i))}
                                className="absolute right-0 top-0 rounded-bl bg-black/70 px-1 text-[10px] text-white"
                                aria-label={`Remove existing gallery image ${i + 1}`}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {galleryImages.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {galleryImages.map((file, i) => (
                            <div key={i} className="size-12 relative overflow-hidden border border-border">
                              <Image src={URL.createObjectURL(file)} alt="Gallery" fill className="object-cover" />
                              <button
                                type="button"
                                onClick={() => setGalleryImages((prev) => prev.filter((_, index) => index !== i))}
                                className="absolute right-0 top-0 rounded-bl bg-black/70 px-1 text-[10px] text-white"
                                aria-label={`Remove new gallery image ${i + 1}`}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          const nextFiles = Array.from(e.target.files || [])
                          if (nextFiles.length === 0) return
                          setGalleryImages((prev) => [...prev, ...nextFiles])
                          e.currentTarget.value = ''
                        }}
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
                  {loading ? (editingProductId ? 'Saving...' : 'Uploading...') : (editingProductId ? 'Save Product Changes' : 'Upload Product')}
                </Button>
                {editingProductId && (
                  <Button type="button" variant="outline" size="lg" className="w-full" onClick={resetProductForm}>
                    Cancel Edit
                  </Button>
                )}
              </form>
            </div>

            <div className="flex flex-col gap-8">
              <div className="bg-surface-dim p-8 flex flex-col justify-center items-start border border-border">
                <p className="editorial-kicker text-primary mb-4">Instructions</p>
                <h3 className="text-3xl font-black mb-6">Product Management</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Use this panel to define new fabrics and bundles for your customers. Data entered here is securely synchronized with your Sanity backend.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Tip: Use high-quality imagery for the best customer experience.
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
                          <td className="px-4 py-4">
                            <div className="flex flex-col">
                                <span className="font-bold">₦{(Number(p.price) || 0).toLocaleString("en-NG")}</span>
                                {p.salePrice && p.originalPrice && (
                                  <span className="text-[10px] text-muted-foreground line-through">₦{(Number(p.originalPrice) || 0).toLocaleString("en-NG")}</span>
                                )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditProduct(p)}
                              >
                                <Pencil className="size-4" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => confirmDelete(p._id, 'product')}
                                disabled={isDeleting === p._id}
                              >
                                {isDeleting === p._id ? '...' : <Trash2 className="size-4" />}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : activeTab === 'explore' ? (
          <>
            <div className="bg-card p-8 border border-border shadow-sm h-fit">
              <h2 className="text-2xl font-black mb-6">{editingExploreId ? 'Edit Explore Moment' : 'Share a New Moment'}</h2>
              <form onSubmit={handleExploreSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Headline / Title</label>
                  <input
                    name="title"
                    type="text"
                    required
                    value={exploreFormData.title}
                    onChange={handleExploreChange}
                    className="w-full px-4 py-3 bg-transparent border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="e.g. The Story of Our New Indigo Wax"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Writeup / Narrative</label>
                  <textarea
                    name="content"
                    required
                    rows={6}
                    value={exploreFormData.content}
                    onChange={handleExploreChange}
                    className="w-full px-4 py-3 bg-transparent border border-border focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    placeholder="Tell the story behind this image..."
                  />
                </div>

                <div className="p-4 border border-border bg-surface-container-low space-y-4">
                  <label className="block text-sm font-semibold mb-2">Explore Image</label>
                  {exploreImagePreview && (
                    <div className="relative aspect-video w-full overflow-hidden border border-border">
                      <Image src={exploreImagePreview} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    required={!editingExploreId}
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      setExploreImage(file)
                      if (file) {
                        setExploreImagePreview(URL.createObjectURL(file))
                      } else {
                        setExploreImagePreview(null)
                      }
                    }}
                    className="w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-primary file:text-white hover:file:bg-primary/90"
                  />
                </div>

                {status && (
                  <div className={`p-4 text-sm font-medium ${status.includes('Error') ? 'bg-destructive text-white' : 'bg-surface-container border border-primary text-primary-strong'}`}>
                    {status}
                  </div>
                )}

                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? (editingExploreId ? 'Saving...' : 'Publishing...') : (editingExploreId ? 'Save Explore Changes' : 'Publish to Explore')}
                </Button>
                {editingExploreId && (
                  <Button type="button" variant="outline" size="lg" className="w-full" onClick={resetExploreForm}>
                    Cancel Edit
                  </Button>
                )}
              </form>
            </div>

            <div className="flex flex-col gap-8">
              <div className="bg-surface-dim p-8 flex flex-col justify-center items-start border border-border">
                <p className="editorial-kicker text-primary mb-4">Instructions</p>
                <h3 className="text-3xl font-black mb-6">Explore Management</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  This section allows you to share narratives, fabric stories, and behind-the-scenes moments with your customers on the Explore page.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  These items appear in an editorial gallery format.
                </p>
              </div>

              <div className="bg-card border border-border shadow-sm p-6 overflow-hidden">
                <h3 className="text-xl font-black mb-4">Explore Feed</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-surface-container-low text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 font-medium">Title</th>
                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {exploreItems.length === 0 ? (
                        <tr>
                          <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">
                            No explore items yet. Share your first story!
                          </td>
                        </tr>
                      ) : exploreItems.map(item => (
                        <tr key={item._id} className="hover:bg-surface-container-low/50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-4">
                              <div className="size-12 bg-surface-container relative overflow-hidden border border-border flex items-center justify-center shrink-0">
                                {item.image ? (
                                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                                ) : (
                                  <ImageIcon className="size-5 text-muted-foreground" />
                                )}
                              </div>
                              <span className="font-semibold truncate max-w-[150px]">{item.title}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditExplore(item)}
                              >
                                <Pencil className="size-4" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => confirmDelete(item._id, 'explore')}
                                disabled={isDeleting === item._id}
                              >
                                {isDeleting === item._id ? '...' : <Trash2 className="size-4" />}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : activeTab === 'settings' ? (
          <div className="lg:col-span-2">
            <div className="bg-card p-8 border border-border shadow-sm max-w-2xl mx-auto">
              <h2 className="text-2xl font-black mb-6">Location-Based Shipping Fees</h2>
              <form onSubmit={handleSettingsSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Ado-Ekiti Region (₦)</label>
                  <input
                    name="shippingAdoEkiti"
                    type="number"
                    min="0"
                    required
                    value={settingsForm.shippingAdoEkiti}
                    onChange={handleSettingsChange}
                    className="w-full px-4 py-3 bg-transparent border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Rest of Ekiti State</label>
                  <input
                    type="text"
                    value="Shipping fee determined at park"
                    disabled
                    className="w-full px-4 py-3 bg-surface-container-low border border-border text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Outside Ekiti State</label>
                  <input
                    type="text"
                    value="Shipping fee determined at park"
                    disabled
                    className="w-full px-4 py-3 bg-surface-container-low border border-border text-muted-foreground"
                  />
                </div>

                <h2 className="text-2xl font-black mb-6 mt-10">Bank Transfer Details</h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold mb-2">Bank Name</label>
                    <input
                      name="bankName"
                      type="text"
                      value={settingsForm.bankName || ''}
                      onChange={handleSettingsChange}
                      placeholder="e.g. GTBank"
                      className="w-full px-4 py-3 bg-transparent border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Account Name</label>
                    <input
                      name="accountName"
                      type="text"
                      value={settingsForm.accountName || ''}
                      onChange={handleSettingsChange}
                      placeholder="e.g. Influence Fabrics"
                      className="w-full px-4 py-3 bg-transparent border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Account Number</label>
                    <input
                      name="accountNumber"
                      type="text"
                      value={settingsForm.accountNumber || ''}
                      onChange={handleSettingsChange}
                      placeholder="e.g. 0123456789"
                      className="w-full px-4 py-3 bg-transparent border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                {status && (
                  <div className={`p-4 text-sm font-medium ${status.includes('Error') ? 'bg-destructive text-white' : 'bg-surface-container border border-primary text-primary-strong'}`}>
                    {status}
                  </div>
                )}

                <Button type="submit" size="lg" className="w-full" disabled={isSavingSettings}>
                  {isSavingSettings ? 'Saving...' : 'Save Settings'}
                </Button>
              </form>
            </div>
          </div>
        ) : null}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {deleteType} from the archive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete()} className="bg-destructive text-white hover:bg-destructive/90 transition-colors">
              Delete {deleteType === 'product' ? 'Product' : 'Explore Item'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
