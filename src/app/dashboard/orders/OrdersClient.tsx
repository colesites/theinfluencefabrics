'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { OrderRecord } from '@/lib/orders'
import { X, ExternalLink } from 'lucide-react'

function getStatusBadgeVariant(status: string) {
  if (status === 'approved' || status === 'paid') return 'default'
  if (status === 'pending') return 'secondary'
  return 'outline'
}

// Using HTML native dialog approach or absolute overlay for the modal
export default function OrdersClient({ initialOrders }: { initialOrders: OrderRecord[] }) {
  const [orders, setOrders] = useState<OrderRecord[]>(initialOrders)
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      const data = await res.json()
      if (res.ok) {
        // Update local state
        setOrders(orders.map(o => o._id === id ? { ...o, status: newStatus } : o))
        if (selectedOrder?._id === id) {
          setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null)
        }
      } else {
        alert("Failed to update: " + data.error)
      }
    } catch {
      alert("Network err.")
    } finally {
      setIsUpdating(false)
    }
  }

  const Modal = () => {
    if (!selectedOrder) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-background border border-border w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col md:flex-row">
          <button 
            className="absolute top-4 right-4 p-2 z-10 bg-black/5 rounded-full hover:bg-black/10 transition"
            onClick={() => setSelectedOrder(null)}
          >
            <X className="size-4" />
          </button>

          <div className="flex-1 p-8 sm:p-12 space-y-8">
            <header>
              <div className="flex gap-3 mb-2 items-center">
                 <Badge variant={getStatusBadgeVariant(selectedOrder.status)} className="uppercase text-[9px] tracking-widest px-2 py-0.5">
                    {selectedOrder.status}
                  </Badge>
                  <p className="text-[10px] uppercase font-black tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded">
                    {selectedOrder.paymentMethod === 'transfer' ? 'Manual Transfer' : 'Paystack Secure'}
                  </p>
              </div>
              <h2 className="text-3xl font-black font-serif italic mb-1">#{selectedOrder.orderNumber}</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                {new Date(selectedOrder._createdAt).toLocaleString()}
              </p>
            </header>

            <div className="grid gap-6">
              <div className="p-5 bg-surface-container-low border border-border">
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-3">Customer Details</p>
                <div className="space-y-1 text-sm font-medium">
                  <p>{selectedOrder.customer.name}</p>
                  <p>{selectedOrder.customer.email}</p>
                  <p>{selectedOrder.customer.phone}</p>
                  <p className="pt-2 text-muted-foreground leading-relaxed">
                    {selectedOrder.customer.address}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-3">Order Items</p>
                <div className="divide-y divide-border border border-border border-b-0">
                  {selectedOrder.items.map(item => (
                    <div key={item._key} className="p-3 bg-surface-container-low border-b border-border flex justify-between text-sm">
                      <div>
                        <span className="font-bold">{item.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">x{item.quantity}</span>
                        {(item.size || item.color) && (
                           <p className="text-[10px] uppercase tracking-widest mt-1 text-muted-foreground">
                             {item.size} {item.color ? ` / ${item.color}` : ''}
                           </p>
                        )}
                      </div>
                      <span className="font-serif italic font-black">₦{item.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-black text-white flex justify-between items-center mt-4">
                  <span className="text-xs uppercase tracking-widest font-bold">Total Paid</span>
                  <span className="font-serif italic font-black text-2xl">₦{selectedOrder.totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                 <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-3">Modify Status</p>
                 <div className="flex gap-2">
                    <select 
                      className="border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto"
                      value={selectedOrder.status}
                      onChange={(e) => handleUpdateStatus(selectedOrder._id, e.target.value)}
                      disabled={isUpdating}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    {isUpdating && <span className="text-xs self-center animate-pulse text-muted-foreground">Updating...</span>}
                 </div>
              </div>
            </div>
          </div>

          {/* Receipt Sidebar */}
          {selectedOrder.paymentMethod === 'transfer' && selectedOrder.receiptImage && (
            <div className="w-full md:w-72 border-t md:border-t-0 md:border-l border-border bg-surface-container-highest flex flex-col p-6">
              <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-4">Transfer Receipt</p>
              <div className="relative aspect-[3/4] w-full bg-black/5 hover:bg-black/10 transition-colors group cursor-pointer overflow-hidden border border-black/10">
                <Image 
                  src={selectedOrder.receiptImage} 
                  alt="Receipt" 
                  fill 
                  className="object-cover"
                />
                <a href={selectedOrder.receiptImage} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 backdrop-blur-sm transition-all text-white text-[10px] font-black uppercase tracking-widest gap-2">
                  <ExternalLink className="size-4" />
                  View Original
                </a>
              </div>
              <p className="text-[10px] mt-4 text-center leading-relaxed text-muted-foreground">
                Please verify the amount matches the total above before marking as <strong className="text-black">Approved</strong>.
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-card border border-border overflow-hidden relative">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-surface-container-low text-[10px] uppercase tracking-[0.2em] text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-black">Date</th>
                <th className="px-6 py-4 font-black">Order #</th>
                <th className="px-6 py-4 font-black">Customer</th>
                <th className="px-6 py-4 font-black">Amount</th>
                <th className="px-6 py-4 font-black">Method</th>
                <th className="px-6 py-4 font-black">Status</th>
                <th className="px-6 py-4 font-black text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border relative">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-muted-foreground absolute inset-0 flex items-center justify-center w-full min-h-[200px]">
                    No orders have been recorded.
                  </td>
                </tr>
              ) : orders.map((order) => (
                <tr key={order._id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-6 py-5 text-xs text-muted-foreground">
                    {new Date(order._createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-5 font-black text-sm text-primary underline underline-offset-4 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                    {order.orderNumber.slice(0, 10)}...
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-ellipsis overflow-hidden max-w-[200px]">{order.customer.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{order.customer.email}</p>
                  </td>
                  <td className="px-6 py-5 font-serif font-black text-sm">
                    ₦{order.totalPrice?.toLocaleString()}
                  </td>
                  <td className="px-6 py-5">
                    {order.paymentMethod === 'transfer' ? (
                       <span className="text-[10px] uppercase font-bold tracking-widest text-[#e46623]">Transfer</span>
                    ) : (
                       <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600">Paystack</span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <Badge variant={getStatusBadgeVariant(order.status)} className="uppercase text-[9px] tracking-widest px-2 py-0.5">
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-5 text-right w-fit">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)} className="text-[10px] uppercase tracking-widest font-black">
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <Modal />
    </>
  )
}
