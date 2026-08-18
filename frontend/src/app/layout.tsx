import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Evaluasi Delegasi - K-Means Clustering",
  description: "Sistem cerdas berbasis K-Means untuk menganalisis distribusi beban kerja.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
