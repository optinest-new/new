import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient, hasSupabaseServerEnv } from "@/lib/supabase-server";

function getAccessTokenFromRequest(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.toLowerCase().startsWith("bearer ")) {
    return "";
  }
  return authorization.slice(7).trim();
}

type PortalUserAccessResult =
  | {
      ok: true;
      accessToken: string;
      user: User;
    }
  | {
      ok: false;
      response: NextResponse;
    };

export async function assertPortalUserAccess(request: Request): Promise<PortalUserAccessResult> {
  if (!hasSupabaseServerEnv()) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Supabase environment variables are missing." },
        { status: 500 }
      )
    };
  }

  const accessToken = getAccessTokenFromRequest(request);
  if (!accessToken) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Missing authorization token." }, { status: 401 })
    };
  }

  const authClient = createSupabaseServerClient();
  const { data: userResult, error: userError } = await authClient.auth.getUser(accessToken);
  if (userError || !userResult.user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized request." }, { status: 401 })
    };
  }

  return {
    ok: true,
    accessToken,
    user: userResult.user
  };
}
