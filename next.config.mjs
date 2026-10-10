/**
 * Security headers hold only directives that cannot break a third party. The
 * CSP is deliberately minimal (frame-ancestors, base-uri, object-src); no
 * script-src/connect-src so Razorpay, analytics and the admin keep working.
 */
const SECURITY_HEADERS = [
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      'camera=(), microphone=(), geolocation=(), payment=(self "https://checkout.razorpay.com" "https://api.razorpay.com")',
  },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
  },
]

/** Personal data and staff-specific responses: never cached anywhere. */
const PRIVATE_ROUTES = [
  "/api/admin/:path*",
  "/api/public/checkout/:path*",
  "/api/public/track",
  "/api/me/:path*",
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  distDir: process.env.NEXT_DIST_DIR || ".next",
  serverExternalPackages: ["pdfkit"],
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [70, 80, 90],
    deviceSizes: [640, 750, 828, 1080, 1200, 1280, 1440, 1920, 2048],
    minimumCacheTTL: process.env.NODE_ENV === "development" ? 0 : 604800,
  },
  experimental: {
    inlineCss: true,
  },

  headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      ...PRIVATE_ROUTES.map((source) => ({
        source,
        headers: [{ key: "Cache-Control", value: "private, no-store" }],
      })),
    ]
  },

  redirects() {
    return [
      // The old Botble store served everything under /public/*. Those URLs are
      // indexed; send them to the clean paths with a permanent redirect.
      { source: "/public", destination: "/", permanent: true },
      { source: "/public/products/:slug", destination: "/products/:slug", permanent: true },
      { source: "/public/product-categories/:slug", destination: "/categories/:slug", permanent: true },
      { source: "/public/:path*", destination: "/:path*", permanent: true },
      // The cart is a drawer; the old /cart URL opens it on the home page.
      { source: "/cart", destination: "/?cart=open", permanent: false },
    ]
  },
}

export default nextConfig
