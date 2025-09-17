import React from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';

const Avatar = ({ role = 'assistant' }) => {
  const { isDark } = React.useContext(ThemeContext);
  const { currentUser } = useUser();

  if (role === 'user') {
    // Si l'utilisateur a une photo de profil, l'utiliser
    if (currentUser?.profilePicture) {
      return (
        <div className="flex-shrink-0 rounded-full h-10 w-10 shadow-lg transition-transform duration-200 hover:scale-105 overflow-hidden border-2 border-brand-blue">
          <img 
            src={currentUser.profilePicture}
            alt={`${currentUser.firstName || 'Utilisateur'}`}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }
    
    // Avatar par dÃ©faut si pas de photo
    return (
      <div className="flex-shrink-0 bg-gradient-to-br from-brand-blue to-blue-500 rounded-full h-10 w-10 flex items-center justify-center text-white font-medium shadow-lg transition-transform duration-200 hover:scale-105">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      </div>
    );
  }
  
  // Avatar pour ComNect avec icÃ´ne personnalisÃ©e
  // Utilise l'icÃ´ne selon le thÃ¨me (clair/sombre)
  const botIconSrc = isDark ? '/images/bot-avatar-d.png' : '/images/bot-avatar-l.png';
  
  return (
    <div className="flex-shrink-0 bg-white rounded-full h-10 w-10 flex items-center justify-center text-gray-800 font-bold shadow-lg transition-transform duration-200 hover:scale-105 overflow-hidden border-2 border-gray-200">
      <img 
        src={botIconSrc}
        alt="ComNect Bot" 
        className="w-8 h-8 object-contain"
        onError={(e) => {
          // Si l'image ne charge pas, afficher la lettre B en fallback
          e.target.style.display = 'none';
          e.target.nextElementSibling.style.display = 'block';
        }} 
      />
      <span 
        className="text-sm tracking-tight"
        style={{display: 'none'}}
      >
        B
      </span>
    </div>
  );
};

export default Avatar;