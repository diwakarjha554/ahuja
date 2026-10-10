"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardBody } from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { BTN, BTN_SECONDARY } from "@/components/shared/button-styles"
import { cn } from "@/lib/utils"

export type BrandInitial = {
  id: string
  name: string
  slug: string
  description: string
}

export function BrandForm({ initial }: { initial?: BrandInitial }) {
  const router = useRouter()
  const editing = Boolean(initial)
  const [name, setName] = useState(initial?.name ?? "")
  const [slug, setSlug] = useState(initial?.slug ?? "")
  const [description, setDescription] = useState(initial?.description ?? "")
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
      }
      const res = await fetch(editing ? `/api/admin/brands/${initial!.id}` : "/api/admin/brands", {
        method: editing ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(editing ? "Brand updated." : "Brand created.")
        router.push("/admin/brands")
        router.refresh()
      } else {
        toast.error(data.error?.message ?? "Could not save the brand.")
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="max-w-2xl">
      <Card>
        <CardBody className="space-y-5">
          <Field label="Name" htmlFor="brand-name" hint="For example: Ahuja, Ahuja Radios.">
            <Input
              id="brand-name"
              required
              minLength={2}
              maxLength={200}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>

          <Field
            label="Slug"
            htmlFor="brand-slug"
            hint={
              editing
                ? "Lowercase with hyphens. Leave unchanged to keep the current URL."
                : "Lowercase with hyphens. Leave blank to build it from the name."
            }
          >
            <Input
              id="brand-slug"
              placeholder="ahuja"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </Field>

          <Field label="Description" htmlFor="brand-desc" hint="Optional. Shown on the brand page.">
            <Textarea
              id="brand-desc"
              maxLength={2000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
        </CardBody>
      </Card>

      <div className="mt-5 flex items-center gap-3">
        <Button type="submit" variant="primary" disabled={busy}>
          {busy ? "Saving..." : editing ? "Save changes" : "Create brand"}
        </Button>
        <Link href="/admin/brands" className={cn(BTN, BTN_SECONDARY)}>
          Cancel
        </Link>
      </div>
    </form>
  )
}
