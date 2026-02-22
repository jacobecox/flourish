import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import ScrollToTop from "@/components/ScrollToTop";

export const metadata: Metadata = {
  title: {
    default: "Flourish",
    template: "%s | Flourish",
  },
  description:
    "Your personal sourdough baking companion. Track recipes, document bakes with photos and notes, and refine your craft over time.",
  keywords: ["sourdough", "baking", "bread", "recipes", "baking journal", "sourdough starter", "baker"],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Flourish — Sourdough Baking Companion",
    description: "Track recipes, document bakes, and refine your sourdough craft.",
    siteName: "Flourish",
  },
  twitter: {
    card: "summary",
    title: "Flourish — Sourdough Baking Companion",
    description: "Track recipes, document bakes, and refine your sourdough craft.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme');
                const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                if (theme === 'dark' || (theme === 'system' && systemPrefersDark) || (!theme && systemPrefersDark)) {
                  document.documentElement.classList.add('dark');
                } else if (theme === 'light') {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        <ScrollToTop />
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
