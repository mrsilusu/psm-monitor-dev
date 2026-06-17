import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }

  static getDerivedStateFromError(error) { return { hasError: true, error }; }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-2">
          <p className="text-sm font-medium text-red-800">⚠️ Erro neste componente</p>
          <p className="text-xs text-red-600 mt-1">{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })} className="mt-2 text-xs text-red-700 underline">Tentar novamente</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
