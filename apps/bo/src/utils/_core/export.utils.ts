import { ExportFormat, IExportColumn } from '@/types/_core/app.type';
import { triggerDownload } from '@/utils/_core/download.utils';

const toExportRows = <T>(
  items: T[],
  columns: IExportColumn<T>[]
): Record<string, string | number>[] =>
  items.map((item: T) => {
    const row: Record<string, string | number> = {};

    columns.forEach(({ header, getValue }) => {
      row[header] = getValue(item) ?? '';
    });

    return row;
  });

/**
 * flattens raw domain items into rows (using `columns`) then triggers a browser download,
 * either as a CSV file or a real .xlsx workbook (SheetJS)
 * SheetJS is loaded on demand: it weighs several hundred kB and is only needed when an admin
 * actually clicks an export button, so it must never sit in the entry chunk
 * @param items raw domain items (ex: IRide[]) — not the JSX-transformed table rows used on screen
 * @param fileNamePrefix ex: 'rides' -> 'rides-2026-07-23.csv'
 */
export const exportRows = async <T>(
  items: T[],
  columns: IExportColumn<T>[],
  fileNamePrefix: string,
  format: ExportFormat
): Promise<void> => {
  const XLSX = await import('xlsx');
  const rows = toExportRows(items, columns);
  const worksheet = XLSX.utils.json_to_sheet(rows, { header: columns.map(({ header }) => header) });
  const date = new Date().toISOString().slice(0, 10);
  const fileName = `${fileNamePrefix}-${date}.${format}`;

  if (format === 'csv') {
    const csv = XLSX.utils.sheet_to_csv(worksheet);

    // BOM prefix so Excel opens UTF-8 accented characters (é, à...) correctly
    triggerDownload(new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8;' }), fileName);
    return;
  }

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, fileNamePrefix);
  XLSX.writeFile(workbook, fileName);
};
