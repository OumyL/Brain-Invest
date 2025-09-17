// src/components/admin/AdminDashboard.jsx - Version améliorée
import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Activity, Settings, LogOut, Trash2, Shield, MessageCircle, Sun, Moon, Save, Database, Server, Key } from 'lucide-react';

const AdminDashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Gestion du thème
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('brain_invest_theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Appliquer le thème
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

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('brain_invest_token')}`,
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsResponse, usersResponse] = await Promise.all([
        fetch('http://localhost:3001/api/admin/stats', { headers: getAuthHeaders() }),
        fetch('http://localhost:3001/api/admin/users', { headers: getAuthHeaders() })
      ]);

      if (statsResponse.ok && usersResponse.ok) {
        const statsData = await statsResponse.json();
        const usersData = await usersResponse.json();
        
        setStats(statsData);
        setUsers(usersData.users);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });

        if (response.ok) {
          setUsers(users.filter(u => u.id !== userId));
          fetchData();
        } else {
          const error = await response.json();
          alert(error.message);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement du dashboard admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Admin Dashboard
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Brain Invest
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Administrateur
                </p>
              </div>

              {/* Toggle Theme */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={`Passer au mode ${isDarkMode ? 'clair' : 'sombre'}`}
              >
                {isDarkMode ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-gray-600" />}
              </button>
              
              {/* Bouton Interface Chat SEUL */}
              <button
                onClick={() => window.location.href = '/user-interface'}
                className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                title="Accéder à l'interface utilisateur"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Interface Chat</span>
              </button>
              
              <button
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Déconnexion"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
              { id: 'users', label: 'Utilisateurs', icon: Users },
              { id: 'settings', label: 'Paramètres', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Welcome Card */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Bienvenue, {user.firstName} !</h2>
              <p className="text-blue-100">Vous êtes connecté en tant qu'administrateur de Brain Invest</p>
              <p className="text-blue-100 text-sm mt-3">Utilisez le bouton "Interface Chat" dans le header pour accéder à l'interface utilisateur</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Total Utilisateurs
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {stats?.totalUsers || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Shield className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Administrateurs
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {stats?.adminUsers || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TrendingUp className="h-6 w-6 text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Nouveaux (7j)
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {stats?.recentUsers || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Activity className="h-6 w-6 text-purple-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Utilisateurs Actifs
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {stats?.regularUsers || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  État du système
                </h3>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Serveur Backend</span>
                    <span className="text-sm font-semibold text-green-600">Opérationnel</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Base de données</span>
                    <span className="text-sm font-semibold text-green-600">Connectée</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Services MCP</span>
                    <span className="text-sm font-semibold text-green-600">Actifs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Companies Distribution */}
            {stats?.usersByCompany && (
              <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Répartition par entreprise
                  </h3>
                  <div className="mt-4 space-y-3">
                    {Object.entries(stats.usersByCompany).map(([company, count]) => (
                      <div key={company} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {company}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {count} utilisateur{count > 1 ? 's' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                  Gestion des utilisateurs
                </h3>
                
                <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 md:rounded-lg border border-gray-200 dark:border-gray-600">
                  <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Utilisateur
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Entreprise
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Rôle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Inscription
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                      {users.map((userData) => (
                        <tr key={userData.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                  <span className="text-sm font-medium text-white">
                                    {userData.firstName[0]}{userData.lastName[0]}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {userData.firstName} {userData.lastName}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {userData.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {userData.company || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              userData.role === 'admin' 
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            }`}>
                              {userData.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(userData.createdAt).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {userData.id !== 1 && (
                              <button
                                onClick={() => handleDeleteUser(userData.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                title="Supprimer l'utilisateur"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-6">
                  Paramètres système
                </h3>
                
                <div className="space-y-6">
                  {/* Configuration générale */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                      Configuration générale
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Mode maintenance</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Activer/désactiver le mode maintenance</p>
                        </div>
                        <label className="inline-flex items-center">
                          <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" />
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Logs détaillés</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Activer les logs détaillés</p>
                        </div>
                        <label className="inline-flex items-center">
                          <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" defaultChecked />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Configuration MCP */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                      Configuration MCP
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <Server className="h-5 w-5 text-blue-600" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">URL du serveur MCP</span>
                          <input 
                            type="text" 
                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            defaultValue="http://localhost:3002"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <Key className="h-5 w-5 text-yellow-600" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Clé API Trading</span>
                          <input 
                            type="password" 
                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="••••••••••••••••"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Configuration base de données */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                      Base de données
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Database className="h-5 w-5 text-green-600" />
                          <div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Sauvegarde automatique</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Sauvegarde quotidienne à 02:00</p>
                          </div>
                        </div>
                        <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                          Configurer
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Nettoyage des conversations</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Supprimer les conversations 90 jours</p>
                        </div>
                        <label className="inline-flex items-center">
                          <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex items-center space-x-4 pt-4">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Save className="h-4 w-4" />
                      <span>Sauvegarder les paramètres</span>
                    </button>
                    
                    <button className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors">
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;