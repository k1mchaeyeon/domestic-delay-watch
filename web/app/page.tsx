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
  return <Tabs h={await loadHistory()} />;
}
