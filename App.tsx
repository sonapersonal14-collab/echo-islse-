
import React, { useState } from 'react';
import DocSection from './components/DocSection';
import RhythmGame from './components/RhythmGame';
import { Gamepad2, FileText, Music, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo'>('concept');

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 px-6 shadow-xl relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10 text-center md:text-left flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/10 backdrop-blur-sm rounded-full text-blue-100 text-sm font-bold mb-6 border border-white/20">
              <Sparkles size={16} /> 2D RHYTHM-EXPLORATION ADVENTURE
            </div>
            <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight drop-shadow-lg">
              Echo <span className="text-orange-400">Isles</span>
            </h1>
            <p className="text-xl md:text-2xl font-medium text-blue-100 max-w-2xl leading-relaxed mb-8">
              The world has gone silent. Use your Echo Scanner to trace rhythmic patterns, 
              evade silence spirits, and restore the symphony of the islands.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
               <button 
                  onClick={() => setActiveTab('demo')}
                  className={`px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95 ${activeTab === 'demo' ? 'bg-orange-400 text-white hover:bg-orange-500 ring-4 ring-orange-400/30' : 'bg-white text-blue-700 hover:bg-blue-50'}`}
               >
                 <Gamepad2 size={24} /> Try Interactive Demo
               </button>
               <button 
                  onClick={() => setActiveTab('concept')}
                  className={`px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95 ${activeTab === 'concept' ? 'bg-orange-400 text-white hover:bg-orange-500 ring-4 ring-orange-400/30' : 'bg-white text-blue-700 hover:bg-blue-50'}`}
               >
                 <FileText size={24} /> Full Concept Document
               </button>
            </div>
          </div>

          <div className="w-64 h-64 md:w-96 md:h-96 relative hidden md:block">
            <div className="absolute inset-0 bg-blue-400 rounded-full opacity-20 animate-pulse" />
            <div className="absolute inset-8 bg-blue-300 rounded-full opacity-40 animate-ping" />
            <div className="absolute inset-16 bg-white rounded-full flex items-center justify-center shadow-2xl">
               <Music size={120} className="text-blue-600 animate-bounce" />
            </div>
          </div>
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 transform origin-top-right" />
        <div className="absolute -bottom-10 left-10 w-48 h-48 bg-blue-500 rounded-full blur-3xl opacity-50" />
      </header>

      {/* Main Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto flex justify-center gap-2 p-3">
          <button 
            onClick={() => setActiveTab('concept')}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'concept' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            Game Design Document
          </button>
          <button 
            onClick={() => setActiveTab('demo')}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'demo' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            Prototype Demo
          </button>
        </div>
      </nav>

      {/* Content Area */}
      <main className="max-w-6xl mx-auto mt-12 animate-fadeIn">
        {activeTab === 'concept' ? (
          <DocSection />
        ) : (
          <div className="px-6 flex flex-col items-center">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-slate-800 mb-4">Interactive Concept Prototype</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">
                Test the "Echo Scanner" mechanic. Navigate the island, use 'Q' to pulse and reveal treasures, 
                and avoid the red "Silence Parrots." Hold 'E' to hide from their detection.
              </p>
            </div>
            <RhythmGame />
          </div>
        )}
      </main>

      <footer className="mt-20 border-t border-slate-200 py-10 text-center text-slate-400">
        <p className="font-medium">© 2024 Echo Isles: Rhythm of Treasures. All musical rights restored.</p>
        <p className="text-xs mt-2 uppercase tracking-widest">A Concept Pitch by Horizon Games</p>
      </footer>
    </div>
  );
};

export default App;
