"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/session";

export async function forgotPasswordAction(
  _prevState: { error: string } | { success: true } | null,
  formData: FormData
): Promise<{ error: string } | { success: true }> {
  const email = (formData.get("email") as string)?.trim();

  if (!email) return { error: "Email is required." };

  const fusionAuthUrl = process.env.FUSIONAUTH_URL!;
  const apiKey = process.env.FUSIONAUTH_API_KEY!;
  const applicationId = process.env.FUSIONAUTH_CLIENT_ID!;
  const resendApiKey = process.env.RESEND_API_KEY!;
  const fromEmail = process.env.RESEND_FROM_EMAIL!;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  // Ask FusionAuth to generate a reset token without sending its own email
  let res: Response;
  try {
    res = await fetch(`${fusionAuthUrl}/api/user/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: apiKey },
      body: JSON.stringify({ loginId: email, applicationId, sendForgotPasswordEmail: false }),
    });
  } catch {
    return { error: "Could not reach the authentication server. Please try again." };
  }

  // Always show success to prevent user enumeration — only hard-fail on server errors
  if (res.status === 404 || res.status === 422) return { success: true };
  if (!res.ok) return { error: "Something went wrong. Please try again." };

  const { changePasswordId } = await res.json() as { changePasswordId: string };
  const resetUrl = `${appUrl}/reset-password?token=${changePasswordId}`;

  // Send the email via Resend HTTP API
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: `Flourish <${fromEmail}>`,
        to: [email],
        subject: "Reset your Flourish password",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
            <h1 style="font-size:24px;font-weight:700;margin:0 0 8px">Reset your password</h1>
            <p style="color:#666;margin:0 0 24px">
              We received a request to reset the password for your Flourish account.
              Click the button below to create a new password.
            </p>
            <a href="${resetUrl}"
               style="display:inline-block;background:#b45309;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:15px">
              Reset password
            </a>
            <p style="color:#999;font-size:13px;margin:24px 0 0">
              This link expires in 24 hours. If you didn't request a password reset, you can safely ignore this email.
            </p>
            <p style="color:#bbb;font-size:12px;margin:8px 0 0;word-break:break-all">
              Or copy this link: ${resetUrl}
            </p>
          </div>
        `,
      }),
    });
  } catch {
    // Don't surface Resend errors to the user — the token was created successfully
  }

  return { success: true };
}

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
  const passwordConfirm = formData.get("passwordConfirm") as string;
  const firstName = (formData.get("firstName") as string)?.trim() || undefined;
  const lastName = (formData.get("lastName") as string)?.trim() || undefined;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (password !== passwordConfirm) {
    return { error: "Passwords do not match." };
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

export async function resetPasswordAction(
  _prevState: { error: string } | { success: true } | null,
  formData: FormData
): Promise<{ error: string } | { success: true }> {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const passwordConfirm = formData.get("passwordConfirm") as string;

  if (!token) return { error: "Invalid or expired reset link." };
  if (!password || !passwordConfirm) return { error: "Both password fields are required." };
  if (password !== passwordConfirm) return { error: "Passwords do not match." };

  const fusionAuthUrl = process.env.FUSIONAUTH_URL!;
  const apiKey = process.env.FUSIONAUTH_API_KEY!;

  let res: Response;
  try {
    res = await fetch(`${fusionAuthUrl}/api/user/change-password/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: apiKey },
      body: JSON.stringify({ password, passwordConfirm }),
    });
  } catch {
    return { error: "Could not reach the authentication server. Please try again." };
  }

  if (res.status === 404) return { error: "This reset link has expired. Please request a new one." };

  if (!res.ok) {
    let message = "Password could not be updated. Please try again.";
    try {
      const body = await res.json() as { fieldErrors?: Record<string, { message: string }[]> };
      const firstField = body.fieldErrors ? Object.values(body.fieldErrors)[0] : null;
      if (firstField?.[0]?.message) message = firstField[0].message;
    } catch { /* ignore */ }
    return { error: message };
  }

  return { success: true };
}
