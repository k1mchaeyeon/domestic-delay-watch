# site/index.html + site/data/*.json → site/bundle.html (자료를 한 파일에 넣은 배포·미리보기용)
import json
import pathlib
import sys

site = pathlib.Path(sys.argv[1])
data = {p.stem: json.loads(p.read_text()) for p in sorted((site / "data").glob("*.json"))}
html = (site / "index.html").read_text()
font = (site / "assets" / "paperlogy.css").read_text()
html = html.replace('<link rel="stylesheet" href="assets/paperlogy.css">', f"<style>{font}</style>")
inject = "<script>window.__DATA__=" + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "</script>\n<script>\n(async () => {"
assert "<script>\n(async () => {" in html
html = html.replace("<script>\n(async () => {", inject, 1)
(site / "bundle.html").write_text(html)
print("bundle", len(html))
