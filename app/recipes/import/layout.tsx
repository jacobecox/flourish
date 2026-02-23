import { Metadata } from "next";

export const metadata: Metadata = { title: "Import Recipe" };

export default function ImportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
