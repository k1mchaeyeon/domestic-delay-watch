"use client";

import { useState } from "react";
import type { History } from "@/lib/types";
import { BookTab } from "@/components/BookTab";

const TABS = [
  { id: "book", label: "예약할 때", sub: "몇 시가 좋을까" },
  { id: "leave", label: "출발 전", sub: "오늘 늦을까" },
  { id: "airport", label: "공항에서", sub: "왜, 얼마나" },
  { id: "arrive", label: "도착", sub: "언제 나올까" },
] as const;
type TabId = (typeof TABS)[number]["id"];

export function Tabs({ h }: { h: History }) {
  const [tab, setTab] = useState<TabId>("book");
  return (
    <>
      <nav role="tablist" aria-label="여행 단계" className="sticky top-0 z-10 grid grid-cols-4 gap-1 rounded-2xl border border-line bg-card p-1">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
            className={`rounded-xl px-1.5 py-2.5 text-sm font-semibold transition-colors ${tab === t.id ? "bg-blue text-white" : "text-sub hover:bg-soft"}`}>
            {t.label}
            <span className="block text-[11px] font-medium opacity-80">{t.sub}</span>
          </button>
        ))}
      </nav>
      {tab === "book" && <BookTab h={h} />}
      {tab !== "book" && (
        <section className="rounded-[20px] border border-dashed border-line px-5 py-8 text-sub">
          이 탭은 HTML 1차안(site/index.html)에서 옮기는 중이에요. 편 검색·지도·다른 날 비교를 같은 구조로 컴포넌트로 나눌 예정이에요.
        </section>
      )}
    </>
  );
}
