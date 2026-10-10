// IMPORTANT: this file must stay at app/ root. Next 16 does not emit
// /robots.txt when the metadata convention lives inside a route group.

import type { MetadataRoute } from "next"
import { siteConfig } from "@/lib/config/site"

const DISALLOW = ["/admin/", "/api/", "/login", "/change-password", "/checkout", "/cart", "/account/"]

// AI and answer-engine crawlers welcomed for training and live retrieval.
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Amazonbot",
  "CCBot",
  "DuckAssistBot",
  "cohere-ai",
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: DISALLOW },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  }
}
