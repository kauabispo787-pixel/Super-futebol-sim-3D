
import React, { useState } from 'react';
import { Team, Player, CareerState, Transfer } from '../types';

interface CareerModeProps {
  teams: Team[];
  transfers: Transfer[];
  userTeamId: string;
  onUpdateTeams: (teams: Team[]) => void;
  onRecordTransfer: (transfer: Transfer) => void;
  onPlayMatch: (opponentId: string) => void;
  onBack: () => void;
}

const CareerMode: React.FC<CareerModeProps> = ({ teams, transfers, userTeamId, onUpdateTeams, onRecordTransfer, onPlayMatch, onBack }) => {
  const userTeam = teams.find(t => t.id === userTeamId)!;
  const [activeTab, setActiveTab] = useState<'HOME' | 'TRANSFERS' | 'TABLE' | 'HISTORY'>('HOME');

  const leagueTable = [...teams].sort((a, b) => (b.wins * 3 + b.draws) - (a.wins * 3 + a.draws));

  const handleBuyPlayer = (sellerTeamId: string, player: Player) => {
    if (userTeam.budget < player.value) {
      alert("Orçamento insuficiente!");
      return;
    }

    const sellerTeam = teams.find(t => t.id === sellerTeamId)!;

    const newTransfer: Transfer = {
      id: `tr-${Date.now()}`,
      playerName: player.name,
      playerPhoto: player.photoUrl,
      fromTeamName: sellerTeam.name,
      toTeamName: userTeam.name,
      value: player.value,
      timestamp: Date.now()
    };

    const newTeams = teams.map(t => {
      if (t.id === userTeamId) {
        return {
          ...t,
          budget: t.budget - player.value,
          players: [...t.players, player]
        };
      }
      if (t.id === sellerTeamId) {
        return {
          ...t,
          budget: t.budget + player.value,
          players: t.players.filter(p => p.id !== player.id)
        };
      }
      return t;
    });

    onUpdateTeams(newTeams);
    onRecordTransfer(newTransfer);
    alert(`${player.name} contratado com sucesso!`);
  };

  return (
    <div className="flex h-screen bg-slate-900 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 p-6 flex flex-col border-r border-white/5">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded bg-emerald-500 flex items-center justify-center font-bold text-xl shadow-lg">
            {userTeam.name[0]}
          </div>
          <div>
            <div className="font-bold truncate w-32">{userTeam.name}</div>
            <div className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">MODO CARREIRA</div>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setActiveTab('HOME')}
            className={`w-full text-left p-4 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'HOME' ? 'bg-emerald-600 shadow-lg translate-x-1' : 'hover:bg-slate-700/50'}`}
          >
            <i className="fas fa-home"></i> <span className="text-sm font-bold">Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('TRANSFERS')}
            className={`w-full text-left p-4 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'TRANSFERS' ? 'bg-emerald-600 shadow-lg translate-x-1' : 'hover:bg-slate-700/50'}`}
          >
            <i className="fas fa-exchange-alt"></i> <span className="text-sm font-bold">Mercado</span>
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`w-full text-left p-4 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'HISTORY' ? 'bg-emerald-600 shadow-lg translate-x-1' : 'hover:bg-slate-700/50'}`}
          >
            <i className="fas fa-history"></i> <span className="text-sm font-bold">Histórico</span>
          </button>
          <button
            onClick={() => setActiveTab('TABLE')}
            className={`w-full text-left p-4 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'TABLE' ? 'bg-emerald-600 shadow-lg translate-x-1' : 'hover:bg-slate-700/50'}`}
          >
            <i className="fas fa-list-ol"></i> <span className="text-sm font-bold">Classificação</span>
          </button>
        </nav>

        <button onClick={onBack} className="mt-auto p-4 text-slate-400 hover:text-white flex items-center gap-3 group transition-colors">
          <i className="fas fa-sign-out-alt group-hover:-translate-x-1 transition-transform"></i> <span className="text-sm font-bold">Sair do Modo</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-12 overflow-auto bg-slate-900">
        {activeTab === 'HOME' && (
          <div className="space-y-10 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-800 p-8 rounded-3xl border border-white/5 shadow-xl">
                <div className="text-slate-500 text-[10px] font-black mb-1 uppercase tracking-widest">Orçamento Total</div>
                <div className="text-4xl font-sport text-emerald-400">R$ {(userTeam.budget / 1000000).toFixed(1)}M</div>
              </div>
              <div className="bg-slate-800 p-8 rounded-3xl border border-white/5 shadow-xl">
                <div className="text-slate-500 text-[10px] font-black mb-1 uppercase tracking-widest">Vitórias</div>
                <div className="text-4xl font-sport">{userTeam.wins}</div>
              </div>
              <div className="bg-slate-800 p-8 rounded-3xl border border-white/5 shadow-xl">
                <div className="text-slate-500 text-[10px] font-black mb-1 uppercase tracking-widest">Elenco Ativo</div>
                <div className="text-4xl font-sport text-sky-400">{userTeam.players.length}</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-600/30 to-emerald-900/10 border border-emerald-500/30 p-10 rounded-[3rem] relative overflow-hidden group shadow-2xl">
              <div className="relative z-10">
                <div className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.5em] mb-4">Próximo Desafio</div>
                <h3 className="text-5xl font-sport italic uppercase mb-4 tracking-tighter">PARTIDA DECISIVA</h3>
                <p className="text-slate-300 mb-10 max-w-lg leading-relaxed text-lg">Mantenha o foco. O adversário virá com tudo, mas a sua tática é superior. Vitória é a única opção!</p>
                <button
                  onClick={() => onPlayMatch(teams.find(t => t.id !== userTeamId)!.id)}
                  className="bg-white text-black px-12 py-5 rounded-2xl font-black text-xl shadow-2xl transform hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
                >
                  <i className="fas fa-play text-emerald-600"></i> ENTRAR EM CAMPO
                </button>
              </div>
              <i className="fas fa-futbol absolute -right-10 -bottom-10 text-[18rem] text-emerald-500/5 rotate-12 transition-transform group-hover:rotate-45 duration-1000"></i>
            </div>
          </div>
        )}

        {activeTab === 'HISTORY' && (
          <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
            <div className="flex justify-between items-end mb-6">
               <div>
                 <h2 className="text-5xl font-sport italic uppercase tracking-tighter">MOVIMENTAÇÕES <span className="text-emerald-500">RECENTES</span></h2>
                 <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Histórico completo de negociações da temporada</p>
               </div>
               <div className="bg-slate-800/50 px-6 py-2 rounded-xl border border-white/5">
                 <span className="text-[10px] font-black text-slate-500 uppercase mr-2">Total:</span>
                 <span className="font-bold">{transfers.length} Negócios</span>
               </div>
            </div>

            {transfers.length === 0 ? (
              <div className="bg-slate-800/30 border border-white/5 rounded-[2rem] p-20 text-center">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-exchange-alt text-3xl text-slate-600"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-400">Nenhuma transferência realizada ainda</h3>
                <p className="text-slate-600 mt-2 text-sm">Vá ao Mercado da Bola para contratar novos craques.</p>
              </div>
            ) : (
              <div className="bg-slate-800/50 rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-800 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <th className="p-6">Jogador</th>
                      <th className="p-6">Origem</th>
                      <th className="p-6"></th>
                      <th className="p-6">Destino</th>
                      <th className="p-6 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transfers.map((tr) => (
                      <tr key={tr.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <img src={tr.playerPhoto} className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 group-hover:scale-110 transition-transform" alt="" />
                            <span className="font-bold text-lg">{tr.playerName}</span>
                          </div>
                        </td>
                        <td className="p-6">
                          <span className="text-slate-400 font-bold">{tr.fromTeamName}</span>
                        </td>
                        <td className="p-6 text-center">
                          <i className="fas fa-arrow-right text-emerald-500"></i>
                        </td>
                        <td className="p-6">
                          <span className="text-emerald-400 font-bold">{tr.toTeamName}</span>
                        </td>
                        <td className="p-6 text-right">
                          <span className="text-xl font-sport text-white">R$ {(tr.value / 1000000).toFixed(1)}M</span>
                          <div className="text-[9px] text-slate-600 font-black uppercase tracking-tighter mt-1">{new Date(tr.timestamp).toLocaleString()}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'TABLE' && (
          <div className="max-w-5xl mx-auto animate-fade-in">
            <h2 className="text-5xl font-sport italic uppercase tracking-tighter mb-10">CLASSIFICAÇÃO <span className="text-sky-500">GERAL</span></h2>
            <div className="bg-slate-800/50 rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-800 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <th className="p-6">Posição</th>
                    <th className="p-6">Time</th>
                    <th className="p-6 text-center">PONTOS</th>
                    <th className="p-6 text-center">VIT</th>
                    <th className="p-6 text-center">EMP</th>
                    <th className="p-6 text-center">DER</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {leagueTable.map((t, i) => (
                    <tr key={t.id} className={`group transition-colors ${t.id === userTeamId ? 'bg-emerald-500/10' : 'hover:bg-white/[0.02]'}`}>
                      <td className="p-6">
                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${i < 4 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-900 text-slate-500'}`}>
                           {i + 1}
                         </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: t.color }}></div>
                          <span className="font-bold text-lg group-hover:translate-x-1 transition-transform">{t.name}</span>
                        </div>
                      </td>
                      <td className="p-6 text-center text-2xl font-sport text-white">{t.wins * 3 + t.draws}</td>
                      <td className="p-6 text-center font-bold text-slate-400">{t.wins}</td>
                      <td className="p-6 text-center font-bold text-slate-500">{t.draws}</td>
                      <td className="p-6 text-center font-bold text-red-900/40">{t.losses}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'TRANSFERS' && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <div className="flex justify-between items-end mb-12">
               <div>
                 <h2 className="text-5xl font-sport italic uppercase tracking-tighter">MERCADO DA <span className="text-emerald-500">BOLA</span></h2>
                 <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Invista no seu elenco para dominar a liga</p>
               </div>
               <div className="text-right">
                 <div className="text-[10px] font-black text-slate-500 uppercase mb-1">Seu Saldo</div>
                 <div className="text-3xl font-sport text-emerald-400">R$ {(userTeam.budget / 1000000).toFixed(1)}M</div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {teams.filter(t => t.id !== userTeamId).map(t => (
                <div key={t.id} className="bg-slate-800/50 p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full shadow-lg" style={{ backgroundColor: t.color }}></div>
                    {t.name}
                  </h3>
                  <div className="space-y-4">
                    {t.players.slice(0, 5).map(p => (
                      <div key={p.id} className="flex justify-between items-center bg-slate-900/60 p-4 rounded-2xl border border-white/5 hover:border-emerald-500/50 transition-all group">
                        <div className="flex items-center gap-4">
                          <img src={p.photoUrl} className="w-12 h-12 rounded-xl border border-white/10" alt="" />
                          <div>
                            <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{p.position} • OVR {p.overall}</div>
                            <div className="font-bold text-lg">{p.name}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-sport text-white mb-2">R$ {(p.value / 1000000).toFixed(1)}M</div>
                          <button
                            onClick={() => handleBuyPlayer(t.id, p)}
                            className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-emerald-900/20 active:scale-95 transition-all"
                          >
                            CONTRATAR
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerMode;
