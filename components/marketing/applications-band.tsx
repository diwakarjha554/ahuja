import Link from "next/link"
import { School, Church, Building2, CalendarDays, ArrowRight } from "lucide-react"

import { Section } from "@/components/shared/section"
import { Reveal } from "@/components/shared/reveal"

/** Typical setups by place. Copy names the gear rather than selling a feeling. */
const APPLICATIONS = [
  {
    icon: School,
    title: "Schools and colleges",
    desc: "Ceiling speakers on a 100 V line amplifier for classrooms, corridors and the assembly ground.",
  },
  {
    icon: Church,
    title: "Places of worship",
    desc: "Horn and column speakers for even coverage across a hall or an open courtyard.",
  },
  {
    icon: Building2,
    title: "Offices and factories",
    desc: "Paging and background music on reliable 100 V line systems that run all day.",
  },
  {
    icon: CalendarDays,
    title: "Events and rental",
    desc: "Portable trolley speakers, megaphones and wireless microphones for mobile use.",
  },
]

export function ApplicationsBand() {
  return (
    <Section
      title="Systems by place"
      description="Typical setups for the spaces we equip most often. Tell us your room size and we will size it."
      className="bg-background"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {APPLICATIONS.map(({ icon: Icon, title, desc }, i) => (
          <Reveal key={title} delay={i * 80}>
            <Link
              href="/blog"
              className="group flex h-full flex-col rounded-sm border border-border bg-card p-5 transition-[transform,box-shadow,border-color] duration-[200ms] ease-standard hover:-translate-y-1 hover:border-border-strong hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-sm bg-brand-soft text-brand transition-colors duration-[160ms] group-hover:bg-brand group-hover:text-white">
                <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
              <p className="mt-4 font-display text-base font-semibold text-ink">{title}</p>
              <p className="mt-2 flex-1 text-sm text-ink-muted">{desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-[15px] font-medium text-brand">
                Read the guide
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-[200ms] ease-standard group-hover:translate-x-1"
                  strokeWidth={1.75}
                  aria-hidden
                />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

export default ApplicationsBand
