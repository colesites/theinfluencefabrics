import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-none border border-transparent font-semibold uppercase tracking-[0.2em] text-[11px] transition-[transform,background-color,color,opacity,border-color,filter] outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-40 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-primary-strong to-primary text-primary-foreground hover:brightness-110",
        secondary:
          "bg-secondary text-secondary-foreground hover:opacity-90 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        whatsapp:
          "border-[#25D366] bg-[#25D366] text-white hover:border-[#1eb85c] hover:bg-[#1eb85c] aria-expanded:border-[#1eb85c] aria-expanded:bg-[#1eb85c]",
        outline:
          "border-black/15 bg-transparent text-foreground hover:border-black/60 hover:bg-surface-container-high",
        ghost:
          "border-transparent bg-transparent text-foreground hover:bg-surface-container-high",
        destructive:
          "bg-destructive text-white hover:brightness-95",
        link: "h-auto border-transparent bg-transparent px-0 py-0 text-foreground underline underline-offset-6 decoration-2 hover:text-primary",
        tertiary:
          "h-auto border-transparent bg-transparent px-0 py-0 text-foreground underline underline-offset-6 decoration-2 hover:text-primary",
      },
      size: {
        default:
          "h-12 gap-2 px-8 has-data-[icon=inline-end]:pr-6 has-data-[icon=inline-start]:pl-6",
        xs: "h-8 gap-1 px-3 text-[10px]",
        sm: "h-10 gap-1.5 px-5 text-[10px]",
        lg: "h-14 gap-2.5 px-12 text-xs",
        icon: "size-12",
        "icon-xs": "size-8",
        "icon-sm": "size-10",
        "icon-lg": "size-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
