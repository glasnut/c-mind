// Демонстрационная база систем охлаждения процессора.
//
// sockets — поддерживаемые сокеты (LGA1851 использует то же крепление, что и LGA1700).
// heightMm — высота башенного кулера (для сравнения с вместимостью корпуса);
// radiatorMm — длина радиатора у жидкостного охлаждения.
// perfIndex — УСЛОВНЫЙ индекс охлаждающей способности (0–100): экспертная оценка класса
//             конструкции по открытым обзорам, не результат собственных измерений.
// price     — УСЛОВНАЯ цена в рублях, не актуальное предложение.

export const coolers = [
  {
    id: 'cooler-master-hyper-212-black',
    category: 'cooler',
    brand: 'Cooler Master',
    name: 'Cooler Master Hyper 212 Black',
    highlights: ['Башенный', '1×120 мм', 'высота 159 мм'],
    specs: {
      type: 'Башенный воздушный',
      heightMm: 159,
      fans: '1×120 мм',
      sockets: ['AM4', 'AM5', 'LGA1700'],
    },
    price: 3990,
    perfIndex: 40,
    releaseYear: 2022,
  },
  {
    id: 'deepcool-ak400',
    category: 'cooler',
    brand: 'DeepCool',
    name: 'DeepCool AK400',
    highlights: ['Башенный', '1×120 мм', 'высота 155 мм'],
    specs: {
      type: 'Башенный воздушный',
      heightMm: 155,
      fans: '1×120 мм',
      sockets: ['AM4', 'AM5', 'LGA1700', 'LGA1851'],
    },
    price: 2990,
    perfIndex: 52,
    releaseYear: 2022,
  },
  {
    id: 'thermalright-peerless-assassin-120-se',
    category: 'cooler',
    brand: 'Thermalright',
    name: 'Thermalright Peerless Assassin 120 SE',
    highlights: ['Двухбашенный', '2×120 мм', 'высота 155 мм'],
    specs: {
      type: 'Башенный воздушный',
      heightMm: 155,
      fans: '2×120 мм',
      sockets: ['AM4', 'AM5', 'LGA1700', 'LGA1851'],
    },
    price: 3490,
    perfIndex: 66,
    releaseYear: 2022,
  },
  {
    id: 'noctua-nh-d15-g2',
    category: 'cooler',
    brand: 'Noctua',
    name: 'Noctua NH-D15 G2',
    highlights: ['Двухбашенный', '2×140 мм', 'высота 168 мм'],
    specs: {
      type: 'Башенный воздушный',
      heightMm: 168,
      fans: '2×140 мм',
      sockets: ['AM4', 'AM5', 'LGA1700', 'LGA1851'],
    },
    price: 14990,
    perfIndex: 82,
    releaseYear: 2024,
  },
  {
    id: 'arctic-liquid-freezer-iii-240',
    category: 'cooler',
    brand: 'Arctic',
    name: 'Arctic Liquid Freezer III 240',
    highlights: ['СЖО', 'радиатор 240 мм', '2×120 мм'],
    specs: {
      type: 'Жидкостное (СЖО)',
      radiatorMm: 240,
      fans: '2×120 мм',
      sockets: ['AM4', 'AM5', 'LGA1700', 'LGA1851'],
    },
    price: 7490,
    perfIndex: 70,
    releaseYear: 2023,
  },
  {
    id: 'arctic-liquid-freezer-iii-360',
    category: 'cooler',
    brand: 'Arctic',
    name: 'Arctic Liquid Freezer III 360',
    highlights: ['СЖО', 'радиатор 360 мм', '3×120 мм'],
    specs: {
      type: 'Жидкостное (СЖО)',
      radiatorMm: 360,
      fans: '3×120 мм',
      sockets: ['AM4', 'AM5', 'LGA1700', 'LGA1851'],
    },
    price: 9490,
    perfIndex: 86,
    releaseYear: 2023,
  },
]
