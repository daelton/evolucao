/*
 * Evolução · sincronização com o app Saúde (HealthKit)
 * -----------------------------------------------------
 * Lógica pura, sem nada de iPhone: recebe um "gateway" (quem lê o HealthKit)
 * e a função ingest(...) do app (a mesma porta de entrada que o simulador usa).
 * Por ser pura, roda e é testada no Node hoje (health-sync.test.js).
 * No app nativo, só troca o gateway falso pelo real (healthkit-gateway.js).
 */

// Valores de HKCategoryValueSleepAnalysis que contam como "dormindo"
// 0 inBed · 1 asleepUnspecified · 2 awake · 3 asleepCore · 4 asleepDeep · 5 asleepREM
const SLEEP_ASLEEP = new Set([1, 3, 4, 5]);

// HKWorkoutActivityType (número) → o que o Evolução faz com o treino
// "forca" marca o treino do dia ("Fui"); o resto vira minutos de movimento
const WORKOUT_MAP = {
  50: "forca",        // traditionalStrengthTraining
  20: "forca",        // functionalStrengthTraining
  59: "forca",        // coreTraining
  63: "forca",        // highIntensityIntervalTraining
  11: "forca",        // crossTraining
  52: "Caminhada",    // walking
  24: "Caminhada",    // hiking
  37: "Corrida",      // running
  13: "Bike",         // cycling
  46: "Natação",      // swimming
  41: "Futebol",      // soccer
  51: "Vôlei",        // volleyball
  14: "Dança", 77: "Dança", 78: "Dança", // dance, cardioDance, socialDance
};

const pad = (n) => String(n).padStart(2, "0");

/** Dia "lógico" do Evolução: o dia vira no meio do sono (cutoffMin), não à meia-noite. */
function logicalDate(ms, cutoffMin) {
  const d = new Date(ms - cutoffMin * 60000);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Janela [início, fim) de um dia lógico, em milissegundos. */
function dayWindow(date, cutoffMin) {
  const [y, m, d] = date.split("-").map(Number);
  const from = new Date(y, m - 1, d, 0, 0, 0, 0).getTime() + cutoffMin * 60000;
  return { from, to: from + 86400000 };
}

/** Junta os trechos "dormindo" (acordou no meio? até 90 min junta) e devolve a sessão mais longa. */
function mergeSleep(samples, gapMin = 90) {
  const parts = (samples || [])
    .filter((s) => SLEEP_ASLEEP.has(Number(s.value)))
    .map((s) => ({ a: +new Date(s.startDate), b: +new Date(s.endDate) }))
    .filter((s) => s.b > s.a)
    .sort((x, y) => x.a - y.a);
  const sessions = [];
  for (const s of parts) {
    const cur = sessions[sessions.length - 1];
    if (cur && s.a - cur.b <= gapMin * 60000) cur.b = Math.max(cur.b, s.b);
    else sessions.push({ ...s });
  }
  sessions.sort((x, y) => y.b - y.a - (x.b - x.a));
  return sessions[0] || null;
}

function classifyWorkout(w) {
  const k = WORKOUT_MAP[Number(w.workoutActivityType)];
  if (k === "forca") return { kind: "forca" };
  return { kind: "atividade", act: k || "Outro" };
}

const DEFAULTS = { steps: true, sleep: true, workouts: true, weight: true, water: false };

/**
 * Lê o que estiver ligado e manda para o app pela porta ingest(...).
 * Um tipo que falhar (ex.: permissão negada) não impede os outros.
 * Chamar ao abrir o app e ao voltar para ele. Pode chamar várias vezes: não duplica.
 */
async function syncHealth({ gateway, ingest, cutoffMin, now = Date.now(), settings = {} }) {
  const cfg = { ...DEFAULTS, ...settings };
  const out = { steps: null, sleep: null, workouts: 0, weight: null, water: 0, errors: [], unavailable: false };
  if (!(await gateway.available())) return { ...out, unavailable: true };
  const today = logicalDate(now, cutoffMin);
  const yday = logicalDate(now - 86400000, cutoffMin);
  const safe = async (key, fn) => { try { await fn(); } catch (e) { out.errors.push(`${key}: ${(e && e.message) || e}`); } };

  if (cfg.steps) await safe("passos", async () => {
    for (const d of [yday, today]) {
      const w = dayWindow(d, cutoffMin);
      const n = await gateway.stepsBetween(w.from, Math.min(w.to, now));
      if (n == null) continue;
      ingest("steps", d, Math.round(n), "Saúde");
      if (d === today) out.steps = Math.round(n);
    }
  });

  if (cfg.sleep) await safe("sono", async () => {
    const w = dayWindow(today, cutoffMin);
    const m = mergeSleep(await gateway.sleepSamples(w.from - 12 * 3600000, now));
    if (m && logicalDate(m.b, cutoffMin) === today && m.b - m.a >= 2 * 3600000) {
      ingest("sleep", m.a, m.b, "Saúde");
      out.sleep = { bed: m.a, wake: m.b };
    }
  });

  if (cfg.workouts) await safe("treinos", async () => {
    const w = dayWindow(yday, cutoffMin);
    for (const x of (await gateway.workouts(w.from, now)) || []) {
      const c = classifyWorkout(x), a = +new Date(x.startDate), b = +new Date(x.endDate);
      const r = ingest("workout", { uuid: x.uuid, kind: c.kind, act: c.act, start: a, end: b, minutes: Math.round((b - a) / 60000) }, "Saúde");
      if (r && r.ok && r.why !== "já importado") out.workouts++;
    }
  });

  if (cfg.weight) await safe("peso", async () => {
    const x = await gateway.latestWeight(now - 7 * 86400000, now);
    if (x && x.kg) { ingest("weight", x.kg, +new Date(x.date), x.uuid, "Saúde"); out.weight = x.kg; }
  });

  if (cfg.water) await safe("água", async () => {
    const w = dayWindow(today, cutoffMin);
    for (const x of (await gateway.waterSamples(w.from, now)) || []) {
      const r = ingest("water", x.liters, +new Date(x.date), x.uuid, "Saúde");
      if (r && r.ok && r.why !== "já importado") out.water++;
    }
  });
  return out;
}

const api = { syncHealth, mergeSleep, classifyWorkout, logicalDate, dayWindow, WORKOUT_MAP, SLEEP_ASLEEP };
if (typeof module !== "undefined") module.exports = api;
