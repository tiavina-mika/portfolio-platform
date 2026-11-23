# Test cases — attach an acceptance proof file to a quote

Fake data only. "Live" cases need the server on a database **and** a Cloudinary account; the machine that
ran `/dev --auto` has neither locally (the server env files point at remote environments, not used), so
they were **not run** and are detailed in `tc-manual.md` for pre-production after the merge. They are
`auto` by nature (a browser could run them) and stay unverified until someone does.

| # | Acceptance criterion | Steps | Expected | Type | Status | Place | Test |
|---|---|---|---|---|---|---|---|
| 1 | Attach one PDF or image when accepting | Aldaron workspace; Quotes; a sent quote → Mark as accepted; method "Signed quote"; drop a PDF; confirm | Status Accepted; an "Acceptance proof" link under it | auto (live) | to do — not run, no local database nor Cloudinary | pre-production | — |
| 1b | Same, accepting without a file still works | Same, no file | Status Accepted, no link | auto (live) | to do — not run | pre-production | — |
| 1c | Same, the dialog refuses another type or a file too big | Drop a `.docx`, then a 6 MB PDF | Error under the drop zone, nothing sent | auto (live) | to do — not run | pre-production | — |
| 1d | Same, the server takes only a platform proof | `isQuoteAcceptanceProofFile`: PDF/JPG/PNG/WEBP of the account's proofs folder accepted; another host, account, `http`, folder, extension or a mismatching id refused | As described | auto | ok | local | `apps/server/src/utils/_domain/quote.utils.test.ts` |
| 2 | Open the proof from the list | Click "Acceptance proof" on the accepted quote | The file opens in a new tab | auto (live) | to do — not run | pre-production | — |
| 3 | No proof on a quote that is not being accepted | `changeQuoteStatusSchema` with a proof on `sent`, `refused`, `expired`; `canAttachQuoteAcceptanceProof` on every move and on an already accepted quote | Refused, except the move that accepts | auto | ok | local | `apps/server/src/validations/_domain/quote.validations.test.ts`, `quote.utils.test.ts` |
| 3b | Same, live through the trigger | Call `changeQuoteStatus` with `refused` and a proof (by hand) | Refused by the validation | auto (live) | to do — not run | pre-production | — |
| 3c | Same, the proof keeps its shape | `changeQuoteStatusSchema` with an `http` address, an extra key, no `publicId` | Refused | auto | ok | local | `quote.validations.test.ts` |
| 4 | Labels and errors in `fr`, `en`, `mg` | `pnpm check-i18n` | Passes | auto | ok | local | `scripts/check-i18n.mjs` |

Static proof run on 2026-11-23: `pnpm nx run-many -t lint typecheck -p server bo` ok (warnings only, all
pre-existing); `pnpm nx run server:test` ok (6 files, 78 tests); `pnpm nx run-many -t build -p server bo`
ok; `pnpm check-i18n`, `pnpm lint:docs`, `pnpm check-doc-links`, `pnpm check-doc-twins --worktree` ok.
