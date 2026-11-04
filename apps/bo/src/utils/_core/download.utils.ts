/*
 * kept apart from export.utils so modules that only need a browser download (file.utils, CMS JSON
 * download, JSON template) never pull the SheetJS library into the entry chunk
 */

export const triggerDownload = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
};

/**
 * downloads a single raw domain item (ex: an IPage, an IArticle) as a formatted JSON file,
 * omitting fields that should not leave the admin UI (ex: 'user')
 * @param item raw domain item
 * @param fieldsToIgnore keys omitted from the downloaded JSON
 * @param fileNamePrefix ex: 'page' -> 'page-2026-07-23.json'
 */
export const downloadObjectAsJson = <T extends Record<string, any>>(
  item: T,
  fieldsToIgnore: string[],
  fileNamePrefix: string
): void => {
  const data = Object.fromEntries(
    Object.entries(item).filter(([key]) => !fieldsToIgnore.includes(key))
  );
  const date = new Date().toISOString().slice(0, 10);

  triggerDownload(
    new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
    `${fileNamePrefix}-${date}.json`
  );
};
