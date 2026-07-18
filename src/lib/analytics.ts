// Thin analytics wrapper. PostHog activates only when VITE_POSTHOG_KEY is set.
import posthog from "posthog-js";

let initialized = false;

export function initAnalytics() {
  if (initialized || typeof window === "undefined") return;
  const key = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
  if (!key) return;
  posthog.init(key, {
    api_host: (import.meta.env.VITE_POSTHOG_HOST as string) || "https://us.i.posthog.com",
    capture_pageview: true,
    autocapture: true,
    persistence: "localStorage",
  });
  initialized = true;
}

export function identify(userId: string, traits?: Record<string, unknown>) {
  if (!initialized) return;
  posthog.identify(userId, traits);
}

export function track(event: string, props?: Record<string, unknown>) {
  if (!initialized) return;
  posthog.capture(event, props);
}

export function resetAnalytics() {
  if (!initialized) return;
  posthog.reset();
}
