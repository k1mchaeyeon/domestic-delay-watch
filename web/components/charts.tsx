"use client";

// 막대그래프 하나로 두 차트(시간대별 지연률, 월별 결항률)를 그린다.
// 회색 막대 + 강조는 의미 있는 1~2개(제일 덜/제일 많이), y축 눈금·범례·마우스 올리면 수치
import { useEffect, useRef, useState } from "react";

export type Bar = { key: string | number; label: string; value: number; tip: string; tone?: "ok" | "bad" | "accent"; sub?: string; icon?: WxIcon };
export type WxIcon = "wind" | "snow" | "typhoon" | "fog" | "rain" | "storm";

const FILL = { ok: "var(--ok)", bad: "var(--bad)", accent: "var(--accent)" } as const;

export function BarChart({ bars, unit = "%", height = 280, tickEvery: tickEveryIn = 1, legend, showValues = false, max: maxIn }: {
  bars: Bar[]; unit?: string; height?: number; tickEvery?: number; legend?: { tone: keyof typeof FILL; label: string }[];
  /** 막대 위에 값 표시 */ showValues?: boolean; /** y축 최댓값 고정(예: 100%) */ max?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  // 그려지는 실제 폭을 재서 viewBox에 쓴다(글자가 화면 크기 따라 커지거나 작아지지 않게)
  const box = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(720);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const hasSub = bars.some((b) => b.sub);
  const hasIcon = bars.some((b) => b.icon);
  const H = height, pl = 48, pr = 8, pt = (showValues ? 22 : 12) + (hasIcon ? 22 : 0), pb = hasSub ? 48 : 32;
  const raw = Math.max(...bars.map((b) => b.value), 0);
  const step = niceStep(raw / 4);
  const max = maxIn ?? Math.max(step, Math.ceil(raw / step) * step);
  const ticks = Array.from({ length: Math.round(max / step) + 1 }, (_, i) => i * step);
  const bw = (W - pl - pr) / Math.max(1, bars.length);
  const tickEvery = bw < 34 ? Math.max(tickEveryIn, Math.ceil(34 / bw)) : tickEveryIn;
  const y = (v: number) => pt + (H - pt - pb) * (1 - v / max);
  const fmt = (v: number) => (step < 1 ? v.toFixed(1) : String(Math.round(v)));
  const fmtV = (v: number) => String(Math.round(v));
  return (
    <div className="relative" ref={box}>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={bars.map((b) => b.tip).join(", ")}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pl} x2={W - pr} y1={y(t)} y2={y(t)} stroke="var(--line)" />
            <text x={pl - 8} y={y(t) + 4} textAnchor="end" fontSize={13} fill="var(--ink-3)" className="num">{fmt(t)}{unit}</text>
          </g>
        ))}
        {bars.map((b, i) => {
          const x = pl + i * bw + bw * 0.2, w = bw * 0.6, top = y(b.value);
          const fill = b.tone ? FILL[b.tone] : hover === i ? "var(--chart-strong)" : "var(--chart)";
          return (
            <g key={b.key} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}>
              <rect x={pl + i * bw} y={pt} width={bw} height={H - pt - pb} fill="transparent" />
              <path d={roundTop(x, top, w, H - pb - top, Math.min(3, w / 2))} fill={fill} />
              {i % tickEvery === 0 && <text x={x + w / 2} y={hasSub ? H - 26 : H - 10} textAnchor="middle" fontSize={13} fill="var(--ink-3)">{b.label}</text>}
              {b.sub && <text x={x + w / 2} y={H - 8} textAnchor="middle" fontSize={12} fill="var(--ink-3)" className="num">{b.sub}</text>}
              {b.icon && <WxGlyph kind={b.icon} x={x + w / 2} y={top - (showValues ? 22 : 6) - 9} />}
              {showValues && <text x={x + w / 2} y={top - 6} textAnchor="middle" fontSize={14} fontWeight={600} fill="var(--ink)" className="num">{fmtV(b.value)}{unit}</text>}
            </g>
          );
        })}
      </svg>
      {hover != null && (
        <div className="pointer-events-none absolute top-1 rounded-[6px] border border-line bg-surface px-2 py-1 text-sm text-ink shadow-none"
          style={{ left: `${((pl + (hover + 0.5) * bw) / W) * 100}%`, transform: "translateX(-50%)" }}>
          {bars[hover].tip}
        </div>
      )}
      {legend && (
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-ink-2">
          {legend.map((l) => <span key={l.label} className="inline-flex items-center gap-1.5"><i className="size-2 rounded-[2px]" style={{ background: FILL[l.tone] }} />{l.label}</span>)}
        </div>
      )}
    </div>
  );
}

function niceStep(x: number) {
  if (x <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(x)));
  const n = x / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
}

// 위쪽 모서리만 둥근 막대(바닥은 기준선에 붙인다)
function roundTop(x: number, y: number, w: number, h: number, r: number) {
  if (h <= 0) return "";
  const rr = Math.min(r, h);
  return `M${x},${y + h} V${y + rr} Q${x},${y} ${x + rr},${y} H${x + w - rr} Q${x + w},${y} ${x + w},${y + rr} V${y + h} Z`;
}

// 날씨 선 아이콘(16px, 옅은 회색). 막대 위에 그 달의 주된 날씨 결항 원인을 표시
function WxGlyph({ kind, x, y }: { kind: WxIcon; x: number; y: number }) {
  const d: Record<WxIcon, string> = {
    wind: "M2 5h8a2 2 0 1 0-2-2 M2 8h11a2 2 0 1 1-2 2 M2 11h6",
    snow: "M8 1v14 M2 4.5l12 7 M2 11.5l12-7 M6 2.5l2 1.5 2-1.5 M6 13.5l2-1.5 2 1.5",
    typhoon: "M13 4c-2-2.5-6.5-2.5-8.5 0S2 10 4 12 M3 12c2 2.5 6.5 2.5 8.5 0S14 6 12 4 M8 8m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0",
    fog: "M2 5h12 M1 8h14 M3 11h10",
    rain: "M4 9a3 3 0 0 1 1-5.8A4 4 0 0 1 13 5a2.5 2.5 0 0 1 0 4H4 M5 11l-1 3 M9 11l-1 3 M13 11l-1 3",
    storm: "M4 9a3 3 0 0 1 1-5.8A4 4 0 0 1 13 5a2.5 2.5 0 0 1 0 4H4 M9 9l-2 3h3l-2 3",
  };
  return <path d={d[kind]} transform={`translate(${x - 8},${y - 8})`} fill="none" stroke="var(--ink-3)" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />;
}
