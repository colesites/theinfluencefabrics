'use client'

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import dynamic from "next/dynamic"

const PaystackButton = dynamic(() => import("react-paystack").then((mod) => mod.PaystackButton), { ssr: false })
import { ChevronLeft, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCart } from "@/components/cart/CartContext"
import { useSession } from "@/lib/auth-client"
import { StoreSettings } from "@/lib/settings"

const checkoutSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(2, "Name is too short"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(5, "Please enter a full shipping address"),
  region: z.enum(["ado_ekiti", "ekiti_state", "outside_ekiti"], {
    message: "Please select a delivery region"
  }),
})

type CheckoutFormValues = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart()
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [loading, setLoading] = useState(false)
  const [shippingRates, setShippingRates] = useState<StoreSettings | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'transfer'>('paystack')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)

  const { register, watch, formState: { errors, isValid } } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    mode: "onChange",
    defaultValues: {
      email: session?.user?.email || "",
      name: session?.user?.name || "",
      phone: "",
      address: "",
    }
  })

  const selectedRegion = watch("region")

  let shippingFee = 0;
  if (shippingRates) {
    if (selectedRegion === 'ado_ekiti') shippingFee = shippingRates.shippingAdoEkiti;
    else if (selectedRegion === 'ekiti_state') shippingFee = shippingRates.shippingEkitiState;
    else if (selectedRegion === 'outside_ekiti') shippingFee = shippingRates.shippingOutsideEkiti;
  }

  const total = cartTotal + shippingFee

  useEffect(() => {
    setIsClient(true)
    fetch('/api/settings').then(r => r.json()).then(data => {
      if(data.success && data.settings) {
        setShippingRates(data.settings)
      }
    })
  }, [])

  // Checkout Gate: Ensure user is signed in
  useEffect(() => {
    if (isClient && !isPending && !session?.user) {
      router.replace('/account?redirectTo=/checkout')
    }
  }, [isClient, isPending, session, router])

  if (!isClient || isPending || !session?.user) {
    return <div className="min-h-screen bg-surface-dim grid place-content-center">
      <div className="text-center space-y-4">
        <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="editorial-kicker text-[10px] animate-pulse">Authenticating...</p>
      </div>
    </div>
  }

  if (items.length === 0) {
    return (
      <div className="atelier-shell py-28 text-center animate-in fade-in duration-500">
        <h1 className="text-4xl font-black mb-6">No items detected.</h1>
        <Button asChild variant="outline">
          <Link href="/collection">Return to Collection</Link>
        </Button>
      </div>
    )
  }

  // Paystack config
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || ""
  
  interface PaystackSuccessResponse {
    reference: string;
    trans: string;
    status: string;
    message: string;
    transaction: string;
    [key: string]: string;
  }

  const handlePaymentSuccess = async (reference: PaystackSuccessResponse) => {
    setLoading(true)
    try {
      // 1. Verify payment on server
      const verifyRes = await fetch("/api/orders/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: reference.reference })
      })

      const verifyData = await verifyRes.json()
      if (!verifyRes.ok) throw new Error(verifyData.error || "Verification failed")

      // 2. Clear cart and redirect
      clearCart()
      router.push(`/checkout/success/${reference.reference}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error"
      alert(`Error verifying payment: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  const handleTransferSubmit = async () => {
    if (!receiptFile) return alert("Please upload your transfer receipt.")
    
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('receipt', receiptFile)
      
      const formValues = watch()
      const orderData = {
        customer: {
           name: formValues.name,
           email: formValues.email,
           phone: formValues.phone,
           address: formValues.address,
        },
        items,
        totalPrice: total
      }
      formData.append('orderData', JSON.stringify(orderData))

      const res = await fetch("/api/orders/transfer", {
        method: "POST",
        body: formData
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Transfer submission failed")

      clearCart()
      router.push(`/checkout/success/${data.order.orderNumber}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error"
      alert(`Error submitting transfer: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  const paystackProps = {
    email: session?.user?.email || "customer@example.com",
    amount: total * 100, // kobo
    publicKey,
    text: "Complete Payment",
    metadata: {
      custom_fields: [
        {
          display_name: "Cart Items",
          variable_name: "cart_items",
          value: JSON.stringify(items.map(i => ({ id: i.productId, qty: i.quantity, size: i.size, color: i.color })))
        }
      ]
    },
    onSuccess: (ref: PaystackSuccessResponse) => handlePaymentSuccess(ref),
    onClose: () => alert("Payment cancelled"),
  }

  return (
    <div className="bg-surface-dim min-h-screen">
      <div className="atelier-shell py-12">
        <Link href="/cart" className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-12">
          <ChevronLeft className="size-3" />
          Back to Selection
        </Link>
        
        <div className="grid lg:grid-cols-[1fr_450px] gap-12 items-start">
          <div className="space-y-10">
            <div>
              <h1 className="text-5xl font-black font-serif italic mb-4">Finalizing Order</h1>
              <p className="text-muted-foreground uppercase text-[10px] tracking-[0.2em]">Contact & Shipping Information</p>
            </div>

            <Card className="bg-background border-none shadow-sm p-8 sm:p-10">
              <form className="space-y-8">
                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-widest">Full Name</label>
                    <Input 
                      {...register("name")}
                      placeholder="e.g. Adeoke Johnson" 
                      className="h-12 bg-surface-container-low border-transparent focus:bg-background transition-all"
                    />
                    {errors.name && <p className="text-[10px] text-destructive font-bold uppercase tracking-widest">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-widest">Email Address</label>
                    <Input 
                      {...register("email")}
                      placeholder="adeoke@example.com"
                      className="h-12 bg-surface-container-low border-transparent focus:bg-background transition-all"
                    />
                    {errors.email && <p className="text-[10px] text-destructive font-bold uppercase tracking-widest">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-widest">Phone Number</label>
                  <Input 
                    {...register("phone")}
                    placeholder="+234 ..."
                    className="h-12 bg-surface-container-low border-transparent focus:bg-background transition-all"
                  />
                  {errors.phone && <p className="text-[10px] text-destructive font-bold uppercase tracking-widest">{errors.phone.message}</p>}
                </div>

                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-widest">Shipping Archive Address</label>
                    <Input 
                      {...register("address")}
                      placeholder="Provide full logistics coordinates"
                      className="h-12 bg-surface-container-low border-transparent focus:bg-background transition-all"
                    />
                    {errors.address && <p className="text-[10px] text-destructive font-bold uppercase tracking-widest">{errors.address.message}</p>}
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-widest">Delivery Region</label>
                    <select 
                      {...register("region")}
                      className="w-full h-12 px-3 text-sm bg-surface-container-low border-transparent focus:bg-background transition-all outline-none"
                    >
                      <option value="">Select your region...</option>
                      {shippingRates && (
                        <>
                          <option value="ado_ekiti">Within Ado-Ekiti (₦{shippingRates.shippingAdoEkiti.toLocaleString()})</option>
                          <option value="ekiti_state">Within Ekiti State (₦{shippingRates.shippingEkitiState.toLocaleString()})</option>
                          <option value="outside_ekiti">Outside Ekiti (₦{shippingRates.shippingOutsideEkiti.toLocaleString()})</option>
                        </>
                      )}
                    </select>
                    {errors.region && <p className="text-[10px] text-destructive font-bold uppercase tracking-widest">{errors.region.message}</p>}
                  </div>
                </div>
              </form>
            </Card>
          </div>

          <aside className="sticky top-28">
            <Card className="bg-primary text-primary-strong border-none shadow-2xl p-8 sm:p-10 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Lock className="size-24 -mr-8 -mt-8" />
              </div>
              
              <CardHeader className="p-0 mb-8 border-b border-white/20 pb-6">
                <CardTitle className="text-3xl font-black font-serif italic text-white">Archives Total</CardTitle>
              </CardHeader>
              
              <CardContent className="p-0 space-y-8">
                <div className="space-y-4">
                  {items.map(item => (
                    <div key={item.productId} className="flex justify-between text-xs tracking-widest uppercase text-white/80">
                      <span>{item.name} x {item.quantity}</span>
                      <span className="font-black">₦{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                
                <div className="pt-6 border-t border-white/20 space-y-4 text-sm uppercase tracking-widest text-white">
                  <div className="flex justify-between opacity-70">
                    <span>Shipping</span>
                    <span>{shippingFee > 0 ? `₦${shippingFee.toLocaleString()}` : "Pending Region"}</span>
                  </div>
                  <div className="flex justify-between text-2xl font-black pt-4">
                    <span>Grand Total</span>
                    <span className="font-serif italic font-black">₦{total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-6 space-y-4">
                  <div className="flex gap-4 p-1 bg-white/10 rounded">
                     <button
                        type="button" 
                        onClick={() => setPaymentMethod('paystack')}
                        className={`flex-1 py-3 text-xs tracking-widest uppercase font-black transition-colors ${paymentMethod === 'paystack' ? 'bg-white text-primary rounded' : 'text-white/60 hover:text-white'}`}
                     >Paystack</button>
                     <button
                        type="button"
                        onClick={() => setPaymentMethod('transfer')}
                        className={`flex-1 py-3 text-xs tracking-widest uppercase font-black transition-colors ${paymentMethod === 'transfer' ? 'bg-white text-primary rounded' : 'text-white/60 hover:text-white'}`}
                     >Transfer</button>
                  </div>

                  {paymentMethod === 'transfer' && shippingRates && (
                    <div className="p-5 bg-white/5 border border-white/10 text-white/90 text-sm space-y-3">
                      <p className="text-[10px] uppercase font-black tracking-widest text-white/50 mb-4">Transfer Details</p>
                      <p><strong>Bank:</strong> {shippingRates.bankName || 'N/A'}</p>
                      <p><strong>Account Name:</strong> {shippingRates.accountName || 'N/A'}</p>
                      <p><strong>Account No:</strong> {shippingRates.accountNumber || 'N/A'}</p>
                      
                      <div className="pt-4 border-t border-white/10 mt-4">
                        <label className="block text-[10px] uppercase font-black tracking-widest text-white/50 mb-3">Upload Payment Receipt</label>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                          className="w-full text-xs file:bg-white/10 file:border-none file:text-white file:px-4 file:py-2 file:mr-4 file:text-xs file:uppercase file:tracking-widest file:font-black hover:file:bg-white/20 transition-colors"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6">
                  {isValid ? (
                    paymentMethod === 'paystack' ? (
                      <PaystackButton
                        {...paystackProps}
                        className="w-full h-16 bg-white text-primary font-black uppercase tracking-[0.2em] text-sm hover:bg-white/90 transition-all shadow-xl disabled:opacity-50 rounded-sm"
                      />
                    ) : (
                      <Button 
                        onClick={handleTransferSubmit}
                        disabled={loading || !receiptFile} 
                        className="w-full h-16 bg-white text-primary font-black uppercase tracking-[0.2em] text-sm hover:bg-white/90 transition-all shadow-xl disabled:opacity-50 border-none rounded-sm"
                      >
                        {loading ? 'Submitting...' : 'Submit Transfer'}
                      </Button>
                     )
                  ) : (
                    <Button disabled className="w-full h-16 bg-white/20 text-white/50 font-black uppercase tracking-[0.2em] text-sm cursor-not-allowed border-none rounded-sm">
                      Complete Information
                    </Button>
                  )}
                  <p className="text-[9px] text-center mt-6 uppercase tracking-[0.25em] text-white/60">
                    {paymentMethod === 'paystack' ? 'Encrypted Transaction / Secured by Paystack' : 'Manual verification required for transfers'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  )
}
