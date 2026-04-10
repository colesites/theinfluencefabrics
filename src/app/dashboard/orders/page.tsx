import { redirect } from 'next/navigation'
import { getOwnerSession } from '@/lib/session'
import { getOrders } from '@/lib/orders'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const revalidate = 0

export default async function OrdersDashboardPage() {
  const session = await getOwnerSession()
  
  if (!session) {
    redirect('/dashboard/login')
  }

  const orders = await getOrders()

  return (
    <div className="atelier-shell py-16 min-h-[80vh]">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="editorial-kicker text-primary mb-2">Owner Portal</p>
          <h1 className="text-4xl sm:text-5xl font-black font-serif italic">Customer Archive Orders</h1>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard">Products Management</Link>
        </Button>
      </header>

      <div className="bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low text-[10px] uppercase tracking-[0.2em] text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-black">Date</th>
                <th className="px-6 py-4 font-black">Order #</th>
                <th className="px-6 py-4 font-black">Customer</th>
                <th className="px-6 py-4 font-black">Total</th>
                <th className="px-6 py-4 font-black">Status</th>
                <th className="px-6 py-4 font-black text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-muted-foreground">
                    No orders in the archive yet.
                  </td>
                </tr>
              ) : orders.map((order) => (
                <tr key={order._id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-6 py-5 text-xs text-muted-foreground">
                    {new Date(order._createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-5 font-black text-sm">
                    {order.orderNumber.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold">{order.customer.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{order.customer.email}</p>
                  </td>
                  <td className="px-6 py-5 font-serif font-black text-primary text-lg">
                    ₦{order.totalPrice?.toLocaleString()}
                  </td>
                  <td className="px-6 py-5">
                    <Badge variant={order.status === 'paid' ? 'default' : 'secondary'} className="uppercase text-[9px] tracking-widest px-2 py-0.5">
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <Button variant="ghost" size="sm" className="text-[10px] uppercase tracking-widest font-black">
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
