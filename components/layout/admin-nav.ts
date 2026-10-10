import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  FolderTree,
  Tag,
  Users,
  FileText,
  Star,
  MessageSquare,
  Newspaper,
  Settings,
  UserCog,
  type LucideIcon,
} from "lucide-react"

import { PERMISSIONS, type Permission } from "@/lib/constants"

export type NavChild = { label: string; href: string }
export type NavItem = { label: string; href: string; icon: LucideIcon; scope: Permission; children?: NavChild[] }

export const DASHBOARD_HREF = "/admin"

export const NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, scope: PERMISSIONS.DASHBOARD_READ },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
    scope: PERMISSIONS.ORDER_READ,
    children: [{ label: "All orders", href: "/admin/orders?scope=all" }],
  },
  { label: "Products", href: "/admin/products", icon: Package, scope: PERMISSIONS.PRODUCT_READ },
  { label: "Categories", href: "/admin/categories", icon: FolderTree, scope: PERMISSIONS.CATALOG_WRITE },
  { label: "Brands", href: "/admin/brands", icon: Tag, scope: PERMISSIONS.CATALOG_WRITE },
  { label: "Coupons", href: "/admin/coupons", icon: Tag, scope: PERMISSIONS.COUPON_READ },
  { label: "Customers", href: "/admin/customers", icon: Users, scope: PERMISSIONS.CUSTOMER_READ },
  { label: "Quote requests", href: "/admin/quotes", icon: FileText, scope: PERMISSIONS.QUOTE_READ },
  { label: "Reviews", href: "/admin/reviews", icon: Star, scope: PERMISSIONS.REVIEW_READ },
  { label: "Inquiries", href: "/admin/inquiries", icon: MessageSquare, scope: PERMISSIONS.INQUIRY_READ },
  { label: "Blog", href: "/admin/blog", icon: Newspaper, scope: PERMISSIONS.POST_READ },
  { label: "Staff", href: "/admin/staff", icon: UserCog, scope: PERMISSIONS.SETTING_READ },
  { label: "Settings", href: "/admin/settings", icon: Settings, scope: PERMISSIONS.SETTING_READ },
]

export function navFor(permissions: readonly Permission[]): NavItem[] {
  return NAV.filter((item) => permissions.includes(item.scope))
}
