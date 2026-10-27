import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in SEC Hostel UI:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 text-white text-center">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-xs">
                <AlertTriangle className="w-8 h-8 text-amber-300" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">SEC HOSTEL PORTAL</h2>
              <p className="text-xs text-blue-100 mt-1 uppercase tracking-wider">Saveetha Engineering College</p>
            </div>

            <div className="p-6 text-center space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Application Error Recovered</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                An unexpected display issue occurred while loading this view. The portal has safely prevented a blank screen.
              </p>

              {this.state.error && (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-left">
                  <p className="text-[11px] font-mono text-rose-800 break-words">
                    {this.state.error.message || String(this.state.error)}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  onClick={this.handleReset}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
                >
                  <RefreshCw className="w-4 h-4" /> Reload Portal
                </button>
                <button
                  type="button"
                  onClick={this.handleGoHome}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition"
                >
                  <Home className="w-4 h-4" /> Go to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

