import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "국내선 지연 워치",
  description: "국내선 승객이 여행 단계마다 묻는 지연 질문에 한 줄로 답하는 대시보드",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
