"use client";

import { FormEvent, useState } from "react";
import { SignaturePad } from "@/components/signature-pad";

const DEFAULT_INTERN_FIELDS = {
  intern_name: "",
  week_summary: "",
  total_hours: "",
};

export default function Home() {
  const [internId, setInternId] = useState("intern-001");
  const [supervisorId, setSupervisorId] = useState("supervisor-001");
  const [weekNo, setWeekNo] = useState(1);
  const [templateType, setTemplateType] = useState<"timesheet" | "weekly_progress">("timesheet");
  const [fields, setFields] = useState(DEFAULT_INTERN_FIELDS);
  const [previewPayload, setPreviewPayload] = useState<string>("");
  const [signPayload, setSignPayload] = useState<string>("");
  const [signatureMode, setSignatureMode] = useState<"visual" | "audit">("visual");

  async function handlePreview(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/documents/preview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        internId,
        supervisorId,
        templateType,
        weekNo,
        formInput: fields,
      }),
    });

    const payload = await response.json();
    setPreviewPayload(JSON.stringify(payload, null, 2));
  }

  async function handleSign(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/documents/sign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        documentId: `${internId}-${weekNo}`,
        supervisorId,
        signatureMode,
      }),
    });

    const payload = await response.json();
    setSignPayload(JSON.stringify(payload, null, 2));
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 text-slate-900 sm:px-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold">Weekly Sign Please</h1>
        <p className="text-sm text-slate-700">
          Role workflow: Admin manages users, Intern fills templates, Supervisor previews and signs.
        </p>
      </section>

      <section className="grid gap-6 rounded border border-slate-200 p-4 md:grid-cols-2">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Admin</h2>
          <p className="text-sm text-slate-700">
            Manage Intern/Supervisor accounts in the <code>users</code> table (name, email, role, signature_image_url).
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Supervisor Signature Creator</h2>
          <SignaturePad userId={supervisorId} />
        </div>
      </section>

      <section className="rounded border border-slate-200 p-4">
        <h2 className="mb-4 text-lg font-semibold">Intern Data Entry</h2>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handlePreview}>
          <label className="grid gap-1 text-sm">
            Intern ID
            <input
              value={internId}
              onChange={(event) => setInternId(event.target.value)}
              className="rounded border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Supervisor ID
            <input
              value={supervisorId}
              onChange={(event) => setSupervisorId(event.target.value)}
              className="rounded border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Template Type
            <select
              value={templateType}
              onChange={(event) => setTemplateType(event.target.value as "timesheet" | "weekly_progress")}
              className="rounded border border-slate-300 px-3 py-2"
            >
              <option value="timesheet">Timesheet</option>
              <option value="weekly_progress">Weekly Progress</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            Week Number
            <input
              type="number"
              min={1}
              max={12}
              value={weekNo}
              onChange={(event) => setWeekNo(Number(event.target.value))}
              className="rounded border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm md:col-span-2">
            Weekly Summary
            <textarea
              value={fields.week_summary}
              onChange={(event) => setFields((current) => ({ ...current, week_summary: event.target.value }))}
              className="min-h-24 rounded border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Intern Name
            <input
              value={fields.intern_name}
              onChange={(event) => setFields((current) => ({ ...current, intern_name: event.target.value }))}
              className="rounded border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Total Hours
            <input
              value={fields.total_hours}
              onChange={(event) => setFields((current) => ({ ...current, total_hours: event.target.value }))}
              className="rounded border border-slate-300 px-3 py-2"
            />
          </label>
          <button type="submit" className="rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white md:col-span-2">
            Generate Preview
          </button>
        </form>
        {previewPayload ? <pre className="mt-4 overflow-auto rounded bg-slate-900 p-3 text-xs text-slate-100">{previewPayload}</pre> : null}
      </section>

      <section className="rounded border border-slate-200 p-4">
        <h2 className="mb-4 text-lg font-semibold">Supervisor One-Click Signing</h2>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSign}>
          <label className="grid gap-1 text-sm">
            Signature Mode
            <select
              value={signatureMode}
              onChange={(event) => setSignatureMode(event.target.value as "visual" | "audit")}
              className="rounded border border-slate-300 px-3 py-2"
            >
              <option value="visual">Visual Stamp</option>
              <option value="audit">Digital Audit Trail</option>
            </select>
          </label>
          <button type="submit" className="rounded bg-emerald-700 px-4 py-2 text-sm font-medium text-white">
            One-Click Sign & Convert to PDF
          </button>
        </form>
        {signPayload ? <pre className="mt-4 overflow-auto rounded bg-slate-900 p-3 text-xs text-slate-100">{signPayload}</pre> : null}
      </section>
    </main>
  );
}
