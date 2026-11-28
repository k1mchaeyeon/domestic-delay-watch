"use client";

// 공항 출발 안내판(FIDS) 모양의 표: 시간 · 변경 · 항공사 · 편명 · 목적지 · 비고
// 실시간 시계·게이트·탑승 상태는 빼고, 회전 테이블 기록(예정·실제 출발, 지연 분)만 쓰도록 줄였다.
import type { Leg } from "@/lib/types";
import { AIR_CODE, hm } from "@/lib/words";

function remark(x: Leg) {
  const d = x.dep_delay_gate_est_min;
  if (x.dep_status && /결항|취소/.test(x.dep_status)) return { ko: "결항", en: "CANCELLED", cls: "text-red-400" };
  if (d == null) return { ko: "예정", en: "SCHEDULED", cls: "text-sky-300" };
  if (d > 15) return { ko: "지연출발", en: `+${Math.round(d)} MIN`, cls: "text-amber-300" };
  return { ko: "출발", en: "DEPARTED", cls: "text-emerald-300" };
}

export function FidsBoard({ rows, ko, mine }: { rows: Leg[]; ko: (c: string | null) => string; mine?: Leg }) {
  const cols = "grid-cols-[48px_48px_minmax(96px,1.3fr)_64px_minmax(70px,1fr)_minmax(84px,1fr)]";
  return (
    <div className="overflow-hidden rounded-[6px] border-4 border-[#05070d] bg-[#0a1a47]">
      <div className={`grid ${cols} gap-2 bg-[#0d2463] px-3 py-1.5 text-[11px] font-bold leading-tight text-white`}>
        {[["시간", "Time"], ["변경", "Actual"], ["항공사", "Airline"], ["편명", "Flight"], ["목적지", "To"], ["비고", "Remarks"]].map(([k, e]) => (
          <span key={e}>{k}<span className="block font-semibold text-slate-400">{e}</span></span>
        ))}
      </div>
      {rows.map((x, i) => {
        const rm = remark(x), code = AIR_CODE[x.airline_name] ?? x.flight_no.slice(0, 2);
        const changed = x.dep_actual_at && hm(x.dep_actual_at) !== hm(x.dep_sched_at);
        return (
          <div key={x.flight_no + x.dep_sched_at}
            className={`grid ${cols} items-center gap-2 px-3 py-1.5 text-[12px] font-bold text-white ${i % 2 ? "bg-[#0f2a6b]" : "bg-[#0b2159]"} ${x === mine ? "outline outline-2 -outline-offset-2 outline-amber-400" : ""}`}>
            <span className="font-mono tabular-nums">{hm(x.dep_sched_at)}</span>
            <span className={`font-mono tabular-nums ${changed ? ((x.dep_delay_gate_est_min ?? 0) > 15 ? "text-amber-300" : "text-sky-200") : "text-transparent"}`}>{changed ? hm(x.dep_actual_at) : "--:--"}</span>
            <span className="flex min-w-0 items-center gap-1.5">
              <span className="flex h-4 w-[26px] shrink-0 items-center justify-center rounded-[2px] bg-white/15 text-[11px] font-black">{code}</span>
              <span className="truncate font-semibold text-slate-100">{x.airline_name}</span>
            </span>
            <span className="font-mono">{x.flight_no}</span>
            <span className="truncate">{ko(x.arr_airport)}</span>
            <span className={`min-w-0 leading-tight ${rm.cls}`}>
              <span className="block truncate">{rm.ko}</span>
              <span className="block truncate text-[11px] font-semibold opacity-80">{rm.en}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
