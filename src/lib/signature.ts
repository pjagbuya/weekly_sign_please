import { getSupabaseServerClient } from "@/lib/supabase";

export function dataUrlToPngBytes(dataUrl: string): Uint8Array {
  const match = dataUrl.match(/^data:image\/png;base64,(.+)$/);
  if (!match) {
    throw new Error("Expected PNG data URL.");
  }

  return Uint8Array.from(Buffer.from(match[1], "base64"));
}

export async function uploadSignatureImage(userId: string, dataUrl: string, bucket: string) {
  const supabase = getSupabaseServerClient();
  const path = `signatures/${userId}.png`;
  const png = dataUrlToPngBytes(dataUrl);

  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, png, {
    contentType: "image/png",
    upsert: true,
  });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  const { error: updateError } = await supabase
    .from("users")
    .update({ signature_image_url: data.publicUrl })
    .eq("id", userId);

  if (updateError) {
    throw updateError;
  }

  return data.publicUrl;
}
