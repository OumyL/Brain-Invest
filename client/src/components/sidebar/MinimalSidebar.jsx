import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { TrendingUp, Bitcoin, Briefcase, Newspaper, GraduationCap } from 'lucide-react';

const MinimalSidebar = () => {
  const { projects, currentProject, setCurrentProject } = useProject();
  
  const getIcon = (projectId) => {
    const icons = {
      'trading': <TrendingUp className="h-5 w-5" />,
      'crypto': <Bitcoin className="h-5 w-5" />,
      'portfolio': <Briefcase className="h-5 w-5" />,
      'news': <Newspaper className="h-5 w-5" />,
      'education': <GraduationCap className="h-5 w-5" />
    };
    return icons[projectId] || <TrendingUp className="h-5 w-5" />;
  };

  return (
    <div className="w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          🧠 Brain Invest
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Assistant Trading IA
        </p>
      </div>

      {/* Projects */}
      <div className="p-4">
        <h2 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
          Projets
        </h2>
        <div className="space-y-1">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => setCurrentProject(project.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                currentProject === project.id
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {getIcon(project.id)}
              <div className="text-left">
                <div className="font-medium">{project.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {project.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MinimalSidebar;