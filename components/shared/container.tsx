import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react"
import { cn } from "@/lib/utils"

type ContainerProps<T extends ElementType> = {
  as?: T
  className?: string
  children: ReactNode
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">

/** The single 1600px content column with a 16px side gutter that grows on wide screens. */
export function Container<T extends ElementType = "div">({ as, className, children, ...props }: ContainerProps<T>) {
  // Typed with the props it is given, not as a bare ElementType: with three.js
  // in the JSX element union, some elements declare `children: never`, which
  // would reject the children of every Container.
  const Tag = (as ?? "div") as ElementType<{ className?: string; children?: ReactNode }>
  return (
    <Tag className={cn("mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10", className)} {...props}>
      {children}
    </Tag>
  )
}

export default Container
