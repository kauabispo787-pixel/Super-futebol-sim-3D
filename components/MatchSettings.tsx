
import React from 'react';
import { MatchPhysicsSettings } from '../types';

interface MatchSettingsProps {
  settings: MatchPhysicsSettings;
  onUpdate: (settings: MatchPhysicsSettings) => void;
  onBack: () => void;
}

const MatchSettings: React.FC<MatchSettingsProps> = ({ settings, onUpdate, onBack }) => {
  const updateSetting = (key: keyof MatchPhysicsSettings, value: number) => {
    onUpdate({ ...settings, [key]: value });
  };

  const presets = {
    ARCADE: { ballGravity: 0.15, ballFriction: 0.995, ballBounciness: 0.6, aiAggressiveness: 1.2, aiPassFrequency: 0.4, cameraZoom: 1.1 },
    SIMULATION: { ballGravity: 0.25, ballFriction: 0.98, ballBounciness: 0.4, aiAggressiveness: 0.9, aiPassFrequency: 0.2, cameraZoom: 1.0 },
    CAOS: { ballGravity: 0.05, ballFriction: 1.0, ballBounciness: 0.9, aiAggressiveness: 2.0, aiPassFrequency: 0.8, cameraZoom: 0.8 }
  };

  return (
    <div className="h-full bg-slate-950 p-10 flex flex-col items-center justify-center overflow-auto animate-fade-in">
      <div className="w-full max-w-4xl bg-slate-900/50 backdrop-blur-2xl p-12 rounded-[4rem] border border-white/5 shadow-3xl">
        <button onClick={onBack} className="mb-8 flex items-center text-emerald-400 font-bold uppercase tracking-widest text-sm group">
          <i className="fas fa-arrow-left mr-2 group-hover:-translate-x-1 transition-transform"></i> Voltar ao Menu
        </button>

        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-6xl font-sport italic uppercase tracking-tighter mb-2">MOTOR DE <span className="text-emerald-500">JOGO</span></h2>
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Ajuste a física e o comportamento da IA em tempo real</p>
          </div>
          <div className="flex gap-2">
            {Object.entries(presets).map(([name, vals]) => (
              <button
                key={name}
                onClick={() => onUpdate({ ...vals })}
                className="bg-slate-800 hover:bg-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black transition-all"
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Física da Bola */}
          <div className="space-y-8">
            <h3 className="text-emerald-500 font-black uppercase tracking-widest text-xs flex items-center gap-3">
              <i className="fas fa-volleyball-ball"></i> FÍSICA DA BOLA
            </h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Gravidade</label>
                  <span className="text-xs text-emerald-400 font-mono">{settings.ballGravity.toFixed(2)}</span>
                </div>
                <input type="range" min="0.05" max="0.5" step="0.01" value={settings.ballGravity} onChange={(e) => updateSetting('ballGravity', parseFloat(e.target.value))} className="w-full accent-emerald-500" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Atrito (Deslize)</label>
                  <span className="text-xs text-emerald-400 font-mono">{settings.ballFriction.toFixed(3)}</span>
                </div>
                <input type="range" min="0.95" max="1.0" step="0.001" value={settings.ballFriction} onChange={(e) => updateSetting('ballFriction', parseFloat(e.target.value))} className="w-full accent-emerald-500" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Elasticidade (Quique)</label>
                  <span className="text-xs text-emerald-400 font-mono">{settings.ballBounciness.toFixed(2)}</span>
                </div>
                <input type="range" min="0.1" max="0.9" step="0.05" value={settings.ballBounciness} onChange={(e) => updateSetting('ballBounciness', parseFloat(e.target.value))} className="w-full accent-emerald-500" />
              </div>
            </div>
          </div>

          {/* Comportamento IA e Câmera */}
          <div className="space-y-8">
            <h3 className="text-sky-500 font-black uppercase tracking-widest text-xs flex items-center gap-3">
              <i className="fas fa-brain"></i> INTELIGÊNCIA E CÂMERA
            </h3>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Agressividade IA</label>
                  <span className="text-xs text-sky-400 font-mono">{settings.aiAggressiveness.toFixed(1)}x</span>
                </div>
                <input type="range" min="0.5" max="2.0" step="0.1" value={settings.aiAggressiveness} onChange={(e) => updateSetting('aiAggressiveness', parseFloat(e.target.value))} className="w-full accent-sky-500" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Frequência de Passes</label>
                  <span className="text-xs text-sky-400 font-mono">{Math.round(settings.aiPassFrequency * 100)}%</span>
                </div>
                <input type="range" min="0.05" max="0.9" step="0.05" value={settings.aiPassFrequency} onChange={(e) => updateSetting('aiPassFrequency', parseFloat(e.target.value))} className="w-full accent-sky-500" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Zoom da Câmera</label>
                  <span className="text-xs text-sky-400 font-mono">{settings.cameraZoom.toFixed(1)}x</span>
                </div>
                <input type="range" min="0.5" max="1.5" step="0.1" value={settings.cameraZoom} onChange={(e) => updateSetting('cameraZoom', parseFloat(e.target.value))} className="w-full accent-sky-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex justify-center">
           <div className="text-[10px] font-black text-slate-700 uppercase tracking-[0.5em]">Simulation Engine v1.2</div>
        </div>
      </div>
    </div>
  );
};

export default MatchSettings;
