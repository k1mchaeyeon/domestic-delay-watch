"use client";

// 질문별 분석 페이지: 한 질문 = 한 페이지. 큰 숫자 하나 + 답 한 문장 → 그래프 2개.
// 차트는 QuickSight 기본 차트(막대·열지도)로 옮길 수 있는 형태만 쓴다. 강조는 막대·칸 하나만.
// 카드 오른쪽 작은 글씨 = X·Y축, 그래프 아래 옅은 한 줄 = 출처(원천·기간·기준·n).
import type { Airports, Questions } from "@/lib/types";
import { Card, Hero, InfoTip, Src } from "@/components/ui";
import { BarChart } from "@/components/charts";

const pct = (a: number, b: number) => (b ? Math.round((100 * a) / b) : 0);
const BANDS = ["~08시", "09~11시", "12~14시", "15~17시", "18시~"];
const SMALL = 20; // 이보다 적으면 "적음"
const md = (s: string) => `${+s.slice(4, 6)}/${+s.slice(6)}`;
const KAC = (q: Questions) => `한국공항공사 API · ${md(q.period.from)}~${md(q.period.to)} · 국내선 ${q.flights.toLocaleString()}편 · 15분 초과 지연 · 11/18~22는 하루 1회 수집본(1분 변경 기록 없음)`;
const XY = ({ x, y, m }: { x: string; y: string; m?: string }) => <InfoTip><b className="font-medium text-ink">X</b> {x}<br /><b className="font-medium text-ink">Y</b> {y}{m && <><br />{m}</>}</InfoTip>;

/** 열지도(QuickSight Heat map): 가장 큰 칸만 진하게, 나머지는 옅게 */
function Heatmap({ rows, cols, cell, fmt, rowLabel }: {
  rows: string[]; cols: string[]; cell: (r: string, c: string) => { v: number | null; tip: string };
  fmt: (v: number) => string; rowLabel?: (r: string) => string;
}) {
  const vals = rows.flatMap((r) => cols.map((c) => cell(r, c).v)).filter((v): v is number => v != null);
  const max = Math.max(1e-9, ...vals);
  return (
    <div className="overflow-x-auto">
      <table className="num w-full border-separate border-spacing-[3px] text-sm">
        <thead>
          <tr>
            <th />
            {cols.map((c) => <th key={c} className="whitespace-nowrap px-1 pb-1 text-center font-normal text-ink-3">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r}>
              <th className="whitespace-nowrap pr-2 text-right font-normal text-ink-2">{rowLabel ? rowLabel(r) : r}</th>
              {cols.map((c) => {
                const { v, tip } = cell(r, c);
                const top = v === max;
                const a = v == null ? 0 : top ? 100 : Math.round(6 + 34 * (v / max));
                return (
                  <td key={c} title={tip} className={`h-8 min-w-10 rounded-[4px] text-center ${top ? "font-semibold" : ""}`}
                    style={{ background: v == null ? "var(--subtle)" : `color-mix(in srgb, var(--bad) ${a}%, var(--surface))`, color: top ? "#fff" : "var(--ink-2)" }}>
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

/* ---------- 연쇄 지연은 어디서 끊기나 ---------- */
export function ChainBreakPage({ q }: { q: Questions }) {
  const s = q.c_slack, starts = q.c_len.reduce((a, b) => a + b.n, 0);
  const best = s[s.length - 1];
  return (
    <div className="flex flex-col gap-4">
      <Hero q="앞 비행기가 늦으면 내 비행기도 꼭 늦나요?" value={`${100 - pct(s[0].ontime, s[0].n)}`} unit="%" tone="bad">
        준비 시간 40분 미만이면 거의 다 따라 늦어요
      </Hero>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="준비 시간별 제때 뜬 비율" right={<XY x="계획 준비 시간(앞 편 도착 예정~이 편 출발 예정)" y="앞 편이 15분 넘게 늦었는데도 제때 뜬 비율 = 연쇄가 끊긴 비율" m={`보통 준비 시간 ${q.turn_median}분 · n = 앞 편이 늦게 온 편수`} />}>
          <BarChart showValues max={100}
            bars={s.map((x) => ({ key: x.bucket, label: x.bucket, sub: `n=${x.n}`, value: pct(x.ontime, x.n), tone: x === best ? "ok" : undefined, tip: `${x.bucket} · 앞 편이 늦은 ${x.n}편 중 ${x.ontime}편 제때 출발` }))} />
          <Src>{KAC(q)} · 앞 편 지연 {s.reduce((a, b) => a + b.n, 0)}편</Src>
        </Card>
        <Card title="지연을 몇 편까지 넘겼나" right={<XY x="같은 기체에서 앞 편 지연을 넘겨받아 늦은 편이 이어진 수" y="그날 처음 늦은 비행기 수" />}>
          <BarChart showValues unit="편"
            bars={q.c_len.map((x) => ({ key: x.hops, label: x.hops === 0 ? "안 넘김" : x.hops === 3 ? "3편 이상" : `${x.hops}편`, sub: `${pct(x.n, starts)}%`, value: x.n, tone: x.hops === 0 ? "ok" : undefined, tip: `${x.n}편` }))} />
          <Src>{KAC(q)} · 처음 늦은 {starts}편</Src>
        </Card>
      </div>
    </div>
  );
}

/* ---------- 앞 비행기 탓인가 ---------- */
export function BlamePage({ q, AP }: { q: Questions; AP: Airports | null }) {
  const ko = (c: string) => AP?.[c]?.ko ?? c;
  const prop = q.a_band.reduce((a, b) => a + b.prop, 0);
  const am = q.a_band.slice(0, 2).reduce((a, b) => [a[0] + b.prop, a[1] + b.n], [0, 0]);
  const pm = q.a_band.slice(3).reduce((a, b) => [a[0] + b.prop, a[1] + b.n], [0, 0]);
  const topBand = q.a_band.reduce((m, x) => (pct(x.prop, x.n) > pct(m.prop, m.n) ? x : m));
  const aps = q.a_airport.slice(0, 8);
  const topAp = aps[0];
  return (
    <div className="flex flex-col gap-4">
      <Hero q="비행기가 늦으면 앞 비행기 때문인가요?" value={`${pct(prop, q.late)}`} unit="%" tone="bad">
        늦은 비행기 절반 넘게 앞 비행기 탓, 오후일수록 더 그래요
      </Hero>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="시간대별 앞 비행기 탓 비율" right={<XY x="예정 출발 시간대" y="15분 넘게 늦은 편 중 앞 편 지연을 넘겨받은 비율" m={`오전 ${pct(am[0], am[1])}% → 오후 3시 이후 ${pct(pm[0], pm[1])}% · 첫 편·앞 편 기록 없음 제외`} />}>
          <BarChart showValues max={100}
            bars={q.a_band.map((x) => ({ key: x.band, label: x.band, sub: `n=${x.n}${x.n < SMALL ? " 적음" : ""}`, value: pct(x.prop, x.n), tone: x === topBand ? "bad" : undefined, tip: `${x.band} · 늦은 ${x.n}편 중 ${x.prop}편이 앞 편 탓` }))} />
          <Src>{KAC(q)} · 늦은 {q.late}편</Src>
        </Card>
        <Card title="공항별 앞 비행기 탓 비율" right={<XY x="출발 공항(늦은 편 많은 순 8곳)" y="15분 넘게 늦은 편 중 앞 편 탓 비율" m={`n ${SMALL}편 미만은 5일 치라 비율 단정 어려움`} />}>
          <BarChart showValues max={100}
            bars={aps.map((x) => ({ key: x.ap, label: ko(x.ap), sub: `n=${x.n}${x.n < SMALL ? " 적음" : ""}`, value: pct(x.prop, x.n), tone: x === topAp ? "bad" : undefined, tip: `${ko(x.ap)} · 늦은 ${x.n}편 중 ${x.prop}편이 앞 편 탓` }))} />
          <Src>{KAC(q)} · 늦은 {q.late}편</Src>
        </Card>
      </div>
    </div>
  );
}

/* ---------- 어디서 시작되나 ---------- */
export function OriginPage({ q, AP }: { q: Questions; AP: Airports | null }) {
  const ko = (c: string) => AP?.[c]?.ko ?? c;
  const starts = q.b_cells.reduce((a, b) => a + b.n, 0);
  const byAp = new Map<string, number>();
  q.b_cells.forEach((c) => byAp.set(c.ap, (byAp.get(c.ap) ?? 0) + c.n));
  const apRows = [...byAp.entries()].sort((a, b) => b[1] - a[1]).map(([a]) => a);
  const top = [...q.b_cells].sort((a, b) => b.n - a.n)[0];
  const cg = (byAp.get("CJU") ?? 0) + (byAp.get("GMP") ?? 0);
  const vol = new Map<string, number>();
  q.od.forEach((r) => { vol.set(r.dep, (vol.get(r.dep) ?? 0) + r.flights); vol.set(r.arr, (vol.get(r.arr) ?? 0) + r.flights); });
  const aps = [...vol.entries()].sort((a, b) => b[1] - a[1]).map(([a]) => a);
  const od = new Map(q.od.map((r) => [`${r.dep}|${r.arr}`, r]));
  const p = q.od_period;
  return (
    <div className="flex flex-col gap-4">
      <Hero q="지연은 어느 공항, 몇 시에 처음 시작되나요?" value={`${pct(cg, starts)}`} unit="%" tone="bad">
        처음 늦는 비행기는 제주·김포에서 떠요
      </Hero>
      <Card title="처음 늦은 비행기: 공항 × 시간대" right={<XY x="예정 출발 시간대" y="출발 공항" m={`칸 = 앞 편은 제때 왔는데 그 편에서 처음 늦은 편수 · 가장 많은 칸 ${ko(top.ap)} ${top.band}`} />}>
        <Heatmap rows={apRows} cols={BANDS} rowLabel={ko} fmt={(v) => `${v}`}
          cell={(r, c) => { const x = q.b_cells.find((y) => y.ap === r && y.band === c); return { v: x ? x.n : null, tip: `${ko(r)} ${c} · ${x?.n ?? 0}편` }; }} />
        <Src>{KAC(q)} · 처음 늦은 {starts}편</Src>
      </Card>
      <Card title="노선별 지연률: 출발 × 도착" right={<XY x="도착 공항" y="출발 공항" m="칸 = 15분 넘게 늦게 출발한 비율(%) · 빈칸 = 노선 없음 또는 300편 미만" />}>
        <Heatmap rows={aps} cols={aps} fmt={(v) => `${Math.round(v)}`}
          cell={(r, c) => { const x = od.get(`${r}|${c}`); return x && x.base >= 300 ? { v: (100 * x.late) / x.base, tip: `${r} → ${c} · ${x.base.toLocaleString()}편 중 ${Math.round((100 * x.late) / x.base)}% 지연` } : { v: null, tip: x ? `${r} → ${c} · ${x.base}편(적음)` : `${r} → ${c} · 노선 없음` }; }} />
        <Src>항공정보포털 · {p.from.slice(0, 4)}.{+p.from.slice(4, 6)}~{p.to.slice(0, 4)}.{+p.to.slice(4, 6)} · 국내선 여객 출발편 · 15분 초과 지연</Src>
      </Card>
    </div>
  );
}
