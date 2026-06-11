import iconUrl from '@/assets/icon.png'

/** Header shown at the top of the widget — brand mark + title. */
export function WidgetHeader() {
  return (
    <div className='mb-5 flex items-center gap-2.5'>
      <img
        src={iconUrl}
        alt=''
        className='inline-block h-7 w-7 rounded-lg object-cover'
      />
      <span className='text-lg font-bold text-uw-text'>Umbra Wallet</span>
    </div>
  )
}
