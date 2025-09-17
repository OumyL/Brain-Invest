/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Palette principale basée sur vos pages d'auth
        primary: {
          50: '#f0fdfa',   // Très clair
          100: '#ccfbf1',  // Clair
          200: '#99f6e4',  // 
          300: '#5eead4',  // Teal mint
          400: '#2dd4bf',  // 
          500: '#14b8a6',  // Teal principal
          600: '#0d9488',  // Teal foncé (boutons)
          700: '#0f766e',  // 
          800: '#115e59',  // 
          900: '#134e4a',  // Très foncé
          950: '#042f2e',  // Ultra foncé
        },

        // Couleurs spécifiques Brain Invest
        brain: {
          primary: '#0d9488',    // Teal principal des boutons
          secondary: '#5eead4',  // Teal clair pour les textes
          dark: '#134e4a',       // Couleur de fond sombre
          light: '#f0fdfa',      // Couleur de fond claire
          accent: '#14b8a6',     // Couleur d'accent
        },

        // Backgrounds adaptés
        background: {
          light: '#f8fafc',      // Gris très clair pour mode clair
          dark: '#0f172a',       // Bleu très foncé pour mode sombre
          card: {
            light: '#ffffff',    // Blanc pour cartes en mode clair
            dark: '#1e293b',     // Gris-bleu foncé pour cartes en mode sombre
          }
        },

        // Surfaces et overlays
        surface: {
          light: '#f1f5f9',      // Surface légère
          dark: '#1e293b',       // Surface sombre
          hover: {
            light: '#e2e8f0',    // Hover en mode clair
            dark: '#334155',     // Hover en mode sombre
          }
        },

        // Textes
        text: {
          primary: {
            light: '#0f172a',    // Texte principal clair
            dark: '#f8fafc',     // Texte principal sombre
          },
          secondary: {
            light: '#64748b',    // Texte secondaire clair
            dark: '#94a3b8',     // Texte secondaire sombre
          },
          muted: {
            light: '#94a3b8',    // Texte discret clair
            dark: '#64748b',     // Texte discret sombre
          }
        },

        // Bordures
        border: {
          light: '#e2e8f0',      // Bordure claire
          dark: '#334155',       // Bordure sombre
          focus: '#0d9488',      // Bordure focus (teal)
        },

        // États (success, warning, error)
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        error: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },

        // Couleurs spécifiques aux composants
        sidebar: {
          bg: {
            light: '#ffffff',
            dark: '#111111',
          },
          hover: {
            light: '#f1f5f9',
            dark: '#2a2a2a',
          },
          active: {
            light: '#f0fdfa',
            dark: '#0d2926',      // Vert très sombre pour l'état actif
          }
        },

        chat: {
          user: {
            bg: '#0d9488',       // Fond messages utilisateur (vert teal)
            text: '#ffffff',     // Texte messages utilisateur
          },
          assistant: {
            bg: {
              light: '#ffffff',
              dark: '#111111',   // Noir pour messages assistant
            },
            text: {
              light: '#0f172a',
              dark: '#ffffff',   // Blanc pour texte en mode sombre
            }
          }
        },

        // Trading panel colors
        trading: {
          profit: '#22c55e',     // Vert pour profits
          loss: '#ef4444',       // Rouge pour pertes
          neutral: '#64748b',    // Gris pour neutre
          bg: {
            light: '#f8fafc',
            dark: '#000000',     // Noir pur pour fond trading
          }
        }
      },

      // Gradients personnalisés
      backgroundImage: {
        'auth-light': 'linear-gradient(135deg, #f9fafb 0%, #e0f2fe 50%, #f3f4f6 100%)',
        'auth-dark': 'linear-gradient(135deg, #120228 0%, #1a0d3e 50%, #120228 100%)',
        'brain-gradient': 'linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #2dd4bf 100%)',
        'brain-gradient-dark': 'linear-gradient(135deg, #134e4a 0%, #0f766e 50%, #115e59 100%)',
      },

      // Shadows personnalisées
      boxShadow: {
        'auth': '0 20px 25px -5px rgba(13, 148, 136, 0.1), 0 10px 10px -5px rgba(13, 148, 136, 0.04)',
        'card': '0 4px 6px -1px rgba(13, 148, 136, 0.1), 0 2px 4px -1px rgba(13, 148, 136, 0.06)',
        'elevated': '0 20px 25px -5px rgba(13, 148, 136, 0.1), 0 10px 10px -5px rgba(13, 148, 136, 0.04)',
      },

      // Animation personnalisées
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-teal': 'pulseTeal 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        pulseTeal: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}