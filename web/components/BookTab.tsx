"use client";

import { useMemo, useState } from "react";
import type { History, RouteHour } from "@/lib/types";
import { AIR_CODE, CAUSE, hourName, late10, tenOf } from "@/lib/words";

// 예약할 때: "이 노선, 몇 시 비행기가 덜 늦어요?" → 큰 답 한 줄 → 근거
export function BookTab({ h }: { h: History }) {
  const deps = useMemo(() => [...new Set(h.routes.map((r) => r.dep))], [h]);
  const [dep, setDep] = useState(h.routes[0].dep);
  const arrs = h.routes.filter((r) => r.dep === dep).map((r) => r.arr);
  const [arrPick, setArr] = useState(h.routes[0].arr);
  const arr = arrs.includes(arrPick) ? arrPick : arrs[0];
  const same = <T extends { dep?: string; arr?: string }>(x: T) => x.dep === dep && x.arr === arr;
  const rate = (x: { late: number; base: number }) => x.late / x.base;

  const hours = h.route_hour.filter(same).filter((x) => x.base >= 200 && x.h >= 6).sort((a, b) => a.h - b.h);
  const best = hours.reduce<RouteHour | null>((m, x) => (!m || rate(x) < rate(m) ? x : m), null);
  const worst = hours.reduce<RouteHour | null>((m, x) => (!m || rate(x) > rate(m) ? x : m), null);
  // 운항이 끝난 항공사(데이터 마지막 달에 운항 기록이 없는 곳)는 뺀다
  const cut = `${h.period.to.slice(0, 6)}01`;
  const active = new Set((h.airline_last ?? []).filter((a) => a.last_day >= cut).map((a) => a.airline));
  const isActive = (name: string) => !h.airline_last || active.has(name);
  const airlines = h.route_airline.filter(same).filter((a) => isActive(a.airline)).sort((a, b) => rate(b) - rate(a)).slice(0, 3);
  const flights = h.route_flight.filter(same).filter((f) => isActive(f.airline)).sort((a, b) => a.rk - b.rk).slice(0, 3);
  const causes = h.route_cause.filter(same).filter((c) => CAUSE[c.cause_group]).sort((a, b) => b.late - a.late);
  const ctot = causes.reduce((s, c) => s + c.late, 0);
  const all = h.cause_all.filter((c) => CAUSE[c.cause_group]);
  const atot = all.reduce((s, c) => s + c.late, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3 rounded-[20px] border border-line bg-card p-4">
        <Select label="출발" value={dep} options={deps} onChange={setDep} />
        <span className="pb-3 text-2xl text-sub">→</span>
        <Select label="도착" value={arr} options={arrs} onChange={setArr} />
      </div>

      {best && worst && (
        <Card>
          <p className="mb-1 text-sm font-semibold text-sub">{dep} → {arr}, 몇 시 비행기가 덜 늦어요?</p>
          <p className="mb-2 text-3xl font-bold leading-snug"><em className="not-italic text-ok">{hourName(best.h)}</em> 비행기가 제일 덜 늦어요</p>
          <p className="text-sub">
            {hourName(best.h)} 비행기는 <b className="text-ink">{late10(tenOf(best.late, best.base))}</b>. {hourName(worst.h)}는 {late10(tenOf(worst.late, worst.base))}.
          </p>
          <HourChart hours={hours} best={best} worst={worst} />
        </Card>
      )}

      <Card>
        <h2 className="mb-3 text-lg font-bold">{dep} → {arr}에서 제일 많이 늦는 항공사</h2>
        <div className="flex flex-col">
          {airlines.map((a, i) => (
            <Top key={a.airline} rank={i + 1} name={<><Badge name={a.airline} />{a.airline}</>} n={tenOf(a.late, a.base)} />
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-bold">{dep} → {arr}에서 제일 자주 늦는 비행기</h2>
        <div className="flex flex-col">
          {flights.map((f, i) => (
            <Top key={f.flight} rank={i + 1} name={<>{f.flight}<small className="ml-1.5 text-sm font-normal text-sub">{f.airline}</small></>} n={tenOf(f.late, f.base)} />
          ))}
        </div>
      </Card>

      {ctot > 0 && (
        <Card>
          <h2 className="mb-2 text-lg font-bold">{dep} → {arr} 비행기가 늦는 이유</h2>
          <p className="mb-3 text-xl font-bold">
            이 노선에서 늦은 비행기 10대 중 <em className="not-italic text-bad">{Math.round((10 * causes[0].late) / ctot)}대</em>는 {CAUSE[causes[0].cause_group]}예요
          </p>
          <h2 className="mb-2 mt-5 text-lg font-bold">전체 국내선에서 늦는 이유 순위</h2>
          <ol className="divide-y divide-line">
            {all.slice(0, 5).map((c, i) => (
              <li key={c.cause_group} className="flex items-center justify-between py-2">
                <span><b className="mr-3 text-sub">{i + 1}</b>{CAUSE[c.cause_group]}</span>
                <span className="rounded-full bg-soft px-2.5 py-0.5 text-sm">100대 중 {Math.max(1, Math.round((100 * c.late) / atot))}대</span>
              </li>
            ))}
          </ol>
        </Card>
      )}
    </div>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-semibold text-sub">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="cursor-pointer appearance-none rounded-2xl border border-line bg-soft px-3.5 py-3 text-xl font-bold text-ink">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <section className="min-w-0 rounded-[20px] border border-line bg-card px-5 py-5">{children}</section>;
}

// 로고: public/logos/<코드>.png (투명 배경). 어두운 로고는 다크 모드에서 밝게 바꾼다. 로고 없는 항공사는 코드 배지
const LOGOS = new Set(["KE", "OZ", "7C", "LJ", "TW", "BX", "RS", "ZE", "RF", "WE", "XU"]);
const DARK = new Set(["BX", "KE", "OZ", "RF", "WE", "XU", "ZE"]);
function Badge({ name }: { name: string }) {
  const code = AIR_CODE[name];
  if (code && LOGOS.has(code))
    return (
      <span className="mr-2.5 inline-grid h-6 w-[72px] flex-none place-items-center justify-items-start align-middle">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/logos/${code}.png`} alt="" className={`block max-h-full max-w-full ${DARK.has(code) ? "dark:brightness-0 dark:invert-[.9]" : ""}`} />
      </span>
    );
  return <span className="mr-2 inline-grid size-7 place-items-center rounded-full bg-ink align-middle font-mono text-[11px] font-bold text-bg">{code ?? name.slice(0, 2)}</span>;
}

function Top({ rank, name, n }: { rank: number; name: React.ReactNode; n: number }) {
  // 순위 목록: 1위만 크게·빨강, 나머지는 같은 줄 높이. 같은 크기 카드 3개를 나란히 두지 않는다
  const first = rank === 1;
  return (
    <div className="grid grid-cols-[24px_1fr_auto] items-center gap-x-3 gap-y-2 border-t border-line py-3 first:border-t-0 first:pt-1">
      <span className="text-sm font-semibold tabular-nums text-sub">{rank}</span>
      <span className={`flex min-w-0 items-center font-semibold ${first ? "text-lg" : "text-base"}`}>{name}</span>
      <span className={`text-right font-semibold tabular-nums text-bad ${first ? "text-lg" : "text-[15px]"}`}>10번 중 {n}번<small className="ml-1 text-sm font-normal text-sub">늦어요</small></span>
      <span className="col-start-2 col-end-4 h-1 overflow-hidden rounded-sm bg-soft" aria-hidden="true">
        <i className={`block h-full ${first ? "bg-bad" : "bg-dot"}`} style={{ width: `${n * 10}%` }} />
      </span>
    </div>
  );
}

function HourChart({ hours, best, worst }: { hours: RouteHour[]; best: RouteHour; worst: RouteHour }) {
  const W = 640, H = 200, pb = 26, pt = 24, bw = (W - 8) / hours.length;
  const max = Math.max(...hours.map((x) => x.late / x.base)) * 1.15;
  const y = (v: number) => pt + (H - pt - pb) * (1 - v / max);
  return (
    <div className="mt-4 rounded-2xl bg-map px-3.5 pb-2.5 pt-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="출발 시간대별로 늦게 뜬 비율">
        {hours.map((x, i) => {
          const v = x.late / x.base, bx = 4 + i * bw + bw * 0.18, w = bw * 0.64;
          const hi = x === best || x === worst;
          const c = x === best ? "var(--ok)" : x === worst ? "var(--bad)" : "var(--map-sub)";
          return (
            <g key={x.h}>
              <rect x={bx} y={y(v)} width={w} height={H - pb - y(v)} rx={3} fill={c} opacity={hi ? 1 : 0.55}>
                <title>{`${x.h}시 · 10번 중 ${tenOf(x.late, x.base)}번 늦음 · ${x.flights.toLocaleString()}편`}</title>
              </rect>
              {hi && <text x={bx + w / 2} y={y(v) - 7} textAnchor="middle" fontSize={13} fontWeight={700} fill={c}>{Math.round(100 * v)}%</text>}
              {(x.h % 3 === 0 || hi) && <text x={bx + w / 2} y={H - 7} textAnchor="middle" fontSize={12} fill="var(--map-sub)">{x.h}시</text>}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
