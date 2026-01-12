import React, { Component } from 'react';

class ErrorBoundary extends Component {
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

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            // Fallback UI
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: this.props.minHeight || '400px',
                    padding: '2rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '12px',
                    margin: '1rem'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                        {this.props.fallbackIcon || '⚠️'}
                    </div>
                    <h3 style={{
                        color: '#333',
                        marginBottom: '0.5rem',
                        fontSize: '1.25rem'
                    }}>
                        {this.props.fallbackTitle || 'Something went wrong'}
                    </h3>
                    <p style={{
                        color: '#666',
                        textAlign: 'center',
                        marginBottom: '1rem',
                        maxWidth: '400px'
                    }}>
                        {this.props.fallbackMessage || 'An error occurred while loading this component.'}
                    </p>
                    <button
                        onClick={this.handleRetry}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#2c5f2d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        🔄 Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
