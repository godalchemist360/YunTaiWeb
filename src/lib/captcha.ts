export function isTurnstileEnabled() {
  return (
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY !== '' &&
    process.env.TURNSTILE_SECRET_KEY !== ''
  );
}

interface TurnstileResponse {
  success: boolean;
  'error-codes'?: string[];
}

/**
 * https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
export async function validateTurnstileToken(token: string) {
  const turnstileEnabled = isTurnstileEnabled();
  if (!turnstileEnabled) {
    console.log('validateTurnstileToken, turnstile is disabled');
    return true;
  }

  const response = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
      }),
    }
  );

  const data = (await response.json()) as TurnstileResponse;
  return data.success;
}
