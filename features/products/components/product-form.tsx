"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ImageIcon, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Field } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { Card, CardBody } from "@/components/ui/card"
import { BTN, BTN_ICON, BTN_SECONDARY } from "@/components/shared/button-styles"
import { cn } from "@/lib/utils"

export type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED"
export type BrandOption = { slug: string; name: string }
export type CategoryOption = { slug: string; name: string; depth: number }
type SpecRow = { key: string; value: string }
type ImageRow = { key: string; alt: string }

export type ProductFormProduct = {
  id: string
  name: string
  slug: string
  modelNumber: string | null
  sku: string | null
  shortDesc: string | null
  description: string | null
  price: number
  mrp: number | null
  stock: number
  warranty: string | null
  categorySlug: string
  extraCategorySlugs: string[]
  brandSlug: string
  status: ProductStatus
  featured: boolean
  specs: SpecRow[]
  images: ImageRow[]
  seoTitle: string | null
  seoDesc: string | null
}

type FormValues = {
  name: string
  slug: string
  modelNumber: string
  sku: string
  shortDesc: string
  description: string
  price: string
  mrp: string
  stock: string
  warranty: string
  categorySlug: string
  brandSlug: string
  status: ProductStatus
  featured: boolean
  seoTitle: string
  seoDesc: string
}

type ApiResponse = {
  success: boolean
  error?: {
    message?: string
    details?: { fieldErrors?: Record<string, string[]>; formErrors?: string[] }
  }
}

const STATUS_CHOICES: { value: ProductStatus; label: string }[] = [
  { value: "ACTIVE", label: "Active (visible in the shop)" },
  { value: "DRAFT", label: "Draft (hidden)" },
  { value: "ARCHIVED", label: "Archived (retired)" },
]

const normaliseKey = (key: string) => key.trim().replace(/^\/+/, "")

export function ProductForm({
  product,
  categoryOptions,
  brandOptions,
}: {
  product?: ProductFormProduct
  categoryOptions: CategoryOption[]
  brandOptions: BrandOption[]
}) {
  const router = useRouter()
  const editing = Boolean(product)

  const [values, setValues] = useState<FormValues>({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    modelNumber: product?.modelNumber ?? "",
    sku: product?.sku ?? "",
    shortDesc: product?.shortDesc ?? "",
    description: product?.description ?? "",
    price: product ? String(product.price) : "",
    mrp: product?.mrp != null ? String(product.mrp) : "",
    stock: product ? String(product.stock) : "0",
    warranty: product?.warranty ?? "",
    categorySlug: product?.categorySlug ?? "",
    brandSlug: product?.brandSlug ?? "ahuja",
    status: product?.status ?? "ACTIVE",
    featured: product?.featured ?? false,
    seoTitle: product?.seoTitle ?? "",
    seoDesc: product?.seoDesc ?? "",
  })
  const [extraCategorySlugs, setExtraCategorySlugs] = useState<string[]>(product?.extraCategorySlugs ?? [])
  const [specs, setSpecs] = useState<SpecRow[]>(product?.specs ?? [])
  const [images, setImages] = useState<ImageRow[]>(product?.images ?? [])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  function toggleExtra(slug: string) {
    setExtraCategorySlugs((current) =>
      current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug],
    )
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setErrors({})

    const payload = {
      name: values.name.trim(),
      slug: values.slug.trim(),
      modelNumber: values.modelNumber.trim(),
      sku: values.sku.trim(),
      shortDesc: values.shortDesc.trim(),
      description: values.description.trim(),
      price: Number(values.price),
      mrp: values.mrp.trim() === "" ? null : Number(values.mrp),
      stock: Number(values.stock) || 0,
      warranty: values.warranty.trim(),
      categorySlug: values.categorySlug,
      extraCategorySlugs: extraCategorySlugs.filter((s) => s !== values.categorySlug),
      brandSlug: values.brandSlug || "ahuja",
      status: values.status,
      featured: values.featured,
      specs: specs
        .map((s) => ({ key: s.key.trim(), value: s.value.trim() }))
        .filter((s) => s.key !== "" && s.value !== ""),
      images: images
        .map((im) => ({ key: normaliseKey(im.key), alt: im.alt.trim() }))
        .filter((im) => im.key !== ""),
      seoTitle: values.seoTitle.trim(),
      seoDesc: values.seoDesc.trim(),
    }

    try {
      const res = await fetch(editing ? `/api/admin/products/${product!.id}` : "/api/admin/products", {
        method: editing ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as ApiResponse

      if (data.success) {
        toast.success(editing ? "Product saved." : "Product created.")
        router.push("/admin/products")
        router.refresh()
        return
      }

      const fieldErrors = data.error?.details?.fieldErrors
      if (fieldErrors) {
        const mapped: Record<string, string> = {}
        for (const [key, messages] of Object.entries(fieldErrors)) {
          if (Array.isArray(messages) && messages[0]) mapped[key] = messages[0]
        }
        setErrors(mapped)
      }
      toast.error(data.error?.message ?? "Could not save the product. Check the fields and try again.")
    } catch {
      toast.error("We could not reach the server. Check your connection and try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Main column */}
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardBody className="space-y-4">
            <h2 className="font-display text-lg text-ink">Basics</h2>
            <Field label="Name" htmlFor="name" error={errors.name}>
              <Input
                id="name"
                required
                value={values.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Ahuja DPA-570M PA mixer amplifier"
              />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Slug"
                htmlFor="slug"
                error={errors.slug}
                hint="Lowercase with hyphens. Leave blank to generate from the name."
              >
                <Input
                  id="slug"
                  value={values.slug}
                  onChange={(e) => update("slug", e.target.value)}
                  placeholder="ahuja-dpa-570m"
                  className="font-mono"
                />
              </Field>
              <Field label="Model number" htmlFor="modelNumber" error={errors.modelNumber}>
                <Input
                  id="modelNumber"
                  value={values.modelNumber}
                  onChange={(e) => update("modelNumber", e.target.value)}
                  placeholder="DPA-570M"
                  className="font-mono"
                />
              </Field>
            </div>
            <Field label="SKU" htmlFor="sku" error={errors.sku} hint="Your stock-keeping code. Must be unique.">
              <Input
                id="sku"
                value={values.sku}
                onChange={(e) => update("sku", e.target.value)}
                placeholder="AHJ-DPA570M"
                className="font-mono"
              />
            </Field>
            <Field
              label="Short description"
              htmlFor="shortDesc"
              error={errors.shortDesc}
              hint="One line shown on listing cards. Lead with the fact: watts, channels, outputs."
            >
              <Textarea
                id="shortDesc"
                rows={2}
                value={values.shortDesc}
                onChange={(e) => update("shortDesc", e.target.value)}
                placeholder="60 W PA mixer amplifier, three mic inputs, USB and SD player, 100 V and low-impedance outputs."
              />
            </Field>
            <Field label="Description" htmlFor="description" error={errors.description}>
              <Textarea
                id="description"
                rows={6}
                value={values.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Full product details for the product page."
              />
            </Field>
            <Field
              label="Warranty"
              htmlFor="warranty"
              error={errors.warranty}
              hint="Stated on the product page, for example: 1 year Ahuja manufacturer warranty."
            >
              <Input
                id="warranty"
                value={values.warranty}
                onChange={(e) => update("warranty", e.target.value)}
                placeholder="1 year Ahuja manufacturer warranty"
              />
            </Field>
          </CardBody>
        </Card>

        {/* Specifications */}
        <Card>
          <CardBody className="space-y-4">
            <div>
              <h2 className="font-display text-lg text-ink">Specifications</h2>
              <p className="mt-1 text-sm text-ink-muted">
                Key and value rows, shown as the spec table. For example: Power output, 60 W RMS.
              </p>
            </div>
            {errors.specs && <p className="text-xs text-danger">{errors.specs}</p>}
            {specs.length > 0 && (
              <div className="space-y-2">
                {specs.map((row, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Input
                      aria-label={`Spec ${index + 1} name`}
                      placeholder="Power output"
                      value={row.key}
                      onChange={(e) =>
                        setSpecs((current) => current.map((r, i) => (i === index ? { ...r, key: e.target.value } : r)))
                      }
                    />
                    <Input
                      aria-label={`Spec ${index + 1} value`}
                      placeholder="60 W RMS"
                      className="font-mono"
                      value={row.value}
                      onChange={(e) =>
                        setSpecs((current) =>
                          current.map((r, i) => (i === index ? { ...r, value: e.target.value } : r)),
                        )
                      }
                    />
                    <button
                      type="button"
                      className={cn(BTN_ICON, "shrink-0 text-ink-muted hover:bg-accent hover:text-danger")}
                      onClick={() => setSpecs((current) => current.filter((_, i) => i !== index))}
                      aria-label={`Remove spec ${index + 1}`}
                    >
                      <Trash2 className="h-[18px] w-[18px]" strokeWidth={1.75} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <Button
              type="button"
              variant="secondary"
              onClick={() => setSpecs((current) => [...current, { key: "", value: "" }])}
            >
              <Plus className="h-[18px] w-[18px]" strokeWidth={1.75} />
              Add spec
            </Button>
          </CardBody>
        </Card>

        {/* Images */}
        <Card>
          <CardBody className="space-y-4">
            <div>
              <h2 className="font-display text-lg text-ink">Images</h2>
              <p className="mt-1 text-sm text-ink-muted">
                Stored image keys, for example catalog/ahuja-dpa-570m/0.jpg. The first image is the main photo.
              </p>
            </div>
            {errors.images && <p className="text-xs text-danger">{errors.images}</p>}
            {images.length > 0 && (
              <div className="space-y-3">
                {images.map((row, index) => {
                  const previewSrc = normaliseKey(row.key)
                  return (
                    <div key={index} className="flex items-start gap-3">
                      <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-border bg-white p-1">
                        {previewSrc ? (
                          <Image
                            src={`/${previewSrc}`}
                            alt={row.alt || "Product image preview"}
                            width={56}
                            height={56}
                            unoptimized
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-ink-muted" strokeWidth={1.75} />
                        )}
                      </span>
                      <div className="flex-1 space-y-2">
                        <Input
                          aria-label={`Image ${index + 1} key`}
                          placeholder="catalog/ahuja-dpa-570m/0.jpg"
                          className="font-mono"
                          value={row.key}
                          onChange={(e) =>
                            setImages((current) =>
                              current.map((r, i) => (i === index ? { ...r, key: e.target.value } : r)),
                            )
                          }
                        />
                        <Input
                          aria-label={`Image ${index + 1} alt text`}
                          placeholder="Ahuja DPA-570M mixer amplifier, front panel"
                          value={row.alt}
                          onChange={(e) =>
                            setImages((current) =>
                              current.map((r, i) => (i === index ? { ...r, alt: e.target.value } : r)),
                            )
                          }
                        />
                      </div>
                      <button
                        type="button"
                        className={cn(BTN_ICON, "shrink-0 text-ink-muted hover:bg-accent hover:text-danger")}
                        onClick={() => setImages((current) => current.filter((_, i) => i !== index))}
                        aria-label={`Remove image ${index + 1}`}
                      >
                        <Trash2 className="h-[18px] w-[18px]" strokeWidth={1.75} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
            <Button
              type="button"
              variant="secondary"
              onClick={() => setImages((current) => [...current, { key: "", alt: "" }])}
            >
              <Plus className="h-[18px] w-[18px]" strokeWidth={1.75} />
              Add image
            </Button>
          </CardBody>
        </Card>

        {/* SEO */}
        <Card>
          <CardBody className="space-y-4">
            <h2 className="font-display text-lg text-ink">Search listing</h2>
            <Field
              label="SEO title"
              htmlFor="seoTitle"
              error={errors.seoTitle}
              hint="Shown in search results. Falls back to the product name if blank."
            >
              <Input id="seoTitle" value={values.seoTitle} onChange={(e) => update("seoTitle", e.target.value)} />
            </Field>
            <Field label="SEO description" htmlFor="seoDesc" error={errors.seoDesc}>
              <Textarea
                id="seoDesc"
                rows={3}
                value={values.seoDesc}
                onChange={(e) => update("seoDesc", e.target.value)}
              />
            </Field>
          </CardBody>
        </Card>
      </div>

      {/* Side column */}
      <div className="space-y-6">
        <Card>
          <CardBody className="space-y-4">
            <h2 className="font-display text-lg text-ink">Status</h2>
            <Field label="Visibility" htmlFor="status" error={errors.status}>
              <Select
                id="status"
                value={values.status}
                onChange={(e) => update("status", e.target.value as ProductStatus)}
              >
                {STATUS_CHOICES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </Field>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                className="h-[18px] w-[18px] shrink-0 rounded-sm border border-border-strong accent-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                checked={values.featured}
                onChange={(e) => update("featured", e.target.checked)}
              />
              Feature on the home page
            </label>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-4">
            <h2 className="font-display text-lg text-ink">Pricing and stock</h2>
            <Field label="Selling price (Rs)" htmlFor="price" error={errors.price} hint="Inclusive of GST.">
              <Input
                id="price"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                required
                className="font-mono"
                value={values.price}
                onChange={(e) => update("price", e.target.value)}
                placeholder="6490"
              />
            </Field>
            <Field
              label="MRP (Rs)"
              htmlFor="mrp"
              error={errors.mrp}
              hint="Printed price, shown struck through. Leave blank if there is no discount."
            >
              <Input
                id="mrp"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                className="font-mono"
                value={values.mrp}
                onChange={(e) => update("mrp", e.target.value)}
                placeholder="7690"
              />
            </Field>
            <Field label="Stock" htmlFor="stock" error={errors.stock} hint="Units on hand. Below 5 shows a low-stock warning.">
              <Input
                id="stock"
                type="number"
                inputMode="numeric"
                min={0}
                step="1"
                className="font-mono"
                value={values.stock}
                onChange={(e) => update("stock", e.target.value)}
              />
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-4">
            <h2 className="font-display text-lg text-ink">Organisation</h2>
            <Field label="Category" htmlFor="categorySlug" error={errors.categorySlug}>
              <Select
                id="categorySlug"
                required
                value={values.categorySlug}
                onChange={(e) => update("categorySlug", e.target.value)}
              >
                <option value="">Choose a category</option>
                {categoryOptions.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {String.fromCharCode(0xa0).repeat(c.depth * 2) + c.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Brand" htmlFor="brandSlug" error={errors.brandSlug}>
              {brandOptions.length > 0 ? (
                <Select
                  id="brandSlug"
                  value={values.brandSlug}
                  onChange={(e) => update("brandSlug", e.target.value)}
                >
                  {brandOptions.map((b) => (
                    <option key={b.slug} value={b.slug}>
                      {b.name}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input id="brandSlug" value={values.brandSlug} onChange={(e) => update("brandSlug", e.target.value)} />
              )}
            </Field>

            <div>
              <Label>Also list in</Label>
              {categoryOptions.length > 0 ? (
                <div className="max-h-56 space-y-1 overflow-y-auto rounded-sm border border-border bg-card p-2">
                  {categoryOptions.map((c) => {
                    const disabled = c.slug === values.categorySlug
                    return (
                      <label
                        key={c.slug}
                        className={cn(
                          "flex items-center gap-2 rounded-sm px-2 py-1 text-sm",
                          disabled ? "text-ink-muted" : "text-ink hover:bg-accent",
                        )}
                        style={{ paddingLeft: `${c.depth * 16 + 8}px` }}
                      >
                        <input
                          type="checkbox"
                          className="h-[18px] w-[18px] shrink-0 rounded-sm border border-border-strong accent-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                          checked={disabled || extraCategorySlugs.includes(c.slug)}
                          disabled={disabled}
                          onChange={() => toggleExtra(c.slug)}
                        />
                        {c.name}
                      </label>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-ink-muted">No other categories yet.</p>
              )}
              <p className="mt-1 text-xs text-ink-muted">Extra categories this product also appears in.</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-5 lg:col-span-3">
        <Link href="/admin/products" className={cn(BTN, BTN_SECONDARY)}>
          Cancel
        </Link>
        <Button type="submit" disabled={busy}>
          {busy ? "Saving..." : editing ? "Save changes" : "Create product"}
        </Button>
      </div>
    </form>
  )
}
