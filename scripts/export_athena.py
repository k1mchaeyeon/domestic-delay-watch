# 대시보드 1차안용 집계 JSON 뽑기 (Athena → site/data/*.json)
# 사용: AWS_PROFILE=assac-bat python export_athena.py <출력 폴더>
import json
import os
import sys
import time

import boto3

OUT = sys.argv[1]
ath = boto3.client("athena", region_name="ap-northeast-2")
RESULT = "s3://assac-datalake/athena/query-results/kcy/"

DOM = ("김포", "제주", "김해", "청주", "대구", "광주", "울산", "여수", "사천", "포항경주", "군산", "양양", "원주", "무안", "인천")
DOM_SQL = ",".join(f"'{a}'" for a in DOM)
SINCE, UNTIL = "20230101", "20261031"
BASE = f"""FROM assac_airportal_clean.flight_clean
WHERE kind='여객' AND airport IN ({DOM_SQL}) AND other_airport IN ({DOM_SQL})
  AND "date" BETWEEN '{SINCE}' AND '{UNTIL}'"""
DEP = BASE + " AND direction='dep'"
LATE = "sum(CASE WHEN use_delay AND is_late THEN 1 ELSE 0 END)"
BASEN = "sum(CASE WHEN use_delay THEN 1 ELSE 0 END)"
CANCEL = "sum(CASE WHEN status='취소' THEN 1 ELSE 0 END)"


def q(sql):
    qid = ath.start_query_execution(QueryString=sql, WorkGroup="primary",
                                    ResultConfiguration={"OutputLocation": RESULT})["QueryExecutionId"]
    while True:
        st = ath.get_query_execution(QueryExecutionId=qid)["QueryExecution"]["Status"]
        if st["State"] in ("SUCCEEDED", "FAILED", "CANCELLED"):
            break
        time.sleep(1)
    if st["State"] != "SUCCEEDED":
        raise RuntimeError(f"{st}\n{sql}")
    rows, token = [], None
    while True:
        kw = {"QueryExecutionId": qid, "MaxResults": 1000}
        if token:
            kw["NextToken"] = token
        r = ath.get_query_results(**kw)
        rows += [[c.get("VarCharValue") for c in row["Data"]] for row in r["ResultSet"]["Rows"]]
        token = r.get("NextToken")
        if not token:
            break
    head, body = rows[0], rows[1:]
    return [dict(zip(head, b)) for b in body]


def num(rows):
    for r in rows:
        for k, v in r.items():
            if v is None:
                continue
            try:
                r[k] = int(v) if v.lstrip("-").isdigit() else round(float(v), 2)
            except ValueError:
                pass
    return rows


data = {"period": {"from": SINCE, "to": UNTIL}, "source": "항공정보포털 운항 실적(정제: assac_airportal_clean.flight_clean), 국내선 여객"}
data["routes"] = num(q(f"""SELECT airport AS dep, other_airport AS arr, count(*) AS flights,
  {BASEN} AS base, {LATE} AS late, {CANCEL} AS cancelled,
  round(avg(CASE WHEN use_delay THEN delay_min END),1) AS avg_delay
{DEP} GROUP BY 1,2 HAVING count(*) >= 3000 ORDER BY flights DESC LIMIT 16"""))
keys = {(r["dep"], r["arr"]) for r in data["routes"]}
RT = " OR ".join(f"(airport='{a}' AND other_airport='{b}')" for a, b in keys)

data["route_hour"] = num(q(f"""SELECT airport AS dep, other_airport AS arr, hour(sched_dt) AS h,
  count(*) AS flights, {BASEN} AS base, {LATE} AS late, round(avg(CASE WHEN use_delay THEN delay_min END),1) AS avg_delay,
  approx_percentile(CASE WHEN use_delay THEN delay_min END, 0.5) AS p50, approx_percentile(CASE WHEN use_delay THEN delay_min END, 0.9) AS p90
{DEP} AND ({RT}) GROUP BY 1,2,3"""))
data["route_airline"] = num(q(f"""SELECT airport AS dep, other_airport AS arr, airline,
  count(*) AS flights, {BASEN} AS base, {LATE} AS late, {CANCEL} AS cancelled,
  round(avg(CASE WHEN use_delay THEN delay_min END),1) AS avg_delay
{DEP} AND ({RT}) GROUP BY 1,2,3 HAVING count(*) >= 200"""))
data["route_flight"] = num(q(f"""SELECT * FROM (SELECT airport AS dep, other_airport AS arr, flight, airline,
  count(*) AS flights, {BASEN} AS base, {LATE} AS late, round(avg(CASE WHEN use_delay THEN delay_min END),1) AS avg_delay,
  row_number() OVER (PARTITION BY airport, other_airport ORDER BY 1.0*{LATE}/nullif({BASEN},0) DESC) AS rk
{DEP} AND ({RT}) AND "date" >= '20250101' GROUP BY 1,2,3,4 HAVING {BASEN} >= 100) WHERE rk <= 5"""))
data["route_cause"] = num(q(f"""SELECT airport AS dep, other_airport AS arr, cause_group, count(*) AS late
{DEP} AND ({RT}) AND use_delay AND is_late AND cause_group <> '' GROUP BY 1,2,3"""))
data["airline_all"] = num(q(f"""SELECT airline, count(*) AS flights, {BASEN} AS base, {LATE} AS late, {CANCEL} AS cancelled,
  round(avg(CASE WHEN use_delay THEN delay_min END),1) AS avg_delay
{DEP} AND "date" >= '20250101' GROUP BY 1 HAVING count(*) >= 2000 ORDER BY 1.0*{LATE}/nullif({BASEN},0) DESC"""))
data["cause_all"] = num(q(f"""SELECT cause_group, count(*) AS late
{DEP} AND "date" >= '20250101' AND use_delay AND is_late AND cause_group <> '' GROUP BY 1 ORDER BY 2 DESC"""))
data["hour_all"] = num(q(f"""SELECT hour(sched_dt) AS h, count(*) AS flights, {BASEN} AS base, {LATE} AS late
{DEP} AND "date" >= '20250101' GROUP BY 1 ORDER BY 1"""))
data["jeju_month"] = num(q(f"""SELECT airport AS dep, month(sched_dt) AS m, count(*) AS flights, {CANCEL} AS cancelled,
  sum(CASE WHEN status='취소' AND cause_group='기상' THEN 1 ELSE 0 END) AS cancelled_weather
{BASE} AND direction='dep' AND other_airport='제주' GROUP BY 1,2"""))
data["route_arr_delay"] = num(q(f"""SELECT other_airport AS dep, airport AS arr,
  approx_percentile(delay_min, 0.5) AS p50, approx_percentile(delay_min, 0.9) AS p90, count(*) AS flights
{BASE} AND direction='arr' AND use_delay AND "date" >= '20250101' GROUP BY 1,2 HAVING count(*) >= 1000"""))

ROT_COLS = ("flight_date, reg_no, airline_name, flight_no, dep_airport, arr_airport, dep_sched_at, dep_actual_at, "
            "dep_delay_gate_est_min, is_late, arr_sched_at, arr_actual_at, prev_flight, prev_dep_airport, "
            "prev_arr_sched_at, prev_arr_actual_at, prev_arr_delay_min, sched_turnaround_min, leg_no, "
            "delay_origin_type, carried_delay_min, own_added_delay_min, is_carried_delay, dep_status")
os.makedirs(OUT, exist_ok=True)
for d in [f"202611{x:02d}" for x in range(18, 28)]:
    rot = q(f"SELECT {ROT_COLS} FROM assac_kac_clean.kac_rotation WHERE dt='{d}' AND is_domestic ORDER BY reg_no, dep_sched_at")
    if not rot:  # Athena에 없는 날짜(11/18~22는 로컬 백필 파일)는 덮어쓰지 않는다
        print("rotation", d, "없음, 건너뜀")
        continue
    json.dump(num(rot), open(f"{OUT}/rotation_{d}.json", "w"), ensure_ascii=False, separators=(",", ":"))
    print("rotation", d, len(rot))
json.dump(data, open(f"{OUT}/history.json", "w"), ensure_ascii=False, separators=(",", ":"))
print({k: len(v) for k, v in data.items() if isinstance(v, list)})
# 화면이 읽을 날짜 목록
import glob
days = sorted(os.path.basename(f)[9:17] for f in glob.glob(f"{OUT}/rotation_*.json"))
json.dump(days, open(f"{OUT}/days.json", "w"))
