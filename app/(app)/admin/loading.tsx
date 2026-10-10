import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminDashboardLoading() {
  return (
    <>
      <div className="border-border mb-6 border-b pb-5">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-start justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </div>
            <Skeleton className="mt-3 h-8 w-28" />
            <Skeleton className="mt-2 h-3 w-20" />
          </Card>
        ))}
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-11 w-32" />
        </div>
        <Card className="overflow-hidden">
          <div className="border-border bg-surface-sunken border-b px-4 py-3">
            <Skeleton className="h-4 w-48" />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="border-border flex items-center gap-4 border-b px-4 py-3.5 last:border-0"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="ml-auto h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </Card>
      </div>
    </>
  )
}
