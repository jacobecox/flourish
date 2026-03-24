import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import LandingPage from "@/components/LandingPage";
import Dashboard from "@/components/Dashboard";

export const metadata: Metadata = {
  title: "Flourish — AI-Powered Sourdough Baking Companion",
  description:
    "The sourdough app with an AI assistant that actually knows your bakes. Save recipes, track every loaf, monitor your starter, and get advice no generic app can match.",
  alternates: {
    canonical: "/",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Flourish",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://flourishbake.com",
  applicationCategory: "FoodApplication",
  operatingSystem: "Web",
  description:
    "Flourish is an AI-powered sourdough baking companion. Save recipes, track every bake, monitor your starter, and get personalized AI advice that knows your exact baking history.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "AI baking assistant trained on your recipes and bake history",
    "Recipe manager with URL import",
    "Bake journal with photos, notes, and ratings",
    "Sourdough starter tracker",
    "Shareable recipes",
  ],
};

export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    return <Dashboard user={user} />;
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage />
    </>
  );
}
