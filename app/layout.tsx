import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getDict } from "@/lib/lang";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const sans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://pushyourx.lol"
  ),
  title: {
    default: "PushYourX · bid your way to the top of the timeline",
    template: "%s · PushYourX",
  },
  description:
    "A public leaderboard of X accounts, ordered by what each paid to sit there. No ads, no API keys, no revenue share.",
  applicationName: "PushYourX",
  keywords: ["X", "Twitter", "leaderboard", "auction", "promotion", "growth"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "PushYourX",
    url: "/",
    title: "PushYourX",
    description:
      "A public leaderboard of X accounts, ordered by what each paid to sit there.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "PushYourX" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PushYourX",
    description:
      "A public leaderboard of X accounts, ordered by what each paid to sit there.",
    images: ["/og.png"],
  },
};

/** Applique le thème avant le premier paint pour éviter le flash. */
/** Le site s'ouvre en clair. Le sombre ne s'applique que si le visiteur l'a choisi. */
const themeScript = `try{if(localStorage.getItem("pyx-theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { lang, d } = await getDict();

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${sans.variable} min-h-full font-sans antialiased`}>
        <div className="aurora" />
        <div className="flex min-h-dvh flex-col">
          <Header lang={lang} d={d} />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer d={d} />
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
