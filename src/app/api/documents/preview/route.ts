import { NextResponse } from "next/server";
import { buildPreviewHtml, getTemplateStoragePath, mapFormInputToPlaceholders, type TemplateType } from "@/lib/workflow";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase";

type PreviewRequest = {
  internId: string;
  supervisorId: string;
  templateType: TemplateType;
  weekNo: number;
  formInput: Record<string, string>;
};

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<PreviewRequest>;

  if (!body.internId || !body.supervisorId || !body.templateType || !body.weekNo || !body.formInput) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const templatePath = getTemplateStoragePath(body.templateType, body.weekNo);
  const placeholders = mapFormInputToPlaceholders(body.formInput);
  const previewHtml = buildPreviewHtml(placeholders);

  let dbWarning: string | null = null;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from("documents").insert({
      intern_id: body.internId,
      supervisor_id: body.supervisorId,
      template_type: body.templateType,
      week_no: body.weekNo,
      status: "preview_ready",
      s3_url: templatePath,
    });

    if (error) {
      dbWarning = error.message;
    }
  } else {
    dbWarning = "Supabase environment variables are not configured yet.";
  }

  return NextResponse.json({
    templatePath,
    placeholders,
    previewHtml,
    dbWarning,
  });
}
