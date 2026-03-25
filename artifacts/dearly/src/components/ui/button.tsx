import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md hover:-translate-y-0.5",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      outline: "border-2 border-primary/20 text-foreground hover:bg-primary/10 hover:border-primary/40",
      ghost: "hover:bg-primary/10 text-foreground hover:text-primary",
    }
    
    const sizes = {
      default: "h-10 px-5 py-2",
      sm: "h-8 rounded-full px-3 text-xs",
      lg: "h-12 rounded-full px-8 text-lg font-medium",
      icon: "h-10 w-10 justify-center",
    }

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center gap-2 rounded-full font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 active:scale-95",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
