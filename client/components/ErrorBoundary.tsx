import React, { Component, ReactNode } from "react";
import { AlertTriangle, Home } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error details
    console.error("Error caught by boundary:", error, errorInfo);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    // Optionally navigate to home
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorFallback onReset={this.handleReset} error={this.state.error} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  onReset: () => void;
  error: Error | null;
}

function ErrorFallback({ onReset, error }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen bg-[hsl(217,33%,9%)] text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <AlertTriangle size={64} className="text-red-400" />
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">Oops! Something went wrong</h1>
          <p className="text-white/60">
            We encountered an unexpected error. Please try again or return home.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-left">
            <p className="text-xs font-mono text-red-300 break-all">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={onReset}
            variant="outline"
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Home size={16} />
            Go Home
          </Button>
          <Button
            onClick={() => window.location.reload()}
            className="flex-1"
          >
            Reload Page
          </Button>
        </div>

        <p className="text-xs text-white/40">
          Error ID: {Math.random().toString(36).substr(2, 9)}
        </p>
      </div>
    </div>
  );
}
