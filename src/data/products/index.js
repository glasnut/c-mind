
import { gpus } from './gpus.js'
import { cpus } from './cpus.js'
import { motherboards } from './motherboards.js'
import { ram } from './ram.js'
import { storage } from './storage.js'
import { psus } from './psus.js'
import { cases } from './cases.js'
import { coolers } from './coolers.js'
import prices from './prices.json'

const withPrices = (product) => {
  const data = prices[product.id]

  if (!data) return product

  const conditionalPrice = Number(data.price)

  return {
    ...product,

    price:
      data.price != null &&
      data.price !== '' &&
      Number.isFinite(conditionalPrice) &&
      conditionalPrice > 0
        ? conditionalPrice
        : product.price,

    dnsPrice:
      data.dnsPrice != null && data.dnsPrice !== ''
        ? Number(data.dnsPrice)
        : null,

    dnsRating: data.dnsRating,
    dnsUrl: data.dnsUrl,
  }
}

export const PRODUCTS = [
  ...gpus,
  ...cpus,
  ...motherboards,
  ...ram,
  ...storage,
  ...psus,
  ...cases,
  ...coolers,
].map(withPrices)
