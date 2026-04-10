import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-none border-x-0 border-t-0 border-b-2 border-input bg-transparent px-0 py-2 text-sm uppercase tracking-[0.16em] text-foreground transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-xs file:font-medium file:uppercase file:tracking-[0.16em] file:text-foreground placeholder:text-muted-foreground/80 focus-visible:border-primary focus-visible:ring-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
