import { NextResponse } from "next/server";
import { buildAuditTrail } from "@/lib/workflow";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase";
import { uploadSignatureImage } from "@/lib/signature";

type SignRequest = {
  documentId: string;
  supervisorId: string;
  signatureMode: "visual" | "audit";
  signatureDataUrl?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<SignRequest>;

  if (!body.documentId || !body.supervisorId || !body.signatureMode) {
    return NextResponse.json({ error: "Missing required signing fields." }, { status: 400 });
  }

  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const auditTrail = buildAuditTrail(body.supervisorId, ipAddress);
  const conversionProvider = process.env.PDF_CONVERTER_PROVIDER ?? "gotenberg";
  const conversionUrl = process.env.PDF_CONVERTER_URL ?? "";
  const signatureBucket = process.env.SUPABASE_SIGNATURE_BUCKET ?? "signature-images";
  const pdfPath = `signed-documents/${body.documentId}.pdf`;

  let signatureUrl: string | null = null;
  if (body.signatureMode === "visual" && body.signatureDataUrl) {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Visual signing requires Supabase env variables." },
        { status: 400 },
      );
    }

    signatureUrl = await uploadSignatureImage(body.supervisorId, body.signatureDataUrl, signatureBucket);
  }

  let dbWarning: string | null = null;
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase
      .from("documents")
      .update({
        status: "signed",
        s3_url: pdfPath,
      })
      .eq("id", body.documentId);

    if (error) {
      dbWarning = error.message;
    }
  } else {
    dbWarning = "Supabase environment variables are not configured yet.";
  }

  return NextResponse.json({
    status: "signed",
    signatureMode: body.signatureMode,
    signatureUrl,
    pdf: {
      converter: conversionProvider,
      converterUrl: conversionUrl || "(set PDF_CONVERTER_URL)",
      outputPath: pdfPath,
      note: "Integrate unoconv/gotenberg invocation here for high-fidelity conversion.",
    },
    auditTrail,
    dbWarning,
  });
}
