type ODataFunctionParams = Record<string, number | boolean | string | undefined | null>;

function formatODataParam(
  key: string,
  value: boolean | number | string | undefined | null,
) {
  if (typeof value === "boolean") {
    return `${key}=${value}`;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? `${key}=${value}` : null;
  }

  const nextValue = value?.trim();

  if (!nextValue) return null;

  return `${key}='${encodeURIComponent(nextValue.replace(/'/g, "''"))}'`;
}

export function buildApiFunctionUrl(
  path: string,
  params?: ODataFunctionParams,
) {
  const functionParams = Object.entries(params ?? {})
    .map(([key, value]) => formatODataParam(key, value))
    .filter(Boolean);

  return `${path}(${functionParams.join(",")})`;
}
