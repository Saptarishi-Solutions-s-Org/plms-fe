const escapeCsvValue = (value: unknown): string => {
  const text = String(value ?? "").replace(/"/g, '""');
  return /[",\n]/.test(text) ? `"${text}"` : text;
};

export const buildCsvContent = (
  headers: string[],
  rows: (string | number)[][],
): string =>
  [headers, ...rows].map((row) => row.map(escapeCsvValue).join(",")).join("\n");

export const getExportFilename = (prefix: string): string => {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

  return `${prefix}_${stamp}.csv`;
};

export interface DownloadCsvOptions {
  onEmpty?: () => void;
}

export const downloadCsv = (
  filenamePrefix: string,
  headers: string[],
  rows: (string | number)[][],
  options: DownloadCsvOptions = {},
): void => {
  if (!rows.length) {
    options.onEmpty?.();
    return;
  }

  const blob = new Blob([buildCsvContent(headers, rows)], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = getExportFilename(filenamePrefix);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
