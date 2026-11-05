// Демонстрационная база корпусов.
//
// Габариты (maxGpuMm, maxCoolerMm) — по данным производителей; у корпусов они зависят
// от конфигурации (например, от фронтальных вентиляторов/радиатора).
// perfIndex — УСЛОВНЫЙ индекс «класса корпуса» (0–100): оценка вместимости и продуваемости.
//             Не измерение, а экспертная оценка для демо-версии.
// price     — УСЛОВНАЯ цена в рублях, не актуальное предложение.

export const cases = [
  {
    id: 'nzxt-h5-flow',
    category: 'case',
    brand: 'NZXT',
    name: 'NZXT H5 Flow',
    highlights: ['ATX Mid Tower', 'до 365 мм видеокарта', 'до 165 мм кулер'],
    specs: {
      size: 'ATX Mid Tower',
      supportedBoards: ['ATX', 'mATX', 'Mini-ITX'],
      maxGpuMm: 365,
      maxCoolerMm: 165,
      psuFormFactor: 'ATX',
    },
    price: 8990,
    perfIndex: 62,
    releaseYear: 2023,
  },
  {
    id: 'lian-li-lancool-216',
    category: 'case',
    brand: 'Lian Li',
    name: 'Lian Li LANCOOL 216',
    highlights: ['ATX Mid Tower', 'до 392 мм видеокарта', 'до 180 мм кулер'],
    specs: {
      size: 'ATX Mid Tower',
      supportedBoards: ['ATX', 'mATX', 'Mini-ITX'],
      maxGpuMm: 392,
      maxCoolerMm: 180,
      psuFormFactor: 'ATX',
    },
    price: 9990,
    perfIndex: 72,
    releaseYear: 2022,
  },
  {
    id: 'fractal-design-north',
    category: 'case',
    brand: 'Fractal Design',
    name: 'Fractal Design North',
    highlights: ['ATX Mid Tower', 'до 355 мм видеокарта', 'до 170 мм кулер'],
    specs: {
      size: 'ATX Mid Tower',
      supportedBoards: ['ATX', 'mATX', 'Mini-ITX'],
      maxGpuMm: 355,
      maxCoolerMm: 170,
      psuFormFactor: 'ATX',
    },
    price: 13990,
    perfIndex: 66,
    releaseYear: 2022,
  },
  {
    id: 'corsair-4000d-airflow',
    category: 'case',
    brand: 'Corsair',
    name: 'Corsair 4000D Airflow',
    highlights: ['ATX Mid Tower', 'до 360 мм видеокарта', 'до 170 мм кулер'],
    specs: {
      size: 'ATX Mid Tower',
      supportedBoards: ['ATX', 'mATX', 'Mini-ITX'],
      maxGpuMm: 360,
      maxCoolerMm: 170,
      psuFormFactor: 'ATX',
    },
    price: 9990,
    perfIndex: 62,
    releaseYear: 2020,
  },
  {
    id: 'cooler-master-masterbox-q300l',
    category: 'case',
    brand: 'Cooler Master',
    name: 'Cooler Master MasterBox Q300L',
    highlights: ['Micro-ATX', 'до 360 мм видеокарта', 'до 159 мм кулер'],
    specs: {
      size: 'Micro-ATX',
      supportedBoards: ['mATX', 'Mini-ITX'],
      maxGpuMm: 360,
      maxCoolerMm: 159,
      psuFormFactor: 'ATX',
    },
    price: 5490,
    perfIndex: 40,
    releaseYear: 2017,
  },
  {
    id: 'cooler-master-nr200p',
    category: 'case',
    brand: 'Cooler Master',
    name: 'Cooler Master NR200P',
    highlights: ['Mini-ITX', 'до 330 мм видеокарта', 'до 155 мм кулер'],
    specs: {
      size: 'Mini-ITX',
      supportedBoards: ['Mini-ITX'],
      maxGpuMm: 330,
      maxCoolerMm: 155,
      psuFormFactor: 'SFX / SFX-L',
    },
    price: 11990,
    perfIndex: 58,
    releaseYear: 2020,
  },
]
