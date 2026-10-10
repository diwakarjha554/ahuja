// Canonical site identity. The one place the shop's facts live, quoted by the
// storefront, the footer, policies, emails, invoices, metadata and llms.txt.
// NEXT_PUBLIC_SITE_URL drives absolute URLs so the same code is correct across
// local, staging and production without a hardcoded domain.

const cleanOrigin = (v: string | undefined) => {
  const t = v?.trim().replace(/\/+$/, "")
  return t ? t : undefined
}

const ORIGIN_FALLBACK =
  process.env.NODE_ENV === "production" ? "https://ahujapaworld.com" : "http://localhost:3000"

export const siteConfig = {
  name: "Ahuja PA World",
  shortName: "Ahuja PA World",
  tagline: "Ahuja public-address equipment, supplied and serviced from Delhi",
  description:
    "Authorised dealer of Ahuja Radios public-address equipment. Amplifiers, speakers, mixers, microphones, megaphones and classroom systems, with GST invoicing and delivery across India.",

  url: cleanOrigin(process.env.NEXT_PUBLIC_SITE_URL) ?? ORIGIN_FALLBACK,

  // A dealer, not the manufacturer. We sell Ahuja Radios equipment; the brand
  // name is used in text, never as our own logo.
  dealerOf: "Ahuja Radios",
  authorisedDealer: true,

  email: "sales@ahujapaworld.com",
  supportEmail: "support@ahujapaworld.com",
  grievanceEmail: "support@ahujapaworld.com",
  // Digits only for tel: and wa.me links, and as written for display.
  phones: [
    { display: "011-4709 0169", tel: "+911147090169" },
    { display: "011-4145 0169", tel: "+911141450169" },
  ],
  whatsapp: { number: "919999999999", display: "+91 99999 99999" },

  address: {
    line1: "New Delhi",
    city: "Delhi",
    state: "Delhi",
    pin: "110001",
    country: "India",
  },

  // Business facts about the manufacturer, shown as supplier credentials (verified).
  manufacturer: {
    name: "Ahuja Radios",
    since: 1940,
    note: "India's leading manufacturer and exporter of public-address equipment since 1940.",
  },

  social: {
    instagram: "",
    youtube: "",
    facebook: "",
  },

  // Promises stated once and quoted everywhere (policies, FAQ, checkout, emails).
  promise: {
    dispatchDays: "2 to 4 working days",
    deliveryDays: "4 to 8 working days",
    warranty: "Manufacturer warranty on all Ahuja products",
    returnDays: 7,
    damageReportHours: 48,
    refundDays: "7 working days",
    supportReply: "one working day",
    gstInvoice: true,
  },

  // Public analytics ids live here (they ship in page source). Empty = off.
  googleAnalyticsId: "",
} as const

export type SiteConfig = typeof siteConfig

/** Build an absolute URL from a site-relative path. */
export function absoluteUrl(path = "/"): string {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`
}
