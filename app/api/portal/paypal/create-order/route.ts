import { NextResponse } from "next/server";
import { assertPortalUserAccess } from "@/lib/portal-user-auth";
import { createPayPalOrder, hasPayPalServerEnv } from "@/lib/paypal";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

type CreateOrderRequestBody = {
  projectId?: string;
  amount?: number | string;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function normalizeAmount(value: unknown): number | null {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value <= 0) {
      return null;
    }
    return Number(value.toFixed(2));
  }

  if (typeof value === "string") {
    const normalized = value.replace(/[$,\s]/g, "").trim();
    if (!normalized) {
      return null;
    }
    const parsed = Number.parseFloat(normalized);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return null;
    }
    return Number(parsed.toFixed(2));
  }

  return null;
}

export async function POST(request: Request) {
  const access = await assertPortalUserAccess(request);
  if (!access.ok) {
    return access.response;
  }

  if (!hasPayPalServerEnv()) {
    return NextResponse.json(
      { error: "PayPal environment variables are missing." },
      { status: 500 }
    );
  }

  try {
    const body = (await request.json()) as CreateOrderRequestBody;
    const projectId = typeof body.projectId === "string" ? body.projectId.trim() : "";
    const amount = normalizeAmount(body.amount);

    if (!projectId || !isUuid(projectId)) {
      return NextResponse.json({ error: "Invalid project id." }, { status: 400 });
    }

    if (amount === null) {
      return NextResponse.json({ error: "A valid payment amount is required." }, { status: 400 });
    }

    const supabase = createSupabaseServerClient(access.accessToken);

    const { data: paymentFeatureFlags, error: paymentFeatureFlagsError } = await supabase.rpc(
      "get_payment_feature_flags"
    );
    if (paymentFeatureFlagsError) {
      return NextResponse.json({ error: paymentFeatureFlagsError.message }, { status: 500 });
    }

    const flagsRow = Array.isArray(paymentFeatureFlags) ? paymentFeatureFlags[0] : null;
    const manualPaymentsEnabled = flagsRow?.manual_payments_enabled !== false;
    if (!manualPaymentsEnabled) {
      return NextResponse.json(
        { error: "Manual payments are currently disabled by your manager." },
        { status: 403 }
      );
    }

    const { data: isProjectMember, error: membershipError } = await supabase.rpc("is_project_member", {
      project_uuid: projectId
    });

    if (membershipError) {
      return NextResponse.json({ error: membershipError.message }, { status: 403 });
    }

    if (!isProjectMember) {
      return NextResponse.json({ error: "You do not have access to this project." }, { status: 403 });
    }

    const { data: projectRow, error: projectError } = await supabase
      .from("projects")
      .select("id,name,status,quoted_amount,amount_paid")
      .eq("id", projectId)
      .maybeSingle();

    if (projectError) {
      return NextResponse.json({ error: projectError.message }, { status: 400 });
    }

    if (!projectRow) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    const quotedAmount =
      typeof projectRow.quoted_amount === "number" && Number.isFinite(projectRow.quoted_amount)
        ? projectRow.quoted_amount
        : null;
    const amountPaid =
      typeof projectRow.amount_paid === "number" && Number.isFinite(projectRow.amount_paid)
        ? projectRow.amount_paid
        : 0;
    const balance = quotedAmount !== null ? Math.max(0, Number((quotedAmount - amountPaid).toFixed(2))) : null;

    if (balance !== null && balance <= 0) {
      return NextResponse.json({ error: "This project has no balance due." }, { status: 400 });
    }

    if (balance !== null && amount > balance + 0.009) {
      return NextResponse.json({ error: "Payment amount exceeds project balance." }, { status: 400 });
    }

    const requestUrl = new URL(request.url);
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").trim();
    const origin = siteUrl || requestUrl.origin;
    const returnUrl = `${origin}/portal?project=${projectId}&paypal=success`;
    const cancelUrl = `${origin}/portal?project=${projectId}&paypal=cancel`;

    const order = await createPayPalOrder({
      amountValue: amount.toFixed(2),
      currencyCode: "USD",
      description: `Project payment: ${projectRow.name || "Portal Project"}`,
      customId: projectId,
      returnUrl,
      cancelUrl
    });

    const { error: insertError } = await supabase.from("project_payments").insert({
      project_id: projectId,
      provider: "paypal",
      provider_order_id: order.orderId,
      status: "created",
      amount,
      currency_code: "USD",
      payer_user_id: access.user.id,
      payer_email: access.user.email || null,
      provider_payload: order.raw
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      orderId: order.orderId,
      approveUrl: order.approveUrl
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to start PayPal checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
