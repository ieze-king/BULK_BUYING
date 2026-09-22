import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import "./globals.css";

/* Display face with real character; body face tuned for small Android screens. */
const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const body = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
  themeColor: "#0b7a48",
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
