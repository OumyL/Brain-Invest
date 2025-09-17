/**
 * Utilitaires pour la gestion des images
 */

/**
 * Compresse une image en réduisant sa qualité et/ou taille
 * @param {File} file - Le fichier image
 * @param {Object} options - Options de compression
 * @returns {Promise<string>} - L'image compressée en base64
 */
export const compressImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 300,
      maxHeight = 300,
      quality = 0.7,
      outputFormat = 'image/jpeg'
    } = options;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculer les nouvelles dimensions en conservant le ratio
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      // Redimensionner le canvas
      canvas.width = width;
      canvas.height = height;

      // Dessiner l'image redimensionnée
      ctx.drawImage(img, 0, 0, width, height);

      // Convertir en base64 avec compression
      try {
        const compressedDataUrl = canvas.toDataURL(outputFormat, quality);
        resolve(compressedDataUrl);
      } catch (error) {
        reject(new Error('Erreur lors de la compression de l\'image'));
      }
    };

    img.onerror = () => {
      reject(new Error('Erreur lors du chargement de l\'image'));
    };

    // Charger l'image
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'));
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Vérifie l'espace disponible dans le localStorage
 * @returns {Object} - Informations sur l'espace de stockage
 */
export const checkStorageSpace = () => {
  const test = 'test';
  let totalSize = 0;
  
  // Calculer la taille actuelle du localStorage
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      totalSize += localStorage[key].length + key.length;
    }
  }

  // Tester l'espace disponible (approximatif)
  try {
    let testData = '';
    let availableSpace = 0;
    
    // Test progressif pour estimer l'espace disponible
    for (let i = 0; i < 1000; i++) {
      testData += '0123456789';
      try {
        localStorage.setItem('__test__', testData);
        availableSpace = testData.length;
      } catch (e) {
        break;
      }
    }
    
    // Nettoyer
    localStorage.removeItem('__test__');
    
    return {
      used: totalSize,
      available: availableSpace,
      total: totalSize + availableSpace,
      usedPercent: Math.round((totalSize / (totalSize + availableSpace)) * 100)
    };
  } catch (e) {
    return {
      used: totalSize,
      available: 0,
      total: totalSize,
      usedPercent: 100
    };
  }
};

/**
 * Vérifie si une données peut être stockée sans dépasser le quota
 * @param {string} data - Les données à stocker
 * @returns {boolean} - True si l'espace est suffisant
 */
export const canStore = (data) => {
  try {
    const testKey = '__storage_test__' + Date.now();
    localStorage.setItem(testKey, data);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Nettoie les anciennes données pour libérer de l'espace
 */
export const cleanupStorage = () => {
  try {
    // Supprimer les anciennes conversations si elles existent
    const conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
    if (conversations.length > 10) {
      // Garder seulement les 10 dernières conversations
      const recentConversations = conversations.slice(-10);
      localStorage.setItem('conversations', JSON.stringify(recentConversations));
    }
    
    // Supprimer les clés temporaires
    for (let key in localStorage) {
      if (key.startsWith('__temp__') || key.startsWith('__test__')) {
        localStorage.removeItem(key);
      }
    }
    
    return true;
  } catch (e) {
    console.error('Erreur lors du nettoyage du storage:', e);
    return false;
  }
};

/**
 * Affiche les informations de stockage pour le débogage
 */
export const logStorageInfo = () => {
  const info = checkStorageSpace();
  console.log('📊 Informations de stockage:');
  console.log(`Utilisé: ${(info.used / 1024).toFixed(2)} KB (${info.usedPercent}%)`);
  console.log(`Disponible: ${(info.available / 1024).toFixed(2)} KB`);
  console.log(`Total: ${(info.total / 1024).toFixed(2)} KB`);
};

