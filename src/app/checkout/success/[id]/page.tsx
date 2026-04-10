import React from "react"
import Link from "next/link"
import { CheckCircle2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function SuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="bg-surface-dim min-h-[calc(100vh-10rem)] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-background p-10 sm:p-20 text-center space-y-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="relative inline-block">
          <CheckCircle2 className="size-24 mx-auto text-primary" strokeWidth={1} />
        </div>
        
        <div className="space-y-4">
          <p className="editorial-kicker text-primary">Order Confirmed</p>
          <h1 className="text-5xl font-black font-serif italic">Your piece of the archive is reserved.</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-[0.2em] pt-4">
            Order Reference: <span className="text-black font-black whitespace-nowrap">{id}</span>
          </p>
        </div>

        <div className="pt-6 grid gap-4 max-w-sm mx-auto">
          <Button asChild size="lg" className="h-14 font-black tracking-widest uppercase text-xs">
            <Link href="/account">View Order Status</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-14 font-black tracking-widest uppercase text-xs">
            <Link href="/collection">Continue Shopping</Link>
          </Button>
        </div>

        <div className="pt-10 border-t border-black/5 flex items-center justify-center gap-6 opacity-40">
           <div className="flex items-center gap-2 text-[10px] uppercase tracking-tighter">
             <Package className="size-3" />
             Lagos Dispatch
           </div>
           <div className="w-px h-4 bg-black/20" />
           <p className="text-[10px] uppercase tracking-tighter">Confirmation Sent To Email</p>
        </div>
      </div>
    </div>
  )
}
