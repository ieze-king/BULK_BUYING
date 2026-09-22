import type { Metadata, Viewport } from "next";
import { Figtree, Fraunces } from "next/font/google";
import "./globals.css";

/* A warm, crafted serif for display; a friendly geometric sans for reading. */
const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "900"],
  display: "swap",
});

const body = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bulk prices aren't for big buyers. They're for big orders.",
  description:
    "You don't need to place a big order on your own to get big-order prices. Tell us what you want, we combine it with everyone else, and take the whole order to suppliers.",
  openGraph: {
    title: "Bulk prices aren't for big buyers. They're for big orders.",
    description:
      "You don't need to place a big order on your own to get big-order prices. Tell us what you want in bulk and we combine it with everyone else.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b8a4b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
