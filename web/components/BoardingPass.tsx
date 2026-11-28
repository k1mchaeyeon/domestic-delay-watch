"use client";

// 내 비행기 탑승권 카드: 노선(FROM → TO) · 출발/도착(예정은 취소선) · 상태 · 진행 막대 · 절취선 스텁
// 여기서는 실시간 ADS-B 칸을 빼고, 회전 테이블 기록(예정·실제 시각, 등록번호)만 쓰도록 바꿨다. 색은 이 화면 토큰을 쓴다.
import type { Leg } from "@/lib/types";
import { delayTone, delayWord, hm, mins } from "@/lib/words";

const TONE_BG = { ok: "bg-ok", warn: "bg-warn", bad: "bg-bad" } as const;

function Plane({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
    </svg>
  );
}

function Field({ k, v, strike, tone }: { k: string; v: string; strike?: string; tone?: "ok" | "warn" | "bad" }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] font-semibold tracking-wider text-ink-3">{k}</div>
      <div className={`num truncate text-[15px] font-bold ${tone ? `text-${tone}` : "text-ink"}`}>{v}</div>
      {strike && <div className="num text-[11px] text-ink-3 line-through">{strike}</div>}
    </div>
  );
}

export function BoardingPass({ r, ko }: { r: Leg; ko: (c: string | null) => string }) {
  const d = r.dep_delay_gate_est_min, tone = delayTone(d);
  const status = d == null ? "기록 없음" : delayWord(d);
  // 진행: 착륙했으면 100%, 이륙만 했으면 50%, 아직이면 0% (기록 기준, 실시간 위치 아님)
  const pct = r.arr_actual_at ? 100 : r.dep_actual_at ? 50 : 0;
  const block = (mins(r.arr_actual_at || r.arr_sched_at) ?? 0) - (mins(r.dep_actual_at || r.dep_sched_at) ?? 0);
  const late = (a: string | null, s: string) => (a && hm(a) !== hm(s) ? hm(s) : undefined);
  return (
    <section className="overflow-hidden rounded-[8px] border border-line bg-surface">
      <div className="flex items-center justify-between bg-accent px-4 py-2 text-accent-ink">
        <span className="flex items-center gap-2 text-[13px] font-bold tracking-wider">BOARDING PASS <Plane className="size-4" /></span>
        <span className="truncate pl-2 text-xs font-medium opacity-90">{r.airline_name}</span>
      </div>
      <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_auto_220px]">
        {/* 본권 */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-semibold tracking-wider text-ink-3">FROM</div>
              <div className="num text-4xl font-black leading-none tracking-tight text-ink">{r.dep_airport}</div>
              <div className="mt-1 text-xs text-ink-2">{ko(r.dep_airport)}</div>
            </div>
            <div className="flex flex-1 flex-col items-center text-accent">
              <div className="relative h-5 w-full">
                <span className="absolute left-0 top-1/2 size-2 -translate-y-1/2 rounded-full border-2 border-ink" />
                <span className="absolute right-0 top-1/2 size-2 -translate-y-1/2 rounded-full bg-ink" />
                <span className="absolute left-3 right-3 top-1/2 border-t-2 border-dotted border-line-strong" />
                <span className="absolute left-3 top-1/2 h-0.5 -translate-y-1/2 bg-accent" style={{ width: `calc((100% - 24px) * ${pct / 100})` }} />
                <span className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface px-0.5" style={{ left: `calc(12px + (100% - 24px) * ${pct / 100})` }}><Plane className="size-4 rotate-45" /></span>
              </div>
              <span className="num mt-1 text-[11px] text-ink-3">{block > 0 ? `${block}분 비행` : ""}</span>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-semibold tracking-wider text-ink-3">TO</div>
              <div className="num text-4xl font-black leading-none tracking-tight text-ink">{r.arr_airport}</div>
              <div className="mt-1 text-xs text-ink-2">{ko(r.arr_airport)}</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
            <Field k="FLIGHT" v={r.flight_no} />
            <Field k="DATE" v={`${+r.flight_date.slice(5, 7)}월 ${+r.flight_date.slice(8, 10)}일`} />
            <Field k="DEPART" v={hm(r.dep_actual_at) || hm(r.dep_sched_at)} strike={late(r.dep_actual_at, r.dep_sched_at)} tone={tone} />
            <Field k="ARRIVE" v={hm(r.arr_actual_at) || hm(r.arr_sched_at)} strike={late(r.arr_actual_at, r.arr_sched_at)} />
          </div>
        </div>
        {/* 절취선 */}
        <div className="relative hidden w-0 md:block">
          <span className="absolute -left-3 -top-3 size-6 rounded-full border border-line bg-bg" />
          <span className="absolute -bottom-3 -left-3 size-6 rounded-full border border-line bg-bg" />
          <span className="absolute bottom-4 left-0 top-4 border-l-2 border-dashed border-line-strong" />
        </div>
        {/* 스텁 */}
        <div className="flex flex-col justify-between gap-3 border-t border-dashed border-line-strong px-5 py-4 md:border-t-0">
          <div>
            <div className="text-[10px] font-semibold tracking-wider text-ink-3">STATUS</div>
            <span className={`mt-1 inline-block rounded-[4px] px-2 py-0.5 text-xs font-bold text-white ${tone ? TONE_BG[tone] : "bg-ink-3"}`}>{status}</span>
          </div>
          <Field k="AIRCRAFT" v={r.reg_no} />
          <div className="h-8" aria-hidden="true"
            style={{ background: "repeating-linear-gradient(90deg,var(--ink) 0 2px,transparent 2px 4px,var(--ink) 4px 5px,transparent 5px 8px,var(--ink) 8px 11px,transparent 11px 12px)" }} />
        </div>
      </div>
    </section>
  );
}
