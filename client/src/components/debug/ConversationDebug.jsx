// src/components/debug/ConversationDebug.jsx - Composant temporaire pour débugger
import React, { useState } from 'react';
import { useChatContext } from '../../context/ChatContext';

const ConversationDebug = () => {
  const { getDiagnosticInfo, clearAllLocalData, currentUser } = useChatContext();
  const [diagnosticInfo, setDiagnosticInfo] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const runDiagnostic = () => {
    const info = getDiagnosticInfo();
    setDiagnosticInfo(info);
    console.log('Debug Info:', info);
  };

  const testUserIsolation = async () => {
    // Simuler un changement d'utilisateur pour tester l'isolation
    const fakeUser = {
      id: 999,
      email: 'test@example.com',
      firstName: 'Test'
    };
    
    localStorage.setItem('brain_invest_user', JSON.stringify(fakeUser));
    localStorage.setItem('brain_invest_last_user_id', '999');
    
    console.log('Simulated user change - reload to see effect');
    alert('Utilisateur simulé changé. Rechargez la page pour voir l\'effet.');
  };

  const clearAllData = () => {
    if (window.confirm('Voulez-vous vraiment supprimer toutes les données locales ?')) {
      clearAllLocalData();
      localStorage.clear();
      alert('Toutes les données ont été supprimées');
      window.location.reload();
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null; // Ne pas afficher en production
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'white',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      padding: '12px',
      fontSize: '12px',
      maxWidth: '350px',
      maxHeight: '400px',
      overflow: 'auto',
      zIndex: 9999,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      fontFamily: 'monospace'
    }}>
      <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '8px' }}>
        <h4 style={{ margin: 0, color: '#1a202c' }}>Debug Conversations</h4>
        <button 
          onClick={() => setIsVisible(!isVisible)}
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          {isVisible ? '−' : '+'}
        </button>
      </div>

      {isVisible && (
        <div>
          <div style={{ marginBottom: '12px', padding: '8px', background: '#f7fafc', borderRadius: '4px' }}>
            <strong>Utilisateur actuel:</strong><br/>
            {currentUser ? (
              <>
                ID: {currentUser.id}<br/>
                Email: {currentUser.email}<br/>
                Nom: {currentUser.firstName}
              </>
            ) : (
              <span style={{ color: '#e53e3e' }}>Aucun utilisateur</span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
            <button 
              onClick={runDiagnostic}
              style={{
                padding: '6px 12px',
                background: '#4299e1',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              📊 Diagnostic
            </button>

            <button 
              onClick={testUserIsolation}
              style={{
                padding: '6px 12px',
                background: '#ed8936',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              🔄 Test Changement User
            </button>

            <button 
              onClick={clearAllData}
              style={{
                padding: '6px 12px',
                background: '#e53e3e',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              🧹 Clear All Data
            </button>
          </div>

          {diagnosticInfo && (
            <div style={{ 
              background: '#1a202c', 
              color: '#e2e8f0', 
              padding: '8px', 
              borderRadius: '4px',
              fontSize: '10px',
              maxHeight: '200px',
              overflow: 'auto'
            }}>
              <strong>Diagnostic:</strong>
              <pre style={{ margin: '4px 0', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(diagnosticInfo, null, 2)}
              </pre>
            </div>
          )}

          <div style={{ marginTop: '8px', fontSize: '10px', color: '#718096' }}>
            <strong>LocalStorage Keys:</strong><br/>
            {Object.keys(localStorage)
              .filter(key => key.includes('brain_invest') || key.includes('conversation'))
              .map(key => (
                <div key={key} style={{ marginLeft: '8px' }}>
                  • {key}
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationDebug;