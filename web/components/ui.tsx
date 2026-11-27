"use client";

// 공통 컴포넌트: 같은 높이(32px)·같은 라운드(6/8)·테두리 1px. 색은 토큰만 쓴다
import type { ReactNode } from "react";
import { AIR_CODE } from "@/lib/words";

export function Card({ title, right, children, className = "" }: { title?: ReactNode; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 rounded-[8px] border border-line bg-surface ${className}`}>
      {(title || right) && (
        <header className="flex min-h-11 items-center justify-between gap-3 border-b border-line px-4 py-2.5">
          <h2 className="text-[13px] font-semibold text-ink">{title}</h2>
          {right && <div className="flex items-center gap-2 text-xs text-ink-2">{right}</div>}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

/** 질문 한 줄 + 답(20px). 페이지마다 맨 위에 하나 */
export function Answer({ q, children, sub }: { q: string; children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[13px] text-ink-2">{q}</p>
      <p className="text-xl font-semibold leading-snug tracking-[-0.01em] text-ink [text-wrap:balance]">{children}</p>
      {sub && <p className="text-[13px] text-ink-2">{sub}</p>}
    </div>
  );
}

export function KpiTile({ label, value, unit, note, tone }: { label: string; value: string; unit?: string; note?: string; tone?: Tone }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-[8px] border border-line bg-surface px-4 py-3">
      <span className="text-[13px] text-ink-2">{label}</span>
      <span className={`num text-[28px] font-semibold leading-none tracking-[-0.02em] ${tone ? TONE_TEXT[tone] : "text-ink"}`}>
        {value}
        {unit && <small className="ml-1 text-sm font-normal text-ink-2">{unit}</small>}
      </span>
      {note && <span className="truncate text-xs text-ink-3">{note}</span>}
    </div>
  );
}

export type Tone = "ok" | "warn" | "bad";
const TONE_TEXT: Record<Tone, string> = { ok: "text-ok", warn: "text-warn", bad: "text-bad" };
const TONE_DOT: Record<Tone, string> = { ok: "bg-ok", warn: "bg-warn", bad: "bg-bad" };

/** 상태 배지: 점 + 글자 (색만으로 구분하지 않는다) */
export function Badge({ tone, children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className="inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-[6px] border border-line bg-surface px-2 text-xs text-ink">
      {tone && <i className={`size-1.5 rounded-full ${TONE_DOT[tone]}`} />}
      {children}
    </span>
  );
}

export function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center gap-2 text-xs text-ink-2">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}
        className="h-8 cursor-pointer rounded-[6px] border border-line-strong bg-surface px-2.5 text-[13px] text-ink">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}

export function TextInput({ label, value, onChange, list, placeholder }: { label: string; value: string; onChange: (v: string) => void; list?: string; placeholder?: string }) {
  return (
    <label className="flex items-center gap-2 text-xs text-ink-2">
      {label}
      <input value={value} onChange={(e) => onChange(e.target.value.toUpperCase())} list={list} placeholder={placeholder} aria-label={label} autoComplete="off"
        className="num h-8 w-32 rounded-[6px] border border-line-strong bg-surface px-2.5 text-[13px] uppercase text-ink placeholder:normal-case placeholder:text-ink-3" />
    </label>
  );
}

export function DateInput({ label, value, min, max, onChange }: { label: string; value: string; min: string; max: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center gap-2 text-xs text-ink-2">
      {label}
      <input type="date" value={value} min={min} max={max} onChange={(e) => onChange(e.target.value)} aria-label={label}
        className="num h-8 rounded-[6px] border border-line-strong bg-surface px-2.5 text-[13px] text-ink" />
    </label>
  );
}

export function Button({ children, onClick, active }: { children: ReactNode; onClick?: () => void; active?: boolean }) {
  return (
    <button onClick={onClick} aria-pressed={active}
      className={`h-8 rounded-[6px] border px-3 text-[13px] transition-colors ${active ? "border-accent bg-accent text-accent-ink" : "border-line-strong bg-surface text-ink hover:bg-subtle"}`}>
      {children}
    </button>
  );
}

/** 표: 머리글 12px 회색, 행 36px, 숫자 오른쪽 정렬 */
export type Col<T> = { key: string; label: string; align?: "left" | "right"; width?: string; render: (row: T) => ReactNode };
export function Table<T>({ cols, rows, rowKey, onRow, selected }: { cols: Col<T>[]; rows: T[]; rowKey: (r: T) => string; onRow?: (r: T) => void; selected?: (r: T) => boolean }) {
  return (
    <div className="-mx-4 -my-4 overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-line">
            {cols.map((c) => (
              <th key={c.key} style={{ width: c.width }} className={`h-9 px-4 text-xs font-medium text-ink-2 ${c.align === "right" ? "text-right" : "text-left"}`}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={rowKey(r)} onClick={onRow ? () => onRow(r) : undefined}
              className={`h-9 border-b border-line last:border-b-0 ${onRow ? "cursor-pointer hover:bg-subtle" : ""} ${selected?.(r) ? "bg-accent-soft" : ""}`}>
              {cols.map((c) => (
                <td key={c.key} className={`num px-4 ${c.align === "right" ? "text-right" : "text-left"}`}>{c.render(r)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 항공사: 투명 PNG 로고(어두운 로고는 다크 모드에서 밝게) + 이름 */
const LOGOS = new Set(["KE", "OZ", "7C", "LJ", "TW", "BX", "RS", "ZE", "RF", "WE", "XU"]);
const DARK = new Set(["BX", "KE", "OZ", "RF", "WE", "XU", "ZE"]);
export function Airline({ name, showName = true }: { name: string; showName?: boolean }) {
  const code = AIR_CODE[name];
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <span className="inline-flex h-5 w-14 flex-none items-center">
        {code && LOGOS.has(code) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/logos/${code}.png`} alt="" className={`max-h-full max-w-full ${DARK.has(code) ? "dark:brightness-0 dark:invert-[.9]" : ""}`} />
        ) : (
          <span className="num text-[11px] font-semibold text-ink-2">{code ?? name.slice(0, 2)}</span>
        )}
      </span>
      {showName && <span className="truncate">{name}</span>}
    </span>
  );
}

/** 가는 막대(표 안의 비율 표시) */
export function Meter({ value, max, tone }: { value: number; max: number; tone?: Tone }) {
  return (
    <span className="inline-block h-1.5 w-24 overflow-hidden rounded-[2px] bg-subtle align-middle">
      <i className={`block h-full ${tone ? TONE_DOT[tone] : "bg-chart-strong"}`} style={{ width: `${Math.min(100, (100 * value) / max)}%` }} />
    </span>
  );
}
