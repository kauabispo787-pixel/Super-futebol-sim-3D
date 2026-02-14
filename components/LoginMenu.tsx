
import React, { useState } from 'react';

interface LoginMenuProps {
  onLogin: (name: string) => void;
}

const LoginMenu: React.FC<LoginMenuProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsLoggingIn(true);
    // Simular carregamento de perfil
    setTimeout(() => {
      onLogin(name);
    }, 1500);
  };

  return (
    <div className="h-screen w-screen stadium-bg flex items-center justify-center p-6 overflow-hidden">
      <div className="max-w-md w-full bg-slate-900/40 backdrop-blur-3xl p-12 rounded-[4rem] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] animate-bounce-in relative">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl rotate-12">
          <i className="fas fa-user-tie text-4xl text-white"></i>
        </div>

        <div className="text-center mt-6 mb-12">
          <h1 className="text-4xl font-sport italic tracking-tighter uppercase mb-2">MANAGER <span className="text-emerald-500">LOGIN</span></h1>
          <p className="text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase">Acesse seu DataPack 26/27</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Nome do Treinador</label>
            <div className="relative group">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Prof. Tite"
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 px-6 outline-none focus:border-emerald-500 transition-all font-bold text-lg text-white"
              />
              <i className="fas fa-signature absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors"></i>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name || 'default'}`} 
              className="w-12 h-12 rounded-xl bg-slate-800"
              alt="Avatar"
            />
            <div className="text-[10px] font-bold text-slate-400 leading-tight uppercase">
              Seu perfil será <br/> vinculado ao <span className="text-emerald-500">Global ID</span>
            </div>
          </div>

          <button
            disabled={isLoggingIn || !name.trim()}
            className={`w-full py-6 rounded-3xl font-black text-xl uppercase tracking-widest transition-all shadow-2xl flex items-center justify-center gap-4 ${
              isLoggingIn 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
              : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
            }`}
          >
            {isLoggingIn ? (
              <>
                <i className="fas fa-circle-notch animate-spin"></i> CARREGANDO...
              </>
            ) : (
              <>
                ENTRAR NO JOGO <i className="fas fa-arrow-right"></i>
              </>
            )}
          </button>
        </form>

        <div className="mt-12 text-center">
          <div className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">Super Soccer Sim 3D Engine v1.5</div>
        </div>
      </div>

      <style>{`
        .animate-bounce-in { animation: bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
        @keyframes bounceIn { 
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); opacity: 1; }
          70% { transform: scale(0.95); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default LoginMenu;
