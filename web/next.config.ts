import type { NextConfig } from "next";

// EXPORT=1 일 때만 정적 파일(out/)로 내보낸다(미리보기 캡처용)
const config: NextConfig = process.env.EXPORT === "1" ? { output: "export", images: { unoptimized: true } } : {};
export default config;
