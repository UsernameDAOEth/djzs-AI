import { Component, type ReactNode, type ErrorInfo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[DJZS] Uncaught error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleDismiss = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#1a1d26' }}>
          <div className="max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(243,126,32,0.15)' }}>
                <AlertTriangle className="w-8 h-8" style={{ color: '#F37E20' }} />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Merriweather, serif' }}>
                Something went wrong
              </h1>
              <p className="text-sm text-gray-400 leading-relaxed">
                DJZS hit an unexpected error. Your local data is safe — it's stored in your browser and hasn't been affected.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={this.handleReload}
                className="gap-2"
                style={{ background: '#F37E20' }}
                data-testid="button-error-reload"
              >
                <RefreshCw className="w-4 h-4" />
                Reload
              </Button>
              <Button
                onClick={this.handleDismiss}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
                data-testid="button-error-dismiss"
              >
                Try again
              </Button>
            </div>
            {this.state.error && (
              <details className="text-left">
                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                  Technical details
                </summary>
                <pre className="mt-2 p-3 rounded-lg bg-black/40 text-xs text-gray-500 overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
