import { Outfit } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata = {
  title: "Compare Degree APS",
  description: "Admission Processing System — Smart Decisions, Brighter Futures",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-full font-sans bg-[#f8fafc] text-slate-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
