// Описание таблицы характеристик для страницы товара: подписи и форматирование по категориям.
// Строка, значение которой не задано у товара, в таблицу не попадает.

const yesNo = (v) => (v ? 'Есть' : 'Нет')
const list = (v) => v.join(', ')
const gb = (v) => (v >= 1000 ? `${v / 1000} ТБ` : `${v} ГБ`)

const SPEC_ROWS = {
  gpu: [
    ['Архитектура', (p) => p.specs.architecture],
    ['Объём видеопамяти', (p) => `${p.specs.memoryGb} ГБ`],
    ['Тип видеопамяти', (p) => p.specs.memoryType],
    ['Шина памяти', (p) => `${p.specs.busBits} бит`],
    ['Частота Boost', (p) => `${p.specs.boostMHz} МГц`],
    ['Шейдерные блоки', (p) => p.specs.shaders.toLocaleString('ru-RU')],
    ['Интерфейс', (p) => p.specs.interface],
    ['Энергопотребление', (p) => `${p.powerW} Вт`],
    ['Типовая длина', (p) => `${p.specs.lengthMm} мм`],
    ['Рекомендуемый блок питания', (p) => `${p.specs.recommendedPsuW} Вт`],
  ],
  cpu: [
    ['Сокет', (p) => p.specs.socket],
    ['Ядра', (p) => p.specs.cores],
    ['Раскладка ядер', (p) => p.specs.coreLayout],
    ['Потоки', (p) => p.specs.threads],
    ['Базовая частота', (p) => `${String(p.specs.baseGHz).replace('.', ',')} ГГц`],
    ['Максимальная частота', (p) => `${String(p.specs.boostGHz).replace('.', ',')} ГГц`],
    ['Кэш L3', (p) => `${p.specs.cacheL3Mb} МБ`],
    ['Техпроцесс', (p) => `${p.specs.processNm} нм`],
    ['Поддерживаемая память', (p) => list(p.specs.memoryTypes)],
    ['Встроенная графика', (p) => yesNo(p.specs.igpu)],
    ['Энергопотребление (TDP)', (p) => `${p.powerW} Вт`],
  ],
  motherboard: [
    ['Сокет', (p) => p.specs.socket],
    ['Чипсет', (p) => p.specs.chipset],
    ['Форм-фактор', (p) => p.specs.formFactor],
    ['Тип памяти', (p) => p.specs.memoryType],
    ['Слотов памяти', (p) => p.specs.memorySlots],
    ['Максимальный объём памяти', (p) => `${p.specs.maxMemoryGb} ГБ`],
    ['Слотов M.2', (p) => p.specs.m2Slots],
    ['Слот видеокарты', (p) => p.specs.pcieGpu],
    ['Wi-Fi', (p) => yesNo(p.specs.wifi)],
  ],
  ram: [
    ['Тип памяти', (p) => p.specs.type],
    ['Объём комплекта', (p) => `${p.specs.capacityGb} ГБ`],
    ['Количество модулей', (p) => p.specs.modules],
    ['Скорость', (p) => `${p.specs.speedMTs} МТ/с`],
    ['Задержка', (p) => `CL${p.specs.latencyCl}`],
  ],
  storage: [
    ['Тип', (p) => p.specs.kind],
    ['Объём', (p) => gb(p.specs.capacityGb)],
    ['Интерфейс', (p) => p.specs.interface],
    ['Форм-фактор', (p) => p.specs.formFactor],
    ['Скорость чтения', (p) => `${p.specs.readMBs.toLocaleString('ru-RU')} МБ/с`],
    ['Скорость записи', (p) => `${p.specs.writeMBs.toLocaleString('ru-RU')} МБ/с`],
    ['Скорость вращения', (p) => p.specs.rpm && `${p.specs.rpm} об/мин`],
    ['Кэш', (p) => p.specs.cacheMb && `${p.specs.cacheMb} МБ`],
  ],
  psu: [
    ['Мощность', (p) => `${p.specs.watts} Вт`],
    ['Сертификат', (p) => p.specs.efficiency],
    ['Кабели', (p) => p.specs.modular],
    ['Стандарт', (p) => p.specs.standard],
    ['Форм-фактор', (p) => p.specs.formFactor],
    ['Разъём 12VHPWR', (p) => yesNo(p.specs.has12vhpwr)],
  ],
  case: [
    ['Типоразмер', (p) => p.specs.size],
    ['Поддерживаемые платы', (p) => list(p.specs.supportedBoards)],
    ['Макс. длина видеокарты', (p) => `${p.specs.maxGpuMm} мм`],
    ['Макс. высота кулера', (p) => `${p.specs.maxCoolerMm} мм`],
    ['Формат блока питания', (p) => p.specs.psuFormFactor],
  ],
  cooler: [
    ['Тип', (p) => p.specs.type],
    ['Высота', (p) => p.specs.heightMm && `${p.specs.heightMm} мм`],
    ['Радиатор', (p) => p.specs.radiatorMm && `${p.specs.radiatorMm} мм`],
    ['Вентиляторы', (p) => p.specs.fans],
    ['Поддерживаемые сокеты', (p) => list(p.specs.sockets)],
  ],
}

export function getSpecRows(product) {
  const rows = (SPEC_ROWS[product.category] ?? []).map(([label, get]) => ({ label, value: get(product) }))
  rows.push({ label: 'Год выхода', value: product.releaseYear })
  return rows.filter((row) => row.value !== undefined && row.value !== null && row.value !== false && row.value !== '')
}
