import type { SVGProps } from 'react'

/** Vertical up/down transfer arrows — the secondary-amount marker. */
export function TransferVerticalIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width='14'
      height='14'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      {...props}
    >
      <path d='M7 4v16M7 20l-3-3M7 20l3-3' />
      <path d='M17 20V4M17 4l-3 3M17 4l3 3' />
    </svg>
  )
}

/** Circular refresh arrows. */
export function RefreshIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      {...props}
    >
      <path d='M21 12a9 9 0 1 1-2.64-6.36' />
      <path d='M21 3v6h-6' />
    </svg>
  )
}

/** Up/down chevrons used in the token selector pill. */
export function ChevronUpDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width='14'
      height='14'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      {...props}
    >
      <path d='M8 9l4-4 4 4M8 15l4 4 4-4' />
    </svg>
  )
}
