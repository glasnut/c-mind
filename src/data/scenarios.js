// Сценарии использования: набор весов критериев оценки.
// Чем больше вес, тем сильнее критерий влияет на итоговую оценку.
// «Универсально» не имеет своих весов — берутся веса категории (data/categories.js).

export const SCENARIOS = {
  universal: {
    id: 'universal',
    name: 'Универсально',
    description: 'Сбалансированная оценка по умолчанию',
    weights: null,
  },
  gaming: {
    id: 'gaming',
    name: 'Игры',
    description: 'Главное — производительность, затем цена',
    weights: { performance: 5, efficiency: 1, value: 3, freshness: 1 },
  },
  work: {
    id: 'work',
    name: 'Работа',
    description: 'Важны цена и экономичность, не нужен максимум мощности',
    weights: { performance: 2, efficiency: 3, value: 4, freshness: 1 },
  },
  video: {
    id: 'video',
    name: 'Монтаж видео',
    description: 'Максимальная производительность важнее цены',
    weights: { performance: 6, efficiency: 1, value: 2, freshness: 1 },
  },
  programming: {
    id: 'programming',
    name: 'Программирование',
    description: 'Хорошая мощность при разумной цене и тишине',
    weights: { performance: 4, efficiency: 2, value: 3, freshness: 1 },
  },
}

export const SCENARIO_LIST = Object.values(SCENARIOS)

export const WEIGHT_LABELS = {
  performance: 'Производительность',
  efficiency: 'Энергоэффективность',
  value: 'Цена/качество',
  freshness: 'Актуальность',
}
