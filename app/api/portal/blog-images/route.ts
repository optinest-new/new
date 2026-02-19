import { NextResponse } from "next/server";
import { assertManagerAccess } from "@/lib/portal-manager-auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const BLOG_IMAGES_BUCKET = "blog-images";

function sanitizeBaseName(name: string) {
  const withoutExt = name.replace(/\.[^.]+$/, "");
  return withoutExt
    .toLowerCase()
    .trim()
    .replace(/['"`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function extensionFromFile(file: File) {
  const originalExt = file.name.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
  if (originalExt && ["jpg", "jpeg", "png", "webp", "gif", "svg", "avif"].includes(originalExt)) {
    return originalExt === "jpeg" ? "jpg" : originalExt;
  }

  if (file.type === "image/png") {
    return "png";
  }
  if (file.type === "image/webp") {
    return "webp";
  }
  if (file.type === "image/gif") {
    return "gif";
  }
  if (file.type === "image/svg+xml") {
    return "svg";
  }
  if (file.type === "image/avif") {
    return "avif";
  }

  return "jpg";
}

export async function POST(request: Request) {
  const access = await assertManagerAccess(request);
  if (!access.ok) {
    return access.response;
  }

  try {
    const formData = await request.formData();
    const fileEntry = formData.get("file");
    if (!(fileEntry instanceof File)) {
      return NextResponse.json({ error: "Image file is required." }, { status: 400 });
    }

    const file = fileEntry;
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image uploads are allowed." }, { status: 400 });
    }
    if (file.size <= 0) {
      return NextResponse.json({ error: "Uploaded image is empty." }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Image must be 8MB or smaller." }, { status: 400 });
    }

    const baseName = sanitizeBaseName(file.name) || "blog-featured-image";
    const extension = extensionFromFile(file);
    const objectPath = `${new Date().getUTCFullYear()}/${baseName}-${Date.now()}.${extension}`;

    const supabase = createSupabaseServerClient(access.accessToken);
    const arrayBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from(BLOG_IMAGES_BUCKET)
      .upload(objectPath, arrayBuffer, {
        contentType: file.type || `image/${extension}`,
        upsert: false
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 400 });
    }

    const { data: publicData } = supabase.storage.from(BLOG_IMAGES_BUCKET).getPublicUrl(objectPath);
    const publicUrl = publicData.publicUrl;

    return NextResponse.json({
      path: publicUrl || objectPath,
      objectPath
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload image.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
