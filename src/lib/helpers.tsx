export function offsetFromUrl(url: string) {
  const parts = url.split("/").filter(Boolean);
  return parts[parts.length - 1];
}

export function sanitizePageParam(param: string | undefined): number | null {
  const page = parseInt(param || "1", 10);

  const max_safe_page = 1_000_000;

  if (
    isNaN(page) ||
    page < 1 ||
    !Number.isFinite(page) ||
    page > max_safe_page
  ) {
    return null;
  }

  return page;
}
