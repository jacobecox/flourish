import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import ScrollToTop from "@/components/ScrollToTop";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://flourishapp.com"),
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
    card: "summary_large_image",
    title: "Flourish — Sourdough Baking Companion",
    description: "Track recipes, document bakes, and refine your sourdough craft.",
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Flourish",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

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
        <Navigation user={user ? { name: user.name, email: user.email } : null} />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
