// OAuth 2.0 authorization code callback for Google login via FusionAuth.
// Flow: FusionAuth redirects here with ?code → exchange for access token → fetch user info
// → upsert user in Prisma → set session cookie → redirect to app.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  // FusionAuth sends ?error=... if the user denied or something went wrong
  if (searchParams.get("error")) {
    return NextResponse.redirect(new URL("/login?error=oauth_denied", appUrl));
  }

  const code = searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", appUrl));
  }

  const fusionAuthUrl = process.env.FUSIONAUTH_URL!;
  const clientId = process.env.FUSIONAUTH_CLIENT_ID!;
  const clientSecret = process.env.FUSIONAUTH_CLIENT_SECRET!;

  // Exchange the auth code for tokens
  let tokenRes: Response;
  try {
    tokenRes = await fetch(`${fusionAuthUrl}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: `${appUrl}/auth/callback`,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });
  } catch {
    return NextResponse.redirect(new URL("/login?error=auth_server_unreachable", appUrl));
  }

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL("/login?error=token_exchange_failed", appUrl));
  }

  const { access_token } = await tokenRes.json() as { access_token: string };

  // Fetch user info using the access token
  let userRes: Response;
  try {
    userRes = await fetch(`${fusionAuthUrl}/oauth2/userinfo`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
  } catch {
    return NextResponse.redirect(new URL("/login?error=userinfo_failed", appUrl));
  }

  if (!userRes.ok) {
    return NextResponse.redirect(new URL("/login?error=userinfo_failed", appUrl));
  }

  const userInfo = await userRes.json() as {
    sub: string;
    email: string;
    name?: string;
    given_name?: string;
    family_name?: string;
  };

  const derivedName =
    userInfo.name ||
    [userInfo.given_name, userInfo.family_name].filter(Boolean).join(" ") ||
    null;

  await prisma.user.upsert({
    where: { id: userInfo.sub },
    create: { id: userInfo.sub, email: userInfo.email, name: derivedName },
    update: { email: userInfo.email, ...(derivedName ? { name: derivedName } : {}) },
  });

  await setSession({ userId: userInfo.sub, email: userInfo.email });

  return NextResponse.redirect(new URL("/", appUrl));
}
