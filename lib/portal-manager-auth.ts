import { NextResponse } from "next/server";
import { createSupabaseServerClient, hasSupabaseServerEnv } from "@/lib/supabase-server";

function getAccessTokenFromRequest(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.toLowerCase().startsWith("bearer ")) {
    return "";
  }
  return authorization.slice(7).trim();
}

type ManagerAccessResult =
  | {
      ok: true;
      accessToken: string;
    }
  | {
      ok: false;
      response: NextResponse;
    };

export async function assertManagerAccess(request: Request): Promise<ManagerAccessResult> {
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

  const roleClient = createSupabaseServerClient(accessToken);
  const { data: isManager, error: managerError } = await roleClient.rpc("is_bootstrap_manager");

  if (managerError) {
    return {
      ok: false,
      response: NextResponse.json({ error: managerError.message }, { status: 403 })
    };
  }

  if (!isManager) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Only the manager can access this endpoint." }, { status: 403 })
    };
  }

  return {
    ok: true,
    accessToken
  };
}
