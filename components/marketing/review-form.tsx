"use client"

import { useState } from "react"
import { ArrowRight, Star } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field } from "@/components/ui/field"
import { BTN_ICON } from "@/components/shared/button-styles"
import { fieldErrorsOf } from "@/lib/validation-message"
import { cn } from "@/lib/utils"

/** Posts a review to /api/public/reviews. Reviews are stored as PENDING and
 *  appear on the site only after a staff member moderates them. */
export function ReviewForm({
  productSlug,
  className,
}: {
  productSlug: string
  className?: string
}) {
  const [authorName, setAuthorName] = useState("")
  const [city, setCity] = useState("")
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (rating < 1) {
      setErrors({ rating: "Choose a rating from 1 to 5." })
      return
    }
    setBusy(true)
    setErrors({})
    try {
      const res = await fetch("/api/public/reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productSlug, authorName, city, rating, title, body }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Thanks. Your review will appear after we check it.")
        setAuthorName("")
        setCity("")
        setRating(0)
        setTitle("")
        setBody("")
      } else {
        setErrors(fieldErrorsOf(data.error?.details))
        toast.error(data.error?.message ?? "We could not submit your review. Please try again.")
      }
    } catch {
      toast.error("We could not reach the server. Check your connection and try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className={cn("space-y-5", className)} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" htmlFor="rv-name" error={errors.authorName}>
          <Input
            id="rv-name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            maxLength={80}
            autoComplete="name"
            required
          />
        </Field>
        <Field
          label="City (optional)"
          htmlFor="rv-city"
          error={errors.city}
          hint="For example Delhi"
        >
          <Input
            id="rv-city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            maxLength={80}
          />
        </Field>
      </div>

      <Field label="Your rating" error={errors.rating}>
        <div className="flex items-center gap-3">
          <div role="radiogroup" aria-label="Your rating" className="-ml-2.5 flex items-center" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                className={cn(
                  BTN_ICON,
                  "transition-transform duration-[140ms] ease-standard hover:-translate-y-0.5 hover:scale-110",
                  "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring",
                )}
              >
                <Star
                  className={cn(
                    "h-7 w-7 transition-colors duration-[140ms]",
                    (hover || rating) >= n ? "fill-brand-accent text-brand-accent" : "text-ink-muted",
                  )}
                  strokeWidth={1.75}
                  aria-hidden
                />
              </button>
            ))}
          </div>
          <span className="font-mono text-[15px] text-ink-muted tabular-nums" aria-hidden>
            <span className={cn((hover || rating) > 0 && "text-ink")}>{hover || rating}</span> / 5
          </span>
        </div>
      </Field>

      <Field label="Title" htmlFor="rv-title" error={errors.title}>
        <Input
          id="rv-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          placeholder="Sums up your experience in a few words"
          required
        />
      </Field>

      <Field label="Review" htmlFor="rv-body" error={errors.body}>
        <Textarea
          id="rv-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="How does it perform? Mention your room size, the use (hall, classroom, counter) and how it sounds."
          required
        />
      </Field>

      <Button
        type="submit"
        variant="accent"
        disabled={busy}
        className="group w-full px-6 font-semibold hover:-translate-y-0.5 sm:w-auto"
      >
        {busy ? "Submitting..." : "Submit review"}
        {!busy && (
          <ArrowRight
            className="h-[18px] w-[18px] transition-transform duration-200 ease-standard group-hover:translate-x-1"
            strokeWidth={2}
            aria-hidden
          />
        )}
      </Button>
    </form>
  )
}

export default ReviewForm
