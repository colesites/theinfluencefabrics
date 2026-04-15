'use client'

import { FormEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { useSession } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import type { TestimonialRecord } from '@/lib/testimonials'

function getInitials(name: string) {
  const cleaned = name.trim().replace(/\s+/g, ' ')
  if (!cleaned) return 'AN'
  const parts = cleaned.split(' ')
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase()
}

export default function ProductTestimonials({
  productId,
  initialTestimonials,
}: {
  productId: string
  initialTestimonials: TestimonialRecord[]
}) {
  const { data: session } = useSession()
  const [testimonials, setTestimonials] = useState<TestimonialRecord[]>(initialTestimonials)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')

  const averageRating = useMemo(() => {
    if (testimonials.length === 0) return 0
    const total = testimonials.reduce((sum, item) => sum + item.rating, 0)
    return total / testimonials.length
  }, [testimonials])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('')

    if (!session?.user) {
      setStatus('Sign in to leave a testimonial.')
      return
    }

    if (comment.trim().length < 3) {
      setStatus('Comment must be at least 3 characters.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating,
          comment: comment.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit testimonial')
      }

      const nextTestimonial = data.testimonial as TestimonialRecord
      setTestimonials((prev) => {
        const existingIndex = prev.findIndex((item) => item._id === nextTestimonial._id || item.userId === nextTestimonial.userId)
        if (existingIndex >= 0) {
          const clone = [...prev]
          clone[existingIndex] = nextTestimonial
          return clone
        }
        return [nextTestimonial, ...prev]
      })
      setComment('')
      setRating(5)
      setStatus('Testimonial submitted.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setStatus(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="bg-surface-container-low py-20 sm:py-24">
      <div className="atelier-shell">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black sm:text-5xl">Ankara Reviews</h2>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-primary">
              Real testimonials from signed-in buyers
            </p>
          </div>
          <div className="flex items-end gap-2">
            <p className="font-serif text-6xl font-black leading-none">
              {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
            </p>
            <div className="mb-1 flex text-primary">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className={`size-4 ${index < Math.round(averageRating) ? 'fill-current' : ''}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="grid gap-8 md:grid-cols-2">
            {testimonials.length === 0 ? (
              <div className="md:col-span-2 border border-dashed border-border p-10 text-center text-muted-foreground">
                No testimonials yet. Be the first to leave one.
              </div>
            ) : (
              testimonials.map((review) => (
                <article key={review._id} className="space-y-5">
                  <div className="flex text-primary">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`size-4 ${index < review.rating ? 'fill-current' : ''}`}
                      />
                    ))}
                  </div>
                  <p className="font-serif text-lg italic leading-relaxed">{`"${review.comment}"`}</p>
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-content-center bg-black text-[10px] font-semibold uppercase tracking-[0.15em] text-white">
                      {getInitials(review.userName)}
                    </span>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em]">
                        {review.userName}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        Verified Account
                      </p>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          <div className="border border-border bg-background p-6 sm:p-8 h-fit">
            <h3 className="text-2xl font-black">Leave a Testimonial</h3>
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Signed-in users only
            </p>

            {!session?.user ? (
              <p className="mt-6 text-sm text-muted-foreground">
                <Link href={`/account/sign-in?redirectTo=/product/${productId}`} className="text-primary underline underline-offset-4">
                  Sign in
                </Link>{' '}
                to rate this product and share your review.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-2">
                    Your rating
                  </p>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, index) => {
                      const value = index + 1
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setRating(value)}
                          className="text-primary"
                          aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
                        >
                          <Star className={`size-5 ${value <= rating ? 'fill-current' : ''}`} />
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Your comment
                  </label>
                  <textarea
                    className="mt-2 min-h-[120px] w-full border border-border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Tell other buyers what you liked."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  />
                </div>

                {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}

                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? 'Submitting...' : 'Submit Testimonial'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
