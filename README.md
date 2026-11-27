# 국내선 지연 워치 (1차안)

## 바로 보기
- **`site/bundle.html`을 내려받아 브라우저로 열면 바로 보여요.** 자료가 파일 안에 다 들어 있어서 서버가 필요 없어요.
- 코드를 고치면서 보려면: `python3 -m http.server 8765 --directory site` 실행 후 http://localhost:8765
  (`site/index.html`을 그냥 열면 자료 파일을 못 읽어서 빈 화면이 나와요.)
- 샘플인 부분: "출발 전·공항에서·도착" 탭은 실시간 연결 전이라 11/18~27 수집 기록을 다시 보여 줘요(11/18~22는 공항공사 API 하루 최종본으로 만든 회전 테이블). "예약할 때" 탭은 2023.1~2026.10 실제 기록이에요.

## 화면 코드
- `site/index.html`: 화면 전체(HTML·CSS·자바스크립트 한 파일, 외부 라이브러리 없음)
- `site/bundle.html`: index.html + 자료를 한 파일로 묶은 것 (`python3 scripts/build_bundle.py site`로 다시 만듦)

국내선 승객 여정(예약할 때 · 집 나서기 전 · 공항·지연 발생 · 도착)별 질문에 답하는 대시보드 초안. 팀 공유 전 검토용.

- `site/index.html`: 화면 (정적 HTML, 라이브러리 없음)
- `site/data/history.json`: 항공정보포털 운항 실적 집계(2023.1~2026.10, 국내선 여객, Athena `assac_airportal_clean.flight_clean`)
- `site/data/rotation_*.json`: 회전 테이블(11/23~25, Athena `assac_kac_clean.kac_rotation`): 같은 기체 앞 편, 넘어온 지연, 시작점 분류
- `scripts/export_athena.py`: 위 JSON을 다시 뽑는 스크립트 (`AWS_PROFILE=... python scripts/export_athena.py site/data`)
- `scripts/build_bundle.py`: 자료를 한 파일에 넣은 `site/bundle.html` 생성(서버 없이 열어 볼 때)

로컬에서 보기: `python3 -m http.server 8765 --directory site` 후 http://localhost:8765

## 지연 기준
- 게이트 출발이 예정보다 15분 초과(국토부 기준). 한국공항공사 실시간 출발 시각은 이륙 시각이라 게이트 추정 = 이륙 − 13분.
- 넘어온 지연 = max(0, 앞 편 도착 + 5분 + 최소 준비 40분 − 예정 출발)

## 아직 샘플인 부분
- 02~04 탭은 실시간 API 연결 전이라 11/23~25 수집분을 다시 보여 준다.
- 날씨 결항 위험도, AI 챗봇은 다음 단계.
