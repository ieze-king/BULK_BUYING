import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Buy in bulk, together",
  description:
    "Tell us what you want to buy in bulk and how much. We aggregate demand and connect it with bulk suppliers.",
  openGraph: {
    title: "Buy in bulk, together",
    description:
      "Tell us what you want to buy in bulk and how much. We aggregate demand and connect it with bulk suppliers.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f7a4f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
