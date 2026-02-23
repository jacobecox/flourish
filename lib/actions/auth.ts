"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/session";

interface FusionAuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
}

function deriveName(user: FusionAuthUser): string | null {
  if (user.fullName) return user.fullName;
  const parts = [user.firstName, user.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : null;
}

async function upsertAndLogin(user: FusionAuthUser) {
  await prisma.user.upsert({
    where: { id: user.id },
    create: { id: user.id, email: user.email, name: deriveName(user) },
    update: { email: user.email, name: deriveName(user) },
  });
  await setSession({ userId: user.id, email: user.email });
}

export async function loginAction(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const fusionAuthUrl = process.env.FUSIONAUTH_URL!;
  const apiKey = process.env.FUSIONAUTH_API_KEY!;
  const applicationId = process.env.FUSIONAUTH_CLIENT_ID!;

  let res: Response;
  try {
    res = await fetch(`${fusionAuthUrl}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      body: JSON.stringify({ loginId: email, password, applicationId }),
    });
  } catch {
    return { error: "Could not reach the authentication server. Please try again." };
  }

  if (res.status === 409) {
    return { error: "Your account has been locked. Please contact support." };
  }

  if (!res.ok) {
    return { error: "Invalid email or password." };
  }

  const data = await res.json() as { user: FusionAuthUser };
  await upsertAndLogin(data.user);
  redirect("/recipes");
}

export async function registerAction(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const firstName = (formData.get("firstName") as string)?.trim() || undefined;
  const lastName = (formData.get("lastName") as string)?.trim() || undefined;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const fusionAuthUrl = process.env.FUSIONAUTH_URL!;
  const apiKey = process.env.FUSIONAUTH_API_KEY!;
  const applicationId = process.env.FUSIONAUTH_CLIENT_ID!;

  let res: Response;
  try {
    res = await fetch(`${fusionAuthUrl}/api/user/registration`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      body: JSON.stringify({
        user: { email, password, firstName, lastName },
        registration: { applicationId },
      }),
    });
  } catch {
    return { error: "Could not reach the authentication server. Please try again." };
  }

  if (!res.ok) {
    let message = "Registration failed. Please try again.";
    try {
      const body = await res.json() as { fieldErrors?: Record<string, { message: string }[]> };
      const fieldErrors = body.fieldErrors;
      if (fieldErrors) {
        const firstField = Object.values(fieldErrors)[0];
        if (firstField?.[0]?.message) message = firstField[0].message;
      }
    } catch { /* ignore parse errors */ }
    return { error: message };
  }

  const data = await res.json() as { user: FusionAuthUser };
  await upsertAndLogin(data.user);
  redirect("/recipes");
}
