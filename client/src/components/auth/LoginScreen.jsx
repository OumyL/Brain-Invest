import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import ThemeToggle from '../ui/ThemeToggle';
import { logger } from '../../utils/logger';

const LoginScreen = () => {
  const { isDark } = useContext(ThemeContext);
  const { loginUser } = useUser();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simple login - role will be determined by backend based on email
      const result = await loginUser(formData.email, formData.password);

      if (!result.success) {
        setError(result.error || 'Email ou mot de passe incorrect.');
      }
    } catch (error) {
      setError('Erreur de connexion. Veuillez réessayer.');
      logger.logError(error, 'login_screen');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
    // In a real application, this would trigger a password reset email
    setTimeout(() => {
      alert('Un email de réinitialisation a été envoyé à votre adresse email.');
      setShowForgotPassword(false);
    }, 1000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${
      isDark ? 'bg-black' : 'bg-white'
    }`}>
      {/* Theme Toggle - Position absolue en haut à droite */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center mb-4">
              <img 
                src={isDark ? "/images/brain-logo-d.png" : "/images/brain-logo-l.jpeg"}
                alt="Com'Sup Logo" 
                className="w-48 h-48 object-contain"
              />
            </div>
          </div>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Connectez-vous pour accéder à votre assistant IA
          </p>
        </div>

        {/* Formulaire */}
        <div className={`rounded-lg shadow-lg p-6 ${
          isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
        }`}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
                placeholder="votre.nom@comsup.edu"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Mot de passe *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
                placeholder="Votre mot de passe"
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion...
                </div>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={handleForgotPassword}
              disabled={showForgotPassword}
              className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {showForgotPassword ? 'Email envoyé...' : 'Mot de passe oublié ?'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className={`text-xs ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`}>
            © 2024 Assistant IA Universitaire
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;