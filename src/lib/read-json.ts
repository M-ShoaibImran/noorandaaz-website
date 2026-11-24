export const FRIENDLY_ERROR = "Something went wrong, please try again or WhatsApp us.";

export async function readJson<T extends { error?: string }>(response: Response): Promise<{ ok: boolean; status: number; data: T }> {
  const type = (response.headers.get("content-type") || "").toLowerCase();
  if (!type.includes("application/json")) {
    return { ok: false, status: response.status, data: { error: FRIENDLY_ERROR } as T };
  }
  try {
    const data = (await response.json()) as T;
    if (!response.ok) return { ok: false, status: response.status, data: { ...data, error: data?.error || FRIENDLY_ERROR } };
    return { ok: true, status: response.status, data };
  } catch {
    return { ok: false, status: response.status, data: { error: FRIENDLY_ERROR } as T };
  }
}
