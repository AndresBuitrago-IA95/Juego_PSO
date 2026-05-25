import React from 'react';
import { Landscape } from '../types';
import { Trophy, Compass, RotateCcw, CheckCircle2, Play, Pause, Radio, Cpu } from 'lucide-react';

interface ChallengePanelProps {
  landscape: Landscape;
  currentStep: number;
  particlesCount: number;
  gBestVal: number | null;
  playerBestVal: number | null;
  scansLeft: number;
  userSearchActive: boolean;
  onToggleUserSearch: () => void;
  onResetAll: () => void;
  isRunning: boolean;
  onToggleRun: () => void;
}

export const ChallengePanel: React.FC<ChallengePanelProps> = ({
  landscape,
  currentStep,
  particlesCount,
  gBestVal,
  playerBestVal,
  scansLeft,
  userSearchActive,
  onToggleUserSearch,
  onResetAll,
  isRunning,
  onToggleRun
}) => {
  // Check if minimum convergence benchmark is met
  const isMissionSuccessValue = gBestVal !== null && gBestVal < 1.5;
  const progressPercent = gBestVal !== null ? Math.max(0, Math.min(100, Math.round((1 - Math.min(gBestVal, 50) / 50) * 100))) : 0;

  return (
    <div className="bg-stone-900 border border-emerald-800/40 rounded-xl p-5 shadow-xl flex flex-col gap-5">
      
      {/* Game HUD */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <div className="flex items-center gap-2">
          <Trophy className="text-amber-400 animate-pulse" size={18} />
          <h3 className="font-sans font-bold text-sm text-stone-100 uppercase tracking-wider">
            Consola del Enjambre (PSO)
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 uppercase">
          Minimización
        </span>
      </div>

      {/* Primary Goal Description */}
      <div className="bg-stone-950/65 border border-stone-850 rounded-xl p-4 flex flex-col gap-2.5">
        <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block">🎯 META DEL ENJAMBRE:</span>
        <p className="text-xs text-stone-300 leading-relaxed font-sans">
          Lograr que las partículas autónomas converjan bajo un error menor a <strong className="text-white">1.5 d</strong> en el núcleo del <strong className="text-white">{landscape.name}</strong> para hallar el óptimo matemático.
        </p>

        {/* Real-time convergence status */}
        <div className="mt-2 bg-stone-900/80 p-3 rounded-lg border border-stone-850">
          <div className="flex justify-between items-center mb-1 text-xs">
            <span className="text-stone-400 font-mono">Convergencia PSO:</span>
            <strong className="text-emerald-400 font-mono">{progressPercent}%</strong>
          </div>
          <div className="h-2 w-full bg-stone-950 rounded-full overflow-hidden border border-stone-800">
            <div 
              className={`h-full transition-all duration-300 ${isMissionSuccessValue ? 'bg-gradient-to-r from-emerald-500 to-green-400' : 'bg-gradient-to-r from-emerald-800 to-emerald-500'}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-2.5 text-[11px] font-mono text-stone-300 flex items-start gap-1.5">
            {isMissionSuccessValue ? (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={13} className="shrink-0 animate-bounce" />
                ¡Éxito de Optimización! El enjambre de partículas ubicó el mínimo global estable.
              </span>
            ) : (
              <span className="text-emerald-450/90 flex items-center gap-1.5 text-emerald-455">
                <Cpu size={13} className="shrink-0 animate-pulse text-emerald-400" />
                Enjambre de búsqueda activo... Mapeando superficie.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Competitive Human vs Swarm Game Panel */}
      <div className="bg-stone-955/40 border border-stone-850 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center border-b border-stone-800/80 pb-2">
          <h4 className="font-semibold text-xs font-mono uppercase tracking-wide text-stone-400 flex items-center gap-1.5">
            🎯 Desafío Sonar: Humano vs. Enjambre
          </h4>
          <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
        </div>

        <p className="text-xs text-stone-400 leading-relaxed font-sans">
          ¿Tienes mejor intuición que un algoritmo heurístico? Activa el <strong className="text-stone-300">Modo Jugar</strong> para ocultar herméticamente el mapa de energía. Usa tu radar sobre el lienzo negro para encontrar coordenadas de baja energía. ¡Obtén el menor valor posible en 5 disparos!
        </p>

        <div className="flex flex-wrap gap-2 mt-1">
          <button
            onClick={onToggleUserSearch}
            className={`flex-1 min-w-[150px] px-3.5 py-2.5 rounded-lg font-bold text-xs transition duration-200 flex items-center justify-center gap-1.5 select-none cursor-pointer ${
              userSearchActive
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/40 hover:bg-rose-550'
                : 'bg-emerald-700 text-stone-100 hover:bg-emerald-600 hover:text-white shadow-lg shadow-emerald-950/40'
            }`}
          >
            {userSearchActive ? '🛑 Detener Juego / Mostrar Mapa' : '🎯 Jugar como Buscador'}
          </button>
        </div>

        {userSearchActive && (
          <div className="bg-rose-950/20 border border-rose-500/20 p-3 rounded-lg flex flex-col gap-2 mt-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-rose-200">Scans de radar restantes:</span>
              <strong className="text-rose-400 font-mono text-sm">{scansLeft} intentos</strong>
            </div>

            {/* Score Comparisons */}
            <div className="grid grid-cols-2 gap-3 border-t border-stone-800/60 pt-2.5 mt-1">
              <div className="flex flex-col">
                <span className="text-[10px] text-stone-500 font-mono uppercase">HUMANO (MÍN ENERGÍA)</span>
                <span className="text-sm font-bold text-rose-400 font-mono">
                  {playerBestVal !== null ? `${playerBestVal.toFixed(2)} d` : 'Pendiente clic'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-stone-500 font-mono uppercase">ENJAMBRE (PSO)</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  {gBestVal !== null ? `${gBestVal.toFixed(2)} d` : 'Cargando...'}
                </span>
              </div>
            </div>

            {/* Real-time comparison feedback */}
            {playerBestVal !== null && gBestVal !== null && (
              <div className="border-t border-stone-800/60 pt-2 mt-1.5 text-center text-xs">
                {playerBestVal < gBestVal ? (
                  <span className="text-rose-300 font-bold">🏆 ¡Estás ganando! Descubriste un punto de menor energía.</span>
                ) : playerBestVal.toFixed(1) === gBestVal.toFixed(1) ? (
                  <span className="text-stone-300 font-mono">Empate técnico idéntico.</span>
                ) : (
                  <span className="text-emerald-300 font-bold">📡 Gana el algoritmo de partículas. ¡La inteligencia colectiva converge más rápido!</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Physics Swarm Controls */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        <button
          onClick={onToggleRun}
          className={`px-4 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition select-none cursor-pointer ${
            isRunning 
              ? 'bg-amber-600 hover:bg-amber-500 text-white font-mono' 
              : 'bg-emerald-700 hover:bg-emerald-600 text-white font-mono'
          }`}
        >
          {isRunning ? <Pause size={14} /> : <Play size={14} />}
          {isRunning ? 'Pausar Enjambre' : 'Lanzar Enjambre'}
        </button>
        <button
          onClick={onResetAll}
          className="px-4 py-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold font-mono flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
        >
          <RotateCcw size={14} />
          Reiniciar Campo
        </button>
      </div>

    </div>
  );
};
