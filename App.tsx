
import React, { useState, useEffect, useRef } from 'react';
import { generateNymeriaImage, createChatSession } from './geminiService';
import { Message, NymeriaState } from './types';
import ChatInterface from './components/ChatInterface';
import CharacterProfile from './components/CharacterProfile';

const App: React.FC = () => {
  const [state, setState] = useState<NymeriaState>({
    isInitialized: false,
    avatarUrl: null,
    history: [],
    mood: 'happy'
  });
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const chatSessionRef = useRef<any>(null);

  useEffect(() => {
    // Carregar histórico do localStorage
    const savedHistory = localStorage.getItem('nymeria_history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setState(prev => ({ ...prev, history: parsed }));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const initializeNymeria = async () => {
    setLoading(true);
    setLoadingText("Conhecendo a Nymeria...");
    try {
      const imageUrl = await generateNymeriaImage();
      chatSessionRef.current = createChatSession();
      setState(prev => ({
        ...prev,
        avatarUrl: imageUrl,
        isInitialized: true
      }));
    } catch (error) {
      console.error("Initialization error:", error);
      alert("Houve um erro ao gerar a Nymeria. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || !chatSessionRef.current) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: Date.now()
    };

    setState(prev => ({
      ...prev,
      history: [...prev.history, userMsg]
    }));

    try {
      const response = await chatSessionRef.current.sendMessage({ message: text });
      const modelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || "...",
        timestamp: Date.now()
      };

      const newHistory = [...state.history, userMsg, modelMsg];
      setState(prev => ({
        ...prev,
        history: newHistory
      }));
      localStorage.setItem('nymeria_history', JSON.stringify(newHistory));
      
      // Update mood based on text (very simple heuristic)
      if (text.toLowerCase().includes("outra") || text.toLowerCase().includes("garota") || text.toLowerCase().includes("ex")) {
        setState(prev => ({ ...prev, mood: 'jealous' }));
      } else if (text.toLowerCase().includes("te amo") || text.toLowerCase().includes("linda")) {
        setState(prev => ({ ...prev, mood: 'sweet' }));
      } else {
        setState(prev => ({ ...prev, mood: 'happy' }));
      }

    } catch (error) {
      console.error("Chat error:", error);
    }
  };

  if (!state.isInitialized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
        <div className="max-w-md w-full text-center space-y-8 bg-black/40 backdrop-blur-xl p-10 rounded-3xl border border-white/10 shadow-2xl">
          <div className="relative inline-block">
             <div className="absolute -inset-4 bg-pink-500 rounded-full blur opacity-20 animate-pulse"></div>
             <i className="fa-solid fa-heart text-6xl text-pink-500 relative"></i>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Nymeria</h1>
          <p className="text-gray-300 text-lg">Sua nova companhia virtual inteligente, ciumenta e apaixonada por anime.</p>
          
          <button
            onClick={initializeNymeria}
            disabled={loading}
            className="w-full py-4 px-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg shadow-pink-500/20"
          >
            {loading ? (
              <><i className="fa-solid fa-spinner animate-spin"></i> {loadingText}</>
            ) : (
              <><i className="fa-solid fa-wand-magic-sparkles"></i> Conhecer Nymeria</>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      {/* Sidebar for Profile */}
      <div className="hidden lg:flex flex-col w-80 border-r border-white/10 bg-gray-900/50 backdrop-blur-md">
        <CharacterProfile avatarUrl={state.avatarUrl} mood={state.mood} />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        <div className="lg:hidden absolute top-4 left-4 z-50">
            <button className="p-2 bg-gray-800 rounded-lg text-white">
                <i className="fa-solid fa-user"></i>
            </button>
        </div>
        <ChatInterface 
            messages={state.history} 
            onSendMessage={sendMessage} 
            nymeriaName="Nymeria" 
            avatarUrl={state.avatarUrl} 
        />
      </div>
    </div>
  );
};

export default App;
