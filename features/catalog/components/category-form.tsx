"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardBody } from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { BTN, BTN_SECONDARY } from "@/components/shared/button-styles"
import { cn } from "@/lib/utils"
import type { ParentOption } from "@/features/catalog/components/category-tree"

export type CategoryInitial = {
  id: string
  name: string
  slug: string
  parentSlug: string | null
  description: string
  sort: number
  featured: boolean
  seoTitle: string
  seoDesc: string
}

export function CategoryForm({
  parents,
  initial,
}: {
  parents: ParentOption[]
  initial?: CategoryInitial
}) {
  const router = useRouter()
  const editing = Boolean(initial)
  const [name, setName] = useState(initial?.name ?? "")
  const [slug, setSlug] = useState(initial?.slug ?? "")
  const [parentSlug, setParentSlug] = useState(initial?.parentSlug ?? "")
  const [description, setDescription] = useState(initial?.description ?? "")
  const [sort, setSort] = useState(String(initial?.sort ?? 0))
  const [featured, setFeatured] = useState(initial?.featured ?? false)
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle ?? "")
  const [seoDesc, setSeoDesc] = useState(initial?.seoDesc ?? "")
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        parentSlug: parentSlug ? parentSlug : null,
        description: description.trim(),
        sort: Number.parseInt(sort, 10) || 0,
        featured,
        seoTitle: seoTitle.trim(),
        seoDesc: seoDesc.trim(),
      }
      const res = await fetch(
        editing ? `/api/admin/categories/${initial!.id}` : "/api/admin/categories",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        },
      )
      const data = await res.json()
      if (data.success) {
        toast.success(editing ? "Category updated." : "Category created.")
        router.push("/admin/categories")
        router.refresh()
      } else {
        toast.error(data.error?.message ?? "Could not save the category.")
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="max-w-2xl">
      <Card>
        <CardBody className="space-y-5">
          <Field
            label="Name"
            htmlFor="cat-name"
            hint="For example: Microphones, Amplifiers, Column speakers."
          >
            <Input
              id="cat-name"
              required
              minLength={2}
              maxLength={200}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>

          <Field
            label="Slug"
            htmlFor="cat-slug"
            hint={
              editing
                ? "Lowercase with hyphens. Leave unchanged to keep the current URL."
                : "Lowercase with hyphens. Leave blank to build it from the name."
            }
          >
            <Input
              id="cat-slug"
              placeholder="column-speakers"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </Field>

          <Field
            label="Parent category"
            htmlFor="cat-parent"
            hint="Nest this under another category, or keep it at the top level."
          >
            <Select
              id="cat-parent"
              value={parentSlug}
              onChange={(e) => setParentSlug(e.target.value)}
            >
              <option value="">Top level (no parent)</option>
              {parents.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {"  ".repeat(p.depth)}
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Description"
            htmlFor="cat-desc"
            hint="Optional. Shown on the category page."
          >
            <Textarea
              id="cat-desc"
              maxLength={2000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Sort order" htmlFor="cat-sort" hint="Lower numbers appear first.">
              <Input
                id="cat-sort"
                type="number"
                min={0}
                step={1}
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              />
            </Field>
            <div className="flex items-end pb-2.5">
              <label className="text-ink flex items-center gap-2.5 text-sm">
                <input
                  type="checkbox"
                  className="border-input h-4 w-4 rounded-xs border"
                  style={{ accentColor: "var(--brand)" }}
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                />
                Feature this category
              </label>
            </div>
          </div>

          <div className="border-border space-y-5 border-t pt-5">
            <Field
              label="Search listing title"
              htmlFor="cat-seo-title"
              hint="Optional. Overrides the page title in search results."
            >
              <Input
                id="cat-seo-title"
                maxLength={160}
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
              />
            </Field>
            <Field
              label="Search listing description"
              htmlFor="cat-seo-desc"
              hint="Optional. Up to 320 characters."
            >
              <Textarea
                id="cat-seo-desc"
                maxLength={320}
                value={seoDesc}
                onChange={(e) => setSeoDesc(e.target.value)}
              />
            </Field>
          </div>
        </CardBody>
      </Card>

      <div className="mt-5 flex items-center gap-3">
        <Button type="submit" variant="primary" disabled={busy}>
          {busy ? "Saving..." : editing ? "Save changes" : "Create category"}
        </Button>
        <Link href="/admin/categories" className={cn(BTN, BTN_SECONDARY)}>
          Cancel
        </Link>
      </div>
    </form>
  )
}
