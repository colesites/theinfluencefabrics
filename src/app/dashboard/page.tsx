import { redirect } from 'next/navigation'
import { getOwnerSession } from '@/lib/session'
import DashboardClient from './DashboardClient'
import { getProducts } from '@/lib/products'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getOwnerSession()
  
  if (!session) {
    redirect('/dashboard/login')
  }

  return (
    <div className="atelier-shell py-16 min-h-[80vh]">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <p className="editorial-kicker text-primary mb-2">Owner Portal</p>
          <h1 className="text-4xl sm:text-5xl font-black font-serif italic">Product Management</h1>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/orders">View Archive Orders</Link>
        </Button>
      </div>
      
      <DashboardClient initialProducts={await getProducts()} />
    </div>
  )
}
