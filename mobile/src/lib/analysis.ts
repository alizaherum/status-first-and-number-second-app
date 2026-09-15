import { CategoryKey, EffortKey, Task } from "../types";
import { CATEGORIES, EFFORT_LEVELS, TIME_BUCKETS, TimeBucket, bucketForHour } from "../theme";

export interface CellStat {
  n: number;
  delayed: number;
}

export interface Insight {
  category: CategoryKey;
  timeBucket: TimeBucket;
  n: number;
  delayed: number;
  rate: number;
  score: number;
}

export interface AnalysisResult {
  total: number;
  delayed: number;
  catStats: Record<CategoryKey, CellStat>;
  ctStats: Record<CategoryKey, Record<string, CellStat>>;
  insights: Insight[];
}

function wilsonLowerBound(positive: number, n: number): number {
  if (n === 0) return 0;
  const z = 1.96;
  const phat = positive / n;
  const denom = 1 + (z * z) / n;
  const center = phat + (z * z) / (2 * n);
  const margin = z * Math.sqrt((phat * (1 - phat) + (z * z) / (4 * n)) / n);
  return (center - margin) / denom;
}

export function computeAll(tasks: Task[]): AnalysisResult {
  const total = tasks.length;
  const delayed = tasks.filter((t) => t.status === "delayed").length;

  const catStats = {} as Record<CategoryKey, CellStat>;
  CATEGORIES.forEach((c) => (catStats[c.key] = { n: 0, delayed: 0 }));

  const ctStats = {} as Record<CategoryKey, Record<string, CellStat>>;
  CATEGORIES.forEach((c) => {
    ctStats[c.key] = {};
    TIME_BUCKETS.forEach((tb) => (ctStats[c.key][tb.key] = { n: 0, delayed: 0 }));
  });

  tasks.forEach((t) => {
    if (!catStats[t.category]) return;
    catStats[t.category].n++;
    if (t.status === "delayed") catStats[t.category].delayed++;
    const tb = bucketForHour(t.scheduledHour);
    ctStats[t.category][tb.key].n++;
    if (t.status === "delayed") ctStats[t.category][tb.key].delayed++;
  });

  const candidates: Insight[] = [];
  CATEGORIES.forEach((c) => {
    TIME_BUCKETS.forEach((tb) => {
      const cell = ctStats[c.key][tb.key];
      if (cell.n >= 3) {
        const rate = cell.delayed / cell.n;
        candidates.push({
          category: c.key,
          timeBucket: tb,
          n: cell.n,
          delayed: cell.delayed,
          rate,
          score: wilsonLowerBound(cell.delayed, cell.n),
        });
      }
    });
  });
  candidates.sort((a, b) => b.score - a.score);
  let insights = candidates.filter((i) => i.rate >= 0.4).slice(0, 5);
  if (insights.length === 0) insights = candidates.slice(0, 3);

  return { total, delayed, catStats, ctStats, insights };
}

// ---------------- k-means clustering ----------------

function buildVector(t: Task): number[] {
  const v = new Array(CATEGORIES.length + 2).fill(0);
  const ci = CATEGORIES.findIndex((c) => c.key === t.category);
  if (ci >= 0) v[ci] = 1;
  v[CATEGORIES.length] = t.scheduledHour / 24;
  const effMin = EFFORT_LEVELS.find((e) => e.key === t.effortLevel)?.minutes ?? 35;
  v[CATEGORIES.length + 1] = Math.min(effMin, 120) / 120;
  return v;
}

function dist2(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    s += d * d;
  }
  return s;
}

interface KMeansResult {
  centers: number[][];
  assign: number[];
  inertia: number;
}

function kmeans(vectors: number[][], k: number, restarts: number): KMeansResult | null {
  if (vectors.length < k) return null;
  const dim = vectors[0].length;
  let best: KMeansResult | null = null;

  for (let r = 0; r < restarts; r++) {
    const centers: number[][] = [vectors[Math.floor(Math.random() * vectors.length)].slice()];
    while (centers.length < k) {
      const dists = vectors.map((v) => {
        let m = Infinity;
        centers.forEach((c) => {
          m = Math.min(m, dist2(v, c));
        });
        return m;
      });
      const sum = dists.reduce((a, b) => a + b, 0);
      if (sum === 0) {
        centers.push(vectors[Math.floor(Math.random() * vectors.length)].slice());
        continue;
      }
      const pick = Math.random() * sum;
      let acc = 0;
      let idx = 0;
      for (let i = 0; i < dists.length; i++) {
        acc += dists[i];
        if (acc >= pick) {
          idx = i;
          break;
        }
      }
      centers.push(vectors[idx].slice());
    }

    let assign = new Array(vectors.length).fill(0);
    for (let iter = 0; iter < 40; iter++) {
      let changed = false;
      for (let vi = 0; vi < vectors.length; vi++) {
        let bestD = Infinity;
        let bestC = 0;
        for (let ci = 0; ci < k; ci++) {
          const d = dist2(vectors[vi], centers[ci]);
          if (d < bestD) {
            bestD = d;
            bestC = ci;
          }
        }
        if (assign[vi] !== bestC) {
          assign[vi] = bestC;
          changed = true;
        }
      }
      const sums: number[][] = [];
      const counts: number[] = [];
      for (let c = 0; c < k; c++) {
        sums.push(new Array(dim).fill(0));
        counts.push(0);
      }
      for (let vi = 0; vi < vectors.length; vi++) {
        const a = assign[vi];
        counts[a]++;
        for (let d = 0; d < dim; d++) sums[a][d] += vectors[vi][d];
      }
      for (let c = 0; c < k; c++) {
        if (counts[c] === 0) continue;
        for (let d = 0; d < dim; d++) centers[c][d] = sums[c][d] / counts[c];
      }
      if (!changed) break;
    }

    let inertia = 0;
    for (let vi = 0; vi < vectors.length; vi++) inertia += dist2(vectors[vi], centers[assign[vi]]);
    if (!best || inertia < best.inertia) best = { centers, assign, inertia };
  }

  return best;
}

function mode<T extends string>(arr: T[]): { value: T; share: number } {
  const counts: Record<string, number> = {};
  let best = arr[0];
  let bestN = 0;
  arr.forEach((v) => {
    counts[v] = (counts[v] || 0) + 1;
    if (counts[v] > bestN) {
      bestN = counts[v];
      best = v;
    }
  });
  return { value: best, share: bestN / arr.length };
}

export interface Cluster {
  n: number;
  delayed: number;
  rate: number;
  category: CategoryKey;
  catShare: number;
  effort: EffortKey;
  effShare: number;
  timeBucket: TimeBucket;
}

export type ClusterResult = { ready: false; needed: number } | { ready: true; clusters: Cluster[] };

const MIN_TASKS_FOR_CLUSTERING = 12;

export function computeClusters(tasks: Task[]): ClusterResult {
  if (tasks.length < MIN_TASKS_FOR_CLUSTERING) {
    return { ready: false, needed: MIN_TASKS_FOR_CLUSTERING - tasks.length };
  }
  const k = tasks.length >= 28 ? 4 : 3;
  const vectors = tasks.map(buildVector);
  const result = kmeans(vectors, k, 6);
  if (!result) return { ready: false, needed: MIN_TASKS_FOR_CLUSTERING - tasks.length };

  const groups: Task[][] = Array.from({ length: k }, () => []);
  tasks.forEach((t, i) => groups[result.assign[i]].push(t));

  const clusters: Cluster[] = groups
    .filter((members) => members.length > 0)
    .map((members) => {
      const delayedN = members.filter((t) => t.status === "delayed").length;
      const catMode = mode(members.map((t) => t.category));
      const effMode = mode(members.map((t) => t.effortLevel));
      const avgHour = members.reduce((s, t) => s + t.scheduledHour, 0) / members.length;
      return {
        n: members.length,
        delayed: delayedN,
        rate: delayedN / members.length,
        category: catMode.value,
        catShare: catMode.share,
        effort: effMode.value,
        effShare: effMode.share,
        timeBucket: bucketForHour(Math.round(avgHour)),
      };
    })
    .sort((a, b) => b.rate - a.rate);

  return { ready: true, clusters };
}
