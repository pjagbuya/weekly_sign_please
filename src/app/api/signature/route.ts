import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { uploadSignatureImage } from "@/lib/signature";

type SignatureRequest = {
  userId: string;
  dataUrl: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<SignatureRequest>;

  if (!body.userId || !body.dataUrl) {
    return NextResponse.json({ error: "userId and dataUrl are required." }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY." },
      { status: 400 },
    );
  }

  const bucket = process.env.SUPABASE_SIGNATURE_BUCKET ?? "signature-images";
  const publicUrl = await uploadSignatureImage(body.userId, body.dataUrl, bucket);

  return NextResponse.json({ publicUrl });
}
