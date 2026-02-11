const RECAPTCHA_SITE_KEY = '6LfGLWgsAAAAAENilq2grmb2oJOwWTtgJp6Zk8-6';

declare global {
  interface Window {
    grecaptcha?: {
      ready(callback: () => void): void;
      execute(siteKey: string, options: { action: string }): Promise<string>;
    };
  }
}

/**
 * Generates a fresh reCAPTCHA v3 token for the given action.
 * Returns an empty string if the reCAPTCHA script is unavailable
 * (e.g. ad blocker, SSR, or script loading failure).
 */
export function getRecaptchaToken(action: string): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.grecaptcha) {
      resolve('');
      return;
    }

    window.grecaptcha.ready(() => {
      window.grecaptcha!
        .execute(RECAPTCHA_SITE_KEY, { action })
        .then(resolve)
        .catch(() => resolve(''));
    });
  });
}
