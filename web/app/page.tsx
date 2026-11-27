import { readFile } from "node:fs/promises";
import path from "node:path";
import type { History } from "@/lib/types";
import { Tabs } from "@/components/Tabs";

// 과거 기록 집계는 빌드할 때 읽는다(public/data/history.json, scripts/export_athena.py 가 만든다)
async function loadHistory(): Promise<History> {
  const raw = await readFile(path.join(process.cwd(), "public", "data", "history.json"), "utf8");
  return JSON.parse(raw) as History;
}

export default async function Home() {
  const h = await loadHistory();
  return (
    <main className="mx-auto flex max-w-[920px] flex-col gap-4 px-4 pb-16 pt-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">국내선 지연 워치</h1>
        <p className="text-xs text-sub">항공정보포털 국내선 기록 {h.period.from.slice(0, 4)}~{h.period.to.slice(0, 4)}년</p>
      </header>
      <Tabs h={h} />
    </main>
  );
}
