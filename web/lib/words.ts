// 승객에게 보여 줄 말과 계산 도우미 (HTML 1차안 site/index.html과 같은 규칙)
export const tenOf = (late: number, base: number) => (base ? Math.round((10 * late) / base) : 0);
export const late10 = (n: number) => (n <= 0 ? "거의 안 늦어요" : `10번 중 ${n}번 늦어요`);
export const hourName = (h: number) => (h < 12 ? `오전 ${h}시` : h === 12 ? "낮 12시" : `오후 ${h - 12}시`);
export const dur = (m: number) => {
  const r = Math.round(m);
  return r < 60 ? `${r}분` : `${Math.floor(r / 60)}시간${r % 60 ? ` ${r % 60}분` : ""}`;
};
export const hm = (s: string | null | undefined) => (s ? s.slice(11, 16) : "");
export const mins = (s: string | null | undefined) => (s ? +s.slice(11, 13) * 60 + +s.slice(14, 16) : null);
export const clock = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(Math.round(m) % 60).padStart(2, "0")}`;
export type DelayTone = "ok" | "warn" | "bad";
export const delayTone = (m: number | null | undefined): DelayTone | undefined => (m == null ? undefined : m <= 15 ? "ok" : m <= 45 ? "warn" : "bad");
export const delayWord = (m: number | null | undefined) => (m == null ? "기록 없음" : m <= 15 ? "제때" : `${dur(m)} 늦음`);
export const iso = (d: string) => `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}`;
export const ymd = (s: string) => s.replace(/-/g, "");
export const dayLabel = (d: string) => `${+d.slice(4, 6)}/${+d.slice(6)}(${"일월화수목금토"[new Date(iso(d) + "T00:00:00").getDay()]})`;
export const shift = (d: string, n: number) => {
  const t = new Date(iso(d) + "T00:00:00");
  t.setDate(t.getDate() + n);
  return `${t.getFullYear()}${String(t.getMonth() + 1).padStart(2, "0")}${String(t.getDate()).padStart(2, "0")}`;
};

export const CAUSE: Record<string, string> = {
  "항공기 연결": "앞 비행기가 늦게 와서", 항공교통흐름: "하늘길이 붐벼서", "공항·출입국 절차": "공항 수속이 밀려서", 기상: "날씨 때문에",
  "항공기 정비": "비행기 점검 때문에", "여객·화물처리": "승객·짐 처리가 늦어서", "운항·승무원": "승무원 사정으로", 지상조업: "지상 작업이 늦어서", 기타: "그 밖의 이유로",
};
export const AIR_CODE: Record<string, string> = {
  대한항공: "KE", 아시아나항공: "OZ", 제주항공: "7C", 진에어: "LJ", 트리니티항공: "TW", 에어부산: "BX", 에어서울: "RS",
  이스타항공: "ZE", 에어로케이항공: "RF", 파라타항공: "WE", 하이에어: "4H", 섬에어: "XU",
};
