const priceFormatter = new Intl.NumberFormat('ru-RU')

export const formatPrice = (value) => `${priceFormatter.format(value)} ₽`

// 8.6 -> "8,6"
export const formatScore = (value) => value.toFixed(1).replace('.', ',')

// plural(5, ['товар', 'товара', 'товаров']) -> "товаров"
export function plural(n, [one, few, many]) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}

// formatNumber(2.456, 2) -> "2,46"
export const formatNumber = (value, digits = 1) => value.toFixed(digits).replace('.', ',')
