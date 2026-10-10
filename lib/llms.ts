import "server-only"

// Builders for /llms.txt and /llms-full.txt (https://llmstxt.org). A link-first
// markdown index of the store for answer engines; the -full variant inlines
// product specs, category descriptions and blog article text.

import { siteConfig, absoluteUrl } from "@/lib/config/site"
import { categoryTree, listProducts, type CategoryNode } from "@/features/catalog/server/catalog.queries"
import { hasDatabase } from "@/lib/env"
import { productsForLlms } from "@/features/catalog/server/static-catalog"
import { db } from "@/server/db"

const KEY_PAGES: { path: string; label: string; desc: string }[] = [
  { path: "/", label: "Home", desc: siteConfig.description },
  { path: "/products", label: "All products", desc: "The full Ahuja catalogue, filterable by category, price and stock." },
  { path: "/categories", label: "Categories", desc: "Browse by speaker, amplifier, mixer, microphone, classroom and counter systems." },
  { path: "/bulk-quote", label: "Bulk quote", desc: "Request GST-invoiced pricing for schools, offices, events and institutions." },
  { path: "/about", label: "About", desc: `${siteConfig.name}, authorised dealer of ${siteConfig.dealerOf} in Delhi.` },
  { path: "/contact", label: "Contact", desc: "Phone, WhatsApp and address for sales and service." },
]

const LEGAL_PAGES: { path: string; label: string }[] = [
  { path: "/policies/privacy", label: "Privacy Policy" },
  { path: "/policies/terms", label: "Terms and Conditions" },
  { path: "/policies/shipping", label: "Shipping and Delivery" },
  { path: "/policies/returns", label: "Cancellation and Refunds" },
]

function header(): string {
  const p = siteConfig.phones.map((x) => x.display).join(", ")
  return [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.description}`,
    "",
    `Authorised dealer of ${siteConfig.dealerOf} public-address equipment. Based in ${siteConfig.address.city}, India. GST invoices provided. Phone: ${p}.`,
  ].join("\n")
}

async function categoriesSection(full: boolean): Promise<string> {
  const tree = await categoryTree()
  const lines: string[] = ["## Categories", ""]
  const walk = (nodes: CategoryNode[], depth: number) => {
    for (const n of nodes) {
      const url = absoluteUrl(`/categories/${n.slug}`)
      const indent = "  ".repeat(depth)
      if (full && n.description) lines.push(`${indent}- [${n.name}](${url}) (${n.productCount}): ${n.description}`)
      else lines.push(`${indent}- [${n.name}](${url}) (${n.productCount})`)
      if (n.children.length) walk(n.children, depth + 1)
    }
  }
  walk(tree, 0)
  return lines.join("\n")
}

async function productsSection(full: boolean): Promise<string> {
  const { items } = await listProducts({ pageSize: 200, sort: "name" })
  const lines: string[] = ["## Products", ""]
  for (const p of items) {
    const url = absoluteUrl(`/products/${p.slug}`)
    const price = `Rs ${Number(p.price).toLocaleString("en-IN")}`
    lines.push(`- [${p.name}](${url}): ${price}${p.categoryName ? ` (${p.categoryName})` : ""}`)
  }
  if (!full) return lines.join("\n")

  // Full: add one block per product with its specs.
  const detail: string[] = ["", "## Product details", ""]
  const full200 = !hasDatabase()
    ? productsForLlms()
    : await db.product.findMany({
        where: { status: "ACTIVE" },
        orderBy: { name: "asc" },
        select: { slug: true, name: true, modelNumber: true, price: true, mrp: true, shortDesc: true, specs: true },
      })
  for (const p of full200) {
    const url = absoluteUrl(`/products/${p.slug}`)
    detail.push(`### ${p.name}`)
    detail.push(url)
    if (p.modelNumber) detail.push(`Model: ${p.modelNumber}`)
    detail.push(`Price: Rs ${Number(p.price).toLocaleString("en-IN")}`)
    if (p.shortDesc) detail.push("", p.shortDesc)
    const specs = Array.isArray(p.specs) ? (p.specs as { key: string; value: string }[]) : []
    if (specs.length) {
      detail.push("")
      for (const s of specs) detail.push(`- ${s.key}: ${s.value}`)
    }
    detail.push("")
  }
  return lines.join("\n") + "\n" + detail.join("\n")
}

function pagesSection(): string {
  const key = KEY_PAGES.map((p) => `- [${p.label}](${absoluteUrl(p.path)}): ${p.desc}`)
  const legal = LEGAL_PAGES.map((p) => `- [${p.label}](${absoluteUrl(p.path)})`)
  return `## Key pages\n\n${key.join("\n")}\n\n## Policies\n\n${legal.join("\n")}`
}

export async function buildLlmsTxt(): Promise<string> {
  const [cats] = await Promise.all([categoriesSection(false)])
  return [header(), "", pagesSection(), "", cats, "", await productsSection(false)].join("\n") + "\n"
}

export async function buildLlmsFullTxt(): Promise<string> {
  return (
    [header(), "", pagesSection(), "", await categoriesSection(true), "", await productsSection(true)].join("\n") + "\n"
  )
}
