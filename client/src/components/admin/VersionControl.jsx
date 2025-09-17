import React, { useState, useEffect } from 'react';
import { versionManager } from '../../utils/versionControl';
import { logger } from '../../utils/logger';

const VersionControl = ({ isOpen, onClose }) => {
  const [versions, setVersions] = useState([]);
  const [backups, setBackups] = useState([]);
  const [currentVersion, setCurrentVersion] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadVersionData();
    }
  }, [isOpen]);

  const loadVersionData = () => {
    try {
      const versionHistory = versionManager.getVersionHistory();
      const availableBackups = versionManager.getAvailableBackups();
      const current = versionManager.getCurrentVersion();
      
      setVersions(versionHistory);
      setBackups(availableBackups);
      setCurrentVersion(current.version);
    } catch (error) {
      logger.logError(error, 'version_control_load');
    }
  };

  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      const backupName = `manual-backup-${Date.now()}`;
      const success = versionManager.createBackup(
        currentVersion, 
        `Manual backup created by user`
      );
      
      if (success) {
        logger.logVersionEvent('backup_created', backupName);
        loadVersionData();
        alert('✅ Backup créé avec succès !');
      } else {
        alert('❌ Échec de la création du backup');
      }
    } catch (error) {
      logger.logError(error, 'manual_backup');
      alert('❌ Erreur lors de la création du backup');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedVersion) {
      alert('Veuillez sélectionner une version à restaurer');
      return;
    }

    const confirmed = window.confirm(
      `⚠️ Êtes-vous sûr de vouloir restaurer la version ${selectedVersion} ?\n\n` +
      `Cette action va :\n` +
      `• Remplacer l'état actuel de l'application\n` +
      `• Créer automatiquement un backup de l'état actuel\n` +
      `• Redémarrer l'application\n\n` +
      `Cette action est réversible grâce au backup automatique.`
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      const success = versionManager.restoreFromBackup(selectedVersion);
      
      if (success) {
        logger.logVersionEvent('version_restored', selectedVersion, {
          previousVersion: currentVersion
        });
        alert('✅ Restauration réussie ! L\'application va se recharger...');
        
        // Reload the page to apply changes
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        alert('❌ Échec de la restauration');
      }
    } catch (error) {
      logger.logError(error, 'version_restore');
      alert('❌ Erreur lors de la restauration');
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = () => {
    logger.exportLogs();
    logger.logUserAction('logs_exported_from_version_control');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            🔧 Contrôle de Version & Backup
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Version Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              📦 Version Actuelle
            </h3>
            <p className="text-lg font-mono text-blue-800 dark:text-blue-200">
              {currentVersion}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
              Système d'authentification intégré
            </p>
          </div>

          {/* Quick Actions */}
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-3">
              ⚡ Actions Rapides
            </h3>
            <div className="space-y-2">
              <button
                onClick={handleCreateBackup}
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
              >
                💾 Créer un Backup
              </button>
              <button
                onClick={exportLogs}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                📊 Exporter les Logs
              </button>
            </div>
          </div>
        </div>

        {/* Version History */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            📋 Historique des Versions
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            {versions.length > 0 ? (
              <div className="space-y-3">
                {versions.slice(-5).reverse().map((version, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded border-l-4 border-blue-500">
                    <div>
                      <span className="font-mono font-semibold text-gray-900 dark:text-white">
                        {version.version}
                      </span>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {version.description}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(version.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {version.critical && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                        Critique
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Aucun historique de version disponible
              </p>
            )}
          </div>
        </div>

        {/* Backup Management */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            💾 Gestion des Backups
          </h3>
          
          {backups.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sélectionner une version à restaurer :
              </label>
              <select
                value={selectedVersion}
                onChange={(e) => setSelectedVersion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">-- Choisir une version --</option>
                {backups.map((backup) => (
                  <option key={backup} value={backup}>
                    {backup}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleRestore}
              disabled={loading || !selectedVersion}
              className="bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700 disabled:opacity-50"
            >
              🔄 Restaurer la Version Sélectionnée
            </button>
          </div>
        </div>

        {/* Security Warning */}
        <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-yellow-400 mr-2">⚠️</span>
            <div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                Instructions de Sécurité
              </h4>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 space-y-1">
                <li>• Les backups sont créés automatiquement avant chaque restauration</li>
                <li>• Les données utilisateur sont préservées lors des restaurations</li>
                <li>• En cas de problème, utilisez la console: <code>window.versionManager.restoreFromBackup('backup_name')</code></li>
                <li>• Les logs peuvent être consultés via: <code>window.logger.getRecentLogs()</code></li>
              </ul>
            </div>
          </div>
        </div>

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-900 dark:text-white">Traitement en cours...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VersionControl;