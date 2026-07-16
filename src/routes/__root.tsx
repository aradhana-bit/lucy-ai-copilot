import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
      <div className="relative max-w-md text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl surface">
          <span className="text-lg font-semibold text-gradient">L</span>
        </div>
        <h1 className="text-7xl font-semibold tracking-tight text-gradient">404</h1>
        <h2 className="mt-3 text-xl font-medium">This page went off-map</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The route you're looking for doesn't exist, or Lucy hasn't built it yet.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link to="/" className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90">
            Back home
          </Link>
          <Link to="/dashboard" className="inline-flex h-10 items-center rounded-lg border border-border bg-secondary px-4 text-sm font-medium transition hover:bg-accent">
            Open dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight">Something broke.</h1>
        <p className="mt-2 text-sm text-muted-foreground">Lucy caught the error and is standing by. Try again, or head back home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90">Try again</button>
          <a href="/" className="inline-flex h-10 items-center rounded-lg border border-border bg-secondary px-4 text-sm font-medium hover:bg-accent">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lucy — The AI Workforce That Builds Your Business" },
      { name: "description", content: "Lucy is an AI operating system for founders. Coordinate specialized agents to build, launch, and grow your startup from one workspace." },
      { name: "author", content: "Lucy" },
      { property: "og:title", content: "Lucy — The AI Workforce That Builds Your Business" },
      { property: "og:description", content: "An AI operating system for founders. Agents that plan, research, design, code, write, and grow — coordinated in one workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster position="bottom-right" theme="dark" />
    </QueryClientProvider>
  );
}
