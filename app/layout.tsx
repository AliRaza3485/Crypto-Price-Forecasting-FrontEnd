import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BTC Forecast Monitor — MLOps engineering showcase",
  description:
    "A live monitoring dashboard for a BTC price-forecasting MLOps pipeline — next-hour forecast, backend health, and data-drift metrics. An engineering showcase, not a trading system.",
  openGraph: {
    title: "BTC Forecast Monitor",
    description:
      "Live next-hour BTC forecast plus MLOps pipeline health and drift monitoring.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
