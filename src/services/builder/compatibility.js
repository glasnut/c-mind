// Проверка совместимости сборки по характеристикам комплектующих.
//
// Каждая проверка работает, только если выбраны обе нужные детали, и возвращает:
//   { id, parts: ['cpu', 'motherboard'], status: 'error' | 'warn' | 'ok', title, text }
// error — детали физически или электрически не подойдут друг другу;
// warn  — собрать можно, но есть риск (нужно проверить или возможна потеря скорости).
// Вычислять то, чего нет в данных (например, длину конкретного партнёрского видеоадаптера
// или поддержку радиатора корпусом), мы не пытаемся — в таких случаях честно просим проверить.

import { estimatePower } from './power.js'

const pcieGen = (text) => Number(/PCIe (\d)/.exec(text ?? '')?.[1]) || null
const pcieLanes = (text) => Number(/x(\d+)/.exec(text ?? '')?.[1]) || null

const CHECKS = [
  function socket({ cpu, motherboard }) {
    if (!cpu || !motherboard) return null
    const same = cpu.specs.socket === motherboard.specs.socket
    return {
      id: 'socket',
      parts: ['cpu', 'motherboard'],
      status: same ? 'ok' : 'error',
      title: 'Сокет процессора и платы',
      text: same
        ? `Оба используют сокет ${cpu.specs.socket}.`
        : `Процессор для сокета ${cpu.specs.socket}, а плата — ${motherboard.specs.socket}. Они физически не совместимы.`,
    }
  },

  function memoryType({ ram, motherboard, cpu }) {
    const out = []
    if (ram && motherboard) {
      const same = ram.specs.type === motherboard.specs.memoryType
      out.push({
        id: 'ram-board',
        parts: ['ram', 'motherboard'],
        status: same ? 'ok' : 'error',
        title: 'Тип памяти и плата',
        text: same
          ? `Плата и память — ${ram.specs.type}.`
          : `Плата работает с ${motherboard.specs.memoryType}, а выбрана память ${ram.specs.type}. Установить её не получится.`,
      })
    }
    if (ram && cpu && !cpu.specs.memoryTypes.includes(ram.specs.type)) {
      out.push({
        id: 'ram-cpu',
        parts: ['ram', 'cpu'],
        status: 'error',
        title: 'Тип памяти и процессор',
        text: `Процессор поддерживает ${cpu.specs.memoryTypes.join(' / ')}, а выбрана память ${ram.specs.type}.`,
      })
    }
    return out
  },

  function memoryLimits({ ram, motherboard }) {
    if (!ram || !motherboard) return null
    const { memorySlots, maxMemoryGb } = motherboard.specs
    if (ram.specs.modules > memorySlots) {
      return { id: 'ram-slots', parts: ['ram', 'motherboard'], status: 'error', title: 'Слоты памяти', text: `В комплекте ${ram.specs.modules} планки, а на плате слотов: ${memorySlots}.` }
    }
    if (ram.specs.capacityGb > maxMemoryGb) {
      return { id: 'ram-max', parts: ['ram', 'motherboard'], status: 'error', title: 'Объём памяти', text: `Плата поддерживает до ${maxMemoryGb} ГБ, а в комплекте ${ram.specs.capacityGb} ГБ.` }
    }
    return { id: 'ram-slots', parts: ['ram', 'motherboard'], status: 'ok', title: 'Слоты и объём памяти', text: `${ram.specs.modules} из ${memorySlots} слотов, ${ram.specs.capacityGb} из ${maxMemoryGb} ГБ.` }
  },

  function boardInCase({ motherboard, case: pcCase }) {
    if (!motherboard || !pcCase) return null
    const ok = pcCase.specs.supportedBoards.includes(motherboard.specs.formFactor)
    return {
      id: 'board-case',
      parts: ['motherboard', 'case'],
      status: ok ? 'ok' : 'error',
      title: 'Формат платы и корпус',
      text: ok
        ? `Корпус поддерживает формат ${motherboard.specs.formFactor}.`
        : `Плата формата ${motherboard.specs.formFactor} не поместится: корпус рассчитан на ${pcCase.specs.supportedBoards.join(', ')}.`,
    }
  },

  function gpuLength({ gpu, case: pcCase }) {
    if (!gpu || !pcCase) return null
    const { lengthMm } = gpu.specs
    const max = pcCase.specs.maxGpuMm
    if (lengthMm > max) {
      return { id: 'gpu-case', parts: ['gpu', 'case'], status: 'error', title: 'Длина видеокарты', text: `Типичная длина ${gpu.name} — ${lengthMm} мм, корпус вмещает до ${max} мм.` }
    }
    // Длина у карт разных производителей отличается, поэтому при малом запасе — предупреждение.
    if (max - lengthMm < 15) {
      return { id: 'gpu-case', parts: ['gpu', 'case'], status: 'warn', title: 'Длина видеокарты', text: `Запас всего ${max - lengthMm} мм (типичная длина ${lengthMm} мм, корпус до ${max} мм). Уточните длину конкретной модели.` }
    }
    return { id: 'gpu-case', parts: ['gpu', 'case'], status: 'ok', title: 'Длина видеокарты', text: `Типичная длина ${lengthMm} мм, корпус вмещает до ${max} мм.` }
  },

  function coolerSocket({ cooler, cpu }) {
    if (!cooler || !cpu) return null
    const ok = cooler.specs.sockets.includes(cpu.specs.socket)
    return {
      id: 'cooler-socket',
      parts: ['cooler', 'cpu'],
      status: ok ? 'ok' : 'error',
      title: 'Крепление охлаждения',
      text: ok ? `Охлаждение поддерживает сокет ${cpu.specs.socket}.` : `Охлаждение не рассчитано на сокет ${cpu.specs.socket} (поддерживает: ${cooler.specs.sockets.join(', ')}).`,
    }
  },

  function coolerFit({ cooler, case: pcCase }) {
    if (!cooler || !pcCase) return null
    if (cooler.specs.heightMm != null) {
      const ok = cooler.specs.heightMm <= pcCase.specs.maxCoolerMm
      return {
        id: 'cooler-case',
        parts: ['cooler', 'case'],
        status: ok ? 'ok' : 'error',
        title: 'Высота кулера',
        text: ok
          ? `Высота ${cooler.specs.heightMm} мм, корпус допускает до ${pcCase.specs.maxCoolerMm} мм.`
          : `Кулер высотой ${cooler.specs.heightMm} мм не поместится: корпус допускает до ${pcCase.specs.maxCoolerMm} мм.`,
      }
    }
    // В данных корпусов нет поддерживаемых радиаторов — не выдумываем, просим проверить.
    return {
      id: 'cooler-case',
      parts: ['cooler', 'case'],
      status: 'warn',
      title: 'Радиатор СЖО',
      text: `Для СЖО с радиатором ${cooler.specs.radiatorMm} мм поддержку нужно проверить в документации корпуса: в базе таких данных нет.`,
    }
  },

  function coolingCapacity({ cooler, cpu }) {
    if (!cooler || !cpu || cooler.specs.heightMm == null) return null
    if (cpu.powerW >= 120 && cooler.perfIndex < 45) {
      return { id: 'cooler-power', parts: ['cooler', 'cpu'], status: 'warn', title: 'Запас охлаждения', text: `Процессор выделяет от ${cpu.powerW} Вт, а башенный кулер относится к базовому классу. Под нагрузкой возможен перегрев и сброс частот. Ориентир условный.` }
    }
    return null
  },

  function powerSupply(parts) {
    const { psu, cpu, gpu } = parts
    if (!psu || !(cpu || gpu)) return null
    const need = estimatePower(parts)
    const recommended = gpu?.specs.recommendedPsuW ?? 0
    const watts = psu.specs.watts
    if (watts < need.total) {
      return { id: 'psu-power', parts: ['psu', 'cpu', 'gpu'], status: 'error', title: 'Мощность блока питания', text: `Расчётная нагрузка ~${need.total} Вт, а блок даёт ${watts} Вт.` }
    }
    if (watts < recommended) {
      return { id: 'psu-power', parts: ['psu', 'gpu'], status: 'warn', title: 'Мощность блока питания', text: `Расчётная нагрузка ~${need.total} Вт, блок ${watts} Вт, но производитель видеокарты рекомендует от ${recommended} Вт.` }
    }
    return { id: 'psu-power', parts: ['psu', 'cpu', 'gpu'], status: 'ok', title: 'Мощность блока питания', text: `Расчётная нагрузка ~${need.total} Вт, блок ${watts} Вт${recommended ? `, рекомендация для видеокарты — от ${recommended} Вт` : ''}.` }
  },

  function psuFormFactor({ psu, case: pcCase }) {
    if (!psu || !pcCase) return null
    const caseNeedsSfx = pcCase.specs.psuFormFactor.includes('SFX')
    const psuIsSfx = psu.specs.formFactor.includes('SFX')
    if (caseNeedsSfx && !psuIsSfx) {
      return { id: 'psu-case', parts: ['psu', 'case'], status: 'error', title: 'Формат блока питания', text: `Корпус рассчитан на ${pcCase.specs.psuFormFactor}, а выбран блок формата ${psu.specs.formFactor}.` }
    }
    if (!caseNeedsSfx && psuIsSfx) {
      return { id: 'psu-case', parts: ['psu', 'case'], status: 'warn', title: 'Формат блока питания', text: 'Блок SFX в корпусе под ATX потребует переходную рамку.' }
    }
    return { id: 'psu-case', parts: ['psu', 'case'], status: 'ok', title: 'Формат блока питания', text: `Корпус и блок: ${pcCase.specs.psuFormFactor}.` }
  },

  function pcieSlot({ gpu, motherboard }) {
    if (!gpu || !motherboard) return null
    const boardGen = pcieGen(motherboard.specs.pcieGpu)
    const gpuGen = pcieGen(gpu.specs.interface)
    const lanes = pcieLanes(gpu.specs.interface)
    if (boardGen && gpuGen && boardGen < gpuGen) {
      const slow = lanes && lanes <= 8
      return {
        id: 'gpu-pcie',
        parts: ['gpu', 'motherboard'],
        status: slow ? 'warn' : 'ok',
        title: 'Интерфейс видеокарты',
        text: slow
          ? `Видеокарта использует ${gpu.specs.interface}, а плата даёт PCIe ${boardGen}.0. Карта заработает, но с урезанной шиной возможна потеря скорости.`
          : `Видеокарта ${gpu.specs.interface} на плате с PCIe ${boardGen}.0 работает, пропускная способность шины ниже; на практике разница обычно небольшая.`,
      }
    }
    return { id: 'gpu-pcie', parts: ['gpu', 'motherboard'], status: 'ok', title: 'Интерфейс видеокарты', text: `Видеокарта (${gpu.specs.interface}) и плата (${motherboard.specs.pcieGpu}) совместимы.` }
  },

  function storageSlot({ storage, motherboard }) {
    if (!storage || !motherboard) return null
    if (!storage.specs.formFactor.startsWith('M.2')) {
      return { id: 'storage-board', parts: ['storage', 'motherboard'], status: 'ok', title: 'Подключение накопителя', text: `${storage.specs.kind} подключается по SATA — отдельный слот M.2 не нужен.` }
    }
    const ok = motherboard.specs.m2Slots >= 1
    return {
      id: 'storage-board',
      parts: ['storage', 'motherboard'],
      status: ok ? 'ok' : 'error',
      title: 'Слот M.2',
      text: ok ? `Слотов M.2 на плате: ${motherboard.specs.m2Slots}.` : 'На плате нет слота M.2 для этого накопителя.',
    }
  },

  function integratedGraphics({ cpu, gpu }) {
    if (!cpu || gpu || cpu.specs.igpu) return null
    return { id: 'no-video', parts: ['cpu', 'gpu'], status: 'warn', title: 'Вывод изображения', text: `У ${cpu.name} нет встроенной графики, без видеокарты изображения не будет.` }
  },
]

export function checkCompatibility(parts) {
  const results = CHECKS.flatMap((check) => check(parts) ?? []).filter(Boolean)
  return {
    errors: results.filter((r) => r.status === 'error'),
    warnings: results.filter((r) => r.status === 'warn'),
    passed: results.filter((r) => r.status === 'ok'),
  }
}
