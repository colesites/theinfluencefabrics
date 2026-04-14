import { redirect } from 'next/navigation'
import { getOwnerSession } from '@/lib/session'
import { getOrders } from '@/lib/orders'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import OrdersClient from './OrdersClient'

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

      <OrdersClient initialOrders={orders} />
    </div>
  )
}
