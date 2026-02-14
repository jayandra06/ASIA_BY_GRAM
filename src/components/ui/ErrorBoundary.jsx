'use client';

import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div className="p-4 border border-red-200 bg-red-50 rounded-lg my-4">
                    <h2 className="text-red-800 font-bold mb-2">Something went wrong in this section.</h2>
                    <p className="text-red-600 text-sm mb-4">
                        {this.state.error?.message || "An unexpected error occurred."}
                    </p>
                    <button
                        className="px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors text-xs font-medium"
                        onClick={() => this.setState({ hasError: false })}
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
