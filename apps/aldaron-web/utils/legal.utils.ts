import type { LegalDocumentSection } from '@/containers/legal/LegalDocument';

type RawLegalSections = Record<string, { title: string; lines: Record<string, string> }>;

/**
 * The sections of a legal text as the translations hold them (numbered keys, which keep their order
 * whatever the language) turned into the list the page shows
 */
export const getLegalSections = (raw: unknown): LegalDocumentSection[] =>
  Object.values(raw as RawLegalSections).map(({ title, lines }) => ({
    title,
    lines: Object.values(lines),
  }));
