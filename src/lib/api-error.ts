const MAX_BODY = 8 * 1024 * 1024;

export function tooLarge(request: Request) {
  const length = Number(request.headers.get("content-length") || "0");
  if (Number.isFinite(length) && length > MAX_BODY) {
    return Response.json(
      { error: "That photo is too big. Use one under 5 MB." },
      { status: 413, headers: { "content-type": "application/json; charset=utf-8" } },
    );
  }
  return null;
}

export function jsonError(error: unknown, fallback = "Something went wrong, please try again or WhatsApp us.") {
  const message = error instanceof Error ? error.message : fallback;
  const tooBig = /exceeded|too large|payload|body size|413/i.test(message);
  return Response.json(
    { error: tooBig ? "That photo is too big. Use one under 5 MB." : message || fallback },
    { status: tooBig ? 413 : 400, headers: { "content-type": "application/json; charset=utf-8" } },
  );
}
