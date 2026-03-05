import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer",
  {
    variants: {
      variant: {
        default: "shadow-sm",
        destructive: "shadow-sm",
        outline: "border shadow-sm",
        secondary: "shadow-sm",
        ghost: "",
        link: "underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
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
  style,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  const getVariantStyles = () => {
    switch (variant) {
      case 'default':
        return {
          backgroundColor: 'var(--primary)',
          color: 'var(--primary-foreground)',
          ...style
        }
      case 'destructive':
        return {
          backgroundColor: 'var(--destructive)',
          color: 'var(--destructive-foreground)',
          ...style
        }
      case 'outline':
        return {
          backgroundColor: 'var(--background)',
          color: 'var(--foreground)',
          borderColor: 'var(--border)',
          ...style
        }
      case 'secondary':
        return {
          backgroundColor: 'var(--secondary)',
          color: 'var(--secondary-foreground)',
          ...style
        }
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--foreground)',
          ...style
        }
      case 'link':
        return {
          backgroundColor: 'transparent',
          color: 'var(--primary)',
          ...style
        }
      default:
        return style
    }
  }

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      style={getVariantStyles()}
      onMouseEnter={(e) => {
        const target = e.currentTarget as HTMLElement
        switch (variant) {
          case 'default':
            target.style.opacity = '0.9'
            break
          case 'destructive':
            target.style.opacity = '0.9'
            break
          case 'outline':
            target.style.backgroundColor = 'var(--accent)'
            break
          case 'secondary':
            target.style.opacity = '0.8'
            break
          case 'ghost':
            target.style.backgroundColor = 'var(--accent)'
            break
        }
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget as HTMLElement
        switch (variant) {
          case 'default':
            target.style.opacity = '1'
            break
          case 'destructive':
            target.style.opacity = '1'
            break
          case 'outline':
            target.style.backgroundColor = 'var(--background)'
            break
          case 'secondary':
            target.style.opacity = '1'
            break
          case 'ghost':
            target.style.backgroundColor = 'transparent'
            break
        }
      }}
      {...props}
    />
  )
}

export { Button, buttonVariants }
