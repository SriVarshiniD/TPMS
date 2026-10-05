import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('TPMS Dashboard Crash Caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md p-6 rounded-2xl glass-panel-critical border border-red-500/50 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-600/30 border border-red-500/50 flex items-center justify-center mx-auto text-red-400">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <h2 className="text-lg font-bold text-white font-tech uppercase tracking-wider">
              Cockpit Interface Fault Detected
            </h2>
            <p className="text-xs text-red-200/80 font-mono-val">
              {this.state.error?.message || 'An unexpected rendering error occurred in the digital twin view.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-purple-600 text-white border border-purple-400/50 hover:bg-purple-500 mx-auto transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)]"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Digital Twin Cockpit</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
