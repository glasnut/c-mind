// Категории комплектующих и настройки оценки для каждой из них.
//
// scoring.weights  — веса критериев (чем больше, тем важнее критерий для категории).
// scoring.valueRef — «эталонное» значение индекса производительности на 1000 ₽;
//                    при нём критерий «Цена/качество» получает 10 из 10.
// scoring.efficiencyRef — то же для индекса производительности на 1 Вт.
//
// scoring.labels  — названия критериев, если для категории они отличаются от стандартных.
// scoring.scenarios — см. data/scenarios.js (множители весов по сценариям использования).
//
// Эталонные значения — условная шкала демо-версии, их можно менять в одном месте.

export const CATEGORIES = {
  gpu: {
    id: 'gpu',
    name: 'Видеокарты',
    icon: 'gpu',
    scoring: {
      labels: { capacity: 'Объём видеопамяти' },
      weights: { performance: 4, efficiency: 2, value: 3, freshness: 1, capacity: 2 },
      valueRef: 1.5,
      efficiencyRef: 0.4,
    },
  },
  cpu: {
    id: 'cpu',
    name: 'Процессоры',
    icon: 'cpu',
    scoring: {
      labels: { capacity: 'Многопоточность' },
      weights: { performance: 4, efficiency: 2, value: 3, freshness: 1, capacity: 2 },
      valueRef: 3,
      efficiencyRef: 0.8,
    },
  },
  motherboard: {
    id: 'motherboard',
    name: 'Материнские платы',
    icon: 'motherboard',
    scoring: {
      labels: { performance: 'Класс платы' },
      weights: { performance: 3, value: 3, freshness: 2 },
      valueRef: 4,
    },
  },
  ram: {
    id: 'ram',
    name: 'Оперативная память',
    icon: 'ram',
    scoring: {
      labels: { performance: 'Объём и скорость' },
      weights: { performance: 4, value: 3, freshness: 1 },
      valueRef: 8,
    },
  },
  storage: {
    id: 'storage',
    name: 'SSD и HDD',
    icon: 'ssd',
    scoring: {
      labels: { performance: 'Скорость и объём' },
      weights: { performance: 4, value: 3, freshness: 1 },
      valueRef: 10,
    },
  },
  psu: {
    id: 'psu',
    name: 'Блоки питания',
    icon: 'psu',
    scoring: {
      labels: { performance: 'Класс блока (мощность и КПД)' },
      weights: { performance: 3, value: 3, freshness: 1 },
      valueRef: 9,
    },
  },
  case: {
    id: 'case',
    name: 'Корпуса',
    icon: 'case',
    scoring: {
      labels: { performance: 'Вместимость и продуваемость' },
      weights: { performance: 3, value: 3, freshness: 1 },
      valueRef: 8,
    },
  },
  cooler: {
    id: 'cooler',
    name: 'Системы охлаждения',
    icon: 'cooler',
    scoring: {
      labels: { performance: 'Охлаждающая способность' },
      weights: { performance: 3, value: 3, freshness: 1 },
      valueRef: 15,
    },
  },
}

export const CATEGORY_LIST = Object.values(CATEGORIES)
