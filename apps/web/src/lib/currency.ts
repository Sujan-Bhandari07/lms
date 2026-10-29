const NPR_FORMATTER = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatNpr(amount: number): string {
  return `रु ${NPR_FORMATTER.format(amount)}`
}
