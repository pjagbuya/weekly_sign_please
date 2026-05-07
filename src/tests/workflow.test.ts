import { describe, expect, it } from "vitest";
import { buildAuditTrail, getTemplateStoragePath, mapFormInputToPlaceholders } from "../lib/workflow";

describe("template mapping", () => {
  it("maps timesheet weeks to 1-4, 5-8, 9-12 templates", () => {
    expect(getTemplateStoragePath("timesheet", 2)).toBe("templates/time-sheet-1-4.docx");
    expect(getTemplateStoragePath("timesheet", 6)).toBe("templates/time-sheet-5-8.docx");
    expect(getTemplateStoragePath("timesheet", 11)).toBe("templates/time-sheet-9-12.docx");
  });

  it("maps weekly progress week to ordinal template names", () => {
    expect(getTemplateStoragePath("weekly_progress", 1)).toBe("templates/weekly-progress-1st.docx");
    expect(getTemplateStoragePath("weekly_progress", 12)).toBe("templates/weekly-progress-12th.docx");
  });
});

describe("placeholder and audit helpers", () => {
  it("maps plain form keys to placeholder keys", () => {
    expect(
      mapFormInputToPlaceholders({ intern_name: "Ada", week_summary: "Done" }),
    ).toEqual({
      "{intern_name}": "Ada",
      "{week_summary}": "Done",
    });
  });

  it("builds audit trail with supervisor id and IP fallback", () => {
    const auditTrail = buildAuditTrail("sup-1", null);
    expect(auditTrail.supervisorId).toBe("sup-1");
    expect(auditTrail.ipAddress).toBe("unavailable");
    expect(auditTrail.signedAt).toMatch(/T/);
  });
});
