// 승객에게 보여 줄 말. 전문 용어 대신 "10번 중 몇 번"
export const tenOf = (late: number, base: number) => (base ? Math.round((10 * late) / base) : 0);
export const late10 = (n: number) => (n <= 0 ? "거의 안 늦어요" : `10번 중 ${n}번 늦어요`);
export const hourName = (h: number) => (h < 12 ? `오전 ${h}시` : h === 12 ? "낮 12시" : `오후 ${h - 12}시`);
export const CAUSE: Record<string, string> = {
  "항공기 연결": "앞 비행기가 늦게 와서", 항공교통흐름: "하늘길이 붐벼서", "공항·출입국 절차": "공항 수속이 밀려서", 기상: "날씨 때문에",
  "항공기 정비": "비행기 점검 때문에", "여객·화물처리": "승객·짐 처리가 늦어서", "운항·승무원": "승무원 사정으로", 지상조업: "지상 작업이 늦어서", 기타: "그 밖의 이유로",
};
export const AIR_CODE: Record<string, string> = {
  대한항공: "KE", 아시아나항공: "OZ", 제주항공: "7C", 진에어: "LJ", 트리니티항공: "TW", 에어부산: "BX", 에어서울: "RS",
  이스타항공: "ZE", 에어로케이항공: "RF", 파라타항공: "WE", 하이에어: "4H", 섬에어: "XU",
};
