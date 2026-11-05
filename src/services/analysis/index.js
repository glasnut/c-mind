// Автоматический анализ товара: описание, вердикт, плюсы и минусы, сценарии использования.
//
// Это НЕ нейросеть: тексты собираются по правилам из характеристик и оценок товара.
// Каждое правило — пара «условие → текст», поэтому легко проверить, откуда взялся вывод,
// и добавить новое. Когда к проекту подключат настоящую языковую модель, она сможет
// заменить эту функцию, сохранив формат результата.

import { CRITERIA_LABELS } from '../scoring/index.js'
import { plural } from '../../utils/format.js'

const YEAR = new Date().getFullYear()
const decimal = (v) => String(v).replace('.', ',')

// ---------- Описание ----------

const DESCRIBERS = {
  gpu: (p) =>
    `Видеокарта ${p.brand} на архитектуре ${p.specs.architecture} с ${p.specs.memoryGb} ГБ памяти ${p.specs.memoryType} ` +
    `и ${p.specs.busBits}-битной шиной. Энергопотребление — ${p.powerW} Вт, интерфейс ${p.specs.interface}. Вышла в ${p.releaseYear} году.`,
  cpu: (p) =>
    `Процессор ${p.brand} для сокета ${p.specs.socket}: ${p.specs.cores} ядер, ${p.specs.threads} потоков, ` +
    `частота до ${decimal(p.specs.boostGHz)} ГГц, кэш L3 ${p.specs.cacheL3Mb} МБ. Тепловыделение — ${p.powerW} Вт. ` +
    (p.specs.igpu ? 'Есть встроенная графика.' : 'Встроенной графики нет — нужна видеокарта.'),
  motherboard: (p) =>
    `Материнская плата формата ${p.specs.formFactor} на чипсете ${p.specs.chipset} для процессоров с сокетом ${p.specs.socket}. ` +
    `Память ${p.specs.memoryType}: ${p.specs.memorySlots} ${plural(p.specs.memorySlots, ['слот', 'слота', 'слотов'])}, ` +
    `до ${p.specs.maxMemoryGb} ГБ. Слотов M.2: ${p.specs.m2Slots}.${p.specs.wifi ? ' Есть Wi-Fi.' : ''}`,
  ram: (p) =>
    `Комплект памяти ${p.specs.type}: ${p.specs.modules}×${p.specs.capacityGb / p.specs.modules} ГБ (всего ${p.specs.capacityGb} ГБ), ` +
    `${p.specs.speedMTs} МТ/с, задержка CL${p.specs.latencyCl}.`,
  storage: (p) =>
    `${p.specs.kind === 'HDD' ? 'Жёсткий диск' : 'Твердотельный накопитель'} на ${p.specs.capacityGb >= 1000 ? p.specs.capacityGb / 1000 + ' ТБ' : p.specs.capacityGb + ' ГБ'}, ` +
    `интерфейс ${p.specs.interface}, форм-фактор ${p.specs.formFactor}. Чтение — до ${p.specs.readMBs} МБ/с, запись — до ${p.specs.writeMBs} МБ/с.`,
  psu: (p) =>
    `Блок питания на ${p.specs.watts} Вт с сертификатом ${p.specs.efficiency}, ${p.specs.modular.toLowerCase()}, стандарт ${p.specs.standard}.`,
  case: (p) =>
    `Корпус типоразмера ${p.specs.size}: видеокарты длиной до ${p.specs.maxGpuMm} мм, кулеры высотой до ${p.specs.maxCoolerMm} мм, ` +
    `блок питания формата ${p.specs.psuFormFactor}.`,
  cooler: (p) =>
    `${p.specs.type === 'Жидкостное (СЖО)' ? `Жидкостное охлаждение с радиатором ${p.specs.radiatorMm} мм` : `Воздушный кулер высотой ${p.specs.heightMm} мм`}, ` +
    `вентиляторы ${p.specs.fans}. Поддерживает сокеты ${p.specs.sockets.join(', ')}.`,
}

export const describeProduct = (product) => DESCRIBERS[product.category](product)

// ---------- Вердикт ----------

export function verdictFor(total) {
  if (total >= 8.5) return 'Отличный выбор'
  if (total >= 7.5) return 'Очень хороший выбор'
  if (total >= 6.5) return 'Хороший выбор для своих задач'
  if (total >= 5.5) return 'Рабочий вариант с оговорками'
  return 'Стоит брать только при конкретной причине'
}

// Пояснение к каждому критерию: из каких чисел получился балл.
export function criterionNote(product, id) {
  switch (id) {
    case 'performance':
      return `Условный индекс производительности: ${product.perfIndex} из 100`
    case 'efficiency':
      return `${decimal((product.perfIndex / product.powerW).toFixed(2))} балла индекса на 1 Вт при ${product.powerW} Вт`
    case 'value':
      return `${decimal((product.perfIndex / (product.price / 1000)).toFixed(1))} балла индекса на 1000 ₽`
    case 'freshness':
      return `Вышла в ${product.releaseYear} году`
    default:
      return ''
  }
}

// ---------- Плюсы, минусы, сценарии ----------

const CRITERIA_RULES = {
  performance: {
    pro: 'Высокая производительность для своей категории',
    con: 'Скромная производительность по сравнению с другими моделями в базе',
  },
  efficiency: {
    pro: 'Высокая энергоэффективность: мало энергии на единицу производительности',
    con: 'Низкая энергоэффективность: много энергии на единицу производительности',
  },
  value: {
    pro: 'Выгодная цена относительно производительности',
    con: 'Высокая цена относительно производительности',
  },
  freshness: {
    pro: 'Актуальная модель, вышла недавно',
    con: 'Модель уже не новая',
  },
}

// Правила по характеристикам: { when, text }. Условие получает товар.
const SPEC_RULES = {
  gpu: {
    pros: [
      { when: (p) => p.specs.memoryGb >= 16, text: (p) => `Большой запас видеопамяти (${p.specs.memoryGb} ГБ): удобно для высоких текстур и тяжёлых сцен` },
      { when: (p) => p.specs.memoryType === 'GDDR7', text: () => 'Новый тип памяти GDDR7 с высокой пропускной способностью' },
      { when: (p) => p.powerW <= 150, text: (p) => `Умеренное энергопотребление (${p.powerW} Вт): хватит недорогого блока питания` },
    ],
    cons: [
      { when: (p) => p.specs.memoryGb <= 8, text: (p) => `Всего ${p.specs.memoryGb} ГБ видеопамяти: в новых играх на высоких текстурах её может не хватать` },
      { when: (p) => p.powerW >= 300, text: (p) => `Высокое энергопотребление (${p.powerW} Вт): нужен мощный блок питания (рекомендуется от ${p.specs.recommendedPsuW} Вт) и хорошая вентиляция корпуса` },
      { when: (p) => p.specs.interface === 'PCIe 4.0 x8', text: () => 'Использует 8 линий PCIe: на старых платах с PCIe 3.0 возможна потеря производительности' },
    ],
    scenarios: [
      { when: (p) => p.perfIndex >= 75, text: () => 'Игры в 4K на высоких настройках и тяжёлые рабочие задачи' },
      { when: (p) => p.perfIndex >= 50 && p.perfIndex < 75, text: () => 'Игры в разрешении 1440p на высоких настройках' },
      { when: (p) => p.perfIndex >= 28 && p.perfIndex < 50, text: () => 'Игры в Full HD на высоких настройках' },
      { when: (p) => p.perfIndex < 28, text: () => 'Игры в Full HD на средних настройках и нетребовательные проекты' },
      { when: (p) => p.specs.memoryGb >= 16, text: () => '3D-графика и видеомонтаж: большой объём видеопамяти' },
      { when: (p) => p.powerW <= 150, text: () => 'Компактные и тихие сборки с умеренным энергопотреблением' },
    ],
  },
  cpu: {
    pros: [
      { when: (p) => p.specs.cacheL3Mb >= 64, text: (p) => `Большой кэш L3 (${p.specs.cacheL3Mb} МБ): помогает в играх и ресурсоёмких задачах` },
      { when: (p) => p.specs.cores >= 12, text: (p) => `Много ядер (${p.specs.cores}): уверенная многопоточная работа` },
      { when: (p) => p.specs.socket === 'AM5', text: () => 'Платформа AM5 актуальна: подходит для будущих процессоров AMD' },
      { when: (p) => p.specs.socket === 'LGA1851', text: () => 'Актуальная платформа Intel LGA1851' },
      { when: (p) => p.specs.igpu, text: () => 'Есть встроенная графика: можно запустить ПК без видеокарты' },
    ],
    cons: [
      { when: (p) => p.specs.socket === 'AM4', text: () => 'Платформа AM4 больше не развивается: апгрейд потребует смены платы и памяти' },
      { when: (p) => p.specs.socket === 'LGA1700', text: () => 'Платформа LGA1700 завершена: новые процессоры Intel выходят под LGA1851' },
      { when: (p) => !p.specs.igpu, text: () => 'Нет встроенной графики: без видеокарты изображение не получить' },
      { when: (p) => p.powerW >= 120, text: (p) => `Высокое тепловыделение (${p.powerW} Вт): нужен хороший кулер и мощный блок питания` },
    ],
    scenarios: [
      { when: (p) => p.perfIndex >= 75, text: () => 'Монтаж видео, рендеринг, стриминг и игры одновременно' },
      { when: (p) => p.specs.cacheL3Mb >= 96, text: () => 'Игры с максимальной частотой кадров' },
      { when: (p) => p.perfIndex >= 35 && p.perfIndex < 75, text: () => 'Игры и повседневная работа' },
      { when: (p) => p.perfIndex < 35, text: () => 'Офис, учёба и игры среднего уровня' },
      { when: (p) => p.powerW <= 65, text: () => 'Тихие и недорогие сборки с простым охлаждением' },
    ],
  },
  motherboard: {
    pros: [
      { when: (p) => p.specs.wifi, text: () => 'Встроенный Wi-Fi' },
      { when: (p) => p.specs.m2Slots >= 3, text: (p) => `Много слотов M.2 (${p.specs.m2Slots}) для быстрых накопителей` },
      { when: (p) => p.specs.pcieGpu.includes('5.0'), text: () => 'Слот видеокарты PCIe 5.0 — запас под будущие видеокарты' },
      { when: (p) => p.specs.memoryType === 'DDR5', text: () => 'Современная память DDR5' },
    ],
    cons: [
      { when: (p) => p.specs.memoryType === 'DDR4', text: () => 'Память DDR4 — уходящий стандарт, для новых платформ не используется' },
      { when: (p) => p.specs.socket === 'AM4', text: () => 'Сокет AM4: новые процессоры AMD выходят под AM5' },
      { when: (p) => !p.specs.wifi, text: () => 'Нет Wi-Fi: нужен кабель или отдельный адаптер' },
      { when: (p) => p.specs.formFactor === 'mATX', text: () => 'Компактный форм-фактор: меньше слотов расширения' },
    ],
    scenarios: [
      { when: (p) => p.perfIndex >= 70, text: () => 'Мощные сборки с разгоном и несколькими накопителями' },
      { when: (p) => p.perfIndex >= 40 && p.perfIndex < 70, text: () => 'Игровые и универсальные сборки среднего уровня' },
      { when: (p) => p.perfIndex < 40, text: () => 'Бюджетные сборки для учёбы и офиса' },
      { when: (p) => p.specs.formFactor === 'mATX', text: () => 'Компактные корпуса' },
    ],
  },
  ram: {
    pros: [
      { when: (p) => p.specs.capacityGb >= 32, text: (p) => `Большой объём (${p.specs.capacityGb} ГБ): хватает для работы с несколькими тяжёлыми программами` },
      { when: (p) => p.specs.speedMTs >= 6000, text: (p) => `Высокая скорость (${p.specs.speedMTs} МТ/с)` },
      { when: (p) => p.specs.modules >= 2, text: () => 'Комплект из двух модулей включает двухканальный режим' },
    ],
    cons: [
      { when: (p) => p.specs.type === 'DDR4', text: () => 'DDR4 — уходящий стандарт: на новых платформах не используется' },
      { when: (p) => p.specs.capacityGb <= 16, text: () => '16 ГБ — минимум для современных игр и работы с несколькими приложениями' },
    ],
    scenarios: [
      { when: (p) => p.specs.capacityGb >= 64, text: () => 'Монтаж, 3D, виртуальные машины и другие тяжёлые задачи' },
      { when: (p) => p.specs.capacityGb === 32, text: () => 'Игры, работа и многозадачность с запасом' },
      { when: (p) => p.specs.capacityGb <= 16, text: () => 'Офис, учёба и игры среднего уровня' },
      { when: (p) => p.specs.type === 'DDR4', text: () => 'Апгрейд существующего ПК на платформе с DDR4' },
    ],
  },
  storage: {
    pros: [
      { when: (p) => p.specs.kind === 'HDD', text: () => 'Самая низкая цена за гигабайт' },
      { when: (p) => p.specs.readMBs >= 7000, text: (p) => `Очень высокая скорость чтения (${p.specs.readMBs} МБ/с)` },
      { when: (p) => p.specs.capacityGb >= 2000, text: () => 'Большой объём: хватит под игры и рабочие проекты' },
    ],
    cons: [
      { when: (p) => p.specs.kind === 'HDD', text: () => 'Механический диск: заметно медленнее SSD и чувствителен к ударам' },
      { when: (p) => p.specs.kind === 'SSD SATA', text: () => 'Интерфейс SATA ограничивает скорость примерно 560 МБ/с' },
      { when: (p) => p.specs.interface.startsWith('PCIe 5.0'), text: () => 'Высокая скорость требует хорошего охлаждения, а в повседневных задачах выигрыш над PCIe 4.0 небольшой' },
      { when: (p) => p.specs.capacityGb <= 1000 && p.specs.kind !== 'HDD', text: () => '1 ТБ быстро заполняется современными играми' },
    ],
    scenarios: [
      { when: (p) => p.specs.kind === 'HDD', text: () => 'Хранение архивов, фото и видео, резервные копии' },
      { when: (p) => p.specs.kind === 'SSD SATA', text: () => 'Модернизация старого ПК или ноутбука без слота M.2' },
      { when: (p) => p.specs.kind === 'SSD NVMe' && p.specs.readMBs < 7000, text: () => 'Системный диск и игры' },
      { when: (p) => p.specs.kind === 'SSD NVMe' && p.specs.readMBs >= 7000, text: () => 'Работа с большими файлами, монтаж и системный диск' },
    ],
  },
  psu: {
    pros: [
      { when: (p) => p.specs.efficiency === '80+ Gold', text: () => 'Сертификат 80+ Gold: высокий КПД, меньше нагрева' },
      { when: (p) => p.specs.modular === 'Полностью модульный', text: () => 'Съёмные кабели: проще аккуратно уложить проводку' },
      { when: (p) => p.specs.has12vhpwr, text: () => 'Есть разъём 12VHPWR для современных видеокарт' },
      { when: (p) => p.specs.watts >= 850, text: (p) => `Запас мощности (${p.specs.watts} Вт) для мощных видеокарт` },
    ],
    cons: [
      { when: (p) => p.specs.efficiency === '80+ Bronze', text: () => 'Сертификат 80+ Bronze: КПД ниже, чем у Gold' },
      { when: (p) => p.specs.modular === 'Не модульный', text: () => 'Кабели не отключаются: сложнее укладка проводов' },
      { when: (p) => !p.specs.has12vhpwr, text: () => 'Нет разъёма 12VHPWR: для некоторых видеокарт понадобится переходник' },
      { when: (p) => p.specs.watts <= 650, text: (p) => `Мощность ${p.specs.watts} Вт подойдёт не для всех мощных видеокарт` },
    ],
    scenarios: [
      { when: (p) => p.specs.watts <= 650, text: () => 'Бюджетные сборки с видеокартой среднего уровня' },
      { when: (p) => p.specs.watts > 650 && p.specs.watts < 1000, text: () => 'Игровые сборки с мощной видеокартой' },
      { when: (p) => p.specs.watts >= 1000, text: () => 'Топовые сборки и разгон' },
    ],
  },
  case: {
    pros: [
      { when: (p) => p.specs.maxGpuMm >= 390, text: (p) => `Вмещает длинные видеокарты (до ${p.specs.maxGpuMm} мм)` },
      { when: (p) => p.specs.maxCoolerMm >= 170, text: (p) => `Вмещает высокие кулеры (до ${p.specs.maxCoolerMm} мм)` },
      { when: (p) => p.specs.size === 'Mini-ITX', text: () => 'Компактные габариты' },
    ],
    cons: [
      { when: (p) => p.specs.size === 'Mini-ITX', text: () => 'Подходит только для плат Mini-ITX, ограничения по размеру и охлаждению' },
      { when: (p) => p.specs.size === 'Micro-ATX', text: () => 'Платы формата ATX не поместятся' },
      { when: (p) => p.specs.maxCoolerMm <= 160, text: (p) => `Ограничение высоты кулера (${p.specs.maxCoolerMm} мм)` },
    ],
    scenarios: [
      { when: (p) => p.specs.size === 'ATX Mid Tower', text: () => 'Универсальные игровые и рабочие сборки' },
      { when: (p) => p.specs.size === 'Micro-ATX', text: () => 'Компактные бюджетные сборки' },
      { when: (p) => p.specs.size === 'Mini-ITX', text: () => 'Небольшие ПК, которые удобно ставить на стол' },
    ],
  },
  cooler: {
    pros: [
      { when: (p) => p.specs.radiatorMm >= 360, text: () => 'Радиатор 360 мм: лучший теплосъём для мощных процессоров' },
      { when: (p) => p.specs.type === 'Башенный воздушный' && p.perfIndex >= 60, text: () => 'Воздушный кулер без насоса и жидкости: проще и надёжнее' },
      { when: (p) => p.specs.sockets.includes('LGA1851') && p.specs.sockets.includes('AM5'), text: () => 'Подходит для актуальных платформ AM5 и LGA1851' },
    ],
    cons: [
      { when: (p) => p.specs.heightMm >= 165, text: (p) => `Высота ${p.specs.heightMm} мм: подходит не для всех корпусов` },
      { when: (p) => p.specs.type === 'Жидкостное (СЖО)', text: () => 'Жидкостная система: больше компонентов и требований к установке' },
      { when: (p) => p.perfIndex < 45, text: () => 'Для мощных процессоров охлаждения может не хватить' },
      { when: (p) => !p.specs.sockets.includes('LGA1851'), text: () => 'Производитель не указывает поддержку LGA1851' },
    ],
    scenarios: [
      { when: (p) => p.perfIndex < 45, text: () => 'Процессоры с невысоким тепловыделением (до 65 Вт)' },
      { when: (p) => p.perfIndex >= 45 && p.perfIndex < 75, text: () => 'Процессоры среднего и верхнего-среднего уровня' },
      { when: (p) => p.perfIndex >= 75, text: () => 'Мощные процессоры и длительные нагрузки' },
    ],
  },
}

const MAX_ITEMS = 5

export function analyzeProduct(product, score) {
  const rules = SPEC_RULES[product.category]
  const apply = (list) => list.filter((r) => r.when(product)).map((r) => r.text(product))

  const pros = []
  const cons = []
  for (const { id, score: s } of score.breakdown) {
    if (s >= 7) pros.push(CRITERIA_RULES[id].pro)
    else if (s <= 4.5) cons.push(CRITERIA_RULES[id].con)
  }
  pros.push(...apply(rules.pros))
  cons.push(...apply(rules.cons))

  const sorted = [...score.breakdown].sort((a, b) => b.score - a.score)
  const best = sorted[0]
  const worst = sorted[sorted.length - 1]
  const explanation =
    `Оценка ${decimal(score.total.toFixed(1))} из 10 — взвешенное среднее по критериям. ` +
    `Сильнее всего товар выглядит по критерию «${best.label}» (${decimal(best.score.toFixed(1))}), ` +
    `слабее всего — «${worst.label}» (${decimal(worst.score.toFixed(1))}).`

  return {
    verdict: verdictFor(score.total),
    explanation,
    pros: pros.slice(0, MAX_ITEMS),
    cons: cons.slice(0, MAX_ITEMS),
    scenarios: apply(rules.scenarios).slice(0, MAX_ITEMS),
  }
}

export { CRITERIA_LABELS }
