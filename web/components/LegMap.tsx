"use client";

// 지도(MapLibre) 위에 공항 15곳, 앞 편 → 내 편 경로, 내 비행기의 추정 위치를 그린다.
// 위치는 기록된 이륙·착륙 시각 사이를 곡선으로 나눈 추정(실시간 위치 아님). 슬라이더로 시각을 바꿔 본다.
// 바탕 지도: CARTO Basemaps(키 없음, 출처 표기 필요)
import { useEffect, useMemo, useState, type ReactNode } from "react";
import MapGL, { AttributionControl, Layer, Marker, NavigationControl, Source } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Airports, Leg } from "@/lib/types";
import { clock, hm, mins } from "@/lib/words";

const STYLE = {
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
};

function PlaneIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 1.5c.8 0 1.4.9 1.4 2.2v5.6l8.1 4.7v2.1l-8.1-2.5v4.9l2.4 1.9V22L12 21l-3.8 1v-1.6l2.4-1.9v-4.9l-8.1 2.5V14l8.1-4.7V3.7c0-1.3.6-2.2 1.4-2.2z"
        fill="#f59e0b" stroke="#0b0c0e" strokeWidth="0.8" />
    </svg>
  );
}

type P = [number, number]; // [lon, lat]
// 두 공항 사이를 살짝 휜 곡선(2차 베지에)으로
const ctrl = (a: P, b: P): P => [(a[0] + b[0]) / 2 + (b[1] - a[1]) * 0.18, (a[1] + b[1]) / 2 - (b[0] - a[0]) * 0.18];
const bez = (a: P, c: P, b: P, u: number): P => { const q = 1 - u; return [q * q * a[0] + 2 * q * u * c[0] + u * u * b[0], q * q * a[1] + 2 * q * u * c[1] + u * u * b[1]]; };
const bearing = (from: P, to: P) => (Math.atan2(to[0] - from[0], to[1] - from[1]) * 180) / Math.PI;

/** pass: 비행기·공항을 누르면 지도 위 왼쪽 패널로 여는 내용(탑승권) */
export function LegMap({ legs, cur, AP, pass }: { legs: Leg[]; cur: Leg; AP: Airports; pass?: (close: () => void) => ReactNode }) {
  const [open, setOpen] = useState(false);
  const t0 = (mins(legs[0].dep_actual_at || legs[0].dep_sched_at) ?? 0) - 20;
  const t1 = (mins(cur.arr_actual_at || cur.arr_sched_at) ?? 0) + 10;
  const [tNow, setT] = useState(() => Math.max(t0, (mins(cur.dep_sched_at) ?? 0) - 60));
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-color-scheme: dark)");
    setDark(m.matches);
    const on = (e: MediaQueryListEvent) => setDark(e.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  const ko = (c: string) => AP[c]?.ko ?? c;
  const at = (c: string): P | null => (AP[c] ? [AP[c].lon, AP[c].lat] : null);

  const routes = useMemo(() => legs.map((l) => {
    const a = at(l.dep_airport), b = at(l.arr_airport);
    if (!a || !b) return null;
    const c = ctrl(a, b);
    return { l, a, b, c, line: Array.from({ length: 33 }, (_, i) => bez(a, c, b, i / 32)) };
  }), [legs]); // eslint-disable-line react-hooks/exhaustive-deps

  // 기존(위성 지도)과 같은 추정 규칙
  let pos: P | null = null, head = 0, say = "위치를 몰라요";
  routes.forEach((r, i) => {
    if (!r) return;
    const { l, a, b, c } = r, me = l === cur, ta = mins(l.dep_actual_at), tb = mins(l.arr_actual_at), next = legs[i + 1];
    if (ta != null && tb != null && tNow >= ta && tNow <= tb) {
      const u = (tNow - ta) / (tb - ta);
      pos = bez(a, c, b, u); head = bearing(pos, bez(a, c, b, Math.min(1, u + 0.02)));
      say = me ? `${ko(l.arr_airport)}로 날아가는 중` : `${ko(l.dep_airport)}에서 ${ko(l.arr_airport)}로 오는 중 · ${hm(l.arr_actual_at)} 도착`;
    } else if (tb != null && tNow > tb && (!next || tNow < (mins(next.dep_actual_at || next.dep_sched_at) ?? 0))) {
      pos = b; head = bearing(c, b);
      say = me ? `${ko(l.arr_airport)}에 도착` : `${ko(l.arr_airport)}에 도착해 출발 준비 중`;
    } else if (i === 0 && ta != null && tNow < ta) {
      pos = a; head = bearing(a, c);
      say = `아직 ${ko(l.dep_airport)}에 있어요`;
    }
  });
  const p = pos as P | null;

  const lons = routes.flatMap((r) => (r ? [r.a[0], r.b[0]] : [])), lats = routes.flatMap((r) => (r ? [r.a[1], r.b[1]] : []));
  const bounds: [P, P] = [[Math.min(...lons) - 0.8, Math.min(...lats) - 0.6], [Math.max(...lons) + 0.8, Math.max(...lats) + 0.6]];
  const geo = {
    type: "FeatureCollection" as const,
    features: routes.filter(Boolean).map((r) => ({ type: "Feature" as const, properties: { me: r!.l === cur ? 1 : 0 }, geometry: { type: "LineString" as const, coordinates: r!.line } })),
  };

  return (
    <div>
      <div className="relative h-[70vh] min-h-[460px] overflow-hidden rounded-[8px] border border-line">
        <MapGL key={`${cur.flight_no}-${cur.flight_date}`} initialViewState={{ bounds, fitBoundsOptions: { padding: 30 } }} mapStyle={dark ? STYLE.dark : STYLE.light}
          attributionControl={false} dragRotate={false} scrollZoom={false} style={{ width: "100%", height: "100%" }}>
          <AttributionControl compact position="bottom-right" />
          <NavigationControl position="top-right" showCompass={false} />
          <Source id="routes" type="geojson" data={geo}>
            <Layer id="route-prev" type="line" filter={["==", ["get", "me"], 0]} paint={{ "line-color": dark ? "#e4e4e7" : "#52525b", "line-width": 2, "line-dasharray": [2, 2] }} />
            <Layer id="route-me" type="line" filter={["==", ["get", "me"], 1]} paint={{ "line-color": "#2563eb", "line-width": 3 }} layout={{ "line-cap": "round" }} />
          </Source>
          {Object.entries(AP).map(([c, a]) => (
            <Marker key={c} longitude={a.lon} latitude={a.lat} anchor="left" onClick={(e) => { e.originalEvent.stopPropagation(); if (c === cur.dep_airport || c === cur.arr_airport) setOpen(true); }}>
              <div className={`flex items-center gap-1 ${c === cur.dep_airport || c === cur.arr_airport ? "cursor-pointer" : ""}`}>
                <span className="size-2 rounded-full bg-ink ring-2 ring-surface" />
                <span className="text-[12px] font-semibold text-ink [text-shadow:0_0_3px_var(--surface)]">{a.ko}</span>
              </div>
            </Marker>
          ))}
          {p && (
            <Marker longitude={p[0]} latitude={p[1]} anchor="center" rotation={head} rotationAlignment="map" onClick={(e) => { e.originalEvent.stopPropagation(); setOpen(true); }}>
              <button aria-label="탑승권 열기" className="cursor-pointer transition hover:scale-125"><PlaneIcon size={30} /></button>
            </Marker>
          )}
        </MapGL>
        {/* 지도 위 오버레이: 지금 시각·상태 + 탑승권 패널 */}
        <div className="pointer-events-none absolute left-3 top-3 max-w-[calc(100%-70px)] rounded-[6px] border border-line bg-surface/90 px-3 py-1.5 text-[15px] backdrop-blur-sm">
          <span className="num font-semibold">{clock(tNow)}</span> <span className="text-ink-2">{say}</span>
          {pass && !open && <span className="block text-[12px] text-ink-3">비행기를 누르면 탑승권</span>}
        </div>
        {pass && open && (
          <div className="absolute inset-x-3 bottom-3 top-3 z-10 overflow-y-auto sm:right-auto sm:w-[360px]">{pass(() => setOpen(false))}</div>
        )}
      </div>
      <div className="mt-2 flex items-center gap-3 text-sm text-ink-3">
        <span className="num">{clock(t0)}</span>
        <input type="range" min={t0} max={t1} value={tNow} onChange={(e) => setT(+e.target.value)} aria-label="시각 바꿔 보기" className="flex-1" />
        <span className="num">{clock(t1)}</span>
      </div>
    </div>
  );
}
