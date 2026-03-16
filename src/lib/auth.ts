const GAS_URL = import.meta.env.VITE_GAS_URL as string;

async function post(payload: object): Promise<{ success: boolean; message: string }> {
  const res = await fetch(GAS_URL, {
    method: "POST",
    // No Content-Type header — keeps it a CORS simple request (text/plain),
    // which Google Apps Script web apps can handle without a preflight.
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  return JSON.parse(text);
}

/** Register a new user or request an OTP for an existing one. */
export function sendOTP(email: string, name?: string) {
  return post({ action: "sendOTP", email, name: name ?? "" });
}

/** Verify the 6-digit OTP entered by the user. */
export function verifyOTP(email: string, code: string) {
  return post({ action: "verifyOTP", email, code });
}
