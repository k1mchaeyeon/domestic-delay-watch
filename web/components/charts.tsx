"use client";

// 막대그래프 하나로 두 차트(시간대별 지연률, 월별 결항률)를 그린다.
// 회색 막대 + 강조는 의미 있는 1~2개(제일 덜/제일 많이), y축 눈금·범례·마우스 올리면 수치
import { useEffect, useRef, useState } from "react";

export type Bar = { key: string | number; label: string; value: number; tip: string; tone?: "ok" | "bad" | "accent" };

const FILL = { ok: "var(--ok)", bad: "var(--bad)", accent: "var(--accent)" } as const;

export function BarChart({ bars, unit = "%", height = 220, tickEvery: tickEveryIn = 1, legend }: {
  bars: Bar[]; unit?: string; height?: number; tickEvery?: number; legend?: { tone: keyof typeof FILL; label: string }[];
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
  const H = height, pl = 40, pr = 8, pt = 12, pb = 28;
  const raw = Math.max(...bars.map((b) => b.value), 0);
  const step = niceStep(raw / 4);
  const max = Math.max(step, Math.ceil(raw / step) * step);
  const ticks = Array.from({ length: Math.round(max / step) + 1 }, (_, i) => i * step);
  const bw = (W - pl - pr) / Math.max(1, bars.length);
  const tickEvery = bw < 34 ? Math.max(tickEveryIn, Math.ceil(34 / bw)) : tickEveryIn;
  const y = (v: number) => pt + (H - pt - pb) * (1 - v / max);
  const fmt = (v: number) => (step < 1 ? v.toFixed(1) : String(Math.round(v)));
  return (
    <div className="relative" ref={box}>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={bars.map((b) => b.tip).join(", ")}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pl} x2={W - pr} y1={y(t)} y2={y(t)} stroke="var(--line)" />
            <text x={pl - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="var(--ink-3)" className="num">{fmt(t)}{unit}</text>
          </g>
        ))}
        {bars.map((b, i) => {
          const x = pl + i * bw + bw * 0.2, w = bw * 0.6, top = y(b.value);
          const fill = b.tone ? FILL[b.tone] : hover === i ? "var(--chart-strong)" : "var(--chart)";
          return (
            <g key={b.key} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}>
              <rect x={pl + i * bw} y={pt} width={bw} height={H - pt - pb} fill="transparent" />
              <path d={roundTop(x, top, w, H - pb - top, Math.min(3, w / 2))} fill={fill} />
              {i % tickEvery === 0 && <text x={x + w / 2} y={H - 9} textAnchor="middle" fontSize={11} fill="var(--ink-3)">{b.label}</text>}
            </g>
          );
        })}
      </svg>
      {hover != null && (
        <div className="pointer-events-none absolute top-1 rounded-[6px] border border-line bg-surface px-2 py-1 text-xs text-ink shadow-none"
          style={{ left: `${((pl + (hover + 0.5) * bw) / W) * 100}%`, transform: "translateX(-50%)" }}>
          {bars[hover].tip}
        </div>
      )}
      {legend && (
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-ink-2">
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
