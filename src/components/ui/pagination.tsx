import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex items-center gap-3", className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">

function PaginationLink({
  className,
  isActive,
  size = "icon-sm",
  ...props
}: PaginationLinkProps) {
  const { href, children, ...restProps } = props

  return (
    <Button
      asChild
      variant="ghost"
      size={size}
      data-active={isActive}
      className={cn(
        "border border-black/10 bg-background text-[11px] font-semibold tracking-[0.2em] hover:border-black/60 hover:bg-surface-container-high data-[active=true]:border-transparent data-[active=true]:bg-transparent data-[active=true]:text-primary data-[active=true]:underline data-[active=true]:decoration-2 data-[active=true]:underline-offset-8",
        className
      )}
    >
      <a
        aria-current={isActive ? "page" : undefined}
        data-slot="pagination-link"
        href={href}
        {...restProps}
      >
        {children}
      </a>
    </Button>
  )
}

function PaginationPrevious({
  className,
  text = "Prev",
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="icon-sm"
      className={cn("px-2.5", className)}
      {...props}
    >
      <ChevronLeftIcon data-icon="inline-start" />
      <span className="sr-only md:not-sr-only md:text-[11px] md:tracking-[0.2em]">{text}</span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  text = "Next",
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="icon-sm"
      className={cn("px-2.5", className)}
      {...props}
    >
      <span className="sr-only md:not-sr-only md:text-[11px] md:tracking-[0.2em]">{text}</span>
      <ChevronRightIcon data-icon="inline-end" />
    </PaginationLink>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-10 items-center justify-center border border-black/10 text-black/40 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <MoreHorizontalIcon />
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
