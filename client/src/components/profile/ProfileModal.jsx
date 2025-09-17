import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import DocumentManager from './DocumentManager';
import { compressImage } from '../../utils/imageUtils';

const ProfileModal = () => {
  const { currentUser, isProfileModalOpen, closeProfileModal, saveUserProfile, updateProfilePicture } = useUser();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState(() => ({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    userCode: currentUser?.userCode || '', // Add automatic user code
    studentId: currentUser?.studentId || '',
    cycle: currentUser?.cycle || '',
    groupe: currentUser?.groupe || '', // Add groupe field
    niveau: currentUser?.niveau || '', // Add niveau field
    nationality: currentUser?.nationality || 'Maroc'
  }));

  // Mettre à jour le formulaire quand currentUser change
  React.useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        userCode: currentUser.userCode || '', // Add automatic user code
        studentId: currentUser.studentId || '',
        cycle: currentUser.cycle || '',
        groupe: currentUser.groupe || '', // Add groupe field
        niveau: currentUser.niveau || '', // Add niveau field
        nationality: currentUser.nationality || 'Maroc'
      });
    }
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      try {
        // Afficher un indicateur de chargement
        const loadingToast = document.createElement('div');
        loadingToast.textContent = 'Compression de l\'image...';
        loadingToast.style.cssText = 'position:fixed;top:20px;right:20px;background:#3b82f6;color:white;padding:12px;border-radius:8px;z-index:9999';
        document.body.appendChild(loadingToast);

        // Comprimer l'image
        const compressedImage = await compressImage(file, {
          maxWidth: 200,
          maxHeight: 200,
          quality: 0.8,
          outputFormat: 'image/jpeg'
        });

        // Supprimer l'indicateur de chargement
        document.body.removeChild(loadingToast);

        // Mettre à jour la photo de profil
        updateProfilePicture(compressedImage);
        
        console.log('✅ Image compressée et sauvegardée');
      } catch (error) {
        console.error('❌ Erreur lors de la compression:', error);
        alert('Erreur lors du traitement de l\'image. Veuillez réessayer avec une image plus petite.');
      }
    } else {
      alert('Veuillez sélectionner un fichier image valide (JPG, PNG, etc.)');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const userProfile = {
      ...currentUser,
      ...formData,
      id: currentUser?.id || Date.now(),
      createdAt: currentUser?.createdAt || new Date().toISOString()
    };
    saveUserProfile(userProfile);
    closeProfileModal();
  };

  if (!isProfileModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-brand-dark rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex flex-1 min-h-0">
          {/* Sidebar avec onglets */}
          <div className="w-64 bg-neutral-50 dark:bg-brand-dark/50 border-r border-neutral-200 dark:border-neutral-700 flex-shrink-0">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-brand-dark dark:text-brand-white">
                  Mon Espace
                </h2>
                <button
                  onClick={closeProfileModal}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-brand-dark/80 rounded-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Navigation des onglets */}
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-brand-blue text-white'
                      : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-brand-dark/80'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <span className="font-medium">Mon Profil</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === 'documents'
                      ? 'bg-brand-blue text-white'
                      : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-brand-dark/80'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <span className="font-medium">Mes Documents</span>
                  {currentUser?.documents && currentUser.documents.length > 0 && (
                    <span className="bg-brand-blue text-white text-xs rounded-full px-2 py-1">
                      {currentUser.documents.length}
                    </span>
                  )}
                </button>
              </nav>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="flex-1 min-w-0 flex flex-col">
            {activeTab === 'profile' && (
              <div className="flex-1 overflow-y-auto p-6">
                <h3 className="text-lg font-semibold text-brand-dark dark:text-brand-white mb-6">
                  Informations personnelles
                </h3>

                {/* Photo de profil */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative">
                    <img
                      src={currentUser?.profilePicture || '/images/default-avatar.png'}
                      alt="Profil"
                      className="w-24 h-24 rounded-full object-cover border-4 border-brand-blue"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2MzY2ZjEiLz4KPHN2ZyB4PSI4IiB5PSIxMCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xNS43NSA2QTE1Ljc1IDE1Ljc1IDAgMDEwIDExLjI1IDE1Ljc1IDE1Ljc1IDAgMDExNS43NSA2WiIgZmlsbD0id2hpdGUiLz4KPHN2ZyB4PSI0IiB5PSIxNCIgd2lkdGg9IjE2IiBoZWlnaHQ9IjEwIiB2aWV3Qm94PSIwIDAgMTYgMTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDlDMCA1IDMuNTggMiA4IDJTMTYgNSAxNiA5VjEwSDBWOVoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo8L3N2Zz4K';
                      }}
                    />
                    <label className="absolute bottom-0 right-0 bg-brand-blue text-white p-1 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                      </svg>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                    Cliquez sur l'icône pour changer votre photo
                  </p>
                </div>

                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Prénom
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:ring-brand-blue focus:border-brand-blue dark:bg-brand-dark dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Nom
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:ring-brand-blue focus:border-brand-blue dark:bg-brand-dark dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:ring-brand-blue focus:border-brand-blue dark:bg-brand-dark dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:ring-brand-blue focus:border-brand-blue dark:bg-brand-dark dark:text-white"
                    />
                  </div>

                  {/* Student-specific fields - only show for students */}
                  {currentUser?.role === 'student' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Code Étudiant
                        </label>
                        <input
                          type="text"
                          name="userCode"
                          value={formData.userCode}
                          className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:ring-brand-blue focus:border-brand-blue dark:bg-brand-dark dark:text-white bg-gray-50 dark:bg-gray-800"
                          placeholder="STU001"
                          readOnly
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Code automatique généré</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Cycle d'études
                        </label>
                        <select
                          name="cycle"
                          value={formData.cycle}
                          className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:ring-brand-blue focus:border-brand-blue dark:bg-brand-dark dark:text-white bg-gray-50 dark:bg-gray-800"
                          disabled
                        >
                          <option value="">{formData.cycle || 'Non défini'}</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Niveau
                          </label>
                          <select
                            name="niveau"
                            value={formData.niveau}
                            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:ring-brand-blue focus:border-brand-blue dark:bg-brand-dark dark:text-white bg-gray-50 dark:bg-gray-800"
                            disabled
                          >
                            <option value="">{formData.niveau || 'Non défini'}</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Groupe
                          </label>
                          <select
                            name="groupe"
                            value={formData.groupe}
                            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:ring-brand-blue focus:border-brand-blue dark:bg-brand-dark dark:text-white bg-gray-50 dark:bg-gray-800"
                            disabled
                          >
                            <option value="">{formData.groupe || 'Non défini'}</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Nationalité
                        </label>
                        <select
                          name="nationality"
                          value={formData.nationality}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:ring-brand-blue focus:border-brand-blue dark:bg-brand-dark dark:text-white"
                        >
                          <option value="Maroc">Maroc</option>
                          <option value="Étranger">Étranger</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Boutons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeProfileModal}
                      className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-brand-dark/80 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Sauvegarder
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="flex-1 overflow-y-auto p-6">
                <DocumentManager />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
