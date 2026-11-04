type BeforeLoginPayload = {
  code: string;
  reason?: string;
  mfaChallengeToken?: string;
};

/**
 * What the server's `beforeLogin` refused a sign-in with: it writes a JSON payload with a `code`
 * (MFA_REQUIRED, ACCOUNT_NOT_VERIFIED, ACCOUNT_BANNED) in the error message. The Parse error number
 * cannot tell them apart — the same one comes back for a failure of the trigger itself — so the
 * caller decides on this content.
 * @returns the payload, or undefined when the message is not one of them
 */
export const parseBeforeLoginPayload = (error: unknown): BeforeLoginPayload | undefined => {
  const message = (error as Error | undefined)?.message;

  if (!message) return undefined;

  try {
    const payload = JSON.parse(message);

    return typeof payload?.code === 'string' ? payload : undefined;
  } catch {
    return undefined;
  }
};
