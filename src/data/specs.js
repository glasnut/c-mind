// Описание характеристик для страницы товара и таблицы сравнения.
//
// better: 'high' — больше значит лучше, 'low' — меньше значит лучше.
//         Если не указано, параметр показывается без победителя: его нельзя честно сравнить
//         «по размеру числа» (например, частоты видеочипов разных архитектур).
// rank:   порядок значений от худшего к лучшему для текстовых параметров (например, сертификат БП).
// hint:   пояснение, почему у параметра нет победителя.

const number = new Intl.NumberFormat('ru-RU')
const decimal = (v, digits = 1) => v.toFixed(digits).replace('.', ',')
const unit = (u) => (v) => `${number.format(v)} ${u}`
const yesNo = (v) => (v ? 'Да' : 'Нет')
const list = (v) => (Array.isArray(v) ? v.join(', ') : v)
const capacity = (gb) => (gb >= 1000 ? `${number.format(gb / 1000)} ТБ` : `${gb} ГБ`)

const ARCH_HINT = 'Параметры разных архитектур напрямую не сопоставимы, поэтому без победителя.'

export const SPEC_DEFS = {
  gpu: [
    { id: 'architecture', label: 'Архитектура', get: (p) => p.specs.architecture },
    { id: 'memoryGb', label: 'Видеопамять', get: (p) => p.specs.memoryGb, format: unit('ГБ'), better: 'high' },
    {
      id: 'memoryType',
      label: 'Тип памяти',
      get: (p) => p.specs.memoryType,
      better: 'high',
      rank: ['GDDR6', 'GDDR6X', 'GDDR7'],
    },
    { id: 'busBits', label: 'Шина памяти', get: (p) => p.specs.busBits, format: unit('бит'), hint: ARCH_HINT },
    { id: 'boostMHz', label: 'Частота в режиме Boost', get: (p) => p.specs.boostMHz, format: unit('МГц'), hint: ARCH_HINT },
    { id: 'shaders', label: 'Шейдерные блоки', get: (p) => p.specs.shaders, format: (v) => number.format(v), hint: ARCH_HINT },
    { id: 'interface', label: 'Интерфейс', get: (p) => p.specs.interface },
    { id: 'powerW', label: 'Энергопотребление', get: (p) => p.powerW, format: unit('Вт'), better: 'low' },
    { id: 'recommendedPsuW', label: 'Рекомендуемый БП', get: (p) => p.specs.recommendedPsuW, format: unit('Вт'), better: 'low' },
    {
      id: 'lengthMm',
      label: 'Типичная длина',
      get: (p) => p.specs.lengthMm,
      format: unit('мм'),
      hint: 'Зависит от модели производителя и размера корпуса.',
    },
  ],
  cpu: [
    { id: 'socket', label: 'Сокет', get: (p) => p.specs.socket },
    { id: 'cores', label: 'Ядра', get: (p) => p.specs.cores, better: 'high' },
    { id: 'coreLayout', label: 'Раскладка ядер', get: (p) => p.specs.coreLayout },
    { id: 'threads', label: 'Потоки', get: (p) => p.specs.threads, better: 'high' },
    { id: 'baseGHz', label: 'Базовая частота', get: (p) => p.specs.baseGHz, format: (v) => `${decimal(v)} ГГц`, hint: ARCH_HINT },
    { id: 'boostGHz', label: 'Максимальная частота', get: (p) => p.specs.boostGHz, format: (v) => `${decimal(v)} ГГц`, hint: ARCH_HINT },
    { id: 'cacheL3Mb', label: 'Кэш L3', get: (p) => p.specs.cacheL3Mb, format: unit('МБ'), better: 'high' },
    { id: 'processNm', label: 'Техпроцесс', get: (p) => p.specs.processNm, format: unit('нм'), hint: 'Названия техпроцессов разных компаний не сопоставимы.' },
    { id: 'powerW', label: 'Тепловыделение (TDP)', get: (p) => p.powerW, format: unit('Вт'), better: 'low' },
    { id: 'memoryTypes', label: 'Поддерживаемая память', get: (p) => p.specs.memoryTypes, format: list },
    { id: 'igpu', label: 'Встроенная графика', get: (p) => p.specs.igpu, format: yesNo, better: 'high' },
  ],
  motherboard: [
    { id: 'socket', label: 'Сокет', get: (p) => p.specs.socket },
    { id: 'chipset', label: 'Чипсет', get: (p) => p.specs.chipset },
    { id: 'formFactor', label: 'Форм-фактор', get: (p) => p.specs.formFactor },
    { id: 'memoryType', label: 'Тип памяти', get: (p) => p.specs.memoryType, better: 'high', rank: ['DDR4', 'DDR5'] },
    { id: 'memorySlots', label: 'Слоты памяти', get: (p) => p.specs.memorySlots, better: 'high' },
    { id: 'maxMemoryGb', label: 'Максимум памяти', get: (p) => p.specs.maxMemoryGb, format: unit('ГБ'), better: 'high' },
    { id: 'm2Slots', label: 'Слоты M.2', get: (p) => p.specs.m2Slots, better: 'high' },
    { id: 'pcieGpu', label: 'Слот видеокарты', get: (p) => p.specs.pcieGpu, better: 'high', rank: ['PCIe 4.0 x16', 'PCIe 5.0 x16'] },
    { id: 'wifi', label: 'Wi-Fi', get: (p) => p.specs.wifi, format: yesNo, better: 'high' },
  ],
  ram: [
    { id: 'type', label: 'Тип памяти', get: (p) => p.specs.type, better: 'high', rank: ['DDR4', 'DDR5'] },
    { id: 'capacityGb', label: 'Объём комплекта', get: (p) => p.specs.capacityGb, format: unit('ГБ'), better: 'high' },
    { id: 'modules', label: 'Модулей в комплекте', get: (p) => p.specs.modules },
    { id: 'speedMTs', label: 'Скорость', get: (p) => p.specs.speedMTs, format: unit('МТ/с'), better: 'high' },
    {
      id: 'latencyCl',
      label: 'Тайминг CL',
      get: (p) => p.specs.latencyCl,
      hint: 'Сам по себе CL не сравнивается: важна реальная задержка в наносекундах (следующая строка).',
    },
    {
      id: 'latencyNs',
      label: 'Реальная задержка',
      get: (p) => (p.specs.latencyCl * 2000) / p.specs.speedMTs,
      format: (v) => `${decimal(v)} нс`,
      better: 'low',
    },
  ],
  storage: [
    { id: 'kind', label: 'Тип', get: (p) => p.specs.kind, better: 'high', rank: ['HDD', 'SSD SATA', 'SSD NVMe'] },
    { id: 'capacityGb', label: 'Объём', get: (p) => p.specs.capacityGb, format: capacity, better: 'high' },
    { id: 'interface', label: 'Интерфейс', get: (p) => p.specs.interface },
    { id: 'formFactor', label: 'Форм-фактор', get: (p) => p.specs.formFactor },
    { id: 'readMBs', label: 'Скорость чтения', get: (p) => p.specs.readMBs, format: unit('МБ/с'), better: 'high' },
    { id: 'writeMBs', label: 'Скорость записи', get: (p) => p.specs.writeMBs, format: unit('МБ/с'), better: 'high' },
  ],
  psu: [
    { id: 'watts', label: 'Мощность', get: (p) => p.specs.watts, format: unit('Вт'), better: 'high' },
    {
      id: 'efficiency',
      label: 'Сертификат',
      get: (p) => p.specs.efficiency,
      better: 'high',
      rank: ['80+ White', '80+ Bronze', '80+ Silver', '80+ Gold', '80+ Platinum', '80+ Titanium'],
    },
    {
      id: 'modular',
      label: 'Кабели',
      get: (p) => p.specs.modular,
      better: 'high',
      rank: ['Не модульный', 'Полумодульный', 'Полностью модульный'],
    },
    { id: 'standard', label: 'Стандарт', get: (p) => p.specs.standard, better: 'high', rank: ['ATX 2.x', 'ATX 3.0'] },
    { id: 'formFactor', label: 'Форм-фактор', get: (p) => p.specs.formFactor },
    { id: 'has12vhpwr', label: 'Разъём 12VHPWR', get: (p) => p.specs.has12vhpwr, format: yesNo, better: 'high' },
  ],
  case: [
    { id: 'size', label: 'Типоразмер', get: (p) => p.specs.size },
    { id: 'supportedBoards', label: 'Поддерживаемые платы', get: (p) => p.specs.supportedBoards, format: list },
    { id: 'maxGpuMm', label: 'Макс. длина видеокарты', get: (p) => p.specs.maxGpuMm, format: unit('мм'), better: 'high' },
    { id: 'maxCoolerMm', label: 'Макс. высота кулера', get: (p) => p.specs.maxCoolerMm, format: unit('мм'), better: 'high' },
    { id: 'psuFormFactor', label: 'Формат БП', get: (p) => p.specs.psuFormFactor },
  ],
  cooler: [
    { id: 'type', label: 'Тип охлаждения', get: (p) => p.specs.type },
    {
      id: 'heightMm',
      label: 'Высота кулера',
      get: (p) => p.specs.heightMm,
      format: unit('мм'),
      hint: 'Меньшая высота помогает поместиться в корпус, но не означает лучшее охлаждение.',
    },
    { id: 'radiatorMm', label: 'Радиатор СЖО', get: (p) => p.specs.radiatorMm, format: unit('мм'), better: 'high' },
    { id: 'fans', label: 'Вентиляторы', get: (p) => p.specs.fans },
    { id: 'sockets', label: 'Сокеты', get: (p) => p.specs.sockets, format: list },
  ],
}

export function formatSpec(def, product) {
  const value = def.get(product)
  if (value === undefined || value === null || value === '') return '—'
  return def.format ? def.format(value) : String(value)
}
