// Оценка потребления сборки. Считаем по базовой мощности процессора и видеокарты (TDP/TBP)
// плюс запас на остальные компоненты; пиковые нагрузки процессора могут быть выше.
const REST_OF_SYSTEM_W = 100

export function estimatePower({ cpu, gpu }) {
  const cpuW = cpu?.powerW ?? 0
  const gpuW = gpu?.powerW ?? 0
  return { cpuW, gpuW, restW: REST_OF_SYSTEM_W, total: cpuW + gpuW + REST_OF_SYSTEM_W }
}
