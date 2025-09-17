import React, { useState } from 'react';
import { useChatContext } from '../../context/ChatContext';
import { useProject } from '../../context/ProjectContext';
import AnalysisPanel from '../trading/AnalysisPanel';
import TradingViewChart from '../trading/TradingViewChart';

const ChatInterface = () => {
  const { messages, sendMessage } = useChatContext();
  const { getCurrentProject } = useProject();
  const [currentInput, setCurrentInput] = useState('');

  const handleSendMessage = async (message) => {
    await sendMessage(message);
  };

  const currentProject = getCurrentProject();
  const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';

  return (
    <div className="flex h-full">
      {/* Chat Section */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-3xl p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
              }`}>
                {message.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(currentInput)}
              placeholder={`Demandez une analyse pour ${currentProject?.name}...`}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
            <button
              onClick={() => handleSendMessage(currentInput)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Envoyer
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Panel */}
      {(currentProject?.id === 'trading' || currentProject?.id === 'crypto') && (
        <div className="w-96 border-l border-gray-200 dark:border-gray-700 p-4">
          <AnalysisPanel currentMessage={lastUserMessage} />
        </div>
      )}
    </div>
  );
};

export default ChatInterface;