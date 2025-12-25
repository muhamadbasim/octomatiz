/**
 * Dashboard-specific Error Boundary
 * Provides contextual error handling for admin dashboard sections
 * Feature: error-boundaries
 */

import React, { Component, type ReactNode, type ErrorInfo } from 'react';

interface DashboardErrorBoundaryProps {
  children: ReactNode;
  sectionName: string;
  onRetry?: () => void;
}

interface DashboardErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
}

export class DashboardErrorBoundary extends Component<DashboardErrorBoundaryProps, DashboardErrorBoundaryState> {
  constructor(props: DashboardErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<DashboardErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(`[Dashboard:${this.props.sectionName}] Error:`, error.message);
    console.error(`[Dashboard:${this.props.sectionName}] Stack:`, errorInfo.componentStack);
    
    this.setState(prev => ({ errorCount: prev.errorCount + 1 }));
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const { sectionName } = this.props;
      const { errorCount } = this.state;
      
      return (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg min-h-[120px] flex flex-col justify-center">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="font-medium text-sm">{sectionName}</span>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Gagal memuat komponen ini.
            {errorCount > 2 && ' Terjadi beberapa kali.'}
          </p>
          <button
            onClick={this.handleRetry}
            className="self-start px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Muat Ulang
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Chart-specific Error Boundary
 * Minimal UI for chart errors
 */
export class ChartErrorBoundary extends Component<
  { children: ReactNode; chartName: string },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; chartName: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(`[Chart:${this.props.chartName}] Error:`, error.message);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[200px] bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-xs">{this.props.chartName} tidak tersedia</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DashboardErrorBoundary;
