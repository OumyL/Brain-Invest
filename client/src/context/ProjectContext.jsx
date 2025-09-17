import React, { createContext, useContext, useState, useCallback } from 'react';

const ProjectContext = createContext();

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

// Alias pour compatibilité avec l'ancien code
export const useProjects = useProject;

export const ProjectProvider = ({ children }) => {
  const [currentProject, setCurrentProject] = useState('trading');
  
  const projects = [
    {
      id: 'general',
      name: 'Général',
      icon: '💬',
      description: 'Conversations générales'
    },
    {
      id: 'trading',
      name: 'Trading Analysis',
      icon: '📈',
      description: 'Analyse technique et fondamentale des marchés'
    },
    {
      id: 'crypto',
      name: 'Cryptocurrency',
      icon: '₿',
      description: 'Analyse et suivi des cryptomonnaies'
    },
    {
      id: 'portfolio',
      name: 'Portfolio Management',
      icon: '💼',
      description: 'Gestion et optimisation de portefeuille'
    },
    {
      id: 'news',
      name: 'Market News',
      icon: '📰',
      description: 'Actualités et sentiment de marché'
    },
    {
      id: 'education',
      name: 'Trading Education',
      icon: '🎓',
      description: 'Formation et ressources pédagogiques'
    }
  ];

  const getCurrentProject = useCallback(() => {
    return projects.find(p => p.id === currentProject) || projects[0];
  }, [currentProject, projects]);

  const setActiveProject = useCallback((projectId) => {
    setCurrentProject(projectId);
  }, []);

  const value = {
    currentProject,
    setCurrentProject,
    setActiveProject, // Alias pour compatibilité
    projects,
    getCurrentProject
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};