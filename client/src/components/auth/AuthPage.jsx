// src/components/auth/AuthPage.jsx - Version avec palette noir et vert
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Building, Sun, Moon } from 'lucide-react';

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('brain_invest_theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    company: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('brain_invest_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!isLogin) {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Les mots de passe ne correspondent pas');
        }
        if (formData.password.length < 6) {
          throw new Error('Le mot de passe doit contenir au moins 6 caractères');
        }
      }

      const response = await fetch('http://localhost:3001/api/auth/' + (isLogin ? 'login' : 'register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erreur de connexion');
      }

      localStorage.setItem('brain_invest_token', result.token);
      localStorage.setItem('brain_invest_user', JSON.stringify(result.user));

      onLogin(result.user);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen transition-theme flex items-center justify-center p-4"
      style={{
        background: isDarkMode 
          ? '#000000' // Noir pur pour le mode sombre
          : 'linear-gradient(135deg, #f9fafb 0%, #e0f2fe 50%, #f3f4f6 100%)'
      }}
    >
      
      {/* Toggle thème en haut à droite */}
      <div className="fixed top-4 right-4 z-10">
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-full transition-all duration-200 ${
            isDarkMode
              ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400'
              : 'bg-white shadow-md hover:shadow-lg text-gray-600'
          }`}
          title={`Passer au mode ${isDarkMode ? 'clair' : 'sombre'}`}
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>

      {/* Arrière-plan animé pour mode sombre */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full animate-pulse"
          style={{
            background: isDarkMode 
              ? 'linear-gradient(135deg, rgba(13, 148, 136, 0.1) 0%, rgba(13, 148, 136, 0.05) 100%)'
              : 'linear-gradient(135deg, rgba(6, 111, 102, 0.2) 0%, rgba(6, 111, 102, 0.1) 100%)'
          }}
        ></div>
        <div 
          className="absolute -bottom-1/2 -left-1/2 w-full h-full rounded-full animate-pulse"
          style={{
            background: isDarkMode 
              ? 'linear-gradient(45deg, rgba(13, 148, 136, 0.05) 0%, rgba(13, 148, 136, 0.1) 100%)'
              : 'linear-gradient(45deg, rgba(6, 111, 102, 0.1) 0%, rgba(6, 111, 102, 0.2) 100%)',
            animationDelay: '1s'
          }}
        ></div>
      </div>

      <div className="relative w-full max-w-md">
       {/* Logo et titre Brain Invest */}
<div className="text-center mb-8">
  <div className="inline-flex items-center justify-center w-28 h-28 mb-4 rounded-2xl shadow-lg overflow-hidden">
    <img
      src={isDarkMode ? "/images/B-light.png" : "/images/B-dark.png"}
      alt="Brain Invest Logo"
      className="w-full h-full object-contain"
    />
  </div>
  <h1
    className={`text-3xl font-bold mb-2 ${
      isDarkMode ? "text-white" : "text-gray-900"
    }`}
  >
    Brain Invest
  </h1>
  <p className="text-primary-600">Assistant Trading IA</p>
</div>



        {/* Formulaire */}
        <div 
          className="backdrop-blur-lg rounded-2xl p-8 border shadow-2xl"
          style={{
            backgroundColor: isDarkMode ? 'rgba(17, 17, 17, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            borderColor: isDarkMode ? 'rgba(42, 42, 42, 0.5)' : 'rgba(229, 231, 235, 0.5)'
          }}
        >
          
          {/* Toggle Login/Register */}
          <div 
            className="flex mb-6 p-1 rounded-lg"
            style={{ backgroundColor: isDarkMode ? 'rgba(42, 42, 42, 0.5)' : '#f3f4f6' }}
          >
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
                isLogin ? 'text-white shadow-lg bg-primary-600' : 
                isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
                !isLogin ? 'text-white shadow-lg bg-primary-600' : 
                isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Inscription
            </button>
          </div>

          {/* Erreur */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Champs d'inscription */}
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type="text"
                      name="firstName"
                      placeholder="Prénom"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 rounded-lg backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-600"
                      style={{
                        backgroundColor: isDarkMode ? 'rgba(42, 42, 42, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                        borderWidth: '1px',
                        borderColor: isDarkMode ? 'rgba(42, 42, 42, 0.5)' : '#d1d5db',
                        color: isDarkMode ? 'white' : '#111827'
                      }}
                      required={!isLogin}
                    />
                  </div>
                  <div className="relative">
                    <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Nom"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 rounded-lg backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-600"
                      style={{
                        backgroundColor: isDarkMode ? 'rgba(42, 42, 42, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                        borderWidth: '1px',
                        borderColor: isDarkMode ? 'rgba(42, 42, 42, 0.5)' : '#d1d5db',
                        color: isDarkMode ? 'white' : '#111827'
                      }}
                      required={!isLogin}
                    />
                  </div>
                </div>
                <div className="relative">
                  <Building className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="text"
                    name="company"
                    placeholder="Entreprise (optionnel)"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 rounded-lg backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-600"
                    style={{
                      backgroundColor: isDarkMode ? 'rgba(42, 42, 42, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                      borderWidth: '1px',
                      borderColor: isDarkMode ? 'rgba(42, 42, 42, 0.5)' : '#d1d5db',
                      color: isDarkMode ? 'white' : '#111827'
                    }}
                  />
                </div>
              </>
            )}

            {/* Email */}
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-3 rounded-lg backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-600"
                style={{
                  backgroundColor: isDarkMode ? 'rgba(42, 42, 42, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                  borderWidth: '1px',
                  borderColor: isDarkMode ? 'rgba(42, 42, 42, 0.5)' : '#d1d5db',
                  color: isDarkMode ? 'white' : '#111827'
                }}
                required
              />
            </div>

            {/* Mot de passe */}
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Mot de passe"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-12 pr-12 py-3 rounded-lg backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-600"
                style={{
                  backgroundColor: isDarkMode ? 'rgba(42, 42, 42, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                  borderWidth: '1px',
                  borderColor: isDarkMode ? 'rgba(42, 42, 42, 0.5)' : '#d1d5db',
                  color: isDarkMode ? 'white' : '#111827'
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                  isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Confirmation mot de passe */}
            {!isLogin && (
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirmer le mot de passe"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 rounded-lg backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-600"
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(42, 42, 42, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                    borderWidth: '1px',
                    borderColor: isDarkMode ? 'rgba(42, 42, 42, 0.5)' : '#d1d5db',
                    color: isDarkMode ? 'white' : '#111827'
                  }}
                  required={!isLogin}
                />
              </div>
            )}

            {/* Bouton submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 font-medium rounded-lg transition-all duration-200 text-white focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              style={{
                backgroundColor: '#0d9488'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#14b8a6'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#0d9488'}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isLogin ? 'Connexion...' : 'Inscription...'}
                </div>
              ) : (
                isLogin ? 'Se connecter' : 'S\'inscrire'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div 
          className="text-center mt-6 text-sm"
          style={{ color: isDarkMode ? '#5eead4' : '#0d9488' }}
        >
          © 2025 Brain Invest - Assistant Trading IA
        </div>
      </div>
    </div>
  );
};

export default AuthPage;