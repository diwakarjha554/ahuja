/** Remounts on every navigation, so each storefront page fades in. */
export default function MarketingTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-in">{children}</div>
}
