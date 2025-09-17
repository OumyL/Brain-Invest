/**
 * Utilitaire pour nettoyer le localStorage et résoudre les problèmes de quota
 */

/**
 * Nettoie complètement le localStorage
 */
export const clearAllStorage = () => {
  try {
    localStorage.clear();
    console.log('✅ LocalStorage nettoyé complètement');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    return false;
  }
};

/**
 * Nettoie uniquement les données utilisateur
 */
export const clearUserData = () => {
  try {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('conversations');
    console.log('✅ Données utilisateur supprimées');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la suppression des données utilisateur:', error);
    return false;
  }
};

/**
 * Affiche la taille du localStorage
 */
export const showStorageSize = () => {
  let totalSize = 0;
  let items = [];
  
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      const size = localStorage[key].length + key.length;
      totalSize += size;
      items.push({
        key,
        size,
        sizeKB: (size / 1024).toFixed(2)
      });
    }
  }
  
  console.log('📊 Taille du localStorage:');
  console.log(`Total: ${(totalSize / 1024).toFixed(2)} KB`);
  console.log('Détail par clé:', items.sort((a, b) => b.size - a.size));
  
  return { totalSize, items };
};

/**
 * Fonction d'urgence pour résoudre le problème de quota
 */
export const emergencyCleanup = () => {
  console.log('🚨 Nettoyage d\'urgence du localStorage...');
  
  // Afficher la taille actuelle
  showStorageSize();
  
  // Nettoyer complètement
  const success = clearAllStorage();
  
  if (success) {
    console.log('✅ Nettoyage d\'urgence terminé. Vous pouvez maintenant créer votre profil.');
    alert('Le stockage a été nettoyé. Vous pouvez maintenant créer votre profil avec une image.');
  } else {
    console.log('❌ Échec du nettoyage d\'urgence.');
    alert('Impossible de nettoyer le stockage. Veuillez rafraîchir la page et réessayer.');
  }
  
  return success;
};

// Exposer la fonction d'urgence globalement pour les tests
if (typeof window !== 'undefined') {
  window.emergencyCleanup = emergencyCleanup;
  window.showStorageSize = showStorageSize;
}

