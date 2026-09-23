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
  title: "Order together, pay less",
  description:
    "Suppliers price a big order differently, and most people cannot reach that alone. Start a private pool for what you want, share it with people you know, and organise the order together.",
  openGraph: {
    title: "Turn your group into a bulk buyer",
    description:
      "Start a private pool for what you want to buy in bulk, share it with your family or your trade group, and organise the order together.",
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
