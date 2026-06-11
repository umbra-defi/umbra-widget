import * as TabsPrimitive from '@radix-ui/react-tabs'
import type { ComponentPropsWithoutRef, ElementRef } from 'react'
import { forwardRef } from 'react'
import { cn } from '@/ui/lib/utils'

export const Tabs = TabsPrimitive.Root

export const TabsList = forwardRef<
  ElementRef<typeof TabsPrimitive.List>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'flex w-full flex-nowrap items-center gap-0.5 overflow-x-auto',
      'rounded-[var(--uw-tab-radius)] bg-[var(--uw-tab-row-bg)] p-[var(--uw-tab-row-padding)]',
      className
    )}
    {...props}
  />
))
TabsList.displayName = 'TabsList'

export const TabsTrigger = forwardRef<
  ElementRef<typeof TabsPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'min-w-0 flex-1 basis-0 whitespace-nowrap px-3 py-1.5 text-center text-[13px] font-semibold text-uw-text-tertiary transition-colors hover:text-uw-text',
      'rounded-[var(--uw-tab-radius)] border border-[var(--uw-tab-border)] bg-[var(--uw-tab-bg)]',
      'data-[state=active]:bg-uw-tab-active data-[state=active]:font-bold data-[state=active]:text-uw-primary',
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = 'TabsTrigger'

export const TabsContent = forwardRef<
  ElementRef<typeof TabsPrimitive.Content>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn('mt-4 focus:outline-none', className)}
    {...props}
  />
))
TabsContent.displayName = 'TabsContent'
