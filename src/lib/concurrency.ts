type TaskMap = Record<string, () => Promise<any>>;
type SettledResult = { status: "fulfilled"; value: any } | { status: "rejected"; reason: any };
export async function runAll(tasks: TaskMap): Promise<Record<string, any>> {
  const keys = Object.keys(tasks);
  const promises = keys.map(k => tasks[k]());
  const values = await Promise.all(promises);
  return keys.reduce((acc, k, i) => {
    acc[k] = values[i];
    return acc;
  }, {} as Record<string, any>);
}
export async function runAllSettled(tasks: TaskMap): Promise<Record<string, SettledResult>> {
  const keys = Object.keys(tasks);
  const promises = keys.map(k => tasks[k]().then(v => ({ status: "fulfilled", value: v } as SettledResult)).catch(e => ({ status: "rejected", reason: e } as SettledResult)));
  const values = await Promise.all(promises);
  return keys.reduce((acc, k, i) => {
    acc[k] = values[i];
    return acc;
  }, {} as Record<string, SettledResult>);
}
export async function runWithLimit(tasks: TaskMap, limit: number): Promise<Record<string, any>> {
  const entries = Object.entries(tasks);
  const results: Record<string, any> = {};
  let idx = 0;
  const workers: Promise<void>[] = [];
  const worker = async () => {
    while (idx < entries.length) {
      const i = idx++;
      const [key, fn] = entries[i];
      const value = await fn();
      results[key] = value;
    }
  };
  for (let i = 0; i < Math.max(1, limit); i++) workers.push(worker());
  await Promise.all(workers);
  return results;
}
export async function timed(tasks: TaskMap): Promise<{ results: Record<string, any>; timings: Record<string, number> }> {
  const keys = Object.keys(tasks);
  const timings: Record<string, number> = {};
  const wrapped: TaskMap = {};
  keys.forEach(k => {
    wrapped[k] = async () => {
      const s = performance.now();
      const v = await tasks[k]();
      const e = performance.now();
      timings[k] = e - s;
      return v;
    };
  });
  const results = await runAll(wrapped);
  return { results, timings };
}
export async function groupFetch(config: Array<{ key: string; fn: () => Promise<any>; transform?: (v: any) => any }>): Promise<Record<string, any>> {
  const tasks: TaskMap = {};
  config.forEach(c => {
    tasks[c.key] = async () => {
      const v = await c.fn();
      return c.transform ? c.transform(v) : v;
    };
  });
  return runAll(tasks);
}
