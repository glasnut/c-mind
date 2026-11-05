// «В каких случаях покупка может быть невыгодной» — набор правил: условие → предупреждение.

import { formatScore } from '../../utils/format.js'

const CATEGORY_RULES = {
  gpu: [
    { when: (p) => p.specs.memoryGb <= 8, text: () => 'Если играете в новые проекты с высокими текстурами или работаете с 3D: 8 ГБ видеопамяти могут стать ограничением.' },
    { when: (p) => p.powerW >= 300, text: (p) => `Если у вас небольшой корпус или блок питания слабее ${p.specs.recommendedPsuW} Вт.` },
    { when: (p) => p.specs.interface === 'PCIe 4.0 x8', text: () => 'Если планируете поставить карту в старую плату с PCIe 3.0: из-за 8 линий возможна потеря скорости.' },
  ],
  cpu: [
    { when: (p) => p.specs.socket === 'AM4', text: () => 'Если собираете ПК с нуля и хотите возможность апгрейда: платформа AM4 больше не развивается.' },
    { when: (p) => p.specs.socket === 'LGA1700', text: () => 'Если собираете ПК с нуля: платформа LGA1700 завершена, новые процессоры Intel выходят под LGA1851.' },
    { when: (p) => !p.specs.igpu, text: () => 'Если нет отдельной видеокарты: у процессора нет встроенной графики.' },
    { when: (p) => p.powerW >= 120, text: () => 'Если у вас бюджетный кулер или компактный корпус: процессору нужно хорошее охлаждение.' },
  ],
  motherboard: [
    { when: (p) => p.specs.memoryType === 'DDR4', text: () => 'Если планируете в будущем перейти на DDR5: плата поддерживает только DDR4.' },
    { when: (p) => p.specs.formFactor === 'mATX', text: () => 'Если нужно много карт расширения и накопителей: у mATX меньше слотов.' },
  ],
  ram: [
    { when: (p) => p.specs.type === 'DDR4', text: () => 'Если собираете новый ПК на AM5 или LGA1851: DDR4 там не используется.' },
    { when: (p) => p.specs.capacityGb <= 16, text: () => 'Если работаете с видео, 3D или виртуальными машинами: 16 ГБ может не хватить.' },
  ],
  storage: [
    { when: (p) => p.specs.kind === 'HDD', text: () => 'Если нужен системный диск или быстрая загрузка игр: HDD заметно медленнее SSD.' },
    { when: (p) => p.specs.kind === 'SSD SATA', text: () => 'Если в плате есть свободный слот M.2: NVMe-накопители быстрее при похожей цене.' },
    { when: (p) => p.specs.interface.startsWith('PCIe 5.0'), text: () => 'Если не нужна предельная скорость: накопитель PCIe 4.0 дешевле, а в повседневных задачах разница небольшая.' },
  ],
  psu: [
    { when: (p) => p.specs.watts <= 650, text: () => 'Если планируете мощную видеокарту (от 300 Вт): мощности может не хватить.' },
    { when: (p) => !p.specs.has12vhpwr, text: () => 'Если видеокарта использует разъём 12VHPWR: понадобится переходник.' },
  ],
  case: [
    { when: (p) => p.specs.size === 'Mini-ITX', text: () => 'Если нужна плата ATX или мощное охлаждение: компактный корпус ограничивает выбор.' },
    { when: (p) => p.specs.maxGpuMm <= 360, text: (p) => `Если планируете длинную видеокарту: максимум ${p.specs.maxGpuMm} мм.` },
  ],
  cooler: [
    { when: (p) => p.specs.type === 'Жидкостное (СЖО)', text: () => 'Если важна максимальная простота и надёжность: воздушный кулер проще и без насоса.' },
    { when: (p) => p.specs.heightMm >= 165, text: () => 'Если в корпусе есть ограничение по высоте кулера.' },
    { when: (p) => p.perfIndex < 45, text: () => 'Если процессор мощнее 65 Вт: охлаждения может не хватить.' },
  ],
}

export function whenNotToBuy(product, score, alternatives, cheaperBetterTotal) {
  const notes = []

  // Самый сильный довод: за те же или меньшие деньги есть вариант с заметно более высокой оценкой
  const better = alternatives.find(
    (a) => a.product.price <= product.price && a.total >= score.total + 0.3,
  )
  if (better) {
    notes.push(
      `Есть модель не дороже с более высокой оценкой: ${better.product.name} (${formatScore(better.total)} против ${formatScore(score.total)}).`,
    )
  }

  const c = score.criteria
  if (c.value < 5.5) notes.push('Цена высока относительно производительности: если важен бюджет, лучше рассмотреть более доступные модели.')
  if (c.freshness <= 4) notes.push('Модель вышла давно: для сборки «на годы» лучше выбрать более новую.')
  if (c.efficiency !== undefined && c.efficiency <= 4) {
    notes.push('Если важны тишина и небольшой расход электричества: товар потребляет много для своей производительности.')
  }

  for (const rule of CATEGORY_RULES[product.category] ?? []) {
    if (rule.when(product)) notes.push(rule.text(product))
  }

  return notes.slice(0, 6)
}
