"use client";

// 앱 셸: 왼쪽 사이드바(여정 4단계 + 데이터 기준) + 위쪽 헤더(페이지 제목 + 필터 한 줄) + 본문(최대 1440px)
import { useEffect, useMemo, useState } from "react";
import type { Airports, History, Leg, Questions, Satellite } from "@/lib/types";
import { dayLabel, hm, iso, ymd } from "@/lib/words";
import { DateInput, Select, TextInput } from "@/components/ui";
import { BookTab } from "@/components/BookTab";
import { AirportTab, ArriveTab, LeaveTab } from "@/components/FlightTabs";
import { BlamePage, ChainBreakPage, OriginPage } from "@/components/QuestionPages";

const STEPS = [
  { id: "book", label: "예약할 때", q: "몇 시 비행기가 덜 늦을까" },
  { id: "leave", label: "출발 전", q: "오늘 늦을까, 어디쯤 올까" },
  { id: "airport", label: "공항에서", q: "왜 늦나, 얼마나 기다리나" },
  { id: "arrive", label: "도착", q: "언제 나오나" },
] as const;
// 질문별 분석(한 질문 = 한 페이지)
const QSTEPS = [
  { id: "q-chain", label: "연쇄는 어디서 끊기나", q: "준비 시간과 지연 전파" },
  { id: "q-blame", label: "앞 비행기 탓인가", q: "시간대·공항별 비율" },
  { id: "q-origin", label: "어디서 시작되나", q: "공항 × 시간대" },
] as const;
type StepId = (typeof STEPS)[number]["id"] | (typeof QSTEPS)[number]["id"];

export function Tabs({ h }: { h: History }) {
  const [step, setStep] = useState<StepId>("book");
  const [dep, setDep] = useState(h.routes[0].dep);
  const arrs = h.routes.filter((r) => r.dep === dep).map((r) => r.arr);
  const [arrPick, setArr] = useState(h.routes[0].arr);
  const arr = arrs.includes(arrPick) ? arrPick : arrs[0];
  const deps = useMemo(() => [...new Set(h.routes.map((r) => r.dep))], [h]);

  // 비행기별 기록(회전 테이블)은 화면에서 받아 온다
  const [AP, setAP] = useState<Airports | null>(null);
  const [DAYS, setDays] = useState<string[]>([]);
  const [ROT, setRot] = useState<Record<string, Leg[]>>({});
  const [SAT, setSat] = useState<Satellite | null>(null);
  const [Q, setQ] = useState<Questions | null>(null);
  useEffect(() => { fetch("/data/questions.json").then((r) => r.json()).then(setQ).catch(() => setQ(null)); }, []);
  const isQ = step.startsWith("q-");
  const [day, setDay] = useState("");
  const [fno, setFno] = useState("");
  useEffect(() => {
    (async () => {
      const [ap, days, sat] = await Promise.all([fetch("/data/airports.json").then((r) => r.json()), fetch("/data/days.json").then((r) => r.json()), fetch("/data/satellite.json").then((r) => r.json()).catch(() => null)]);
      const rot: Record<string, Leg[]> = {};
      await Promise.all((days as string[]).map(async (d) => { rot[d] = await fetch(`/data/rotation_${d}.json`).then((r) => r.json()); }));
      // 기본 비행일 = 출발 기록이 다 찬 가장 최근 날, 기본 편 = 앞 비행기 때문에 35분 안팎 늦은 편
      const full = [...days].reverse().find((d: string) => rot[d].filter((r) => r.dep_actual_at).length > rot[d].length * 0.8) ?? days[days.length - 1];
      const sample = rot[full].filter((r) => r.delay_origin_type === "propagated" && (r.carried_delay_min ?? 0) > 0 && (r.dep_delay_gate_est_min ?? 0) > 15)
        .sort((a, b) => Math.abs((a.dep_delay_gate_est_min ?? 0) - 35) - Math.abs((b.dep_delay_gate_est_min ?? 0) - 35))[0] ?? rot[full][0];
      setAP(ap); setDays(days); setRot(rot); setSat(sat); setDay(full); setFno(sample.flight_no);
    })();
  }, []);
  const cur = day && ROT[day] ? ROT[day].find((x) => x.flight_no === fno) ?? null : null;
  const goDay = (d: string, f?: string) => { if (!ROT[d]) return; setDay(d); if (f) setFno(f); };
  const flightNos = day && ROT[day] ? [...new Set(ROT[day].map((r) => r.flight_no))].sort() : [];
  const ko = (c: string) => AP?.[c]?.ko ?? c;
  const meta = [...STEPS, ...QSTEPS].find((s) => s.id === step)!;

  return (
    <div className="min-h-screen md:grid md:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="border-b border-line bg-surface md:sticky md:top-0 md:flex md:h-screen md:flex-col md:border-b-0 md:border-r">
        <div className="flex h-14 items-center px-4 text-[15px] font-semibold">국내선 지연 워치</div>
        <nav aria-label="여행 단계" className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:pb-0">
          {STEPS.map((s, i) => (
            <button key={s.id} onClick={() => setStep(s.id)} aria-current={step === s.id ? "page" : undefined}
              className={`flex min-w-max items-center gap-2.5 rounded-[6px] px-2.5 py-2 text-left text-[13px] transition-colors md:min-w-0 ${step === s.id ? "bg-subtle font-semibold text-ink" : "text-ink-2 hover:bg-subtle hover:text-ink"}`}>
              <span className={`num grid size-5 place-items-center rounded-[4px] border text-[11px] ${step === s.id ? "border-accent bg-accent text-accent-ink" : "border-line-strong text-ink-3"}`}>{i + 1}</span>
              <span className="flex flex-col"><span>{s.label}</span><span className="hidden text-xs font-normal text-ink-3 md:block">{s.q}</span></span>
            </button>
          ))}
        </nav>
        <div className="mt-3 hidden px-4 pb-1 text-[11px] font-medium text-ink-3 md:block">질문별 분석</div>
        <nav aria-label="질문별 분석" className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:pb-0">
          {QSTEPS.map((s) => (
            <button key={s.id} onClick={() => setStep(s.id)} aria-current={step === s.id ? "page" : undefined}
              className={`flex min-w-max items-center gap-2.5 rounded-[6px] px-2.5 py-2 text-left text-[13px] transition-colors md:min-w-0 ${step === s.id ? "bg-subtle font-semibold text-ink" : "text-ink-2 hover:bg-subtle hover:text-ink"}`}>
              <span className={`grid size-5 place-items-center rounded-[4px] border text-[11px] ${step === s.id ? "border-accent bg-accent text-accent-ink" : "border-line-strong text-ink-3"}`}>Q</span>
              <span className="flex flex-col"><span>{s.label}</span><span className="hidden text-xs font-normal text-ink-3 md:block">{s.q}</span></span>
            </button>
          ))}
        </nav>
        <div className="mt-auto hidden border-t border-line px-4 py-3 text-xs leading-5 text-ink-3 md:block">
          <div>운항 기록 {h.period.from.slice(0, 4)}.{+h.period.from.slice(4, 6)}~{h.period.to.slice(0, 4)}.{+h.period.to.slice(4, 6)}</div>
          {DAYS.length > 0 && <div>비행기별 기록 {dayLabel(DAYS[0])}~{dayLabel(DAYS[DAYS.length - 1])}</div>}
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-10 border-b border-line bg-bg/90 px-4 py-3 backdrop-blur-[2px] md:px-6">
          {/* 제목·요약(왼쪽 두 줄)과 필터(오른쪽)를 나눠, 한 줄에 몰아 넣지 않는다 */}
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <div className="min-w-0">
              <h1 className="text-[15px] font-semibold leading-tight">{meta.label}</h1>
              <p className="num mt-0.5 truncate text-xs text-ink-2">
                {isQ ? "국내선 전체 · 회전 테이블과 과거 운항 실적으로 답한 질문"
                  : step === "book" ? `${dep} → ${arr} 노선의 지난 운항 기록`
                  : cur ? `${cur.flight_no} · ${ko(cur.dep_airport)} → ${ko(cur.arr_airport)} · ${dayLabel(day)} ${hm(cur.dep_sched_at)} 출발 예정` : "편명과 비행일을 골라 주세요"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isQ ? null : step === "book" ? (
                <>
                  <Select label="출발" value={dep} options={deps} onChange={setDep} />
                  <span aria-hidden="true" className="text-ink-3">→</span>
                  <Select label="도착" value={arr} options={arrs} onChange={setArr} />
                </>
              ) : (
                <>
                  <TextInput label="편명" value={fno} onChange={setFno} list="fnos" placeholder="예: KE1626" />
                  <datalist id="fnos">{flightNos.map((f) => <option key={f} value={f} />)}</datalist>
                  {DAYS.length > 0 && <DateInput label="비행일" value={iso(day)} min={iso(DAYS[0])} max={iso(DAYS[DAYS.length - 1])} onChange={(v) => goDay(ymd(v))} />}
                </>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] p-4 md:p-6">
          {step === "q-chain" && Q && <ChainBreakPage q={Q} />}
          {step === "q-blame" && Q && <BlamePage q={Q} AP={AP} />}
          {step === "q-origin" && Q && <OriginPage q={Q} AP={AP} />}
          {isQ && !Q && <p className="text-ink-2">질문별 분석 자료를 불러오는 중이에요</p>}
          {step === "book" && <BookTab h={h} dep={dep} arr={arr} />}
          {!isQ && step !== "book" && (!AP || !cur) && <p className="text-ink-2">{AP && fno ? `${dayLabel(day)}에는 ${fno}편 기록이 없어요` : "비행기별 기록을 불러오는 중이에요"}</p>}
          {!isQ && step !== "book" && AP && cur && (
            <>
              {step === "leave" && <LeaveTab h={h} AP={AP} ROT={ROT} DAYS={DAYS} day={day} cur={cur} goDay={goDay} SAT={SAT} />}
              {step === "airport" && <AirportTab h={h} AP={AP} ROT={ROT} DAYS={DAYS} day={day} cur={cur} goDay={goDay} SAT={SAT} />}
              {step === "arrive" && <ArriveTab h={h} AP={AP} ROT={ROT} DAYS={DAYS} day={day} cur={cur} goDay={goDay} SAT={SAT} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
