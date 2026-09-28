/*
 * Evolução · gateway real do HealthKit (só roda no app nativo, com Expo + build próprio)
 * ---------------------------------------------------------------------------------
 * É o ÚNICO arquivo que conversa com o iPhone. Todo o resto é testado no Node.
 * Biblioteca: @kingstinct/react-native-healthkit (não funciona no Expo Go).
 *
 * ⚠️ Conferir no aparelho: os nomes e o formato das opções mudaram entre versões
 * da biblioteca. Na hora de instalar, bata as 5 funções abaixo com a documentação
 * da versão instalada. A saída de cada função está documentada e é o que importa.
 */
import {
  isHealthDataAvailable,
  requestAuthorization,
  queryStatisticsForQuantity,
  queryCategorySamples,
  queryWorkoutSamples,
  queryQuantitySamples,
} from "@kingstinct/react-native-healthkit";

export const READ_TYPES = [
  "HKQuantityTypeIdentifierStepCount",
  "HKCategoryTypeIdentifierSleepAnalysis",
  "HKQuantityTypeIdentifierBodyMass",
  "HKQuantityTypeIdentifierDietaryWater",
  "HKWorkoutTypeIdentifier",
];

const range = (from, to) => ({ filter: { startDate: new Date(from), endDate: new Date(to) } });

export const gateway = {
  /** true se o aparelho tem HealthKit (iPad antigo não tem). */
  available: async () => !!(await isHealthDataAvailable()),

  /** Pede permissão de leitura. O iPhone não conta se a pessoa negou: as leituras só vêm vazias. */
  authorize: async () => requestAuthorization(READ_TYPES, []),

  /** Soma de passos entre dois instantes (ms). Saída: número. */
  stepsBetween: async (from, to) => {
    const r = await queryStatisticsForQuantity("HKQuantityTypeIdentifierStepCount", ["cumulativeSum"], { ...range(from, to), unit: "count" });
    return r?.sumQuantity?.quantity ?? 0;
  },

  /** Amostras de sono. Saída: [{ value, startDate, endDate }]. */
  sleepSamples: async (from, to) => {
    const L = await queryCategorySamples("HKCategoryTypeIdentifierSleepAnalysis", { ...range(from, to), limit: 0 });
    return (L || []).map((s) => ({ value: s.value, startDate: s.startDate, endDate: s.endDate }));
  },

  /** Treinos. Saída: [{ uuid, workoutActivityType, startDate, endDate }]. */
  workouts: async (from, to) => {
    const L = await queryWorkoutSamples({ ...range(from, to), limit: 0 });
    return (L || []).map((w) => ({ uuid: w.uuid, workoutActivityType: w.workoutActivityType, startDate: w.startDate, endDate: w.endDate }));
  },

  /** Peso mais recente no período. Saída: { kg, date, uuid } ou null. */
  latestWeight: async (from, to) => {
    const L = await queryQuantitySamples("HKQuantityTypeIdentifierBodyMass", { ...range(from, to), unit: "kg", limit: 1, ascending: false });
    const x = L && L[0];
    return x ? { kg: x.quantity, date: x.endDate || x.startDate, uuid: x.uuid } : null;
  },

  /** Água registrada no Saúde. Saída: [{ liters, date, uuid }]. */
  waterSamples: async (from, to) => {
    const L = await queryQuantitySamples("HKQuantityTypeIdentifierDietaryWater", { ...range(from, to), unit: "L", limit: 0 });
    return (L || []).map((x) => ({ liters: x.quantity, date: x.endDate || x.startDate, uuid: x.uuid }));
  },
};
