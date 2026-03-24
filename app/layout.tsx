import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import ScrollToTop from "@/components/ScrollToTop";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://flourishbake.com"),
  title: {
    default: "Flourish — Sourdough Baking Companion",
    template: "%s | Flourish",
  },
  description:
    "Flourish is the sourdough app built for serious bakers. Save recipes, track every bake, monitor your starter, and get personalized advice from an AI assistant that knows your exact bakes.",
  keywords: [
    "sourdough", "sourdough app", "sourdough recipe tracker", "baking journal",
    "AI baking assistant", "sourdough AI", "bread baking app", "sourdough starter tracker",
    "sourdough recipes", "artisan bread", "home baker", "bread baking", "sourdough bread",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Flourish — AI-Powered Sourdough Baking Companion",
    description: "Save recipes, track every bake, and get personalized AI advice that knows your exact bakes — no generic app can match it.",
    siteName: "Flourish",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flourish — AI-Powered Sourdough Baking Companion",
    description: "Save recipes, track every bake, and get personalized AI advice that knows your exact bakes.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Flourish",
  },
  icons: {
    icon: "/icon.svg",
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
