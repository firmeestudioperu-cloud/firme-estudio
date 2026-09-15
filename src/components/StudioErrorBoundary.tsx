import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
  onNavigateHome?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class StudioErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('StudioErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    const isImportError =
      this.state.error?.message?.includes('dynamically imported module') ||
      this.state.error?.message?.includes('Failed to fetch') ||
      this.state.error?.name === 'TypeError';

    this.setState({ hasError: false, error: null, errorInfo: null });
    if (isImportError) {
      window.location.reload();
      return;
    }
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onNavigateHome) {
      this.props.onNavigateHome();
    } else {
      window.location.hash = 'inicio';
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-[#FAF8F5]">
          <div className="max-w-lg w-full bg-white rounded-3xl border-2 border-[#DDD5C9] p-8 shadow-xl text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-[#9A5340] flex items-center justify-center mx-auto shadow-xs">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="font-fraunces text-2xl font-bold text-[#1A1815]">
                {this.props.fallbackTitle || 'Hub de Trabajo en Recuperación'}
              </h2>
              <p className="text-sm text-[#6B655C] mt-2 leading-relaxed">
                {this.props.fallbackMessage ||
                  'Se detectó una interrupción temporal al cargar este módulo. Puedes reintentar la carga de la estación sin perder tu sesión.'}
              </p>
            </div>

            {this.state.error && (
              <details className="text-left bg-[#FAF8F5] border border-[#E4DED4] rounded-xl p-3 text-xs">
                <summary className="cursor-pointer font-semibold text-[#6B655C] hover:text-[#1A1815] select-none">
                  Ver detalle técnico del error
                </summary>
                <pre className="mt-2 text-[11px] font-mono text-rose-700 whitespace-pre-wrap overflow-x-auto max-h-36">
                  {this.state.error.name}: {this.state.error.message}
                  {this.state.error.stack && `\n${this.state.error.stack}`}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-5 py-2.5 rounded-xl bg-[#B5654A] hover:bg-[#9A5340] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reintentar Cargar Módulo</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="px-5 py-2.5 rounded-xl bg-[#F1ECE5] hover:bg-[#E4DED4] text-[#1A1815] font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Home className="w-4 h-4 text-[#6B655C]" />
                <span>Volver al Sitio Web</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
