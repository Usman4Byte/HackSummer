export type LLMRole = "user" | "system" | "model";

export interface LLMMessage {
  role: LLMRole;
  content: string;
}

export interface CallLLMOptions {
  messages: LLMMessage[];
  temperature?: number;
  maxOutputTokens?: number;
  jsonMode?: boolean;
}

export interface LLMResult {
  ok: boolean;
  text: string;
  provider: "gemini" | "none";
  error?: string;
}

export function hasLLMKey(): boolean {
  return !!process.env["GEMINI_API_KEY"];
}

const DEFAULT_MODEL = process.env["LLM_MODEL"] || "gemini-flash-lite-latest";

export async function callLLM(opts: CallLLMOptions): Promise<LLMResult> {
  const key = process.env["GEMINI_API_KEY"];
  if (!key) {
    return { ok: false, text: "", provider: "none", error: "no_api_key" };
  }
  const model = DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(key)}`;

  const systemParts = opts.messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");
  const chat = opts.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "model" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const body: Record<string, unknown> = {
    contents: chat,
    generationConfig: {
      temperature: opts.temperature ?? 0.4,
      maxOutputTokens: opts.maxOutputTokens ?? 512,
      ...(opts.jsonMode ? { responseMimeType: "application/json" } : {}),
    },
  };
  if (systemParts) {
    body.systemInstruction = { role: "system", parts: [{ text: systemParts }] };
  }

  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(t);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, text: "", provider: "gemini", error: `http_${res.status}:${text.slice(0, 200)}` };
    }
    const json: any = await res.json();
    const text: string =
      json?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text ?? "").join("") ?? "";
    return { ok: true, text, provider: "gemini" };
  } catch (err: any) {
    return { ok: false, text: "", provider: "gemini", error: String(err?.message || err) };
  }
}
