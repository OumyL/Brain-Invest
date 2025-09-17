import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Met à jour le state pour afficher l'UI de fallback au prochain rendu
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Vous pouvez aussi enregistrer l'erreur dans un service de reporting
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Vous pouvez render une UI de fallback personnalisée
      return (
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
          <div className="max-w-md mx-auto text-center p-6">
            <div className="mb-4">
              <svg 
                className="mx-auto h-12 w-12 text-red-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Oups ! Une erreur s'est produite
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Quelque chose s'est mal passé. Veuillez recharger la page ou essayer plus tard.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Recharger la page
            </button>
            
            {/* Détails de l'erreur en mode développement */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  Détails de l'erreur (développement)
                </summary>
                <div className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-md text-xs">
                  <p className="font-semibold text-red-600 dark:text-red-400 mb-2">
                    {this.state.error && this.state.error.toString()}
                  </p>
                  <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
