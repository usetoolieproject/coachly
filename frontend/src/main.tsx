import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { registerSW } from 'virtual:pwa-register';
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    }
  }
});

// Register service worker
const updateSW = registerSW({
  immediate: true,
  onRegistered(registration: ServiceWorkerRegistration | undefined) {
    // Service Worker registered
  },
  onNeedRefresh() {
    // Service Worker update available
    if (confirm('A new version is available. Click OK to refresh.')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    // Service Worker is ready to work offline
  },
  onRegisterError(error: unknown) {
    // Service Worker registration error
  }
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);