import Link from "next/link"
import { School, Church, Building2, CalendarDays, ArrowRight } from "lucide-react"

import { Section } from "@/components/shared/section"
import { Reveal } from "@/components/shared/reveal"
import { cn } from "@/lib/utils"

/** Typical setups by place. Copy names the gear rather than selling a feeling. */
const APPLICATIONS = [
  {
    icon: School,
    title: "Schools and colleges",
    desc: "Ceiling speakers on a 100 V line amplifier for classrooms, corridors and the assembly ground.",
    tone: "accent",
  },
  {
    icon: Church,
    title: "Places of worship",
    desc: "Horn and column speakers for even coverage across a hall or an open courtyard.",
    tone: "inverse",
  },
  {
    icon: Building2,
    title: "Offices and factories",
    desc: "Paging and background music on reliable 100 V line systems that run all day.",
    tone: "outline",
  },
  {
    icon: CalendarDays,
    title: "Events and rental",
    desc: "Portable trolley speakers, megaphones and wireless microphones for mobile use.",
    tone: "deep",
  },
] as const

/** Colour blocks from the palette, one per card. */
const TONE = {
  accent: "bg-brand-accent text-brand-accent-ink",
  inverse: "bg-ink text-background",
  outline: "border-2 border-border-strong bg-card text-ink",
  deep: "bg-brand-deep text-white",
} as const

/** Four colour-blocked cards that tilt a degree and lift on hover. */
export function ApplicationsBand() {
  return (
    <Section
      poster
      title="Systems by place"
      description="Typical setups for the spaces we equip most often. Tell us your room size and we will size it."
      className="bg-background"
    >
      <div className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-4">
        {APPLICATIONS.map(({ icon: Icon, title, desc, tone }, i) => (
          <Reveal key={title} delay={i * 80} className="h-full">
            <Link
              href="/blog"
              className={cn(
                "group flex h-full min-h-[300px] flex-col rounded-sm p-6 md:min-h-[360px]",
                "transition-[translate,rotate,box-shadow] duration-[240ms] ease-standard",
                "hover:-translate-y-1.5 hover:-rotate-1 hover:shadow-md",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                TONE[tone],
              )}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-sm border-2 border-current transition-transform duration-[240ms] ease-standard group-hover:rotate-6">
                <Icon className="h-6 w-6" strokeWidth={2} aria-hidden />
              </span>
              <span className="type-poster mt-auto block pt-10 text-[clamp(38px,3.4vw,52px)]">{title}</span>
              <span className="mt-3 block text-[15px] leading-relaxed opacity-80">{desc}</span>
              <span className="mt-5 inline-flex items-center gap-1.5 text-[15px] font-semibold">
                Read the guide
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-[200ms] ease-standard group-hover:translate-x-1"
                  strokeWidth={2}
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
