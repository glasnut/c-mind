// Описание фильтров каталога. Для каждой категории — свой набор.
//
// type: 'multi' — список галочек (товар подходит, если его значение выбрано);
//       'min'   — «не меньше» (выбирается одно пороговое значение из thresholds).
// get(product) возвращает значение характеристики (или массив значений, например список сокетов).
// Варианты для галочек строятся автоматически из демо-базы, поэтому новые товары
// появляются в фильтрах без изменения этого файла.

const brand = { id: 'brand', label: 'Производитель', type: 'multi', get: (p) => p.brand }

export const FILTER_DEFS = {
  gpu: [
    brand,
    { id: 'memoryGb', label: 'Видеопамять', type: 'multi', get: (p) => p.specs.memoryGb, format: (v) => `${v} ГБ` },
    { id: 'memoryType', label: 'Тип памяти', type: 'multi', get: (p) => p.specs.memoryType },
    { id: 'interface', label: 'Интерфейс', type: 'multi', get: (p) => p.specs.interface },
  ],
  cpu: [
    brand,
    { id: 'socket', label: 'Сокет', type: 'multi', get: (p) => p.specs.socket },
    { id: 'cores', label: 'Количество ядер', type: 'multi', get: (p) => p.specs.cores },
    { id: 'threads', label: 'Количество потоков', type: 'multi', get: (p) => p.specs.threads },
    {
      id: 'boostGHz',
      label: 'Макс. частота',
      type: 'min',
      get: (p) => p.specs.boostGHz,
      thresholds: [4.5, 5.0, 5.5],
      format: (v) => `от ${String(v).replace('.', ',')} ГГц`,
    },
  ],
  motherboard: [
    brand,
    { id: 'socket', label: 'Сокет', type: 'multi', get: (p) => p.specs.socket },
    { id: 'chipset', label: 'Чипсет', type: 'multi', get: (p) => p.specs.chipset },
    { id: 'formFactor', label: 'Форм-фактор', type: 'multi', get: (p) => p.specs.formFactor },
    { id: 'memoryType', label: 'Тип памяти', type: 'multi', get: (p) => p.specs.memoryType },
  ],
  ram: [
    brand,
    { id: 'type', label: 'Тип памяти', type: 'multi', get: (p) => p.specs.type },
    { id: 'capacityGb', label: 'Объём комплекта', type: 'multi', get: (p) => p.specs.capacityGb, format: (v) => `${v} ГБ` },
    {
      id: 'speedMTs',
      label: 'Скорость',
      type: 'min',
      get: (p) => p.specs.speedMTs,
      thresholds: [3600, 5600, 6000],
      format: (v) => `от ${v} МТ/с`,
    },
  ],
  storage: [
    brand,
    { id: 'kind', label: 'Тип', type: 'multi', get: (p) => p.specs.kind },
    {
      id: 'capacityGb',
      label: 'Объём',
      type: 'multi',
      get: (p) => p.specs.capacityGb,
      format: (v) => `${v / 1000} ТБ`,
    },
    { id: 'interface', label: 'Интерфейс', type: 'multi', get: (p) => p.specs.interface },
  ],
  psu: [
    brand,
    { id: 'watts', label: 'Мощность', type: 'multi', get: (p) => p.specs.watts, format: (v) => `${v} Вт` },
    { id: 'efficiency', label: 'Сертификат', type: 'multi', get: (p) => p.specs.efficiency },
    { id: 'modular', label: 'Кабели', type: 'multi', get: (p) => p.specs.modular },
  ],
  case: [
    brand,
    { id: 'size', label: 'Типоразмер', type: 'multi', get: (p) => p.specs.size },
    { id: 'psuFormFactor', label: 'Формат БП', type: 'multi', get: (p) => p.specs.psuFormFactor },
  ],
  cooler: [
    brand,
    { id: 'type', label: 'Тип охлаждения', type: 'multi', get: (p) => p.specs.type },
    { id: 'sockets', label: 'Поддерживаемый сокет', type: 'multi', get: (p) => p.specs.sockets },
  ],
}

// Для вкладки «Все категории» доступен только общий фильтр по производителю.
export const ALL_CATEGORIES_DEFS = [brand]
