import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { NuqsAdapter } from "nuqs/adapters/react";

import "./index.css";
import App from "./App.tsx";
import QueryProvider from "./context/query-provider.tsx";
import { Toaster } from "./components/ui/toaster.tsx";
import ErrorBoundary from "./components/error-boundary.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <NuqsAdapter>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </NuqsAdapter>
      <Toaster />
    </QueryProvider>
  </StrictMode>
);
