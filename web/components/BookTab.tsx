"use client";

// 예약할 때: 질문 → 답 → KPI → 시간대 차트 → 항공사·비행기 표 → 늦는 이유 → (제주행이면) 월별 결항
import type { History, RouteAirline, RouteFlight, RouteHour } from "@/lib/types";
import { CAUSE, hourName, late10, tenOf } from "@/lib/words";
import { useEffect, useState } from "react";
import { Airline, Answer, Card, KpiTile, Meter, Src, Table, type Col } from "@/components/ui";
import { BarChart } from "@/components/charts";

export function BookTab({ h, dep, arr }: { h: History; dep: string; arr: string }) {
  const same = <T extends { dep?: string; arr?: string }>(x: T) => x.dep === dep && x.arr === arr;
  const rate = (x: { late: number; base: number }) => x.late / x.base;
  const route = h.routes.find(same);
  const cut = `${h.period.to.slice(0, 6)}01`;
  const active = new Set((h.airline_last ?? []).filter((a) => a.last_day >= cut).map((a) => a.airline));
  const isActive = (name: string) => !h.airline_last || active.has(name);

  const hours = h.route_hour.filter(same).filter((x) => x.base >= 200 && x.h >= 6).sort((a, b) => a.h - b.h);
  const best = hours.reduce<RouteHour | null>((m, x) => (!m || rate(x) < rate(m) ? x : m), null);
  const worst = hours.reduce<RouteHour | null>((m, x) => (!m || rate(x) > rate(m) ? x : m), null);
  const airlines = h.route_airline.filter(same).filter((a) => isActive(a.airline)).sort((a, b) => rate(b) - rate(a)).slice(0, 3);
  const flights = h.route_flight.filter(same).filter((f) => isActive(f.airline)).sort((a, b) => a.rk - b.rk).slice(0, 3);
  const causes = h.route_cause.filter(same).filter((c) => CAUSE[c.cause_group]).sort((a, b) => b.late - a.late);
  const ctot = causes.reduce((s, c) => s + c.late, 0);
  const all = h.cause_all.filter((c) => CAUSE[c.cause_group]);
  const atot = all.reduce((s, c) => s + c.late, 0);
  if (!route || !best || !worst) return <Card><p className="text-ink-2">이 노선은 기록이 부족해요</p></Card>;

  const rRate = Math.round((1000 * route.late) / route.base) / 10;
  const per = `${h.period.from.slice(0, 4)}.${+h.period.from.slice(4, 6)}~${h.period.to.slice(0, 4)}.${+h.period.to.slice(4, 6)}`;
  const SRC = `항공정보포털 운항 실적 · 국내선 여객 출발편 · 지연 = 게이트 기준 15분 초과`;
  const airCols: Col<RouteAirline>[] = [
    { key: "rk", label: "순위", width: "48px", render: (a) => <span className="text-ink-2">{airlines.indexOf(a) + 1}</span> },
    { key: "nm", label: "항공사", render: (a) => <Airline name={a.airline} /> },
    { key: "ten", label: "늦게 뜬 횟수", align: "right", render: (a) => <span className={airlines.indexOf(a) === 0 ? "font-semibold text-bad" : ""}>10번 중 {tenOf(a.late, a.base)}번</span> },
    { key: "bar", label: "", width: "120px", wide: true, render: (a) => <Meter value={rate(a)} max={rate(airlines[0])} tone={airlines.indexOf(a) === 0 ? "bad" : undefined} /> },
    { key: "avg", label: "평균 지연", align: "right", wide: true, render: (a) => `${a.avg_delay}분` },
  ];
  const flCols: Col<RouteFlight>[] = [
    { key: "rk", label: "순위", width: "48px", render: (f) => <span className="text-ink-2">{flights.indexOf(f) + 1}</span> },
    { key: "no", label: "편명", render: (f) => <span className="font-medium">{f.flight}</span> },
    { key: "al", label: "항공사", render: (f) => <Airline name={f.airline} /> },
    { key: "ten", label: "늦게 뜬 횟수", align: "right", render: (f) => <span className={flights.indexOf(f) === 0 ? "font-semibold text-bad" : ""}>10번 중 {tenOf(f.late, f.base)}번</span> },
    { key: "n", label: "운항", align: "right", wide: true, render: (f) => `${f.base.toLocaleString()}번` },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Answer q={`${dep} → ${arr}, 몇 시 비행기가 덜 늦어요?`}
        sub={<>{hourName(best.h)} 비행기는 {late10(tenOf(best.late, best.base))}. {hourName(worst.h)}는 {late10(tenOf(worst.late, worst.base))}.</>}>
        <span className="text-ok">{hourName(best.h)}</span> 비행기가 제일 덜 늦어요
      </Answer>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile label="15분 넘게 늦게 뜬 비율" value={`${rRate}`} unit="%" note={`${h.period.from.slice(0, 4)}~${h.period.to.slice(0, 4)}년 기록`} />
        <KpiTile label="평균 지연" value={`${route.avg_delay}`} unit="분" />
        <KpiTile label="결항률" value={`${Math.round((1000 * route.cancelled) / route.flights) / 10}`} unit="%" note={`${route.cancelled.toLocaleString()}편 결항`} />
        <KpiTile label="운항 편수" value={route.flights.toLocaleString()} unit="편" />
      </div>

      <Card title="출발 시간대별 15분 넘게 늦게 뜬 비율">
        <BarChart
          bars={hours.map((x) => ({ key: x.h, label: `${x.h}시`, value: Math.round(1000 * rate(x)) / 10, tone: x === best ? "ok" : undefined, tip: `${x.h}시 · 10번 중 ${tenOf(x.late, x.base)}번 · ${x.flights.toLocaleString()}편` }))}
          tickEvery={2}
          legend={[{ tone: "ok", label: "제일 덜 늦는 시간" }]}
        />
        <Src>{SRC} · {per} · {dep} → {arr} {route.base.toLocaleString()}편 · 그 시간대 편 중 늦은 비율 · 200편 미만 시간대 제외</Src>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="제일 많이 늦는 항공사">
          <Table cols={airCols} rows={airlines} rowKey={(a) => a.airline} />
          <Src>{SRC} · {per} · 이 노선 200편 이상, 지금도 운항하는 항공사</Src>
        </Card>
        <Card title="제일 자주 늦는 비행기">
          <Table cols={flCols} rows={flights} rowKey={(f) => f.flight} />
          <Src>{SRC} · 2025.1~{h.period.to.slice(0, 4)}.{+h.period.to.slice(4, 6)} · 편명별 100편 이상</Src>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {ctot > 0 && (
          <Card title={`${dep} → ${arr} 비행기가 늦는 이유`}>
            <p className="mb-3 text-[15px] font-semibold">
              늦은 비행기 10대 중 <span className="text-bad">{Math.round((10 * causes[0].late) / ctot)}대</span>는 {CAUSE[causes[0].cause_group]}예요
            </p>
            <Table cols={[
              { key: "c", label: "이유", render: (c) => CAUSE[c.cause_group] },
              { key: "v", label: "늦은 비행기 100대 중", align: "right", render: (c) => `${Math.max(1, Math.round((100 * c.late) / ctot))}대` },
            ]} rows={causes.slice(0, 4)} rowKey={(c) => c.cause_group} />
            <Src>{SRC} · {per} · 15분 넘게 늦은 편의 기록된 사유 · 사유 분류는 2023.1부터</Src>
          </Card>
        )}
        <Card title="전체 국내선에서 늦는 이유 순위">
          <Table cols={[
            { key: "r", label: "순위", width: "56px", render: (c) => <span className="text-ink-2">{all.indexOf(c) + 1}</span> },
            { key: "c", label: "이유", render: (c) => <span className={causes[0] && c.cause_group === causes[0].cause_group ? "font-semibold" : ""}>{CAUSE[c.cause_group]}</span> },
            { key: "v", label: "늦은 비행기 100대 중", align: "right", render: (c) => `${Math.max(1, Math.round((100 * c.late) / atot))}대` },
          ]} rows={all.slice(0, 5)} rowKey={(c) => c.cause_group} />
          <Src>{SRC} · 2025.1~{h.period.to.slice(0, 4)}.{+h.period.to.slice(4, 6)} · 국내선 전체 늦은 편의 기록된 사유</Src>
        </Card>
      </div>

      {arr === "제주" && <JejuCard h={h} dep={dep} />}
    </div>
  );
}

type JejuWeather = { source: string; total: number; kinds: { kind: string; n: number }[]; after_2023: { weather_cancel: number; note: string } };

function JejuCard({ h, dep }: { h: History; dep: string }) {
  const [W, setW] = useState<JejuWeather | null>(null);
  useEffect(() => { fetch("/data/jeju_weather.json").then((r) => r.json()).then(setW).catch(() => setW(null)); }, []);
  const jo = dep !== "제주" && h.jeju_month.some((r) => r.dep === dep) ? dep : "전체";
  const m = Array.from({ length: 12 }, (_, i) => ({ m: i + 1, f: 0, c: 0, w: 0 }));
  h.jeju_month.filter((r) => r.m && (jo === "전체" || r.dep === jo)).forEach((r) => { const x = m[(r.m as number) - 1]; x.f += r.flights; x.c += r.cancelled; x.w += r.cancelled_weather; });
  const rate = (x: (typeof m)[number]) => (x.f ? x.c / x.f : 0);
  const per = (x: (typeof m)[number]) => Math.round(1000 * rate(x)) / 10;
  const top = m.reduce((a, b) => (rate(b) > rate(a) ? b : a));
  const low = m.reduce((a, b) => (rate(b) < rate(a) ? b : a));
  const weather = top.c ? Math.round((10 * top.w) / top.c) : 0;
  return (
    <Card title={jo === "전체" ? "제주 가는 비행기 월별 결항률" : `${jo}에서 제주 가는 비행기 월별 결항률`}>
      <div className="mb-3">
        <Answer q={jo === "전체" ? "제주 가는 비행기, 언제 결항이 많아요?" : `${jo}에서 제주 가는 비행기, 언제 결항이 많아요?`}
          sub={<>{top.m}월엔 100편 중 {per(top)}편꼴로 결항돼요{weather >= 5 ? ". 대부분 날씨 때문이에요" : ""}. {per(low) < 0.5 ? `${low.m}월엔 결항이 거의 없어요.` : `${low.m}월은 100편 중 ${per(low)}편이에요.`}</>}>
          <span className="text-bad">{top.m}월</span>에 결항이 가장 많아요
        </Answer>
      </div>
      <BarChart bars={m.map((x) => ({ key: x.m, label: `${x.m}월`, value: per(x), tone: x === top ? "bad" : undefined, tip: `${x.m}월 · 100편 중 ${per(x)}편 결항 · ${x.f.toLocaleString()}편` }))} height={180} />
      <Src>항공정보포털 운항 실적 · {h.period.from.slice(0, 4)}.{+h.period.from.slice(4, 6)}~{h.period.to.slice(0, 4)}.{+h.period.to.slice(4, 6)} · {jo === "전체" ? "전국" : jo} → 제주 여객 출발편 · 결항률 = 결항 ÷ 운항</Src>
      {W && (
        <div className="mt-5 border-t border-line pt-4">
          <p className="mb-1 text-[13px] font-semibold text-ink">날씨 결항은 무엇 때문이었나</p>
          <p className="mb-2 text-xs text-ink-2">바람·눈·태풍이 {Math.round((100 * W.kinds.filter((k) => ["바람", "눈", "태풍"].includes(k.kind)).reduce((a, b) => a + b.n, 0)) / W.total)}%</p>
          <BarChart showValues height={170}
            bars={W.kinds.filter((k) => k.n >= 5).map((k, i) => ({ key: k.kind, label: k.kind, value: Math.round((100 * k.n) / W.total), tone: i === 0 ? "bad" : undefined, tip: `${k.kind} · ${k.n}편` }))} />
          <Src>{W.source} · 날씨 결항 {W.total.toLocaleString()}편 · 2023년부터는 사유가 &apos;기상&apos; 하나로만 기록돼 종류를 알 수 없음</Src>
        </div>
      )}
    </Card>
  );
}
