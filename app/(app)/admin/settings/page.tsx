import { Settings } from "lucide-react"

import { SettingsForm } from "@/features/settings/components/settings-form"
import { getSettings } from "@/features/settings/server/settings.service"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const result = await getSettings()

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Shop contact details, the shipping rule and payment configuration."
      />
      {result.ok ? (
        <SettingsForm settings={result.data} />
      ) : (
        <EmptyState icon={Settings} title="Could not load settings" description={result.error} />
      )}
    </div>
  )
}
