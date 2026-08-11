import { useEffect } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useRouter,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { LocationProvider } from "@/contexts/LocationContext";
import { reportLovableError } from "@/lib/lovable-error-reporting";
import NotFound from "@/pages/NotFound";
import appCss from "@/styles.css?url";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "UTF-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0, viewport-fit=cover",
      },
      { title: "bójí - Business Management Platform" },
      {
        name: "description",
        content:
          "Complete business management platform for service-based businesses",
      },
      { name: "author", content: "bójí" },
      { property: "og:title", content: "bójí - Business Management Platform" },
      {
        property: "og:description",
        content:
          "Complete business management platform for service-based businesses",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://bojiapp.me/boji-logo.png" },
      { property: "og:image:alt", content: "bójí logo" },
      { property: "og:site_name", content: "bójí" },
      { property: "og:url", content: "https://bojiapp.me/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@boji" },
      {
        name: "twitter:title",
        content: "bójí - Business Management Platform",
      },
      {
        name: "twitter:description",
        content:
          "Complete business management platform for service-based businesses",
      },
      { name: "twitter:image", content: "https://bojiapp.me/boji-logo.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "canonical", href: "https://bojiapp.me/" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", href: "/boji-logo.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "shortcut icon", href: "/favicon.ico" },
      { rel: "manifest", href: "/manifest.json" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: RootErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <LocationProvider>
        <LanguageProvider>
          <ThemeProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Outlet />
            </TooltipProvider>
          </ThemeProvider>
        </LanguageProvider>
      </LocationProvider>
    </QueryClientProvider>
  );
}

function RootErrorComponent({ error }: { error: Error }) {
  const router = useRouter();

  console.error(error);

  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-title-1">This page didn't load</h1>
      <p className="text-muted-foreground max-w-md">
        Something went wrong while loading this page. You can try again or head
        back home.
      </p>
      <div className="flex gap-3">
        <button
          className="ios-button bg-primary text-primary-foreground px-5"
          onClick={() => router.invalidate()}
        >
          Try again
        </button>
        <a href="/" className="ios-button bg-secondary text-secondary-foreground inline-flex items-center px-5">
          Go home
        </a>
      </div>
    </div>
  );
}