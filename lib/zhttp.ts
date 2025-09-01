// /lib/zhttp.ts
import 'server-only';
import { z, ZodError } from "zod";

export type JsonResponseInit = ResponseInit & { headers?: HeadersInit };

export function json(data: unknown, init: JsonResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function zodErrorPayload(err: ZodError) {
  return {
    error: "ValidationError",
    issues: err.issues.map((i) => ({
      path: i.path.join("."),
      code: i.code,
      message: i.message,
    })),
  };
}

// Parse JSON body with size limit and content-type guard
export async function parseJson<T extends z.ZodTypeAny>(
  req: Request,
  schema: T,
  opts?: { maxBytes?: number }
): Promise<{ success: true; data: z.infer<T> } | { success: false; res: Response }> {
  const max = opts?.maxBytes ?? 1024 * 1024; // 1MB default

  const ctype = req.headers.get("content-type") || "";
  if (!ctype.toLowerCase().includes("application/json")) {
    return { success: false, res: json({ error: "Поддържаме само application/json" }, { status: 415 }) };
  }

  const text = await req.text();
  if (text.length > max) {
    return { success: false, res: json({ error: "Тяло на заявката е твърде голямо." }, { status: 413 }) };
  }

  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    return { success: false, res: json({ error: "Невалиден JSON." }, { status: 400 }) };
  }

  try {
    const parsed = await schema.parseAsync(payload);
    return { success: true, data: parsed };
  } catch (e) {
    if (e instanceof z.ZodError) {
      return { success: false, res: json(zodErrorPayload(e), { status: 400 }) };
    }
    return { success: false, res: json({ error: "Грешка при валидация." }, { status: 400 }) };
  }
}
