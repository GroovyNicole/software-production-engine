import "./env.js";

const API_URL = "https://api.anthropic.com/v1/messages";

export function anthropicEnabled() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function textFromResponse(data) {
  return (data?.content || []).filter((block) => block?.type === "text").map((block) => block.text || "").join("").trim();
}

export function parseJsonResponse(text, label = "Anthropic response") {
  const cleaned = String(text || "").trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const objectStart = cleaned.indexOf("{");
    const objectEnd = cleaned.lastIndexOf("}");
    const arrayStart = cleaned.indexOf("[");
    const arrayEnd = cleaned.lastIndexOf("]");
    if (arrayStart !== -1 && arrayEnd > arrayStart && (objectStart === -1 || arrayStart < objectStart)) {
      return JSON.parse(cleaned.slice(arrayStart, arrayEnd + 1));
    }
    if (objectStart !== -1 && objectEnd > objectStart) return JSON.parse(cleaned.slice(objectStart, objectEnd + 1));
    throw new Error(`${label} did not contain valid JSON`);
  }
}

export async function callAnthropic({ model, system, user, maxTokens = 4096, temperature, tools, timeoutMs = 120000 }) {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not set");
  const body = {
    model,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  };
  if (temperature != null && !/fable/i.test(model)) body.temperature = temperature;
  if (tools?.length) body.tools = tools;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let response;
  try {
    response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") throw new Error(`Anthropic request timed out after ${timeoutMs}ms`);
    throw error;
  } finally {
    clearTimeout(timer);
  }
  if (!response.ok) throw new Error(`Anthropic HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`);
  return response.json();
}
