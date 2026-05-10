import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
  componentStack: string;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    error: null,
    componentStack: "",
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error, componentStack: "" };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Unhandled UI error", error, errorInfo);
    this.setState({ componentStack: errorInfo.componentStack || "" });
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-lg border bg-card p-6 text-center shadow-sm">
          <AlertTriangle className="mx-auto mb-4 size-8 text-destructive" />
          <h1 className="mb-2 text-xl font-semibold">Something went wrong</h1>
          <p className="mb-5 text-sm text-muted-foreground">
            The page hit a UI error. Reloading should bring you back without a
            blank screen.
          </p>
          {this.state.error.message ? (
            <pre className="mb-5 overflow-auto rounded-md bg-muted p-3 text-left text-xs text-muted-foreground">
              {this.state.error.message}
            </pre>
          ) : null}
          {this.state.componentStack ? (
            <pre className="mb-5 max-h-40 overflow-auto rounded-md bg-muted p-3 text-left text-xs text-muted-foreground">
              {this.state.componentStack}
            </pre>
          ) : null}
          <Button onClick={() => window.location.reload()}>Reload</Button>
        </div>
      </main>
    );
  }
}

export default ErrorBoundary;
