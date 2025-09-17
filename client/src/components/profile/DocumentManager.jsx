import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { canStore, cleanupStorage } from '../../utils/imageUtils';

const DocumentManager = () => {
  const { currentUser, addUserDocument, removeUserDocument } = useUser();
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = (files) => {
    Array.from(files).forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit (réduit de 10MB)
        alert('Le fichier doit faire moins de 5MB pour éviter les problèmes de stockage');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const document = {
            id: Date.now() + Math.random(),
            name: file.name,
            type: file.type,
            size: file.size,
            data: event.target.result,
            uploadedAt: new Date().toISOString()
          };

          // Vérifier si on peut stocker ce document
          const testData = JSON.stringify([...currentUser?.documents || [], document]);
          if (!canStore(testData)) {
            // Essayer de nettoyer le storage
            cleanupStorage();
            
            if (!canStore(testData)) {
              alert('Espace de stockage insuffisant. Veuillez supprimer d\'autres documents ou utiliser un fichier plus petit.');
              return;
            }
          }

          addUserDocument(document);
          console.log(`✅ Document "${file.name}" ajouté avec succès`);
        } catch (error) {
          console.error('❌ Erreur lors de l\'ajout du document:', error);
          alert('Erreur lors de l\'ajout du document. Veuillez réessayer.');
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('word') || type.includes('document')) return '📝';
    return '📎';
  };

  const downloadDocument = (doc) => {
    const link = document.createElement('a');
    link.href = doc.data;
    link.download = doc.name;
    link.click();
  };

  return (
    <div className="bg-white dark:bg-brand-dark rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
      <h3 className="text-lg font-semibold text-brand-dark dark:text-brand-white mb-4">
        Mes Documents
      </h3>

      {/* Zone de drop */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver
            ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/20'
            : 'border-neutral-300 dark:border-neutral-600'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="space-y-2">
          <div className="text-4xl">📁</div>
          <p className="text-neutral-600 dark:text-neutral-400">
            Glissez-déposez vos documents ici
          </p>
          <p className="text-sm text-neutral-500">
            ou
          </p>
          <label className="inline-block bg-brand-blue text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-600 transition-colors">
            Choisir des fichiers
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
          </label>
          <p className="text-xs text-neutral-500 mt-2">
            PDF, Word, Images (max 10MB par fichier)
          </p>
        </div>
      </div>

      {/* Liste des documents */}
      {currentUser?.documents && currentUser.documents.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium text-brand-dark dark:text-brand-white mb-3">
            Documents uploadés ({currentUser.documents.length})
          </h4>
          <div className="space-y-2">
            {currentUser.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-brand-dark/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{getFileIcon(doc.type)}</span>
                  <div>
                    <p className="font-medium text-brand-dark dark:text-brand-white text-sm">
                      {doc.name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {formatFileSize(doc.size)} • {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => downloadDocument(doc)}
                    className="p-2 text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Télécharger"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                  </button>
                  <button
                    onClick={() => removeUserDocument(doc.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions de documents */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h5 className="font-medium text-brand-blue mb-2">Documents recommandés :</h5>
        <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
          <li>• CV récent</li>
          <li>• Diplômes et relevés de notes</li>
          <li>• Pièce d'identité</li>
          <li>• Photos d'identité</li>
          <li>• Certificats de langue (si applicable)</li>
        </ul>
      </div>
    </div>
  );
};

export default DocumentManager;
