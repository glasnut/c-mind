
const XLSX = require('xlsx')
const fs = require('fs')
const path = require('path')

const input = path.join(__dirname, '..', 'prices.xlsx')
const output = path.join(
  __dirname,
  '..',
  'src',
  'data',
  'products',
  'prices.json'
)

if (!fs.existsSync(input)) {
  console.error('Не найден файл prices.xlsx в корне проекта')
  process.exit(1)
}

const workbook = XLSX.readFile(input)
const sheet = workbook.Sheets[workbook.SheetNames[0]]
const rows = XLSX.utils.sheet_to_json(sheet, {
  defval: null
})

if (!rows.length) {
  console.error('Excel-файл пустой')
  process.exit(1)
}

const normalize = value =>
  String(value ?? '').trim().toLowerCase()

const prices = {}

for (const row of rows) {
  const data = {}

  for (const [key, value] of Object.entries(row)) {
    data[normalize(key)] = value
  }

  const id = data.id

  if (!id) continue

  prices[String(id).trim()] = {
    price: data.conditional_price_rub,
    dnsPrice: data.dns_price_rub,
    dnsRating: data.dns_rating,
    dnsUrl: data.dns_url ?? data.dns_ur
  }
}

fs.writeFileSync(output, JSON.stringify(prices, null, 2))

console.log('Импорт завершён!')
console.log('Товаров обработано:', Object.keys(prices).length)
console.log('Файл создан:', output)
