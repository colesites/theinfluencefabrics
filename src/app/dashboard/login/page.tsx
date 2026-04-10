'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { KeyRound } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Identity verification failed.')
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Access denied'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6 bg-surface-dim">
      <div className="w-full max-w-sm p-8 bg-card shadow-sm border border-border">
        <div className="mb-10 text-center">
          <div className="size-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <KeyRound className="size-6 text-primary" />
          </div>
          <p className="editorial-kicker text-primary mb-2">Security Portal</p>
          <h1 className="text-2xl font-black font-serif italic">Unlock Archive.</h1>
          <p className="mt-4 text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed">
            Enter the Master Key to access the owner portal.<br/>All interactions are logged.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-3 text-[10px] font-bold text-white bg-destructive rounded-sm text-center uppercase tracking-[0.15em]">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-8">
          <div>
            <label className="editorial-kicker block text-black/70 mb-3 text-center">Archive Master Key</label>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••••••"
              className="w-full px-4 py-3 bg-transparent border-b-2 border-border focus:border-primary focus:outline-none text-center text-lg tracking-widest font-black"
            />
          </div>
          <Button type="submit" className="w-full h-12" disabled={loading}>
            {loading ? 'Decrypting...' : 'Access Dashboard'}
          </Button>
        </form>
      </div>
    </div>
  )
}
