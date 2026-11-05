// Сборка ПК: итоги (цена, мощность, оценка) и подбор совместимых вариантов.
// Состояние сборки хранится как { cpu: 'id', gpu: 'id', ... }; здесь оно превращается в товары.

import { productsService } from '../products/index.js'
import { checkCompatibility } from './compatibility.js'
import { estimatePower } from './power.js'
import { PURPOSES, SLOTS } from './slots.js'

export { SLOTS, PURPOSES, PURPOSE_LIST } from './slots.js'
export { checkCompatibility } from './compatibility.js'

export function resolveParts(selection) {
  return Object.fromEntries(SLOTS.map((slot) => [slot, selection[slot] ? productsService.getById(selection[slot]) : null]))
}

// Оценка сборки: взвешенный индекс деталей по цели, переведённый в шкалу 0–10 (как в оценке товаров).
// Если детали, важной для цели, нет — она считается нулём: сборка неполная, оценка это показывает.
export function scoreBuild(parts, purposeId) {
  const purpose = PURPOSES[purposeId] ?? PURPOSES.universal
  let index = 0
  for (const [slot, weight] of Object.entries(purpose.weights)) {
    const part = parts[slot]
    // Встроенная графика не ноль, но слабая: условно считаем её 5 из 100.
    const value = part ? part.perfIndex : slot === 'gpu' && parts.cpu?.specs.igpu ? 5 : 0
    index += value * weight
  }
  return { index: Math.round(index), score: Math.round(10 * Math.sqrt(index / 100) * 10) / 10 }
}

// Подсказки по балансу и объёму памяти для выбранной цели.
export function buildNotes(parts, purposeId) {
  const purpose = PURPOSES[purposeId] ?? PURPOSES.universal
  const notes = []
  const { cpu, gpu, ram } = parts
  if (cpu && gpu) {
    const target = 0.8 * gpu.perfIndex + 15
    if (cpu.perfIndex < target - 20) notes.push(`Процессор заметно слабее видеокарты: в играх он может ограничивать её кадровую частоту.`)
    else if (purposeId === 'gaming' && cpu.perfIndex > target + 30) notes.push('Процессор намного мощнее видеокарты: для игр часть бюджета выгоднее перенести на видеокарту.')
  }
  if (ram && ram.specs.capacityGb < purpose.minRamGb) {
    notes.push(`Для цели «${purpose.name}» рекомендуем не менее ${purpose.minRamGb} ГБ памяти, выбрано ${ram.specs.capacityGb} ГБ.`)
  }
  return notes
}

export function summarize(selection, purposeId) {
  const parts = resolveParts(selection)
  const chosen = SLOTS.filter((slot) => parts[slot])
  const missing = SLOTS.filter((slot) => !parts[slot])
  const compatibility = checkCompatibility(parts)
  const power = estimatePower(parts)
  return {
    parts,
    chosen,
    missing,
    total: chosen.reduce((sum, slot) => sum + parts[slot].price, 0),
    power,
    compatibility,
    build: scoreBuild(parts, purposeId),
    notes: buildNotes(parts, purposeId),
    complete: missing.length === 0,
    ready: missing.length === 0 && compatibility.errors.length === 0,
  }
}

// Варианты для слота: каждому товару — список причин несовместимости с текущей сборкой.
export function optionsForSlot(slot, selection) {
  const parts = resolveParts(selection)
  return productsService
    .getAll()
    .filter((p) => p.category === slot)
    .sort((a, b) => a.name.localeCompare(b.name, 'ru'))
    .map((product) => {
      const { errors } = checkCompatibility({ ...parts, [slot]: product })
      return { product, problems: errors.filter((e) => e.parts.includes(slot)).map((e) => e.text) }
    })
}
