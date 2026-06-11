import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { cn } from '@/ui/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center font-semibold transition-opacity disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-uw-primary text-uw-primary-fg hover:opacity-90',
        ghost: 'bg-transparent text-uw-text-secondary hover:text-uw-text',
        danger: 'bg-uw-danger text-white hover:opacity-90'
      },
      size: {
        block: 'w-full rounded-uw-lg py-4 text-[18px] tracking-[-0.36px]',
        sm: 'rounded-uw-md px-3 py-2 text-sm'
      }
    },
    defaultVariants: { variant: 'primary', size: 'block' }
  }
)

export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
)
Button.displayName = 'Button'
