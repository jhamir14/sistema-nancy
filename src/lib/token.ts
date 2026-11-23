export interface SessionPayload {
  userId: string;
  username: string;
  name: string;
  role: "ADMIN" | "OPERATOR";
  exp: number; // timestamp in seconds
}

export const SESSION_COOKIE_NAME = "nancy_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "sistema-nancy-clave-secreta-2026-super-segura-peru";

// Helper universal Base64URL
function base64UrlEncode(str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str).toString("base64url");
  }
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str, "base64url").toString("utf-8");
  }
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return atob(str);
}

// Convert bytes to base64url
function bytesToBase64Url(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64url");
  }
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Convert base64url to Uint8Array
function base64UrlToBytes(str: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(str, "base64url"));
  }
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Firmar token con HMAC-SHA256 (Web Crypto API - universal Edge y Node)
export async function signToken(payload: SessionPayload): Promise<string> {
  const enc = new TextEncoder();
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = base64UrlEncode(payloadStr);

  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(payloadB64));
  const signatureB64 = bytesToBase64Url(new Uint8Array(signatureBuffer));

  return `${payloadB64}.${signatureB64}`;
}

// Verificar token
export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [payloadB64, signatureB64] = parts;
    const enc = new TextEncoder();

    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(SESSION_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const sigBytes = base64UrlToBytes(signatureB64);
    const isValid = await crypto.subtle.verify("HMAC", key, sigBytes as any, enc.encode(payloadB64));

    if (!isValid) return null;

    const payloadJson = base64UrlDecode(payloadB64);
    const payload: SessionPayload = JSON.parse(payloadJson);

    // Verificar expiración
    const nowSec = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < nowSec) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}
