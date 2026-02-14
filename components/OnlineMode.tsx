
import React, { useState, useEffect } from 'react';
import { Team } from '../types';
import { geminiService } from '../services/geminiService';

interface OnlineModeProps {
  teams: Team[];
  userTeamId: string;
  onStartMatch: (opponentId: string) => void;
  onBack: () => void;
}

const OnlineMode: React.FC<OnlineModeProps> = ({ teams, userTeamId, onStartMatch, onBack }) => {
  const [status, setStatus] = useState<'LOBBY' | 'SEARCHING' | 'FOUND'>('LOBBY');
  const [chatMessages, setChatMessages] = useState<{user: string, message: string}[]>([]);
  const [opponent, setOpponent] = useState<Team | null>(null);
  const [onlinePlayers, setOnlinePlayers] = useState(14502);

  const userTeam = teams.find(t => t.id === userTeamId)!;

  useEffect(() => {
    // Carregar mensagens iniciais
    geminiService.getOnlineChatMessages().then(setChatMessages);

    // Simular flutuação de players online
    const interval = setInterval(() => {
      setOnlinePlayers(prev => prev + Math.floor(Math.random() * 10) - 5);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const findMatch = () => {
    setStatus('SEARCHING');
    geminiService.speak("Iniciando busca por oponentes... Preparando o servidor Soccer Pro!");
    
    // Simular busca de 4 a 7 segundos
    setTimeout(() => {
      const randomOpponent = teams[Math.floor(Math.random() * teams.length)];
      setOpponent(randomOpponent);
      setStatus('FOUND');
      geminiService.speak(`Oponente encontrado! Você vai enfrentar o ${randomOpponent.name}. Chegou o momento!`);
      
      // Esperar 3 segundos na tela de "Found" antes de iniciar
      setTimeout(() => {
        onStartMatch(randomOpponent.id);
      }, 4000);
    }, 5000);
  };

  return (
    <div className="h-screen bg-slate-950 text-white flex flex-col overflow-hidden font-inter">
      {/* Header Online */}
      <div className="p-6 bg-slate-900 border-b border-sky-500/30 flex justify-between items-center shadow-[0_0_30px_rgba(14,165,233,0.1)]">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors">
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center shadow-[0_0_15px_rgba(14,165,233,0.5)]">
               <i className="fas fa-globe text-white"></i>
             </div>
             <div>
               <h2 className="text-xl font-sport italic uppercase leading-none">SERVER <span className="text-sky-400">GLOBAL</span></h2>
               <div className="text-[10px] text-sky-500 font-bold uppercase tracking-widest flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                 {onlinePlayers.toLocaleString()} Players Online
               </div>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
           <div className="text-right">
             <div className="text-[10px] font-bold text-slate-500 uppercase">Seu Rank</div>
             <div className="text-lg font-sport text-amber-400">OURO III</div>
           </div>
           <div className="h-10 w-px bg-slate-800"></div>
           <div className="flex items-center gap-4 bg-slate-800/50 px-4 py-2 rounded-xl border border-white/5">
             <div className="w-8 h-8 rounded-full" style={{ backgroundColor: userTeam.color }}></div>
             <div className="font-bold text-sm uppercase">{userTeam.name}</div>
           </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Chat e Social */}
        <div className="w-96 bg-slate-900/50 border-r border-white/5 flex flex-col p-6">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Chat da Comunidade</h3>
          <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className="bg-slate-800/40 p-3 rounded-2xl border border-white/5 animate-slide-up">
                <div className="text-[10px] font-black text-sky-400 uppercase mb-1">{msg.user}</div>
                <p className="text-xs text-slate-300 leading-relaxed">{msg.message}</p>
              </div>
            ))}
          </div>
          <div className="relative">
             <input 
               type="text" 
               placeholder="Escreva algo..." 
               className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs outline-none focus:border-sky-500 transition-all"
             />
             <i className="fas fa-paper-plane absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
          </div>
        </div>

        {/* Main Action Area */}
        <div className="flex-1 flex items-center justify-center p-12 relative">
          {status === 'LOBBY' && (
            <div className="text-center max-w-2xl animate-fade-in">
              <div className="mb-12 relative">
                <div className="w-64 h-64 mx-auto bg-sky-500/10 rounded-full flex items-center justify-center border-2 border-sky-500/20 shadow-[0_0_100px_rgba(14,165,233,0.1)]">
                   <i className="fas fa-trophy text-8xl text-sky-500 opacity-20"></i>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                   <div className="text-6xl font-sport italic">TEMPORADA</div>
                   <div className="text-xl font-bold text-sky-400">2026 / 2027</div>
                </div>
              </div>
              
              <h1 className="text-4xl font-sport mb-4 uppercase tracking-tighter">Pronto para a Competição?</h1>
              <p className="text-slate-400 mb-12 leading-relaxed">Suba no ranking global, enfrente os melhores e torne-se uma lenda do SoccerSim. O modo ranqueado está ativo!</p>
              
              <button 
                onClick={findMatch}
                className="group relative bg-sky-600 hover:bg-sky-500 text-white px-16 py-6 rounded-3xl font-black text-2xl transition-all shadow-[0_20px_50px_rgba(14,165,233,0.3)] hover:-translate-y-1"
              >
                <div className="flex items-center gap-4">
                  <i className="fas fa-play text-xl group-hover:scale-110 transition-transform"></i>
                  ENCONTRAR PARTIDA
                </div>
                <div className="absolute -top-3 -right-3 bg-red-500 text-[10px] px-2 py-1 rounded-full animate-bounce">2X XP</div>
              </button>
            </div>
          )}

          {status === 'SEARCHING' && (
            <div className="flex flex-col items-center">
              <div className="relative mb-12">
                <div className="w-64 h-64 rounded-full border-2 border-sky-500/20 flex items-center justify-center">
                  <div className="absolute inset-0 border-t-2 border-sky-500 rounded-full animate-spin"></div>
                  <div className="w-56 h-56 rounded-full border border-sky-500/10 animate-ping"></div>
                  <i className="fas fa-satellite-dish text-5xl text-sky-500 animate-pulse"></i>
                </div>
              </div>
              <h2 className="text-3xl font-sport uppercase tracking-widest italic animate-pulse">Buscando Oponente...</h2>
              <div className="mt-4 flex gap-2">
                <div className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 rounded-full bg-sky-500 animate-bounce"></div>
              </div>
            </div>
          )}

          {status === 'FOUND' && opponent && (
            <div className="text-center animate-bounce-in w-full max-w-4xl">
              <h2 className="text-5xl font-sport italic text-sky-400 mb-16 uppercase tracking-tighter">OPONENTE ENCONTRADO!</h2>
              <div className="flex items-center justify-center gap-20">
                {/* User */}
                <div className="flex flex-col items-center gap-6">
                  <div className="w-48 h-48 bg-slate-800 rounded-[2.5rem] p-8 border-4 border-slate-700 shadow-2xl">
                    <div className="w-full h-full rounded-full flex items-center justify-center" style={{ backgroundColor: userTeam.color }}>
                       <i className="fas fa-user text-5xl text-white"></i>
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold uppercase">{userTeam.name}</div>
                    <div className="text-sky-500 font-sport">RANK: OURO III</div>
                  </div>
                </div>

                <div className="text-6xl font-sport text-slate-700 italic">VS</div>

                {/* Opponent */}
                <div className="flex flex-col items-center gap-6">
                  <div className="w-48 h-48 bg-slate-800 rounded-[2.5rem] p-8 border-4 border-sky-500 shadow-[0_0_40px_rgba(14,165,233,0.4)]">
                    <div className="w-full h-full rounded-full flex items-center justify-center" style={{ backgroundColor: opponent.color }}>
                       <i className="fas fa-user text-5xl text-white"></i>
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold uppercase">{opponent.name}</div>
                    <div className="text-sky-500 font-sport">RANK: OURO II</div>
                  </div>
                </div>
              </div>
              <div className="mt-20 text-slate-500 font-bold uppercase tracking-[0.5em] animate-pulse">Iniciando em 3s...</div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .font-sport { font-family: 'Ubuntu', sans-serif; }
        .animate-slide-up { animation: slideUp 0.5s ease-out; }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-bounce-in { animation: bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
        @keyframes bounceIn { 
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); opacity: 1; }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default OnlineMode;
