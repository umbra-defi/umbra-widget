export function toBaseUnits(amount: string, decimals: number): bigint {
  if (!amount) return 0n
  const [whole, frac = ''] = amount.split('.')
  const fracPadded = (frac + '0'.repeat(decimals)).slice(0, decimals)
  const digits = `${whole}${fracPadded}`.replace(/^0+(?=\d)/, '')
  return BigInt(digits || '0')
}

export function fromBaseUnits(value: bigint, decimals: number): string {
  const negative = value < 0n
  const abs = negative ? -value : value
  const s = abs.toString().padStart(decimals + 1, '0')
  const whole = s.slice(0, s.length - decimals)
  const frac = s.slice(s.length - decimals).replace(/0+$/, '')
  return `${negative ? '-' : ''}${whole}${frac ? `.${frac}` : ''}`
}
