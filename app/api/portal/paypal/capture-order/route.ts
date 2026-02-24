import { NextResponse } from "next/server";
import { capturePayPalOrder, hasPayPalServerEnv } from "@/lib/paypal";
import { assertPortalUserAccess } from "@/lib/portal-user-auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

type CaptureOrderRequestBody = {
  projectId?: string;
  orderId?: string;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function extractCaptureDetails(payload: Record<string, unknown>) {
  const payer = payload.payer as { email_address?: string } | undefined;
  const purchaseUnits = Array.isArray(payload.purchase_units)
    ? (payload.purchase_units as Array<Record<string, unknown>>)
    : [];
  const firstUnit = purchaseUnits[0] || null;
  const payments = firstUnit?.payments as { captures?: Array<Record<string, unknown>> } | undefined;
  const capture = Array.isArray(payments?.captures) ? payments?.captures[0] : null;

  const captureId = typeof capture?.id === "string" ? capture.id.trim() : "";
  const captureStatus = typeof capture?.status === "string" ? capture.status.trim().toUpperCase() : "";
  const amountInfo = capture?.amount as { value?: string; currency_code?: string } | undefined;
  const amountValue = typeof amountInfo?.value === "string" ? Number.parseFloat(amountInfo.value) : Number.NaN;
  const currencyCode = typeof amountInfo?.currency_code === "string" ? amountInfo.currency_code.trim() : "USD";

  if (!captureId || captureStatus !== "COMPLETED" || Number.isNaN(amountValue) || amountValue <= 0) {
    return null;
  }

  return {
    captureId,
    amount: Number(amountValue.toFixed(2)),
    currencyCode: currencyCode || "USD",
    payerEmail: typeof payer?.email_address === "string" ? payer.email_address.trim().toLowerCase() : null
  };
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
    const body = (await request.json()) as CaptureOrderRequestBody;
    const projectId = typeof body.projectId === "string" ? body.projectId.trim() : "";
    const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";

    if (!projectId || !isUuid(projectId)) {
      return NextResponse.json({ error: "Invalid project id." }, { status: 400 });
    }

    if (!orderId) {
      return NextResponse.json({ error: "Missing PayPal order id." }, { status: 400 });
    }

    const supabase = createSupabaseServerClient(access.accessToken);

    const { data: isProjectMember, error: membershipError } = await supabase.rpc("is_project_member", {
      project_uuid: projectId
    });

    if (membershipError) {
      return NextResponse.json({ error: membershipError.message }, { status: 403 });
    }

    if (!isProjectMember) {
      return NextResponse.json({ error: "You do not have access to this project." }, { status: 403 });
    }

    const { data: paymentRow, error: paymentFetchError } = await supabase
      .from("project_payments")
      .select("id,status")
      .eq("project_id", projectId)
      .eq("provider", "paypal")
      .eq("provider_order_id", orderId)
      .maybeSingle();

    if (paymentFetchError) {
      return NextResponse.json({ error: paymentFetchError.message }, { status: 400 });
    }

    if (!paymentRow) {
      return NextResponse.json({ error: "Payment order was not found." }, { status: 404 });
    }

    if (paymentRow.status === "captured") {
      return NextResponse.json({ ok: true, alreadyCaptured: true });
    }

    const capturePayload = await capturePayPalOrder(orderId);
    const capture = extractCaptureDetails(capturePayload);

    if (!capture) {
      return NextResponse.json(
        { error: "PayPal capture did not return a completed payment." },
        { status: 400 }
      );
    }

    const { error: recordError } = await supabase.rpc("record_project_paypal_capture", {
      project_uuid: projectId,
      provider_order: orderId,
      provider_capture: capture.captureId,
      captured_amount: capture.amount,
      currency: capture.currencyCode,
      provider_payload_json: capturePayload,
      payer_email_text: capture.payerEmail
    });

    if (recordError) {
      return NextResponse.json({ error: recordError.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      captureId: capture.captureId
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to capture PayPal payment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
