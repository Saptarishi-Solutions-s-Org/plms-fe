type ODataFunctionParams = Record<string, number | string | undefined | null>;

function formatODataParam(key: string, value: number | string | undefined | null) {
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
