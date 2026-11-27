// 지연 도미노: 같은 기체의 하루 비행을 따라 앞 편 지연이 다음 편으로 얼마나 넘어가는지 계산한다.
// 회전 테이블(assac-glue-kac-rotation)의 carried_delay_min 과 같은 식을 쓴다.
//   앞 편 게이트 도착 = 앞 편 실제 착륙 + 5분(TAXI_IN)
//   준비 가능 시간   = 이 편 출발 예정 − 앞 편 게이트 도착
//   넘어온 지연     = max(0, 최소 준비 시간 40분 − 준비 가능 시간)
// 가정(what-if): 한 편에 지연을 더하면 그 편 도착도 같은 만큼 늦어지고,
//   뒤 편은 max(기록된 출발 지연, 새로 넘어온 지연)으로 다시 계산한다. 가정이 없으면 기록 그대로.
import type { Leg } from "./types";

export const MTT_MIN = 40;
export const TAXI_IN_MIN = 5;
export const LATE_MIN = 15;

export type CascadeLeg = {
  leg: Leg;
  /** 출발 지연(기록 또는 가정 반영), 분 */
  depDelayMin: number;
  /** 앞 편에서 넘어온 지연, 분. 첫 편은 0 */
  carriedMin: number;
  /** 이 편에서 새로 생긴 지연 = 출발 지연 − 넘어온 지연(0 이상) */
  ownMin: number;
  /** 준비 가능 시간, 분. 첫 편·앞 편 기록 없음은 null */
  availMin: number | null;
  /** 가정 때문에 기록과 달라졌는지 */
  changed: boolean;
};

/** "2026-11-26 16:20:00.000"(KST) → 분 단위 시각(시간대 변환 없이) */
const toMin = (s: string) => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10), +s.slice(11, 13), +s.slice(14, 16)) / 60000;

/** 같은 기체의 그날 비행을 출발 예정 순으로 */
export const legsOfAircraft = (rows: Leg[], reg: string) =>
  rows.filter((x) => x.reg_no === reg).sort((a, b) => (a.dep_sched_at < b.dep_sched_at ? -1 : 1));

export function computeCascade(legs: Leg[], extra: Record<string, number> = {}): CascadeLeg[] {
  const out: CascadeLeg[] = [];
  let prevGateArr: number | null = null; // 앞 편 게이트 도착(분)
  let shifted = false; // 앞쪽에 가정이 들어갔는지(그 전까지는 기록 그대로)
  legs.forEach((l, i) => {
    const sched = toMin(l.dep_sched_at);
    // 회전 테이블이 잡은 앞 편이 이 목록의 앞 편과 다르면(국제선·전날 편 등) 테이블의 앞 편 도착을 쓴다
    if (l.prev_flight && l.prev_arr_actual_at && legs[i - 1]?.flight_no !== l.prev_flight) prevGateArr = toMin(l.prev_arr_actual_at) + TAXI_IN_MIN;
    const availMin = prevGateArr == null ? null : sched - prevGateArr;
    const carriedMin = availMin == null ? 0 : Math.max(0, MTT_MIN - availMin);
    const recorded = l.dep_delay_gate_est_min ?? 0;
    const add = extra[l.flight_no] ?? 0;
    const depDelayMin = (shifted ? Math.max(recorded, carriedMin) : recorded) + add;
    if (add) shifted = true;
    const changed = depDelayMin !== recorded;

    // 도착: 기록이 있으면 기록 + 늘어난 출발 지연, 없으면 예정 + 출발 지연
    // 착륙 기록도 출발 기록도 없으면 다음 편의 준비 시간은 모른다(null)
    const arr = l.arr_actual_at ? toMin(l.arr_actual_at) + (depDelayMin - recorded)
      : l.arr_sched_at && l.dep_delay_gate_est_min != null ? toMin(l.arr_sched_at) + Math.max(0, depDelayMin) : null;
    prevGateArr = arr == null ? null : arr + TAXI_IN_MIN;

    out.push({ leg: l, depDelayMin, carriedMin, ownMin: Math.max(0, depDelayMin - carriedMin), availMin, changed });
  });
  return out;
}

/** 이 편까지 이어진 연쇄의 시작점: 넘어온 지연이 끊기지 않고 이어진 구간의 첫 편 */
export function cascadeOrigin(chain: CascadeLeg[], flightNo: string) {
  const i = chain.findIndex((c) => c.leg.flight_no === flightNo);
  if (i < 0 || chain[i].carriedMin <= 0) return null;
  let j = i;
  while (j > 0 && chain[j].carriedMin > 0) j--;
  return { origin: chain[j], hops: i - j };
}
