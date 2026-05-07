export type TemplateType = "timesheet" | "weekly_progress";

export type SignatureMode = "visual" | "audit";

export const TIMESHEET_BANDS = [
  { label: "1-4", start: 1, end: 4 },
  { label: "5-8", start: 5, end: 8 },
  { label: "9-12", start: 9, end: 12 },
] as const;

const ORDINALS = [
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
  "9th",
  "10th",
  "11th",
  "12th",
] as const;

export function getTemplateStoragePath(templateType: TemplateType, weekNo: number) {
  if (weekNo < 1 || weekNo > 12) {
    throw new Error("weekNo must be between 1 and 12");
  }

  if (templateType === "timesheet") {
    const band = TIMESHEET_BANDS.find(({ start, end }) => weekNo >= start && weekNo <= end);

    if (!band) {
      throw new Error(`No timesheet template band found for week ${weekNo}`);
    }

    return `templates/time-sheet-${band.label}.docx`;
  }

  return `templates/weekly-progress-${ORDINALS[weekNo - 1]}.docx`;
}

export function mapFormInputToPlaceholders(formInput: Record<string, string>) {
  return Object.entries(formInput).reduce<Record<string, string>>((acc, [key, value]) => {
    acc[`{${key}}`] = value;
    return acc;
  }, {});
}

export function buildPreviewHtml(placeholders: Record<string, string>) {
  const items = Object.entries(placeholders)
    .map(([key, value]) => `<li><strong>${escapeHtml(key)}</strong>: ${escapeHtml(value)}</li>`)
    .join("");

  return `<section><h3>Document Preview</h3><ul>${items}</ul></section>`;
}

export function buildAuditTrail(supervisorId: string, ipAddress: string | null) {
  return {
    supervisorId,
    signedAt: new Date().toISOString(),
    ipAddress: ipAddress ?? "unavailable",
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
