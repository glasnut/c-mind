// Слоты сборки: порядок, как удобно выбирать (от «сердца» ПК к корпусу).
export const SLOTS = ['cpu', 'motherboard', 'ram', 'gpu', 'storage', 'psu', 'case', 'cooler']

// Цели сборки: насколько важна каждая деталь для итоговой оценки производительности.
// Доли в сумме дают 1. Это условная модель демо-версии, а не результат тестов.
export const PURPOSES = {
  universal: { id: 'universal', name: 'Универсальное', weights: { gpu: 0.3, cpu: 0.3, ram: 0.2, storage: 0.2 }, minRamGb: 16 },
  gaming: { id: 'gaming', name: 'Игры', weights: { gpu: 0.5, cpu: 0.3, ram: 0.1, storage: 0.1 }, minRamGb: 16 },
  work: { id: 'work', name: 'Работа', weights: { cpu: 0.45, ram: 0.25, storage: 0.2, gpu: 0.1 }, minRamGb: 16 },
  video: { id: 'video', name: 'Монтаж видео', weights: { cpu: 0.35, gpu: 0.3, ram: 0.2, storage: 0.15 }, minRamGb: 32 },
  programming: { id: 'programming', name: 'Программирование', weights: { cpu: 0.4, ram: 0.3, storage: 0.2, gpu: 0.1 }, minRamGb: 32 },
}
export const PURPOSE_LIST = Object.values(PURPOSES)

// Названия слотов в единственном числе: «Процессор», а не «Процессоры»
export const SLOT_NAMES = {
  cpu: 'Процессор',
  motherboard: 'Материнская плата',
  ram: 'Оперативная память',
  gpu: 'Видеокарта',
  storage: 'Накопитель',
  psu: 'Блок питания',
  case: 'Корпус',
  cooler: 'Охлаждение процессора',
}
