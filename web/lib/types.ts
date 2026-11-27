// public/data/*.json 구조 (scripts/export_athena.py 가 만든다)
export type Route = { dep: string; arr: string; flights: number; base: number; late: number; cancelled: number; avg_delay: number };
export type RouteHour = { dep: string; arr: string; h: number; flights: number; base: number; late: number; avg_delay: number; p50: number; p90: number };
export type RouteAirline = { dep: string; arr: string; airline: string; flights: number; base: number; late: number; cancelled: number; avg_delay: number };
export type RouteFlight = { dep: string; arr: string; flight: string; airline: string; flights: number; base: number; late: number; avg_delay: number; rk: number };
export type Cause = { dep?: string; arr?: string; cause_group: string; late: number };
export type JejuMonth = { dep: string; m: number | null; flights: number; cancelled: number; cancelled_weather: number };
export type History = {
  period: { from: string; to: string };
  routes: Route[]; route_hour: RouteHour[]; route_airline: RouteAirline[]; route_flight: RouteFlight[];
  route_cause: Cause[]; cause_all: Cause[]; jeju_month: JejuMonth[];
  airline_last?: { airline: string; last_day: string }[];
  route_arr_delay: { dep: string; arr: string; p50: number; p90: number; flights: number }[];
};
export type Leg = {
  flight_date: string; reg_no: string; airline_name: string; flight_no: string; dep_airport: string; arr_airport: string;
  dep_sched_at: string; dep_actual_at: string | null; dep_delay_gate_est_min: number | null;
  arr_sched_at: string; arr_actual_at: string | null; prev_flight: string | null; prev_dep_airport: string | null;
  prev_arr_sched_at: string | null; prev_arr_actual_at: string | null; prev_arr_delay_min: number | null;
  sched_turnaround_min: number | null; delay_origin_type: string; carried_delay_min: number | null; dep_status: string | null;
};
export type Airports = Record<string, { ko: string; lat: number; lon: number }>;
export type Satellite = { bounds: { west: number; east: number; south: number; north: number }; size: [number, number]; credit: string; img: string };
