"use client";

// 위성 사진(Esri World Imagery z8 한 장) 위에 앞 편·내 편 경로와 지금 위치를 그린다 (HTML 1차안과 같은 계산)
import { useState } from "react";
import type { Airports, Leg, Satellite } from "@/lib/types";
import { clock, hm, mins } from "@/lib/words";

export function SatMap({ legs, cur, AP, SAT }: { legs: Leg[]; cur: Leg; AP: Airports; SAT: Satellite | null }) {
  const t0 = (mins(legs[0].dep_actual_at || legs[0].dep_sched_at) ?? 0) - 20;
  const t1 = (mins(cur.arr_actual_at || cur.arr_sched_at) ?? 0) + 10;
  const [tNow, setT] = useState(() => Math.max(t0, (mins(cur.dep_sched_at) ?? 0) - 60));
  const B = SAT?.bounds ?? { west: 125.6, east: 130.2, south: 32.8, north: 38.9 };
  const [SW, SH] = SAT?.size ?? [837, 1371];
  const my = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
  const proj = (lat: number, lon: number): [number, number] => [((lon - B.west) / (B.east - B.west)) * SW, ((my(B.north) - my(lat)) / (my(B.north) - my(B.south))) * SH];
  const ko = (c: string) => AP[c]?.ko ?? c;

  const pts = legs.flatMap((l) => [AP[l.dep_airport], AP[l.arr_airport]]).filter(Boolean).map((a) => proj(a.lat, a.lon));
  let x0 = Math.min(...pts.map((p) => p[0])) - 110, x1 = Math.max(...pts.map((p) => p[0])) + 110;
  let y0 = Math.min(...pts.map((p) => p[1])) - 90, y1 = Math.max(...pts.map((p) => p[1])) + 90;
  // 4:3에 맞추되 사진 밖(빈 곳)이 보이지 않게 사진 범위 안으로 당긴다
  const want = 4 / 3, cw = x1 - x0, ch = y1 - y0;
  if (cw / ch < want) { const d = (ch * want - cw) / 2; x0 -= d; x1 += d; } else { const d = (cw / want - ch) / 2; y0 -= d; y1 += d; }
  const fit = (a: number, b: number, lim: number): [number, number] => {
    const w = Math.min(b - a, lim);
    let s = a + (b - a - w) / 2;
    s = Math.max(0, Math.min(s, lim - w));
    return [s, s + w];
  };
  [x0, x1] = fit(x0, x1, SW);
  [y0, y1] = fit(y0, y1, SH);
  const k = (x1 - x0) / 460;

  let pos: [number, number] | null = null;
  let say = "위치를 몰라요";
  const paths = legs.map((l, i) => {
    const A = AP[l.dep_airport], Bp = AP[l.arr_airport];
    if (!A || !Bp) return null;
    const [ax, ay] = proj(A.lat, A.lon), [bx, by] = proj(Bp.lat, Bp.lon);
    const cx = (ax + bx) / 2 + (by - ay) * 0.18, cy = (ay + by) / 2 - (bx - ax) * 0.18;
    const me = l === cur, a = mins(l.dep_actual_at), b = mins(l.arr_actual_at), next = legs[i + 1];
    if (a != null && b != null && tNow >= a && tNow <= b) {
      const u = (tNow - a) / (b - a), q = 1 - u;
      pos = [q * q * ax + 2 * q * u * cx + u * u * bx, q * q * ay + 2 * q * u * cy + u * u * by];
      say = me ? `${ko(l.arr_airport)}로 날아가는 중` : `${ko(l.dep_airport)}에서 ${ko(l.arr_airport)}로 오는 중 · ${hm(l.arr_actual_at)} 도착`;
    } else if (b != null && tNow > b && (!next || tNow < (mins(next.dep_actual_at || next.dep_sched_at) ?? 0))) {
      pos = [bx, by];
      say = me ? `${ko(l.arr_airport)}에 도착` : `${ko(l.arr_airport)}에 도착해 출발 준비 중`;
    } else if (i === 0 && a != null && tNow < a) {
      pos = [ax, ay];
      say = `아직 ${ko(l.dep_airport)}에 있어요`;
    }
    return <path key={l.flight_no + i} d={`M${ax},${ay} Q${cx},${cy} ${bx},${by}`} fill="none" stroke={me ? "#93b4ff" : "#ffffff"}
      strokeWidth={(me ? 3 : 2) * k} strokeDasharray={me ? undefined : `${6 * k} ${6 * k}`} opacity={me ? 1 : 0.8} />;
  });
  const p = pos as [number, number] | null;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3 text-[15px]">
        <span><span className="num font-semibold">{clock(tNow)}</span> <span className="text-ink-2">{say}</span></span>
        {SAT && <span className="text-[12px] text-ink-3">{SAT.credit}</span>}
      </div>
      <div className="overflow-hidden rounded-[6px] border border-line bg-[#13283a]">
        <svg viewBox={`${x0} ${y0} ${x1 - x0} ${y1 - y0}`} className="mx-auto block h-auto max-h-[480px] w-full" role="img" aria-label="위성 지도 위 공항과 비행기 위치">
          {SAT && <image href={SAT.img} x={0} y={0} width={SW} height={SH} preserveAspectRatio="none" />}
          <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="#050810" opacity={0.28} />
          {Object.entries(AP).map(([c, a]) => {
            const [x, y] = proj(a.lat, a.lon);
            return (
              <g key={c}>
                <circle cx={x} cy={y} r={3.5 * k} fill="#fff" opacity={0.85} />
                <text x={x + 7 * k} y={y + 4 * k} fontSize={12 * k} fill="#fff" stroke="#000" strokeWidth={3 * k} paintOrder="stroke" strokeOpacity={0.5}>{a.ko}</text>
              </g>
            );
          })}
          {paths}
          {p && (
            <>
              <circle cx={p[0]} cy={p[1]} r={12 * k} fill="none" stroke="#fbbf24" strokeWidth={2 * k} opacity={0.7} />
              <circle cx={p[0]} cy={p[1]} r={6 * k} fill="#fbbf24" />
            </>
          )}
        </svg>
      </div>
      <div className="mt-2 flex items-center gap-3 text-sm text-ink-3">
        <span className="num">{clock(t0)}</span>
        <input type="range" min={t0} max={t1} value={tNow} onChange={(e) => setT(+e.target.value)} aria-label="시각 바꿔 보기" className="flex-1" />
        <span className="num">{clock(t1)}</span>
      </div>
    </div>
  );
}
