import { notFound } from "next/navigation"
import Link from "next/link"

import { PageHeader } from "@/components/shared/page-header"
import {
  ProductForm,
  type CategoryOption,
  type ProductFormProduct,
  type ProductStatus,
} from "@/features/products/components/product-form"
import { getAdminProduct } from "@/features/products/server/products.service"
import { categoryTree, type CategoryNode } from "@/features/catalog/server/catalog.queries"
import { listBrands } from "@/features/catalog/server/brands.service"
import { BTN, BTN_GHOST } from "@/components/shared/button-styles"
import { cn } from "@/lib/utils"

type RawAdminProduct = {
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
  brandSlug: string
  extraCategorySlugs: string[]
  status: ProductStatus
  featured: boolean
  specs: { key: string; value: string }[]
  images: { key: string; alt: string }[]
  seoTitle: string | null
  seoDesc: string | null
}

function flattenCategories(nodes: CategoryNode[], depth = 0): CategoryOption[] {
  return nodes.flatMap((node) => [
    { slug: node.slug, name: node.name, depth },
    ...flattenCategories(node.children, depth + 1),
  ])
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [result, tree, brandsResult] = await Promise.all([getAdminProduct(id), categoryTree(), listBrands()])

  if (!result.ok) notFound()

  const raw = result.data as RawAdminProduct
  const product: ProductFormProduct = {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    modelNumber: raw.modelNumber,
    sku: raw.sku,
    shortDesc: raw.shortDesc,
    description: raw.description,
    price: raw.price,
    mrp: raw.mrp,
    stock: raw.stock,
    warranty: raw.warranty,
    categorySlug: raw.categorySlug,
    extraCategorySlugs: Array.isArray(raw.extraCategorySlugs) ? raw.extraCategorySlugs : [],
    brandSlug: raw.brandSlug || "ahuja",
    status: raw.status,
    featured: raw.featured,
    specs: Array.isArray(raw.specs) ? raw.specs : [],
    images: Array.isArray(raw.images) ? raw.images.map((im) => ({ key: im.key, alt: im.alt ?? "" })) : [],
    seoTitle: raw.seoTitle,
    seoDesc: raw.seoDesc,
  }

  const categoryOptions = flattenCategories(tree)
  const brandOptions = brandsResult.ok ? brandsResult.data.map((b) => ({ slug: b.slug, name: b.name })) : []

  return (
    <div>
      <PageHeader
        title="Edit product"
        subtitle={product.modelNumber ? `${product.name} (${product.modelNumber})` : product.name}
        actions={
          <Link href={`/products/${product.slug}`} className={cn(BTN, BTN_GHOST, "text-brand")} prefetch={false}>
            View in shop
          </Link>
        }
      />
      <ProductForm product={product} categoryOptions={categoryOptions} brandOptions={brandOptions} />
    </div>
  )
}
