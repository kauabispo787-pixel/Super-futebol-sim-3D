
import React, { useEffect, useState, useRef } from 'react';
import { Team, MatchEvent, Player, Difficulty, MatchPhysicsSettings } from '../types';
import { geminiService } from '../services/geminiService';

interface Match3DProps {
  homeTeam: Team;
  awayTeam: Team;
  difficulty: Difficulty;
  stadiumVolume: number;
  onFinish: (homeScore: number, awayScore: number) => void;
  physicsSettings: MatchPhysicsSettings;
}

interface SimPlayer {
  id: string;
  name: string;
  lastName: string;
  team: 'HOME' | 'AWAY';
  role: 'GK' | 'DEF' | 'MID' | 'FWD';
  x: number;
  y: number;
  vx: number;
  vy: number;
  homeX: number;
  homeY: number;
  color: string;
  overall: number;
  lastDecisionTime: number;
  formationSlot: number;
}

type MatchPeriod = 'FIRST_HALF' | 'HALFTIME' | 'SECOND_HALF' | 'FINISHED';

const Match3D: React.FC<Match3DProps> = ({ homeTeam, awayTeam, difficulty, stadiumVolume, onFinish, physicsSettings }) => {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [minute, setMinute] = useState(0);
  const [matchPeriod, setMatchPeriod] = useState<MatchPeriod>('FIRST_HALF');
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [goalOverlay, setGoalOverlay] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pitchCacheRef = useRef<HTMLCanvasElement | null>(null);
  const playersRef = useRef<SimPlayer[]>([]);
  const ballRef = useRef({ 
    x: 400, y: 300, vx: 0, vy: 0, z: 0, vz: 0, 
    owner: null as string | null,
    lastOwnerTeam: null as 'HOME' | 'AWAY' | null
  });
  
  const stateRef = useRef({
    gameState: 'KICKOFF' as 'PLAY' | 'CELEBRATE' | 'KICKOFF' | 'HALFTIME' | 'FINISHED',
    lastUpdate: 0,
    frameId: 0,
    homeScore: 0,
    awayScore: 0,
    minute: 0
  });

  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const PITCH_MARGIN = 60;

  const initPositions = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const p: SimPlayer[] = [];

    const setupTeam = (team: Team, side: 'HOME' | 'AWAY') => {
      team.players.slice(0, 11).forEach((player, i) => {
        let tx, ty;
        let role: 'GK' | 'DEF' | 'MID' | 'FWD' = 'MID';

        if (i === 0) {
          role = 'GK';
          tx = side === 'HOME' ? PITCH_MARGIN + 30 : w - PITCH_MARGIN - 30;
          ty = h / 2;
        } else if (i < 5) {
          role = 'DEF';
          tx = side === 'HOME' ? w * 0.25 : w * 0.75;
          ty = (h / 6) * (i);
        } else if (i < 9) {
          role = 'MID';
          tx = side === 'HOME' ? w * 0.42 : w * 0.58;
          ty = (h / 5) * (i - 4.5 + 1.5);
        } else {
          role = 'FWD';
          tx = side === 'HOME' ? w * 0.48 : w * 0.52;
          ty = (h / 3) * (i - 8.5 + 1);
        }

        p.push({
          id: player.id,
          name: player.name,
          lastName: player.name.split(' ').pop() || '',
          team: side,
          role: role,
          x: tx, y: ty, vx: 0, vy: 0,
          homeX: tx, homeY: ty,
          color: team.color,
          overall: player.overall,
          lastDecisionTime: 0,
          formationSlot: i
        });
      });
    };

    setupTeam(homeTeam, 'HOME');
    setupTeam(awayTeam, 'AWAY');
    playersRef.current = p;
    ballRef.current = { x: w/2, y: h/2, vx: 0, vy: 0, z: 0, vz: 0, owner: null, lastOwnerTeam: null };
  };

  const updatePitchCache = (w: number, h: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Grass filling everything
    ctx.fillStyle = '#102410'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#162b16';
    const strips = 16; const stripW = w / strips;
    for(let i=0; i<strips; i+=2) ctx.fillRect(i*stripW, 0, stripW, h);

    // Subtle field lines
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 2;
    const pw = w - PITCH_MARGIN * 2;
    const ph = h - PITCH_MARGIN * 2;
    ctx.strokeRect(PITCH_MARGIN, PITCH_MARGIN, pw, ph);
    ctx.moveTo(w/2, PITCH_MARGIN); ctx.lineTo(w/2, h - PITCH_MARGIN); ctx.stroke();
    
    ctx.beginPath(); ctx.arc(w/2, h/2, 70, 0, Math.PI*2); ctx.stroke();
    
    // Penalty Areas
    ctx.strokeRect(PITCH_MARGIN, h/2 - 140, 100, 280);
    ctx.strokeRect(w - PITCH_MARGIN - 100, h/2 - 140, 100, 280);
    
    // Goals
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 4;
    ctx.strokeRect(15, h/2 - 65, 45, 130);
    ctx.strokeRect(w - 60, h/2 - 65, 45, 130);

    pitchCacheRef.current = canvas;
  };

  useEffect(() => {
    const audio = new Audio('https://www.soundjay.com/misc/sounds/stadium-crowd-1.mp3');
    audio.loop = true; audio.volume = stadiumVolume;
    ambientAudioRef.current = audio;
    audio.play().catch(() => {});

    const handleResize = () => {
      if (canvasRef.current) {
        const c = canvasRef.current;
        c.width = window.innerWidth;
        c.height = window.innerHeight;
        updatePitchCache(c.width, c.height);
        initPositions();
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      audio.pause();
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(stateRef.current.frameId);
    };
  }, []);

  useEffect(() => {
    stateRef.current.homeScore = homeScore;
    stateRef.current.awayScore = awayScore;
    stateRef.current.minute = minute;
  }, [homeScore, awayScore, minute]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const diffSettings = {
      AMATEUR: { speed: 0.7, precision: 0.5 },
      PROFESSIONAL: { speed: 1.0, precision: 1.0 },
      WORLD_CLASS: { speed: 1.25, precision: 1.5 },
      LEGENDARY: { speed: 1.5, precision: 2.0 }
    }[difficulty];

    const loop = (time: number) => {
      const dt = stateRef.current.lastUpdate ? Math.min((time - stateRef.current.lastUpdate) / 16.67, 2) : 1;
      stateRef.current.lastUpdate = time;

      if (!isPaused && stateRef.current.gameState !== 'HALFTIME' && stateRef.current.gameState !== 'FINISHED') {
        updatePhysics(dt, time);
      }

      render(ctx, time);
      stateRef.current.frameId = requestAnimationFrame(loop);
    };

    const updatePhysics = (dt: number, time: number) => {
      const ball = ballRef.current;
      const players = playersRef.current;
      const w = canvas.width; const h = canvas.height;

      if (stateRef.current.gameState === 'PLAY') {
        if (!ball.owner) {
          ball.x += ball.vx * dt; ball.y += ball.vy * dt;
          ball.z += ball.vz * dt; 
          ball.vz -= physicsSettings.ballGravity * dt;
          
          if (ball.z < 0) { 
            ball.z = 0; 
            ball.vz = -ball.vz * physicsSettings.ballBounciness;
          }
          ball.vx *= physicsSettings.ballFriction;
          ball.vy *= physicsSettings.ballFriction;

          if (ball.z < 50 && Math.abs(ball.y - h/2) < 70) {
            if (ball.x > w - 60) handleGoal('HOME');
            else if (ball.x < 60) handleGoal('AWAY');
          }

          if (ball.x < 15 || ball.x > w - 15) ball.vx *= -0.3;
          if (ball.y < 15 || ball.y > h - 15) ball.vy *= -0.3;
        }

        players.forEach(p => {
          const isOwner = ball.owner === p.id;
          const baseSpeed = (p.overall / 75) * diffSettings.speed * physicsSettings.aiAggressiveness;
          const speed = baseSpeed * dt;

          if (isOwner) {
            const goalX = p.team === 'HOME' ? w - 60 : 60;
            const goalY = h/2;
            const distToGoal = Math.hypot(goalX - p.x, goalY - p.y);
            const angle = Math.atan2(goalY - p.y, goalX - p.x);

            p.vx = Math.cos(angle) * speed * 1.08;
            p.vy = Math.sin(angle) * speed * 1.08;
            p.x += p.vx; p.y += p.vy;
            
            ball.x = p.x + Math.cos(angle) * 12;
            ball.y = p.y + Math.sin(angle) * 12;
            ball.z = 0;

            if (time - p.lastDecisionTime > 500) {
              p.lastDecisionTime = time;
              if (distToGoal < 280) {
                ball.owner = null;
                const shotPower = 16 + (p.overall / 18);
                ball.vx = Math.cos(angle) * shotPower; 
                ball.vy = Math.sin(angle) * shotPower + (Math.random() - 0.5) * 1.5; 
                ball.vz = 4 + Math.random() * 3.5;
              } else if (Math.random() < physicsSettings.aiPassFrequency) {
                ball.owner = null;
                ball.vx = Math.cos(angle) * 11; ball.vy = Math.sin(angle) * 11;
              }
            }
          } else {
            let tx = p.homeX; let ty = p.homeY;
            const distBallToPlayer = Math.hypot(ball.x - p.x, ball.y - p.y);

            if (p.role === 'GK') {
              const myGoalX = p.team === 'HOME' ? PITCH_MARGIN + 15 : w - PITCH_MARGIN - 15;
              tx = myGoalX;
              ty = h/2 + (ball.y - h/2) * 0.45;
              if (distBallToPlayer < 140 && !ball.owner) { tx = ball.x; ty = ball.y; }
            } else {
              const tacticalRange = (p.role === 'FWD' ? 450 : (p.role === 'MID' ? 350 : 250));
              if (distBallToPlayer < tacticalRange || physicsSettings.aiAggressiveness > 1.4) {
                tx = ball.x; ty = ball.y;
              }
            }

            const angle = Math.atan2(ty - p.y, tx - p.x);
            const moveSpeed = distBallToPlayer < 30 ? speed : speed * 0.85;
            p.vx = Math.cos(angle) * moveSpeed;
            p.vy = Math.sin(angle) * moveSpeed;
            p.x += p.vx; p.y += p.vy;

            if (distBallToPlayer < 22 && ball.z < 30 && !ball.owner) {
              ball.owner = p.id; ball.lastOwnerTeam = p.team;
              ball.vx = 0; ball.vy = 0;
            }
          }

          p.x = Math.max(5, Math.min(w - 5, p.x));
          p.y = Math.max(5, Math.min(h - 5, p.y));
        });
      }
    };

    const handleGoal = (side: 'HOME' | 'AWAY') => {
      stateRef.current.gameState = 'CELEBRATE';
      const team = side === 'HOME' ? homeTeam : awayTeam;
      if (side === 'HOME') setHomeScore(s => s + 1); else setAwayScore(s => s + 1);
      setGoalOverlay(team.name.toUpperCase());
      setEvents(prev => [{ minute: stateRef.current.minute, type: 'GOAL', teamId: team.id, description: `GOL! ${team.name} marca!` }, ...prev]);
      geminiService.getNarration(`GOL do ${team.name}`).then(t => geminiService.speak(t));
      setTimeout(() => {
        setGoalOverlay(null);
        stateRef.current.gameState = 'KICKOFF';
        initPositions();
        setTimeout(() => { if(matchPeriod !== 'FINISHED' && matchPeriod !== 'HALFTIME') stateRef.current.gameState = 'PLAY'; }, 1500);
      }, 3000);
    };

    const render = (ctx: CanvasRenderingContext2D, time: number) => {
      const w = canvas.width; const h = canvas.height;
      ctx.save();
      const zoom = physicsSettings.cameraZoom;
      ctx.translate(w / 2, h / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-w / 2, -h / 2);

      if (pitchCacheRef.current) ctx.drawImage(pitchCacheRef.current, 0, 0);

      const players = playersRef.current;
      players.sort((a,b) => a.y - b.y).forEach(p => {
        const scale = 0.95 + (p.y / h) * 0.5;
        const isMoving = Math.hypot(p.vx, p.vy) > 0.1;
        const armSwing = isMoving ? Math.sin(time * 0.01) * 7 : 0;
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath(); ctx.ellipse(p.x, p.y + 2, 8 * scale, 3 * scale, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#ffdbac';
        ctx.beginPath(); ctx.arc(p.x - 8*scale, p.y - 12*scale + armSwing, 2.5*scale, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(p.x + 8*scale, p.y - 12*scale - armSwing, 2.5*scale, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = p.role === 'GK' ? '#fde047' : p.color;
        ctx.beginPath(); ctx.roundRect(p.x - 7*scale, p.y - 19*scale, 14*scale, 18*scale, 4*scale); ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.font = `bold ${Math.floor(8*scale)}px Inter`; ctx.textAlign = 'center';
        ctx.fillText(String(p.formationSlot + 1), p.x, p.y - 10*scale);
        ctx.fillStyle = '#ffdbac'; ctx.beginPath(); ctx.arc(p.x, p.y - 25*scale, 5.5*scale, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = 'white'; ctx.font = `bold ${Math.floor(12*scale)}px Inter`; ctx.textAlign = 'center';
        ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 3;
        ctx.strokeText(p.lastName, p.x, p.y - 36*scale); ctx.fillText(p.lastName, p.x, p.y - 36*scale);
      });

      const ball = ballRef.current;
      ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.ellipse(ball.x, ball.y + 3, 5, 3, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(ball.x, ball.y - ball.z, 6, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#000'; ctx.lineWidth = 0.5; ctx.stroke();
      ctx.restore();
      drawRadar(ctx, w, h);
    };

    const drawRadar = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const rw = 240; const rh = 150;
      const rx = w/2 - rw/2; const ry = h - rh - 20;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)'; ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(rx, ry, rw, rh, 16); ctx.fill(); ctx.stroke();
      ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(rx + rw/2, ry); ctx.lineTo(rx + rw/2, ry + rh); ctx.stroke(); ctx.setLineDash([]);
      playersRef.current.forEach(p => {
        const px = rx + (p.x / w) * rw; const py = ry + (p.y / h) * rh;
        ctx.fillStyle = p.team === 'HOME' ? '#fff' : p.color;
        ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI*2); ctx.fill();
        if (ballRef.current.owner === p.id) { ctx.strokeStyle = '#fde047'; ctx.lineWidth = 2; ctx.stroke(); }
      });
      const ball = ballRef.current;
      const bx = rx + (ball.x / w) * rw; const by = ry + (ball.y / h) * rh;
      ctx.fillStyle = '#fde047'; ctx.beginPath(); ctx.arc(bx, by, 4.5, 0, Math.PI*2); ctx.fill();
    };

    stateRef.current.gameState = 'PLAY';
    stateRef.current.frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(stateRef.current.frameId);
  }, [isPaused, difficulty, matchPeriod, physicsSettings]);

  useEffect(() => {
    if (isPaused || matchPeriod === 'HALFTIME' || matchPeriod === 'FINISHED') return;
    const interval = setInterval(() => {
      setMinute(m => {
        const next = m + 1;
        if (next === 45 && matchPeriod === 'FIRST_HALF') {
          setMatchPeriod('HALFTIME');
          stateRef.current.gameState = 'HALFTIME';
          geminiService.speak("Intervalo de jogo! Jogadores respiram um pouco.");
          return 45;
        }
        if (next >= 90) {
          setMatchPeriod('FINISHED');
          stateRef.current.gameState = 'FINISHED';
          geminiService.speak("Final de partida! Um jogo emocionante!");
          onFinish(homeScore, awayScore);
          return 90;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, matchPeriod, homeScore, awayScore]);

  const resumeSecondHalf = () => {
    setMatchPeriod('SECOND_HALF');
    stateRef.current.gameState = 'KICKOFF';
    initPositions();
    geminiService.speak("Bola rolando para a etapa final!");
    setTimeout(() => { stateRef.current.gameState = 'PLAY'; }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden font-inter select-none">
      {/* Jogo (Canvas) */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* HUD de Placar - Transparente e Integrada */}
      <div className="absolute top-0 inset-x-0 p-8 z-20 flex justify-between items-start pointer-events-none">
        <div className="flex items-center gap-12 bg-black/30 backdrop-blur-md px-10 py-4 rounded-[2rem] border border-white/10">
          <div className="text-right">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{homeTeam.name}</div>
            <div className="text-6xl font-sport text-white drop-shadow-lg leading-none">{homeScore}</div>
          </div>
          <div className="flex flex-col items-center">
             <div className="bg-emerald-600 px-6 py-2 rounded-xl shadow-2xl font-sport text-4xl text-white">
               {minute}'
             </div>
             <div className="text-[9px] font-black text-emerald-400 mt-2 tracking-widest uppercase">
               {matchPeriod === 'FIRST_HALF' ? '1º TEMPO' : '2º TEMPO'}
             </div>
          </div>
          <div className="text-left">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{awayTeam.name}</div>
            <div className="text-6xl font-sport text-white drop-shadow-lg leading-none">{awayScore}</div>
          </div>
        </div>
        
        <button 
          onClick={() => setIsPaused(true)} 
          className="pointer-events-auto w-16 h-16 bg-white/10 hover:bg-emerald-600 rounded-full flex items-center justify-center backdrop-blur-2xl transition-all border border-white/10 shadow-2xl group"
        >
           <i className="fas fa-pause text-xl group-hover:scale-110"></i>
        </button>
      </div>

      {/* Goal Overlay */}
      {goalOverlay && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-emerald-600/30 backdrop-blur-xl pointer-events-none animate-fade-in">
          <div className="text-center scale-up">
            <div className="text-[18rem] font-black italic text-white leading-none drop-shadow-2xl">GOL!</div>
            <div className="text-5xl font-sport uppercase tracking-[0.5em] text-white/90 mt-6">{goalOverlay}</div>
          </div>
        </div>
      )}

      {/* Menus Overlays */}
      {(isPaused || matchPeriod === 'HALFTIME') && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl z-40 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-slate-900/80 p-16 rounded-[4rem] border border-white/10 w-full max-w-2xl text-center shadow-3xl">
             <h2 className="text-7xl font-sport italic uppercase tracking-tighter mb-10 text-white">
               {isPaused ? 'PAUSA' : 'INTERVALO'}
             </h2>
             
             <div className="flex justify-center gap-14 mb-14 bg-black/40 p-12 rounded-[3.5rem] border border-white/5">
                <div className="text-center">
                  <div className="text-7xl font-sport text-white">{homeScore}</div>
                  <div className="text-xs font-black text-slate-500 mt-3 uppercase tracking-widest">{homeTeam.name}</div>
                </div>
                <div className="text-4xl text-slate-700 font-sport self-center italic">VS</div>
                <div className="text-center">
                  <div className="text-7xl font-sport text-white">{awayScore}</div>
                  <div className="text-xs font-black text-slate-500 mt-3 uppercase tracking-widest">{awayTeam.name}</div>
                </div>
             </div>

             <div className="grid grid-cols-1 gap-6">
               {isPaused ? (
                 <button onClick={() => setIsPaused(false)} className="bg-emerald-600 hover:bg-emerald-500 py-8 rounded-[2.5rem] font-black text-3xl flex items-center justify-center gap-5 transition-all active:scale-95 shadow-2xl">
                   <i className="fas fa-play"></i> VOLTAR AO JOGO
                 </button>
               ) : (
                 <button onClick={resumeSecondHalf} className="bg-emerald-600 hover:bg-emerald-500 py-8 rounded-[2.5rem] font-black text-3xl flex items-center justify-center gap-5 transition-all active:scale-95 shadow-2xl">
                   <i className="fas fa-bolt"></i> INICIAR 2º TEMPO
                 </button>
               )}
               <button onClick={() => onFinish(homeScore, awayScore)} className="bg-slate-800 py-6 rounded-[2rem] font-bold text-slate-500 text-sm uppercase tracking-[0.3em] border border-white/5 hover:bg-red-900/30 hover:text-white transition-all">
                 Sair da Partida
               </button>
             </div>
          </div>
        </div>
      )}

      <style>{`
        .scale-up { animation: scaleUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        @keyframes scaleUp { from { transform: scale(0.3); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default Match3D;
