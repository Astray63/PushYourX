import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const sans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "push your.x · bid your way to the top of the timeline",
  description:
    "A public leaderboard of X accounts. No ads, no API keys, no revenue share. The highest bid sits at #1.",
  openGraph: {
    title: "push your.x",
    description: "Outbid everyone. Own #1.",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "push your.x" },
};

/** Applique le thème avant le premier paint pour éviter le flash. */
/** Le site s'ouvre en clair. Le sombre ne s'applique que si le visiteur l'a choisi. */
const themeScript = `try{if(localStorage.getItem("pyx-theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${sans.variable} min-h-full font-sans antialiased`}>
        <div className="aurora" />
        <div className="flex min-h-dvh flex-col">
          <Header />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
