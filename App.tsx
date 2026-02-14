
import React, { useState, useEffect, useRef } from 'react';
import { GameView, Team, MatchType, Difficulty, Transfer, MatchPhysicsSettings } from './types';
import { INITIAL_TEAMS } from './constants';
import Editor from './components/Editor';
import Match3D from './components/Match3D';
import CareerMode from './components/CareerMode';
import OnlineMode from './components/OnlineMode';
import MatchSettings from './components/MatchSettings';
import LoginMenu from './components/LoginMenu';
import { geminiService } from './services/geminiService';

const SAVE_KEY = 'super_soccer_sim_save_v1_datapack';

const App: React.FC = () => {
  // Alterado de 'MAIN_MENU' para 'LOGIN' para restaurar o menu de entrada
  const [view, setView] = useState<GameView>('LOGIN');
  const [managerName, setManagerName] = useState<string>('TREINADOR');
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [userTeamId, setUserTeamId] = useState<string>(INITIAL_TEAMS[0].id);
  const [opponentId, setOpponentId] = useState<string>(INITIAL_TEAMS[1].id);
  const [activeMatchType, setActiveMatchType] = useState<MatchType>('FRIENDLY');
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Settings States
  const [narrationEnabled, setNarrationEnabled] = useState(true);
  const [stadiumVolume, setStadiumVolume] = useState(0.4);
  const [difficulty, setDifficulty] = useState<Difficulty>('PROFESSIONAL');
  const [simSpeed, setSimSpeed] = useState(1.0);
  const [showPlayerNames, setShowPlayerNames] = useState(true);

  // Physics & AI Settings
  const [matchPhysics, setMatchPhysics] = useState<MatchPhysicsSettings>({
    ballGravity: 0.22,
    ballFriction: 0.988,
    ballBounciness: 0.45,
    aiAggressiveness: 1.0,
    aiPassFrequency: 0.25,
    cameraZoom: 1.0
  });
  
  const [friendlyHomeId, setFriendlyHomeId] = useState<string>(INITIAL_TEAMS[0].id);
  const [friendlyAwayId, setFriendlyAwayId] = useState<string>(INITIAL_TEAMS[1].id);

  useEffect(() => {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.teams && Array.isArray(parsed.teams)) setTeams(parsed.teams);
        if (parsed.managerName) {
          setManagerName(parsed.managerName);
        }
        if (parsed.userTeamId) {
          setUserTeamId(parsed.userTeamId);
          setFriendlyHomeId(parsed.userTeamId);
        }
        if (parsed.stadiumVolume !== undefined) setStadiumVolume(parsed.stadiumVolume);
        if (parsed.difficulty) setDifficulty(parsed.difficulty);
        if (parsed.transfers) setTransfers(parsed.transfers);
        if (parsed.narrationEnabled !== undefined) setNarrationEnabled(parsed.narrationEnabled);
        if (parsed.simSpeed !== undefined) setSimSpeed(parsed.simSpeed);
        if (parsed.showPlayerNames !== undefined) setShowPlayerNames(parsed.showPlayerNames);
        if (parsed.matchPhysics) setMatchPhysics(parsed.matchPhysics);
      } catch (e) {
        console.error("Failed to load saved game state", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const dataToSave = { 
      teams, 
      userTeamId, 
      managerName,
      narrationEnabled, 
      stadiumVolume, 
      difficulty, 
      transfers,
      simSpeed,
      showPlayerNames,
      matchPhysics
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
  }, [teams, userTeamId, managerName, isLoaded, narrationEnabled, stadiumVolume, difficulty, transfers, simSpeed, showPlayerNames, matchPhysics]);

  const handleLogin = (name: string) => {
    setManagerName(name);
    setView('MAIN_MENU');
    if (narrationEnabled) {
      geminiService.speak(`Bem vindo ao Super Soccer Sim, Professor ${name}. O campo te espera para o desafio!`);
    }
  };

  const handleUpdateTeam = (updatedTeam: Team) => {
    setTeams(prev => prev.map(t => t.id === updatedTeam.id ? updatedTeam : t));
  };

  const handleAddTeam = (newTeam: Team) => {
    setTeams(prev => [...prev, newTeam]);
  };

  const handleDeleteTeam = (teamId: string) => {
    if (teams.length <= 1) {
      alert("Atenção: Você não pode deletar o último time do seu Datapack!");
      return;
    }
    const updatedTeams = teams.filter(t => t.id !== teamId);
    setTeams(updatedTeams);
    const nextAvailableId = updatedTeams[0].id;
    const secondAvailableId = updatedTeams[1]?.id || nextAvailableId;
    if (userTeamId === teamId) setUserTeamId(nextAvailableId);
    if (opponentId === teamId) setOpponentId(secondAvailableId);
    if (friendlyHomeId === teamId) setFriendlyHomeId(nextAvailableId);
    if (friendlyAwayId === teamId) setFriendlyAwayId(secondAvailableId);
  };

  const handleRecordTransfer = (transfer: Transfer) => {
    setTransfers(prev => [transfer, ...prev]);
  };

  const handleResetData = () => {
    if (window.confirm("Isso apagará todas as edições do DATAPACK. Continuar?")) {
      localStorage.removeItem(SAVE_KEY);
      window.location.reload();
    }
  };

  const handleExportDataPack = () => {
    const data = JSON.stringify({ teams, userTeamId, managerName, version: '1.0', difficulty, transfers, stadiumVolume, matchPhysics }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `datapack_soccersim.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const startMatch = (homeId: string, oppId: string, type: MatchType) => {
    setUserTeamId(homeId);
    setOpponentId(oppId);
    setActiveMatchType(type);
    setView('MATCH_3D');
  };

  const finishMatch = (homeScore: number, awayScore: number) => {
    if (activeMatchType === 'CAREER') {
      setTeams(prev => prev.map(t => {
        const teamCopy = { ...t };
        if (t.id === userTeamId) {
          if (homeScore > awayScore) teamCopy.wins++;
          else if (homeScore === awayScore) teamCopy.draws++;
          else teamCopy.losses++;
        }
        if (t.id === opponentId) {
          if (awayScore > homeScore) teamCopy.wins++;
          else if (homeScore === awayScore) teamCopy.draws++;
          else teamCopy.losses++;
        }
        return teamCopy;
      }));
      setView('CAREER');
    } else {
      setView('MAIN_MENU');
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="h-screen w-screen overflow-hidden text-white font-inter">
      {view === 'LOGIN' && <LoginMenu onLogin={handleLogin} />}

      {view === 'MAIN_MENU' && (
        <div className="h-full stadium-bg flex flex-col items-center justify-center p-4 relative animate-fade-in">
          <div className="absolute top-10 left-10 flex items-center gap-4 bg-black/40 backdrop-blur-xl p-4 rounded-3xl border border-white/5 shadow-2xl">
             <img 
               src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${managerName}`} 
               className="w-12 h-12 rounded-2xl bg-slate-800"
               alt="Avatar"
             />
             <div>
               <h1 className="text-xl font-sport tracking-tighter leading-none">{managerName.toUpperCase()}</h1>
               <div className="text-[9px] font-black text-emerald-400 tracking-[0.2em] uppercase">MANAGER STATUS: ATIVO</div>
             </div>
          </div>

          <div className="absolute top-10 right-10 flex items-center gap-3">
             <i className="fas fa-futbol text-emerald-500 text-4xl animate-pulse"></i>
             <div>
               <h1 className="text-3xl font-sport tracking-tighter leading-none">SOCCERSIM<span className="text-emerald-500">3D</span></h1>
               <div className="text-[10px] font-black text-slate-400 tracking-[0.3em]">PRO DATAPACK 26/27</div>
             </div>
          </div>

          <div className="text-center mb-12">
            <h2 className="text-8xl font-sport tracking-tighter mb-4 drop-shadow-2xl italic uppercase text-white">
              SOCCER <span className="text-emerald-500">SIM 3D</span>
            </h2>
            <p className="text-slate-300 text-xl max-w-lg mx-auto bg-black/40 backdrop-blur-md py-2 rounded-full border border-white/5">
              Simule a glória eterna • Pro Edition
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl px-4">
            <button
              onClick={() => setView('CAREER')}
              className="bg-emerald-600 hover:bg-emerald-500 p-10 rounded-[2.5rem] flex flex-col items-center gap-4 transition-all group shadow-2xl hover:scale-105 border-b-4 border-emerald-800"
            >
              <i className="fas fa-trophy text-5xl group-hover:animate-bounce"></i>
              <div className="text-2xl font-bold uppercase tracking-widest">Carreira</div>
              <p className="text-xs text-emerald-200/60">Lidere seu time até o topo</p>
            </button>

            <button
              onClick={() => setView('FRIENDLY_SELECT')}
              className="bg-sky-600 hover:bg-sky-500 p-10 rounded-[2.5rem] flex flex-col items-center gap-4 transition-all group shadow-2xl hover:scale-105 border-b-4 border-sky-800"
            >
              <i className="fas fa-bolt text-5xl group-hover:rotate-12 transition-transform"></i>
              <div className="text-2xl font-bold uppercase tracking-widest">Partida Rápida</div>
              <p className="text-xs text-sky-200/60">Amistosos rápidos</p>
            </button>

            <button
              onClick={() => setView('EDITOR')}
              className="bg-slate-800/80 backdrop-blur-xl hover:bg-slate-700 p-10 rounded-[2.5rem] flex flex-col items-center gap-4 transition-all group shadow-2xl hover:scale-105 border border-white/10"
            >
              <i className="fas fa-database text-5xl text-emerald-500"></i>
              <div className="text-2xl font-bold uppercase tracking-widest">DataPack</div>
              <p className="text-xs text-slate-400">Editor de Times e Jogadores</p>
            </button>

            <button
              onClick={() => setView('MATCH_SETTINGS')}
              className="bg-emerald-900/40 hover:bg-emerald-900/60 p-6 rounded-3xl flex items-center justify-center gap-4 transition-all group shadow-xl border border-emerald-500/20"
            >
              <i className="fas fa-sliders-h text-2xl text-emerald-400"></i>
              <div className="font-bold uppercase">Motor de Jogo</div>
            </button>

            <button
              onClick={() => setView('ONLINE')}
              className="bg-sky-900/80 p-6 rounded-3xl flex items-center justify-center gap-4 transition-all group shadow-xl hover:bg-sky-800 border border-sky-500/20"
            >
              <i className="fas fa-globe text-2xl text-sky-400"></i>
              <div className="font-bold uppercase">Modo Online</div>
            </button>

            <button
              onClick={() => setView('SETTINGS')}
              className="bg-slate-900/80 p-6 rounded-3xl flex items-center justify-center gap-4 transition-all group shadow-xl hover:bg-slate-800 border border-white/5"
            >
              <i className="fas fa-cog text-2xl text-slate-400"></i>
              <div className="font-bold uppercase">Configurações</div>
            </button>
          </div>
        </div>
      )}

      {view === 'EDITOR' && (
        <Editor 
          teams={teams} 
          onUpdateTeam={handleUpdateTeam} 
          onAddTeam={handleAddTeam}
          onDeleteTeam={handleDeleteTeam}
          onBack={() => setView('MAIN_MENU')} 
        />
      )}

      {view === 'MATCH_SETTINGS' && (
        <MatchSettings 
          settings={matchPhysics}
          onUpdate={setMatchPhysics}
          onBack={() => setView('MAIN_MENU')}
        />
      )}
      
      {view === 'FRIENDLY_SELECT' && (
        <div className="h-full bg-slate-950 p-10 flex flex-col items-center justify-center overflow-auto animate-fade-in">
          <div className="w-full max-w-5xl">
            <button onClick={() => setView('MAIN_MENU')} className="mb-10 flex items-center text-emerald-400 font-bold uppercase tracking-widest text-sm">
               <i className="fas fa-arrow-left mr-2"></i> Voltar
            </button>
            <h2 className="text-6xl font-sport text-center mb-16 uppercase tracking-tighter italic">SELEÇÃO DE <span className="text-sky-400">CONFRONTO</span></h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-16">
              <div className="space-y-4">
                <label className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Mandante</label>
                <div className="bg-slate-900 p-10 rounded-[3rem] border-2 border-slate-800 hover:border-emerald-500 transition-all shadow-2xl">
                  <select 
                    value={friendlyHomeId}
                    onChange={(e) => setFriendlyHomeId(e.target.value)}
                    className="w-full bg-transparent text-4xl font-black p-2 rounded-xl outline-none"
                  >
                    {teams.map(t => <option key={t.id} value={t.id} className="bg-slate-900 text-lg">{t.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Visitante</label>
                <div className="bg-slate-900 p-10 rounded-[3rem] border-2 border-slate-800 hover:border-sky-500 transition-all shadow-2xl">
                  <select 
                    value={friendlyAwayId}
                    onChange={(e) => setFriendlyAwayId(e.target.value)}
                    className="w-full bg-transparent text-4xl font-black p-2 rounded-xl outline-none"
                  >
                    {teams.map(t => <option key={t.id} value={t.id} className="bg-slate-900 text-lg">{t.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => startMatch(friendlyHomeId, friendlyAwayId, 'FRIENDLY')}
                className="bg-white text-black px-24 py-6 rounded-full font-black text-3xl shadow-2xl transform hover:scale-105 active:scale-95 transition-all flex items-center gap-6"
              >
                <i className="fas fa-play text-emerald-600"></i> INICIAR PARTIDA
              </button>
            </div>
          </div>
        </div>
      )}

      {view === 'ONLINE' && (
        <OnlineMode 
          teams={teams} 
          userTeamId={userTeamId} 
          onStartMatch={(oppId) => startMatch(userTeamId, oppId, 'FRIENDLY')} 
          onBack={() => setView('MAIN_MENU')} 
        />
      )}

      {view === 'MATCH_3D' && (
        <Match3D
          homeTeam={teams.find(t => t.id === userTeamId)!}
          awayTeam={teams.find(t => t.id === opponentId)!}
          difficulty={difficulty}
          stadiumVolume={stadiumVolume}
          onFinish={finishMatch}
          physicsSettings={matchPhysics}
        />
      )}

      {view === 'CAREER' && (
        <CareerMode
          teams={teams}
          transfers={transfers}
          userTeamId={userTeamId}
          onUpdateTeams={setTeams}
          onRecordTransfer={handleRecordTransfer}
          onPlayMatch={(oppId) => startMatch(userTeamId, oppId, 'CAREER')}
          onBack={() => setView('MAIN_MENU')}
        />
      )}

      {view === 'SETTINGS' && (
        <div className="h-full bg-slate-950 p-8 overflow-auto flex items-center justify-center animate-fade-in">
          <div className="max-w-6xl w-full">
            <button onClick={() => setView('MAIN_MENU')} className="mb-8 flex items-center text-emerald-400 font-bold group">
               <i className="fas fa-arrow-left mr-2 group-hover:-translate-x-1 transition-transform"></i> VOLTAR AO MENU
            </button>
            
            <h2 className="text-6xl font-sport italic uppercase tracking-tighter mb-10">SOCCERSIM <span className="text-emerald-500">PRO CONFIG</span></h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-xl shadow-2xl">
                <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-emerald-500 uppercase tracking-widest">
                  <i className="fas fa-gamepad"></i> Jogabilidade
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Dificuldade da IA</label>
                    <div className="flex flex-wrap gap-2">
                      {(['AMATEUR', 'PROFESSIONAL', 'WORLD_CLASS', 'LEGENDARY'] as Difficulty[]).map(d => (
                        <button
                          key={d}
                          onClick={() => setDifficulty(d)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${difficulty === d ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Velocidade da Simulação ({simSpeed.toFixed(1)}x)</label>
                    <input 
                      type="range" min="0.5" max="2.0" step="0.1"
                      value={simSpeed}
                      onChange={(e) => setSimSpeed(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-xl shadow-2xl">
                <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-sky-500 uppercase tracking-widest">
                  <i className="fas fa-volume-up"></i> Áudio e Narração
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm">Narração Gemini</div>
                      <div className="text-[10px] text-slate-500 uppercase">Voz de Dandan Pereira</div>
                    </div>
                    <button 
                      onClick={() => setNarrationEnabled(!narrationEnabled)}
                      className={`w-14 h-7 rounded-full transition-all relative ${narrationEnabled ? 'bg-emerald-600' : 'bg-slate-800'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${narrationEnabled ? 'left-8' : 'left-1'}`}></div>
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Volume Ambiente ({Math.round(stadiumVolume * 100)}%)</label>
                    <input 
                      type="range" min="0" max="1" step="0.05"
                      value={stadiumVolume}
                      onChange={(e) => setStadiumVolume(parseFloat(e.target.value))}
                      className="w-full accent-sky-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-xl shadow-2xl">
                <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-amber-500 uppercase tracking-widest">
                  <i className="fas fa-server"></i> Sistema
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm">Exibir Nomes</div>
                      <div className="text-[10px] text-slate-500 uppercase">Tags sobre jogadores</div>
                    </div>
                    <button 
                      onClick={() => setShowPlayerNames(!showPlayerNames)}
                      className={`w-14 h-7 rounded-full transition-all relative ${showPlayerNames ? 'bg-amber-600' : 'bg-slate-800'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${showPlayerNames ? 'left-8' : 'left-1'}`}></div>
                    </button>
                  </div>

                  <div className="pt-4 grid grid-cols-2 gap-3">
                    <button onClick={handleExportDataPack} className="bg-slate-800 hover:bg-slate-700 text-[10px] font-black uppercase p-3 rounded-xl transition-all border border-white/5">
                      Exportar DataPack
                    </button>
                    <button onClick={handleResetData} className="bg-red-900/20 hover:bg-red-900/40 text-red-500 text-[10px] font-black uppercase p-3 rounded-xl transition-all border border-red-500/20">
                      Resetar Tudo
                    </button>
                  </div>
                </div>
              </div>

            </div>
            
            <div className="mt-10 text-center opacity-30 text-[10px] font-black uppercase tracking-[0.4em]">
              Super Soccer Sim 3D • Versão 1.5.0 • Datapack 26/27 Pro
            </div>
          </div>
        </div>
      )}

      <style>{`
        .animate-fade-in { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default App;
