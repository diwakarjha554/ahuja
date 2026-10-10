import type { Metadata } from "next"
import { Archivo, Inter, IBM_Plex_Mono, Noto_Sans_Devanagari } from "next/font/google"
import { Toaster } from "sonner"

import { siteConfig } from "@/lib/config/site"
import "./globals.css"

// Variable, with the width axis: the home hero line is set condensed.
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap", axes: ["wdth"] })
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  display: "swap",
  weight: ["400", "500", "600"],
})
const notoDeva = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  variable: "--font-noto-deva",
  display: "swap",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name}: Ahuja PA equipment in Delhi`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    siteName: siteConfig.name,
    type: "website",
    locale: "en_IN",
    url: siteConfig.url,
  },
  twitter: { card: "summary" },
  icons: { icon: "/icon.png", shortcut: "/icon.png", apple: "/icon.png" },
  alternates: { canonical: "/" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${inter.variable} ${plexMono.variable} ${notoDeva.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-background text-foreground antialiased">
        {children}
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  )
}
