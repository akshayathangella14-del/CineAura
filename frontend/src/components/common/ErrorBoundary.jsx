import React from 'react';
import { AlertCircle } from 'lucide-react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary__container">
          <div className="error-boundary__card">
            <div className="error-boundary__icon-wrapper">
              <AlertCircle size={48} className="error-boundary__icon" />
            </div>
            <h2 className="error-boundary__title">Playback Interrupted</h2>
            <p className="error-boundary__message">
              We encountered an unexpected issue while loading this cinematic experience.
            </p>
            <button
              className="error-boundary__retry-btn"
              onClick={() => window.location.reload()}
            >
              Reload Experience
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
