import { PageHeader } from "@/components/shared/page-header"
import { ProductForm, type CategoryOption } from "@/features/products/components/product-form"
import { categoryTree, type CategoryNode } from "@/features/catalog/server/catalog.queries"
import { listBrands } from "@/features/catalog/server/brands.service"

function flattenCategories(nodes: CategoryNode[], depth = 0): CategoryOption[] {
  return nodes.flatMap((node) => [
    { slug: node.slug, name: node.name, depth },
    ...flattenCategories(node.children, depth + 1),
  ])
}

export default async function NewProductPage() {
  const [tree, brandsResult] = await Promise.all([categoryTree(), listBrands()])
  const categoryOptions = flattenCategories(tree)
  const brandOptions = brandsResult.ok ? brandsResult.data.map((b) => ({ slug: b.slug, name: b.name })) : []

  return (
    <div>
      <PageHeader title="New product" subtitle="Add an Ahuja product with its model number, price, stock and specs." />
      <ProductForm categoryOptions={categoryOptions} brandOptions={brandOptions} />
    </div>
  )
}
