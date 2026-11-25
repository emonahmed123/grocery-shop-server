import type * as AiSdk from 'ai' with { 'resolution-mode': 'import' };
import type * as GoogleSdk from '@ai-sdk/google' with { 'resolution-mode': 'import' };

export type TAiSdk = typeof AiSdk;

/**
 * `ai` and `@ai-sdk/google` are ES modules only. This server is CommonJS, and
 * Vercel's runtime cannot `require()` an ES module (ERR_REQUIRE_ESM), so they
 * are loaded with `import()` instead: tsconfig's `module: node16` keeps it a
 * real `import()` in the build. Loaded once, on the first chat request.
 */
let sdk: Promise<{ ai: TAiSdk; google: typeof GoogleSdk }> | undefined;

export const loadAiSdk = () => {
  sdk ??= Promise.all([import('ai'), import('@ai-sdk/google')]).then(
    ([ai, google]) => ({ ai, google }),
  );
  return sdk;
};
