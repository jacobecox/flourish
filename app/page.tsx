import { getCurrentUser } from "@/lib/auth";
import LandingPage from "@/components/LandingPage";
import Dashboard from "@/components/Dashboard";

export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    return <Dashboard user={user} />;
  }

  return <LandingPage />;
}
