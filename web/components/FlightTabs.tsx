"use client";

// 출발 전 · 공항에서 · 도착: 같은 "내 비행기"(편명+비행일)를 보고 각 단계 질문에 답한다 (HTML 1차안과 같은 계산·문구)
import { useEffect, useState } from "react";
import type { Airports, History, Leg, Satellite } from "@/lib/types";
import { clock, dayLabel, delayTone, delayWord, dur, hm, mins, shift } from "@/lib/words";
import { Airline, Answer, Badge, Card, KpiTile, Table, type Col } from "@/components/ui";
import { SatMap } from "@/components/SatMap";

type Ctx = { h: History; AP: Airports; ROT: Record<string, Leg[]>; DAYS: string[]; day: string; cur: Leg; goDay: (d: string, fno?: string) => void; SAT: Satellite | null };
const koOf = (AP: Airports) => (c: string | null) => (c ? AP[c]?.ko ?? c : "");
const legsOf = (rows: Leg[], r: Leg) => rows.filter((x) => x.reg_no === r.reg_no).sort((a, b) => (a.dep_sched_at < b.dep_sched_at ? -1 : 1));

export function LeaveTab({ h, AP, ROT, DAYS, day, cur, goDay, SAT }: Ctx) {
  const ko = koOf(AP);
  const r = cur, d = r.dep_delay_gate_est_min;
  const legs = legsOf(ROT[day], r), i = legs.indexOf(r), prev = i > 0 ? legs[i - 1] : null;
  const carried = (r.carried_delay_min ?? 0) > 0 && ["propagated", "external"].includes(r.delay_origin_type);
  const on = (dd: string) => ROT[dd]?.find((x) => x.flight_no === r.flight_no && x.dep_airport === r.dep_airport);
  const seen = DAYS.map(on).filter((x): x is Leg => !!x && x.dep_delay_gate_est_min != null);
  const lateN = seen.filter((x) => (x.dep_delay_gate_est_min ?? 0) > 15).length;
  const cmp = (label: string, dd: string) => {
    const x = on(dd), m = x?.dep_delay_gate_est_min;
    return <KpiTile key={label} label={`${label} · ${ROT[dd] ? dayLabel(dd) : "기록 없음"}`} value={!ROT[dd] ? "-" : !x ? "운항 없음" : delayWord(m)} tone={x ? delayTone(m) : undefined} />;
  };

  return (
    <div className="flex flex-col gap-4">
      <Answer q="내 비행기, 오늘 늦을까요?"
        sub={prev && r.prev_flight ? <>이 비행기는 {ko(r.prev_dep_airport)}에서 오는 {r.prev_flight}편을 마치고 와요. 그 비행기가 {(r.prev_arr_delay_min ?? 0) > 5 ? `${dur(r.prev_arr_delay_min ?? 0)} 늦게` : "제때"} 도착했어요.</> : "오늘 이 비행기의 첫 비행이에요."}>
        {d == null ? "출발 기록이 없어요" : d <= 15 ? <span className="text-ok">제때 떠요</span>
          : carried ? <>앞 비행기가 늦게 와서 <span className={d > 45 ? "text-bad" : "text-warn"}>{dur(d)}쯤</span> 늦게 떠요</>
          : <><span className={d > 45 ? "text-bad" : "text-warn"}>{dur(d)}쯤</span> 늦게 떠요</>}
      </Answer>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile label="출발 예정" value={hm(r.dep_sched_at)} note={`${ko(r.dep_airport)} → ${ko(r.arr_airport)}`} />
        <KpiTile label="실제 이륙" value={hm(r.dep_actual_at) || "-"} tone={delayTone(d)} note={d == null ? undefined : delayWord(d)} />
        <KpiTile label="도착 예정" value={hm(r.arr_sched_at)} />
        <KpiTile label="실제 착륙" value={hm(r.arr_actual_at) || "-"} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card title="내가 탈 비행기는 지금 어디쯤?">
          <SatMap key={r.flight_no + day} legs={prev ? [prev, r] : [r]} cur={r} AP={AP} SAT={SAT} />
        </Card>
        <Card title={`${r.flight_no}, 다른 날은 어땠어요?`} right={<span>최근 {seen.length}번 운항 중 {lateN}번 늦음</span>}>
          <div className="mb-4 grid grid-cols-2 gap-3">{cmp("하루 전", shift(day, -1))}{cmp("일주일 전 같은 요일", shift(day, -7))}</div>
          <Table<string>
            cols={[
              { key: "d", label: "날짜", render: (dd) => dayLabel(dd) },
              { key: "s", label: "출발", align: "right", render: (dd) => { const x = on(dd); return x ? <Badge tone={delayTone(x.dep_delay_gate_est_min)}>{delayWord(x.dep_delay_gate_est_min)}</Badge> : <span className="text-ink-3">운항 없음</span>; } },
            ]}
            rows={[...DAYS].reverse()} rowKey={(dd) => dd} selected={(dd) => dd === day} onRow={(dd) => on(dd) && goDay(dd, r.flight_no)} />
        </Card>
      </div>

      <Card title="이 비행기의 오늘 일정">
        <Table<Leg> cols={[
          { key: "t", label: "출발 예정", width: "96px", render: (l) => hm(l.dep_sched_at) },
          { key: "rt", label: "구간", render: (l) => `${ko(l.dep_airport)} → ${ko(l.arr_airport)}` },
          { key: "no", label: "편명", render: (l) => l.flight_no },
          { key: "s", label: "출발", align: "right", render: (l) => <Badge tone={delayTone(l.dep_delay_gate_est_min)}>{delayWord(l.dep_delay_gate_est_min)}</Badge> },
        ]} rows={legs} rowKey={(l) => l.flight_no + l.dep_sched_at} selected={(l) => l === r} />
      </Card>
    </div>
  );
}

export function AirportTab({ h, AP, ROT, day, cur }: Ctx) {
  const ko = koOf(AP);
  const r = cur, d = r.dep_delay_gate_est_min, t = r.delay_origin_type;
  let ans: React.ReactNode, why: React.ReactNode = null;
  if (d == null || d <= 15) ans = <span className="text-ok">늦지 않았어요</span>;
  else if (["propagated", "external"].includes(t) && (r.carried_delay_min ?? 0) > 0) {
    ans = <>앞 비행기가 <span className="text-bad">{dur(r.prev_arr_delay_min ?? 0)}</span> 늦게 도착해서 늦어요</>;
    why = <>{r.prev_flight}편({ko(r.prev_dep_airport)} → {ko(r.dep_airport)})이 예정보다 늦은 {hm(r.prev_arr_actual_at)}에 들어왔어요. 이 편 출발 예정은 {hm(r.dep_sched_at)}이었어요.</>;
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
        </Card>
        <Card title="다른 비행기로 바꿀 수 있을까요?" right={<span>{alts.length ? `${ko(r.arr_airport)} 가는 다음 비행기 ${alts.length}편` : "다음 비행기 없음"}</span>}>
          {alts.length ? (
            <Table<Leg> cols={[
              { key: "t", label: "출발 예정", width: "96px", render: (x) => <span className="font-medium">{hm(x.dep_sched_at)}</span> },
              { key: "a", label: "항공사", render: (x) => <Airline name={x.airline_name} /> },
              { key: "n", label: "편명", render: (x) => x.flight_no },
              { key: "s", label: "출발", align: "right", render: (x) => <Badge tone={delayTone(x.dep_delay_gate_est_min)}>{x.dep_delay_gate_est_min == null ? "예정" : delayWord(x.dep_delay_gate_est_min)}</Badge> },
            ] as Col<Leg>[]} rows={alts} rowKey={(x) => x.flight_no + x.dep_sched_at} />
          ) : <p className="text-ink-2">이날은 {ko(r.arr_airport)} 가는 다음 비행기가 없어요</p>}
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
        <p className="mt-4 text-xl font-semibold">{left >= 0 ? <>약속까지 <span className="text-ok">{dur(left)}</span> 남아요</> : <>약속에 <span className="text-bad">{dur(-left)}</span> 늦어요</>}</p>
      </Card>
    </div>
  );
}
