"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { StoreProvider } from "@/lib/store/StoreProvider";
import { NavigationProgress } from "@/components/ui/navigation-progress";
import { SWRegister } from "@/components/ui/sw-register";
import { SWUpdateToast } from "@/components/ui/sw-update-toast";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { PWAInstallPrompt } from "@/components/ui/pwa-install-prompt";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return (
    <SessionProvider>
      <StoreProvider>
        <QueryClientProvider client={queryClient}>
          <NextThemesProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            {/* Always-visible global UI */}
            <OfflineBanner />
            <React.Suspense fallback={null}>
              <NavigationProgress />
            </React.Suspense>

            {children}

            {/* PWA features */}
            <SWRegister />
            <SWUpdateToast />
            <PWAInstallPrompt />

            {/* Toasts — top-center just below sticky Topbar on mobile, bottom-right on desktop */}
            <Toaster
              position={isMobile ? "top-center" : "bottom-right"}
              offset={
                isMobile
                  ? "calc(92px + env(safe-area-inset-top, 0px))"
                  : "24px"
              }
              mobileOffset={{
                top: "calc(92px + env(safe-area-inset-top, 0px))",
                left: "16px",
                right: "16px",
              }}
              theme="system"
              toastOptions={{
                className: "border-l-4 border-l-[var(--primary)]",
                style: {
                  background: "var(--bg-elevated)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid var(--border)",
                  borderLeft: "4px solid var(--primary)",
                  color: "var(--text-heading)",
                  borderRadius: "16px",
                  boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.45)",
                },
              }}
            />
          </NextThemesProvider>
        </QueryClientProvider>
      </StoreProvider>
    </SessionProvider>
  );
}
