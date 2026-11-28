"use client";

// 질문별 분석 페이지: 한 질문 = 한 페이지, 그래프 2~3개. 모두 QuickSight 기본 차트(막대·열지도·KPI)로 옮길 수 있는 형태만 쓴다.
// 그래프마다 X축·Y축과 값의 뜻을 한 줄로 붙이고, 표본이 작은 곳은 편수(n)를 같이 보여 준다.
import type { ReactNode } from "react";
import type { Airports, Questions } from "@/lib/types";
import { Answer, Card, KpiTile } from "@/components/ui";
import { BarChart } from "@/components/charts";

const pct = (a: number, b: number) => (b ? Math.round((100 * a) / b) : 0);
const BANDS = ["~08시", "09~11시", "12~14시", "15~17시", "18시~"];
const SMALL = 20; // 이보다 적으면 "표본 작음"

/** 그래프 아래 한 줄: X축·Y축과 값의 뜻 */
function Axis({ x, y, note }: { x: string; y: string; note?: ReactNode }) {
  return (
    <p className="mt-3 border-t border-line pt-2 text-xs leading-5 text-ink-2">
      <b className="font-medium text-ink">X</b> {x} · <b className="font-medium text-ink">Y</b> {y}
      {note && <span className="block text-ink-3">{note}</span>}
    </p>
  );
}

function Source({ q, hist }: { q: Questions; hist?: boolean }) {
  const d = (s: string) => `${+s.slice(4, 6)}/${+s.slice(6)}`;
  return (
    <p className="text-xs text-ink-3">
      {hist
        ? `과거 운항 실적(항공정보포털) ${q.od_period.from.slice(0, 4)}.${+q.od_period.from.slice(4, 6)}~${q.od_period.to.slice(0, 4)}.${+q.od_period.to.slice(4, 6)}, 국내선 여객 출발편`
        : `회전 테이블(한국공항공사 API) ${d(q.period.from)}~${d(q.period.to)} ${q.flights.toLocaleString()}편 중 15분 넘게 늦은 ${q.late}편`}
    </p>
  );
}

/** 열지도(QuickSight Heat map과 같은 모양): 칸 색 = 값, 칸 글자 = 값 */
function Heatmap({ rows, cols, cell, fmt, colLabel, rowLabel }: {
  rows: string[]; cols: string[]; cell: (r: string, c: string) => { v: number | null; tip: string };
  fmt: (v: number) => string; colLabel?: (c: string) => string; rowLabel?: (r: string) => string;
}) {
  const vals = rows.flatMap((r) => cols.map((c) => cell(r, c).v)).filter((v): v is number => v != null);
  const max = Math.max(1e-9, ...vals);
  return (
    <div className="overflow-x-auto">
      <table className="num w-full border-separate border-spacing-[3px] text-xs">
        <thead>
          <tr>
            <th />
            {cols.map((c) => <th key={c} className="whitespace-nowrap px-1 pb-1 text-center font-normal text-ink-3">{colLabel ? colLabel(c) : c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r}>
              <th className="whitespace-nowrap pr-2 text-right font-normal text-ink-2">{rowLabel ? rowLabel(r) : r}</th>
              {cols.map((c) => {
                const { v, tip } = cell(r, c);
                const a = v == null ? 0 : 0.08 + 0.82 * (v / max);
                return (
                  <td key={c} title={tip} className="h-8 min-w-10 rounded-[4px] text-center"
                    style={{ background: v == null ? "var(--subtle)" : `color-mix(in srgb, var(--bad) ${Math.round(a * 100)}%, var(--surface))`, color: a > 0.55 ? "#fff" : "var(--ink)" }}>
                    {v == null ? <span className="text-ink-3">·</span> : fmt(v)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- C. 연쇄 지연은 어디서 끊기나요? ---------- */
export function ChainBreakPage({ q }: { q: Questions }) {
  const s = q.c_slack, starts = q.c_len.reduce((a, b) => a + b.n, 0);
  const half = s.find((x) => pct(x.ontime, x.n) >= 45);
  return (
    <div className="flex flex-col gap-4">
      <Answer q="앞 비행기가 늦게 오면, 내 비행기도 꼭 늦나요?"
        sub={<>준비 시간이 40분 미만이면 거의 다({100 - pct(s[0].ontime, s[0].n)}%) 따라 늦어요. 보통 비행기의 준비 시간은 {q.turn_median}분이라 여유가 5분 남짓이에요.</>}>
        준비 시간이 <span className="text-ok">{half ? parseInt(half.bucket) : 60}분</span> 넘게 잡혀 있어야 절반쯤 제때 떠요
      </Answer>
      <Source q={q} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile label="보통 준비 시간(중간값)" value={`${q.turn_median}`} unit="분" note="최소 필요 40분" />
        <KpiTile label="앞 편이 늦게 온 편" value={`${s.reduce((a, b) => a + b.n, 0)}`} unit="편" note="15분 넘게 늦게 도착" />
        <KpiTile label="그래도 제때 뜬 편" value={`${pct(s.reduce((a, b) => a + b.ontime, 0), s.reduce((a, b) => a + b.n, 0))}`} unit="%" tone="ok" />
        <KpiTile label="3편 이상 이어진 연쇄" value={`${pct(q.c_len.find((x) => x.hops === 3)?.n ?? 0, starts)}`} unit="%" note={`처음 늦은 ${starts}편 기준`} />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="준비 시간이 길수록 지연이 끊겨요">
          <BarChart showValues max={100}
            bars={s.map((x, i) => ({ key: x.bucket, label: x.bucket, sub: `n=${x.n}`, value: pct(x.ontime, x.n), tone: i === 0 ? "bad" : i === s.length - 1 ? "ok" : undefined, tip: `${x.bucket} · ${x.n}편 중 ${x.ontime}편 제때 출발` }))} />
          <Axis x="계획 준비 시간(앞 편 도착 예정 ~ 이 편 출발 예정)" y="앞 편이 15분 넘게 늦게 왔는데도 이 편이 제때(15분 이내) 뜬 비율 = 연쇄가 끊긴 비율"
            note="n = 그 구간에서 앞 편이 늦게 온 편수" />
        </Card>
        <Card title="처음 늦은 비행기는 지연을 몇 편까지 넘겼나">
          <BarChart showValues unit="편"
            bars={q.c_len.map((x) => ({ key: x.hops, label: x.hops === 0 ? "안 넘김" : x.hops === 3 ? "3편 이상" : `${x.hops}편`, sub: `${pct(x.n, starts)}%`, value: x.n, tone: x.hops === 0 ? "ok" : x.hops === 3 ? "bad" : undefined, tip: `${x.n}편` }))} />
          <Axis x="같은 기체에서 뒤이어 늦은 편 수(앞 편 지연을 넘겨받아 15분 넘게 늦은 편이 연속된 수)" y="그렇게 연쇄를 시작한 비행기 수"
            note={`처음 늦은 편 ${starts}편 기준`} />
        </Card>
      </div>
    </div>
  );
}

/* ---------- A. 늦은 비행기, 앞 비행기 탓인가요? ---------- */
export function BlamePage({ q, AP }: { q: Questions; AP: Airports | null }) {
  const ko = (c: string) => AP?.[c]?.ko ?? c;
  const prop = q.a_band.reduce((a, b) => a + b.prop, 0), skip = (q.origin_mix.first_leg ?? 0) + (q.origin_mix.unknown ?? 0);
  const am = q.a_band.slice(0, 2).reduce((a, b) => [a[0] + b.prop, a[1] + b.n], [0, 0]);
  const pm = q.a_band.slice(3).reduce((a, b) => [a[0] + b.prop, a[1] + b.n], [0, 0]);
  const aps = q.a_airport.slice(0, 8);
  return (
    <div className="flex flex-col gap-4">
      <Answer q="비행기가 늦으면, 앞 비행기 때문인가요?"
        sub={<>오전에 늦은 비행기는 {pct(am[0], am[1])}%만 앞 비행기 탓이고, 오후 3시 이후엔 {pct(pm[0], pm[1])}%가 앞 비행기 탓이에요.</>}>
        늦은 비행기 <span className="text-bad">{pct(prop, q.late)}%</span>는 앞 비행기가 늦게 와서 늦어요
      </Answer>
      <Source q={q} />
      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="오후로 갈수록 앞 비행기 탓이 늘어요">
          <BarChart showValues max={100}
            bars={q.a_band.map((x) => ({ key: x.band, label: x.band, sub: `n=${x.n}${x.n < SMALL ? " 적음" : ""}`, value: pct(x.prop, x.n), tone: pct(x.prop, x.n) >= 60 ? "bad" : undefined, tip: `${x.band} · 늦은 ${x.n}편 중 ${x.prop}편이 앞 편 탓` }))} />
          <Axis x="예정 출발 시간대" y="그 시간대에 15분 넘게 늦은 편 중, 앞 편 지연을 넘겨받아 늦은 편의 비율" note={`n = 그 시간대에 늦은 편수(그날 첫 편·앞 편 기록 없는 ${skip}편 제외). 나머지는 그 편에서 처음 늦은 편`} />
        </Card>
        <Card title="출발 공항별 앞 비행기 탓 비율">
          <BarChart showValues max={100}
            bars={aps.map((x) => ({ key: x.ap, label: ko(x.ap), sub: `n=${x.n}${x.n < SMALL ? " 적음" : ""}`, value: pct(x.prop, x.n), tone: x.n < SMALL ? undefined : pct(x.prop, x.n) >= 55 ? "bad" : undefined, tip: `${ko(x.ap)} · 늦은 ${x.n}편 중 ${x.prop}편이 앞 편 탓` }))} />
          <Axis x="출발 공항(늦은 편이 많은 순 8곳)" y="그 공항에서 15분 넘게 늦은 편 중 앞 편 탓인 비율" note={`n이 ${SMALL}편 미만인 공항은 5일 치라 비율을 단정하기 어려워요`} />
        </Card>
      </div>
    </div>
  );
}

/* ---------- B. 지연은 어디서 시작되나요? ---------- */
export function OriginPage({ q, AP }: { q: Questions; AP: Airports | null }) {
  const ko = (c: string) => AP?.[c]?.ko ?? c;
  const starts = q.b_cells.reduce((a, b) => a + b.n, 0);
  const byAp = new Map<string, number>();
  q.b_cells.forEach((c) => byAp.set(c.ap, (byAp.get(c.ap) ?? 0) + c.n));
  const apRows = [...byAp.entries()].sort((a, b) => b[1] - a[1]).map(([a]) => a);
  const top = [...q.b_cells].sort((a, b) => b.n - a.n)[0];
  const cju = (byAp.get("CJU") ?? 0) + (byAp.get("GMP") ?? 0);
  // 출발×도착: 운항 많은 공항 순
  const vol = new Map<string, number>();
  q.od.forEach((r) => { vol.set(r.dep, (vol.get(r.dep) ?? 0) + r.flights); vol.set(r.arr, (vol.get(r.arr) ?? 0) + r.flights); });
  const aps = [...vol.entries()].sort((a, b) => b[1] - a[1]).map(([a]) => a);
  const od = new Map(q.od.map((r) => [`${r.dep}|${r.arr}`, r]));
  return (
    <div className="flex flex-col gap-4">
      <Answer q="지연은 어느 공항, 몇 시에 처음 시작되나요?"
        sub={<>가장 많은 곳은 {ko(top.ap)} {top.band} 출발편({top.n}편)이에요. 제주는 오전부터 지연이 시작돼요.</>}>
        처음 늦는 비행기 <span className="text-bad">{pct(cju, starts)}%</span>가 제주·김포에서 떠요
      </Answer>
      <Source q={q} />
      <Card title="처음 늦은 비행기가 나온 공항 × 시간대">
        <Heatmap rows={apRows} cols={BANDS} rowLabel={ko} fmt={(v) => `${v}`}
          cell={(r, c) => { const x = q.b_cells.find((y) => y.ap === r && y.band === c); return { v: x ? x.n : null, tip: `${ko(r)} ${c} · ${x?.n ?? 0}편` }; }} />
        <Axis x="예정 출발 시간대" y="출발 공항" note={`칸 값 = 앞 편은 제때 왔는데 그 편에서 처음 15분 넘게 늦은 편수(연쇄 시작점), 모두 ${starts}편. 빈칸(·) = 0편`} />
      </Card>
      <Card title="노선 전체 그림: 출발 × 도착 지연률">
        <Heatmap rows={aps} cols={aps} fmt={(v) => `${Math.round(v)}`}
          cell={(r, c) => { const x = od.get(`${r}|${c}`); return x && x.base >= 300 ? { v: (100 * x.late) / x.base, tip: `${r} → ${c} · ${x.base.toLocaleString()}편 중 ${Math.round((100 * x.late) / x.base)}% 지연` } : { v: null, tip: x ? `${r} → ${c} · ${x.base}편(적음)` : `${r} → ${c} · 노선 없음` }; }} />
        <Axis x="도착 공항" y="출발 공항" note="칸 값 = 15분 넘게 늦게 출발한 편 비율(%). 운항 많은 공항 순. 빈칸(·) = 노선 없음 또는 300편 미만" />
        <div className="mt-2"><Source q={q} hist /></div>
      </Card>
    </div>
  );
}
