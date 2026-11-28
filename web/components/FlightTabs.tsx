"use client";

// 출발 전 · 공항에서 · 도착: 같은 "내 비행기"(편명+비행일)를 보고 각 단계 질문에 답한다 (HTML 1차안과 같은 계산·문구)
import { useEffect, useMemo, useState } from "react";
import type { Airports, History, Leg, Satellite } from "@/lib/types";
import { clock, dayLabel, delayTone, delayWord, dur, hm, mins, shift } from "@/lib/words";
import { Airline, Answer, Badge, Card, KpiTile, Src, Table, type Col } from "@/components/ui";
import { SatMap } from "@/components/SatMap";
import { CascadeGraph } from "@/components/CascadeGraph";
import { BoardingPass } from "@/components/BoardingPass";
import { FidsBoard } from "@/components/FidsBoard";
import { cascadeOrigin, computeCascade, MTT_MIN } from "@/lib/cascade";

type Ctx = { h: History; AP: Airports; ROT: Record<string, Leg[]>; DAYS: string[]; day: string; cur: Leg; goDay: (d: string, fno?: string) => void; SAT: Satellite | null };
const koOf = (AP: Airports) => (c: string | null) => (c ? AP[c]?.ko ?? c : "");
const KACS = (days: string[]) => `한국공항공사 API · ${days.length > 1 ? `${dayLabel(days[0])}~${dayLabel(days[days.length - 1])}` : dayLabel(days[0])} · 15분 초과 지연`;
const legsOf = (rows: Leg[], r: Leg) => rows.filter((x) => x.reg_no === r.reg_no).sort((a, b) => (a.dep_sched_at < b.dep_sched_at ? -1 : 1));

export function LeaveTab({ h, AP, ROT, DAYS, day, cur, goDay, SAT }: Ctx) {
  const ko = koOf(AP);
  const r = cur, d = r.dep_delay_gate_est_min;
  const legs = legsOf(ROT[day], r), i = legs.indexOf(r), prev = i > 0 ? legs[i - 1] : null;
  const carried = (r.carried_delay_min ?? 0) > 0 && ["propagated", "external"].includes(r.delay_origin_type);
  const on = (dd: string) => ROT[dd]?.find((x) => x.flight_no === r.flight_no && x.dep_airport === r.dep_airport);
  // 같은 편명은 매일 같은 번호로 뜬다 → 어제와 지난주 같은 요일만 비교(요일마다 경향이 달라서)
  const cmp = (label: string, dd: string) => {
    const x = on(dd), m = x?.dep_delay_gate_est_min;
    const ok = m != null;
    return <KpiTile key={label} label={`${label} · ${dayLabel(dd)}`} value={ok ? `${Math.max(0, Math.round(m!))}` : "기록 없음"} unit={ok ? "분 늦음" : undefined}
      tone={ok ? delayTone(m) : undefined} note={ok ? (m! <= 15 ? "제때" : "지연") : undefined} />;
  };

  return (
    <div className="flex flex-col gap-4">
      <Answer q="내 비행기, 오늘 늦을까요?"
        sub={prev && r.prev_flight ? <>이 비행기는 {ko(r.prev_dep_airport)}에서 오는 {r.prev_flight}편을 마치고 와요. 그 비행기가 {(r.prev_arr_delay_min ?? 0) > 5 ? `${dur(r.prev_arr_delay_min ?? 0)} 늦게` : "제때"} 도착했어요.</> : "오늘 이 비행기의 첫 비행이에요."}>
        {d == null ? "출발 기록이 없어요" : d <= 15 ? <span className="text-ok">제때 떠요</span>
          : carried ? <>앞 비행기가 늦게 와서 <span className={d > 45 ? "text-bad" : "text-warn"}>{dur(d)}쯤</span> 늦게 떠요</>
          : <><span className={d > 45 ? "text-bad" : "text-warn"}>{dur(d)}쯤</span> 늦게 떠요</>}
      </Answer>

      <BoardingPass r={r} ko={ko} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card title="내가 탈 비행기는 지금 어디쯤?">
          <SatMap key={r.flight_no + day} legs={prev ? [prev, r] : [r]} cur={r} AP={AP} SAT={SAT} />
          <Src>{KACS([day])} · 위치는 이착륙 시각으로 추정 · 위성 사진 Esri</Src>
        </Card>
        <Card title={`${r.flight_no} 어제 · 지난주 같은 요일`}>
          <div className="grid grid-cols-2 gap-3">{cmp("어제", shift(day, -1))}{cmp("지난주 같은 요일", shift(day, -7))}</div>
          <Src>{KACS(DAYS)} · 같은 편명·출발 공항 · 데이터가 없는 날은 기록 없음</Src>
        </Card>
      </div>

      <Card title="이 비행기의 오늘 일정">
        <Table<Leg> cols={[
          { key: "t", label: "출발 예정", width: "96px", render: (l) => hm(l.dep_sched_at) },
          { key: "rt", label: "구간", render: (l) => `${ko(l.dep_airport)} → ${ko(l.arr_airport)}` },
          { key: "no", label: "편명", wide: true, render: (l) => l.flight_no },
          { key: "s", label: "출발", align: "right", render: (l) => <Badge tone={delayTone(l.dep_delay_gate_est_min)}>{delayWord(l.dep_delay_gate_est_min)}</Badge> },
        ]} rows={legs} rowKey={(l) => l.flight_no + l.dep_sched_at} selected={(l) => l === r} />
        <Src>{KACS([day])} · {r.reg_no}</Src>
      </Card>

      <Domino legs={legs} r={r} ko={ko} />
    </div>
  );
}

// 지연 도미노 + 가정(what-if): "만약 이 편이 N분 더 늦으면 내 비행기는?"
function Domino({ legs, r, ko }: { legs: Leg[]; r: Leg; ko: (c: string | null) => string }) {
  const before = legs.slice(0, legs.indexOf(r) + 1);
  const [pick, setPick] = useState(""), [extra, setExtra] = useState(0);
  const what = before.some((l) => l.flight_no === pick) ? pick : before[0]?.flight_no ?? "";
  useEffect(() => { setPick(""); setExtra(0); }, [r]);
  const base = useMemo(() => computeCascade(legs), [legs]);
  const chain = useMemo(() => computeCascade(legs, extra && what ? { [what]: extra } : {}), [legs, what, extra]);
  const mine = chain.find((c) => c.leg === r), mineBase = base.find((c) => c.leg === r);
  const moved = mine && mineBase ? Math.round(mine.depDelayMin - mineBase.depDelayMin) : 0;
  const hops = chain.filter((c) => c.carriedMin > 0).length;
  const field = "num h-8 rounded-[6px] border border-line-strong bg-surface px-2 text-[13px] text-ink";

  return (
    <Card title="지연 도미노" right={<span>준비 시간이 {MTT_MIN}분보다 짧으면 앞 편 지연이 넘어와요 · 오늘 {hops}번 넘어옴</span>}>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-[13px] text-ink-2">
        <span>만약</span>
        <select aria-label="가정할 편" value={what} onChange={(e) => setPick(e.target.value)} className={field}>
          {before.map((l) => <option key={l.flight_no + l.dep_sched_at} value={l.flight_no}>{l.flight_no} ({hm(l.dep_sched_at)})</option>)}
        </select>
        <span>편이</span>
        <input type="range" min={0} max={90} step={5} value={extra} onChange={(e) => setExtra(+e.target.value)} aria-label="더 늦어지는 시간(분)" className="w-32 accent-[var(--accent)]" />
        <span className="num w-24 text-ink">{extra}분 더 늦으면</span>
        {extra > 0 && <span className="font-medium text-ink">→ 내 비행기 {moved > 0 ? <span className="text-bad">{dur(moved)} 더 늦어요</span> : <span className="text-ok">그대로예요</span>}</span>}
      </div>
      <CascadeGraph chain={chain} myFlight={r.flight_no} ko={ko} />
      <Src>한국공항공사 API · {r.flight_date} · {r.reg_no} · 슬라이더는 가정</Src>
    </Card>
  );
}

export function AirportTab({ h, AP, ROT, day, cur }: Ctx) {
  const ko = koOf(AP);
  const r = cur, d = r.dep_delay_gate_est_min, t = r.delay_origin_type;
  let ans: React.ReactNode, why: React.ReactNode = null;
  if (d == null || d <= 15) ans = <span className="text-ok">늦지 않았어요</span>;
  else if (["propagated", "external"].includes(t) && (r.carried_delay_min ?? 0) > 0) {
    ans = <>앞 비행기가 <span className="text-bad">{dur(r.prev_arr_delay_min ?? 0)}</span> 늦게 도착해서 늦어요</>;
    const o = cascadeOrigin(computeCascade(legsOf(ROT[day], r)), r.flight_no);
    why = <>{r.prev_flight}편({ko(r.prev_dep_airport)} → {ko(r.dep_airport)})이 예정보다 늦은 {hm(r.prev_arr_actual_at)}에 들어왔어요. 이 편 출발 예정은 {hm(r.dep_sched_at)}이었어요.
      {o && o.hops > 1 && <> 지연은 {hm(o.origin.leg.dep_sched_at)} {o.origin.leg.flight_no}편({ko(o.origin.leg.dep_airport)} → {ko(o.origin.leg.arr_airport)})이 늦게 도착한 데서 시작해 {o.hops}편째 이어졌어요.</>}</>;
  } else if (t === "first_leg") ans = <>오늘 첫 비행이라 앞 비행기 탓은 아니에요</>;
  else if (t === "unknown") ans = "앞 비행기 기록이 없어서 이유를 모르겠어요";
  else { ans = <>앞 비행기는 제때 왔어요</>; why = <>그런데도 {dur(d)} 늦게 떴어요.</>; }

  const hr = h.route_hour.find((x) => x.dep === ko(r.dep_airport) && x.arr === ko(r.arr_airport) && x.h === +r.dep_sched_at.slice(11, 13));
  const p50 = hr ? Math.max(0, Math.round(hr.p50)) : null, p90 = hr ? Math.max(0, Math.round(hr.p90)) : null;
  const t0 = mins(r.dep_sched_at) ?? 0;
  const alts = ROT[day].filter((x) => x !== r && x.dep_airport === r.dep_airport && x.arr_airport === r.arr_airport && (mins(x.dep_sched_at) ?? 0) >= t0 - 30)
    .sort((a, b) => (a.dep_sched_at < b.dep_sched_at ? -1 : 1)).slice(0, 5);

  return (
    <div className="flex flex-col gap-4">
      <Answer q={`${r.flight_no}, 왜 늦어요?`} sub={why}>{ans}</Answer>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="얼마나 기다려야 해요?">
          {p90 != null && p50 != null ? (
            <>
              <p className="text-[15px] font-semibold">
                {d != null && d > 15 ? <>지금 <span className={d > 45 ? "text-bad" : "text-warn"}>{dur(d)}</span> 늦었어요. 보통은 {p90}분을 넘기지 않아요</> : <>늦어져도 보통 {p90}분 안에는 떠요</>}
              </p>
              <p className="mt-1 text-[13px] text-ink-2">이 시간대 {ko(r.dep_airport)} → {ko(r.arr_airport)} 비행기 10대 중 9대가 {p90}분 안에, 절반은 {p50}분 안에 떠났어요.</p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <KpiTile label="절반은" value={`${p50}`} unit="분 안" />
                <KpiTile label="10대 중 9대" value={`${p90}`} unit="분 안" />
                <KpiTile label="이 비행기" value={d == null ? "-" : `${Math.max(0, Math.round(d))}`} unit={d == null ? undefined : "분"} tone={delayTone(d)} />
              </div>
            </>
          ) : <p className="text-ink-2">이 노선은 지난 기록이 부족해요</p>}
          <Src>항공정보포털 · {h.period.from.slice(0, 4)}.{+h.period.from.slice(4, 6)}~{h.period.to.slice(0, 4)}.{+h.period.to.slice(4, 6)}{hr ? ` · ${hr.flights.toLocaleString()}편` : ""}</Src>
        </Card>
        <Card title="다른 비행기로 바꿀 수 있을까요?" right={<span>{alts.length ? `${ko(r.arr_airport)} 가는 다음 비행기 ${alts.length}편` : "다음 비행기 없음"}</span>}>
          {alts.length ? (
            <FidsBoard rows={alts} ko={ko} />
          ) : <p className="text-ink-2">이날은 {ko(r.arr_airport)} 가는 다음 비행기가 없어요</p>}
          <Src>{KACS([day])}</Src>
        </Card>
      </div>
    </div>
  );
}

const EXIT = 15;
export function ArriveTab({ AP, cur }: Ctx) {
  const ko = koOf(AP);
  const r = cur, land = mins(r.arr_actual_at || r.arr_sched_at) ?? 0, sched = mins(r.arr_sched_at) ?? 0;
  const diff = r.arr_actual_at ? land - sched : null;
  const [meet, setMeet] = useState(() => clock(Math.ceil((land + 90) / 30) * 30));
  const [out, setOut] = useState(15), [move, setMove] = useState(40);
  useEffect(() => { setMeet(clock(Math.ceil((land + 90) / 30) * 30)); }, [land]);
  const [mh, mm] = meet.split(":").map(Number);
  const left = mh * 60 + mm - (land + 5 + out + move);
  const field = "num h-8 rounded-[6px] border border-line-strong bg-surface px-2.5 text-[13px] text-ink";
  return (
    <div className="flex flex-col gap-4">
      <Answer q={`${r.flight_no}, ${ko(r.arr_airport)}에 언제 마중 나가면 돼요?`}
        sub={<>{r.arr_actual_at ? `${hm(r.arr_actual_at)}에 착륙했어요` : `${hm(r.arr_sched_at)} 도착 예정이에요`}{diff == null ? "" : diff > 5 ? `(예정보다 ${dur(diff)} 늦게)` : diff < -5 ? `(예정보다 ${dur(-diff)} 일찍)` : "(예정대로)"}.</>}>
        <span className="text-accent">{clock(land + 5 + EXIT)}</span>쯤 도착장에 계시면 돼요
      </Answer>
      <Card title="약속에 맞출 수 있을까요?">
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1 text-xs text-ink-2">약속 시각<input type="time" value={meet} onChange={(e) => setMeet(e.target.value)} className={field} /></label>
          <label className="flex flex-col gap-1 text-xs text-ink-2">공항에서 나오는 데(분)<input type="number" min={0} step={5} value={out} onChange={(e) => setOut(+e.target.value || 0)} className={`${field} w-28`} /></label>
          <label className="flex flex-col gap-1 text-xs text-ink-2">약속 장소까지(분)<input type="number" min={0} step={5} value={move} onChange={(e) => setMove(+e.target.value || 0)} className={`${field} w-28`} /></label>
        </div>
        <Src>한국공항공사 API · {r.flight_date} 착륙 기록</Src>
        <p className="mt-4 text-xl font-semibold">{left >= 0 ? <>약속까지 <span className="text-ok">{dur(left)}</span> 남아요</> : <>약속에 <span className="text-bad">{dur(-left)}</span> 늦어요</>}</p>
      </Card>
    </div>
  );
}
