
import React, { useState, useRef } from 'react';
import { Team, Player } from '../types';
import { LIGUES } from '../constants';

interface EditorProps {
  teams: Team[];
  onUpdateTeam: (team: Team) => void;
  onAddTeam: (team: Team) => void;
  onDeleteTeam: (teamId: string) => void;
  onBack: () => void;
}

const Editor: React.FC<EditorProps> = ({ teams, onUpdateTeam, onAddTeam, onDeleteTeam, onBack }) => {
  const [selectedLeague, setSelectedLeague] = useState<string>(LIGUES[0]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const playerFileInputRef = useRef<HTMLInputElement>(null);
  const teamLogoInputRef = useRef<HTMLInputElement>(null);

  const filteredTeams = teams.filter(t => t.league === selectedLeague);

  const handleUpdateTeamName = (name: string) => {
    if (!selectedTeam) return;
    const updated = { ...selectedTeam, name };
    setSelectedTeam(updated);
    onUpdateTeam(updated);
  };

  const handleUpdateStadium = (stadium: string) => {
    if (!selectedTeam) return;
    const updated = { ...selectedTeam, stadium };
    setSelectedTeam(updated);
    onUpdateTeam(updated);
  };

  const handleUpdateColor = (color: string) => {
    if (!selectedTeam) return;
    const updated = { ...selectedTeam, color };
    setSelectedTeam(updated);
    onUpdateTeam(updated);
  };

  const handleTeamLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedTeam) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updated = { ...selectedTeam, logoUrl: reader.result as string };
        setSelectedTeam(updated);
        onUpdateTeam(updated);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdatePlayer = (player: Player) => {
    if (!selectedTeam) return;
    const updatedPlayers = selectedTeam.players.map(p => p.id === player.id ? player : p);
    const updated = { ...selectedTeam, players: updatedPlayers };
    setSelectedTeam(updated);
    onUpdateTeam(updated);
    setEditingPlayer(null);
  };

  const handleDeletePlayer = (playerId: string) => {
    if (!selectedTeam) return;
    if (window.confirm("Deseja remover este jogador do elenco? Sim ou Não?")) {
      const updatedPlayers = selectedTeam.players.filter(p => p.id !== playerId);
      const updated = { ...selectedTeam, players: updatedPlayers };
      setSelectedTeam(updated);
      onUpdateTeam(updated);
    }
  };

  const handleDeleteSpecificTeam = (e: React.MouseEvent, teamId: string, teamName: string) => {
    e.stopPropagation();
    if (window.confirm(`Deseja remover o time ${teamName}? Sim ou Não?`)) {
      onDeleteTeam(teamId);
      if (selectedTeam?.id === teamId) {
        setSelectedTeam(null);
      }
    }
  };

  const handleDeleteCurrentTeam = () => {
    if (!selectedTeam) return;
    if (window.confirm("Deseja remover este time? Sim ou Não?")) {
      onDeleteTeam(selectedTeam.id);
      setSelectedTeam(null);
    }
  };

  const handlePlayerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingPlayer) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingPlayer({
          ...editingPlayer,
          photoUrl: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const addNewTeam = () => {
    const name = 'Novo Time';
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: name,
      stadium: 'Novo Estádio',
      color: '#ffffff',
      logoUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
      league: selectedLeague,
      players: [],
      budget: 10000000,
      wins: 0,
      draws: 0,
      losses: 0
    };
    onAddTeam(newTeam);
    setSelectedTeam(newTeam);
  };

  const addPlayer = () => {
    if (!selectedTeam) return;
    const newPlayer: Player = {
      id: `new-${Date.now()}`,
      name: 'Novo Jogador',
      number: 99,
      photoUrl: 'https://i.pravatar.cc/150',
      position: 'FWD',
      overall: 70,
      value: 1000000,
      salary: 5000,
    };
    const updated = { ...selectedTeam, players: [...selectedTeam.players, newPlayer] };
    setSelectedTeam(updated);
    onUpdateTeam(updated);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      {/* Sidebar de Seleção */}
      <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl z-10">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50">
          <button onClick={onBack} className="flex items-center text-emerald-400 hover:text-emerald-300 mb-6 transition-all font-bold text-sm group">
            <i className="fas fa-arrow-left mr-2 group-hover:-translate-x-1 transition-transform"></i> VOLTAR AO MENU
          </button>
          <h2 className="text-2xl font-bold flex items-center gap-2 uppercase tracking-tighter">
            <i className="fas fa-database text-emerald-500"></i> DATAPACK
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block px-2">Liga Selecionada</label>
            <select 
              value={selectedLeague}
              onChange={(e) => {
                setSelectedLeague(e.target.value);
                setSelectedTeam(null);
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
            >
              {LIGUES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3 px-2">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Times ({filteredTeams.length})</label>
               <button onClick={addNewTeam} className="text-[10px] font-black text-emerald-400 hover:text-emerald-300 uppercase tracking-tighter bg-emerald-500/10 px-2 py-1 rounded transition-colors">
                 + ADICIONAR
               </button>
            </div>
            <div className="space-y-1">
              {filteredTeams.map(t => (
                <div key={t.id} className="relative group">
                  <button
                    onClick={() => setSelectedTeam(t)}
                    className={`w-full text-left p-3 rounded-xl text-sm transition-all flex items-center gap-3 pr-10 ${selectedTeam?.id === t.id ? 'bg-emerald-600 shadow-lg translate-x-1' : 'bg-slate-800/40 hover:bg-slate-700'}`}
                  >
                    <img src={t.logoUrl} className="w-6 h-6 rounded-md object-contain bg-white/10 p-0.5" alt="" />
                    <span className={`truncate font-bold ${selectedTeam?.id === t.id ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{t.name}</span>
                  </button>
                  <button
                    onClick={(e) => handleDeleteSpecificTeam(e, t.id, t.name)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg flex items-center justify-center opacity-40 group-hover:opacity-100 transition-all shadow-lg"
                    title="Excluir Time"
                  >
                    <i className="fas fa-trash-alt text-[10px]"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Área Central de Edição */}
      <div className="flex-1 overflow-y-auto bg-slate-950 p-10 relative">
        {selectedTeam ? (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <div className="flex justify-between items-start mb-12 border-b border-slate-800 pb-10">
              <div className="flex items-start gap-8 flex-1">
                <div 
                  className="relative group/logo cursor-pointer w-40 h-40 bg-slate-900 rounded-[2.5rem] border-2 border-slate-800 flex items-center justify-center overflow-hidden hover:border-emerald-500 transition-all shadow-2xl"
                  onClick={() => teamLogoInputRef.current?.click()}
                >
                  <img src={selectedTeam.logoUrl} className="w-full h-full object-contain p-4" alt="Logo" />
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity">
                    <i className="fas fa-camera text-2xl mb-2"></i>
                    <span className="text-[10px] font-black uppercase">Trocar Logo</span>
                  </div>
                  <input type="file" ref={teamLogoInputRef} onChange={handleTeamLogoChange} accept="image/*" className="hidden" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <input
                      type="text"
                      value={selectedTeam.name}
                      onChange={(e) => handleUpdateTeamName(e.target.value)}
                      placeholder="Nome do Time"
                      className="text-6xl font-black bg-transparent border-b-2 border-transparent hover:border-emerald-500/30 focus:border-emerald-500 focus:outline-none transition-all uppercase italic tracking-tighter w-full"
                    />
                    <input 
                      type="color"
                      value={selectedTeam.color}
                      onChange={(e) => handleUpdateColor(e.target.value)}
                      className="w-12 h-12 rounded-full cursor-pointer bg-transparent border-none overflow-hidden shadow-lg"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-4 text-slate-400">
                    <div className="flex items-center gap-3 bg-slate-900 px-6 py-3 rounded-2xl border border-white/5 shadow-inner max-w-md">
                      <i className="fas fa-landmark text-emerald-500"></i>
                      <div className="flex-1">
                        <label className="block text-[8px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Nome do Estádio</label>
                        <input
                          type="text"
                          value={selectedTeam.stadium}
                          onChange={(e) => handleUpdateStadium(e.target.value)}
                          placeholder="Ex: Estádio do Café"
                          className="bg-transparent border-none focus:outline-none font-bold text-sm w-full text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <button onClick={addPlayer} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-xs transition-all shadow-xl flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95">
                  <i className="fas fa-user-plus"></i> ADICIONAR JOGADOR
                </button>
                <button 
                  onClick={handleDeleteCurrentTeam} 
                  className="bg-red-900/20 hover:bg-red-600 text-red-500 hover:text-white px-8 py-4 rounded-2xl font-black text-xs transition-all border border-red-500/20 flex items-center justify-center gap-2 active:scale-95 group shadow-lg"
                >
                  <i className="fas fa-trash-alt group-hover:animate-bounce"></i> APAGAR TIME
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
              {selectedTeam.players.map(p => (
                <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 hover:border-emerald-500/50 transition-all group relative overflow-hidden shadow-xl">
                  <div className="flex gap-5">
                    <img 
                      src={p.photoUrl} 
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-800 bg-slate-800 shadow-lg group-hover:scale-105 transition-transform"
                      onError={(e) => (e.currentTarget.src = 'https://i.pravatar.cc/150')}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded uppercase tracking-widest">{p.position}</span>
                        <span className="text-xl font-sport text-slate-800 italic group-hover:text-emerald-500/20 transition-colors">#{p.number}</span>
                      </div>
                      <h3 className="text-lg font-black truncate uppercase tracking-tight">{p.name}</h3>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${p.overall}%` }}></div>
                        </div>
                        <span className="text-xs font-black text-emerald-400">{p.overall}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute top-4 right-4 flex gap-2 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <button
                      onClick={() => setEditingPlayer(p)}
                      className="w-10 h-10 bg-slate-800 border border-white/5 rounded-full flex items-center justify-center hover:bg-emerald-600 shadow-xl"
                    >
                      <i className="fas fa-edit text-xs"></i>
                    </button>
                    <button
                      onClick={() => handleDeletePlayer(p.id)}
                      className="w-10 h-10 bg-slate-800 border border-white/5 rounded-full flex items-center justify-center hover:bg-red-600 shadow-xl"
                    >
                      <i className="fas fa-trash-alt text-xs text-red-500 hover:text-white"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-700 animate-fade-in px-4 text-center">
            <i className="fas fa-database text-8xl opacity-10 mb-8"></i>
            <h3 className="text-4xl font-black uppercase tracking-tighter italic text-slate-800">Selecione um Clube</h3>
            <p className="mt-4 text-slate-600 font-bold uppercase tracking-[0.2em] text-xs max-w-sm">Use o menu lateral para editar os times ou criar novos projetos.</p>
          </div>
        )}
      </div>

      {editingPlayer && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 w-full max-w-lg p-10 rounded-[3rem] border border-white/10 shadow-3xl animate-bounce-in">
            <div className="flex items-center gap-8 mb-10">
              <div className="relative group/photo cursor-pointer" onClick={() => playerFileInputRef.current?.click()}>
                <img 
                  src={editingPlayer.photoUrl} 
                  className="w-28 h-28 rounded-[2rem] object-cover border-4 border-emerald-500/20 bg-slate-800 group-hover/photo:border-emerald-500 transition-all shadow-2xl"
                  onError={(e) => (e.currentTarget.src = 'https://i.pravatar.cc/150')}
                />
                <div className="absolute inset-0 bg-black/60 rounded-[2rem] opacity-0 group-hover/photo:opacity-100 flex flex-col items-center justify-center transition-opacity">
                  <i className="fas fa-camera text-2xl mb-1"></i>
                  <span className="text-[8px] font-black">TROCAR</span>
                </div>
                <input type="file" ref={playerFileInputRef} className="hidden" accept="image/*" onChange={handlePlayerFileChange} />
              </div>
              <div>
                <h3 className="text-3xl font-black uppercase italic tracking-tighter">Editar Atleta</h3>
                <p className="text-slate-500 uppercase tracking-widest text-[10px] font-black">{selectedTeam?.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-12">
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Nome do Craque</label>
                <input
                  type="text"
                  value={editingPlayer.name}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
                  className="w-full bg-slate-800 border border-white/5 rounded-2xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Número</label>
                <input
                  type="number"
                  value={editingPlayer.number}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, number: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-800 border border-white/5 rounded-2xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Overall</label>
                <input
                  type="number"
                  min="1" max="99"
                  value={editingPlayer.overall}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, overall: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-800 border border-white/5 rounded-2xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setEditingPlayer(null)} className="flex-1 px-6 py-5 bg-slate-800 text-slate-400 rounded-3xl font-black uppercase text-xs">CANCELAR</button>
              <button onClick={() => handleUpdatePlayer(editingPlayer)} className="flex-1 px-6 py-5 bg-emerald-600 rounded-3xl font-black uppercase text-xs shadow-2xl active:scale-95">SALVAR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;
