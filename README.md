# weekly_sign_please

Next.js internal workflow for intern document data entry, supervisor one-click signing, and PDF finalization.

## Roles

- **Admin**: Manage intern/supervisor accounts.
- **Intern**: Fill timesheet/weekly report form data.
- **Supervisor**: Preview merged placeholders and sign in one click.

## Database / Storage Model

### users
- `id`
- `name`
- `email`
- `role` (`admin | intern | supervisor`)
- `signature_image_url`

### documents
- `id`
- `intern_id`
- `supervisor_id`
- `template_type`
- `week_no`
- `status`
- `s3_url`

### Suggested additional columns
- `documents.signed_at`
- `documents.signed_ip`
- `documents.signed_by`
- `documents.audit_trail_json`
- `documents.preview_payload_json`
- `documents.pdf_url` (if you want separate fields for template and final PDF)

## Template Naming Logic

Templates are read from Supabase Storage and mapped by week:

- **Timesheet**: filenames containing `1-4`, `5-8`, or `9-12`
- **Weekly progress**: `1st` through `12th`

Implemented mapping:

- `timesheet + week 1..4 -> templates/time-sheet-1-4.docx`
- `timesheet + week 5..8 -> templates/time-sheet-5-8.docx`
- `timesheet + week 9..12 -> templates/time-sheet-9-12.docx`
- `weekly_progress + week N -> templates/weekly-progress-{ordinal}.docx`

## Environment Variables

Create `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL` (Supabase project URL)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase anon key)
- `SUPABASE_SIGNATURE_BUCKET` (default: `signature-images`)
- `PDF_CONVERTER_PROVIDER` (example: `gotenberg` or `unoconv`)
- `PDF_CONVERTER_URL` (service URL for converter)

These are consumed in:

- `src/lib/supabase.ts`
- `src/app/api/signature/route.ts`
- `src/app/api/documents/sign/route.ts`

## Signature Creation

Supervisors can draw an e-signature in the web UI. The signature pad tracks pointer movement and supports:

- **Undo/Clear**
- **Save Signature** (uploads to Supabase Storage and updates `users.signature_image_url`)

## Run

```bash
npm install
npm run dev
```

## Test

```bash
npm run test
```
