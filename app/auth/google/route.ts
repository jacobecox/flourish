import { NextResponse } from "next/server";

export async function GET() {
  const fusionAuthUrl = process.env.FUSIONAUTH_URL!;
  const clientId = process.env.FUSIONAUTH_CLIENT_ID!;
  const googleIdpId = process.env.FUSIONAUTH_GOOGLE_IDP_ID!;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const url = new URL(`${fusionAuthUrl}/oauth2/authorize`);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", `${appUrl}/auth/callback`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("idp_hint", googleIdpId);

  return NextResponse.redirect(url.toString());
}
