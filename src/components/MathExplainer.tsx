import React, { useState } from 'react';
import { PsoParams } from '../types';

interface MathExplainerProps {
  params: PsoParams;
  onChangeParams: (updated: Partial<PsoParams>) => void;
}

export const MathExplainer: React.FC<MathExplainerProps> = ({ params, onChangeParams }) => {
  const [randomR1, setRandomR1] = useState(0.65);
  const [randomR2, setRandomR2] = useState(0.42);

  // Roll the dice to simulate the stochastic nature of c1 * r1 and c2 * r2
  const rollDice = () => {
    setRandomR1(parseFloat(Math.random().toFixed(2)));
    setRandomR2(parseFloat(Math.random().toFixed(2)));
  };

  // Base layout dimensions for vector drawing inside 220x220 space
  const cx = 110;
  const cy = 110;

  // Let's declare fixed vectors to draw on SVG relative to central particle
  const vecInertia = { x: 50 * params.w, y: -20 * params.w }; // Inertia vector
  const vecCognitive = { 
    x: 40 * (params.c1 * randomR1), 
    y: 50 * (params.c1 * randomR1) 
  }; // Nostalgia vector
  const vecSocial = { 
    x: -60 * (params.c2 * randomR2), 
    y: 10 * (params.c2 * randomR2) 
  }; // Social pull vector

  // Sum vector
  const vecResult = {
    x: vecInertia.x + vecCognitive.x + vecSocial.x,
    y: vecInertia.y + vecCognitive.y + vecSocial.y
  };

  return (
    <div className="bg-stone-900 border border-emerald-800/40 rounded-xl p-5 shadow-xl flex flex-col gap-5">
      
      {/* Dynamic Title */}
      <div>
        <h3 className="font-sans font-bold text-lg text-white flex items-center gap-2">
          <span>Formula Interactiva</span>
          <span className="font-mono text-xs text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full bg-emerald-950/40">
            Vector Sum
          </span>
        </h3>
        <p className="text-xs text-stone-400 mt-1">
          La velocidad de cada partícula se decide por tres fuerzas competitivas:
        </p>
      </div>

      {/* Math Visual Equation Expression with neon accents */}
      <div className="bg-stone-950 border border-stone-850 p-4 rounded-lg font-mono text-xs overflow-x-auto select-none leading-relaxed text-stone-300">
        <div className="text-stone-500 text-[10px] mb-1 font-mono uppercase tracking-wider">// EQUACIÓN ACTUALIZACIÓN VELOCIDAD</div>
        <div className="flex flex-wrap items-center gap-1.5 text-sm">
          <span className="text-emerald-400 font-bold">V<sub className="text-[10px]">t+1</sub></span>
          <span>=</span>
          
          {/* Inertia factor */}
          <span className="bg-purple-950/40 border border-purple-500/20 px-1.5 py-0.5 rounded text-purple-300">
            {params.w.toFixed(2)} × V<sub className="text-[10px]">t</sub>
          </span>
          <span>+</span>

          {/* Cognitive target */}
          <span className="bg-amber-950/40 border border-amber-500/20 px-1.5 py-0.5 rounded text-amber-300">
            {params.c1.toFixed(1)} × <span className="underline italic" title="Número aleatorio R1">{randomR1}</span> × (P<sub className="text-[9px]">mej_propia</sub> - X<sub className="text-[9px]">t</sub>)
          </span>
          <span>+</span>

          {/* Social target */}
          <span className="bg-cyan-950/40 border border-cyan-500/20 px-1.5 py-0.5 rounded text-cyan-300">
            {params.c2.toFixed(1)} × <span className="underline italic" title="Número aleatorio R2">{randomR2}</span> × (G<sub className="text-[9px]">mej_grupal</sub> - X<sub className="text-[9px]">t</sub>)
          </span>
        </div>
        
        {/* Helper guide */}
        <div className="mt-3 flex gap-4 text-[10px] text-stone-500 border-t border-stone-900 pt-2">
          <div className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-purple-500"></span> Inercia (w)</div>
          <div className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-amber-500"></span> Nostalgia (c1)</div>
          <div className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-cyan-450 bg-cyan-500"></span> Social (c2)</div>
        </div>
      </div>

      {/* SVG Canvas for Vector Playground */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        
        {/* Dynamic Vector Graph */}
        <div className="flex flex-col items-center bg-stone-950 border border-stone-850 rounded-lg p-3">
          <span className="text-[10px] font-mono text-stone-500 mb-1">MÉTRICA VECTORIAL DE FUERZAS</span>
          
          <div className="relative">
            <svg width="220" height="220" className="border border-stone-900 rounded bg-stone-950">
              {/* Grid Lines */}
              <line x1="0" y1={cy} x2="220" y2={cy} stroke="#1c1917" strokeWidth="1" strokeDasharray="2 3" />
              <line x1={cx} y1="0" x2={cx} y2="220" stroke="#1c1917" strokeWidth="1" strokeDasharray="2 3" />
              
              {/* Vector Definition Arrows */}
              <defs>
                <marker id="arrow-purple" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#c084fc" />
                </marker>
                <marker id="arrow-amber" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#fbbf24" />
                </marker>
                <marker id="arrow-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#22d3ee" />
                </marker>
                <marker id="arrow-emerald" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#10b981" />
                </marker>
              </defs>

              {/* Vector representation */}
              {/* 1. Inertia Vector (Purple) */}
              <line 
                x1={cx} y1={cy} 
                x2={cx + vecInertia.x} y2={cy + vecInertia.y} 
                stroke="#c084fc" strokeWidth="2.5" 
                markerEnd="url(#arrow-purple)"
              />
              
              {/* 2. Cognitive Vector (Amber) */}
              <line 
                x1={cx} y1={cy} 
                x2={cx + vecCognitive.x} y2={cy + vecCognitive.y} 
                stroke="#fbbf24" strokeWidth="2.5" 
                markerEnd="url(#arrow-amber)"
              />

              {/* 3. Social Vector (Cyan) */}
              <line 
                x1={cx} y1={cy} 
                x2={cx + vecSocial.x} y2={cy + vecSocial.y} 
                stroke="#22d3ee" strokeWidth="2.5" 
                markerEnd="url(#arrow-cyan)"
              />

              {/* 4. Resulting Velocity Vector (Glow Emerald) */}
              <line 
                x1={cx} y1={cy} 
                x2={cx + vecResult.x} y2={cy + vecResult.y} 
                stroke="#10b981" strokeWidth="4" 
                markerEnd="url(#arrow-emerald)"
                className="drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]"
              />

              {/* Central Particle Dot */}
              <circle cx={cx} cy={cy} r="6" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
              <text x={cx + 8} y={cy - 8} fill="#ffffff" fontSize="9" fontFamily="monospace">Partícula (X)</text>
              
              {/* Explanatory labels near tip coordinates */}
              {params.w > 0.15 && <text x={cx + vecInertia.x + 5} y={cy + vecInertia.y - 5} fill="#c084fc" fontSize="9" fontFamily="monospace" fontWeight="bold">Inercia</text>}
              {params.c1 > 0.15 && <text x={cx + vecCognitive.x + 5} y={cy + vecCognitive.y + 10} fill="#fbbf24" fontSize="9" fontFamily="monospace" fontWeight="bold">Nostalgia</text>}
              {params.c2 > 0.15 && <text x={cx + vecSocial.x - 35} y={cy + vecSocial.y - 5} fill="#22d3ee" fontSize="9" fontFamily="monospace" fontWeight="bold">Social</text>}
              <text x={cx + vecResult.x + 8} y={cy + vecResult.y + 12} fill="#10b981" fontSize="10" fontFamily="monospace" fontWeight="extrabold">Nueva Vel</text>
            </svg>
          </div>

          <button
            onClick={rollDice}
            className="mt-3 px-3 py-1.5 rounded bg-stone-850 hover:bg-emerald-800 hover:text-white active:scale-95 text-stone-300 flex items-center gap-1.5 transition text-xs font-mono font-semibold"
          >
            🎲 Rodar Aleatoriedad (r1, r2)
          </button>
        </div>

        {/* Sliders and direct config panel */}
        <div className="flex flex-col gap-4 self-start w-full">
          
          {/* Slider 1: Inertia w */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-purple-300 font-semibold flex items-center gap-1">
                ⚙️ Inercia (w): <strong className="font-mono">{params.w.toFixed(2)}</strong>
              </span>
              <span className="text-stone-500 font-mono text-[10px]">Conserva velocidad</span>
            </div>
            <input 
              type="range" 
              min="0.0" 
              max="1.5" 
              step="0.05"
              value={params.w} 
              onChange={(e) => onChangeParams({ w: parseFloat(e.target.value) })}
              className="accent-purple-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
            />
            <p className="text-[10px] text-stone-400 font-sans leading-relaxed">
              Inercia alta impulsa exploración salvaje de llanuras. Valores mayores a 1.0 hacen que el enjambre orbite indefinidamente sin frenar.
            </p>
          </div>

          {/* Slider 2: Nostalgia c1 */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-amber-300 font-semibold flex items-center gap-1">
                🧠 Nostalgia / Auto (c1): <strong className="font-mono">{params.c1.toFixed(1)}</strong>
              </span>
              <span className="text-stone-500 font-mono text-[10px]">Memoria propia</span>
            </div>
            <input 
              type="range" 
              min="0.0" 
              max="4.0" 
              step="0.1"
              value={params.c1} 
              onChange={(e) => onChangeParams({ c1: parseFloat(e.target.value) })}
              className="accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
            />
            <p className="text-[10px] text-stone-400 font-sans leading-relaxed">
              Tracción egoísta empujando a cada individuo de regreso al mejor punto histórico que él mismo encontró.
            </p>
          </div>

          {/* Slider 3: Social Pull c2 */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-cyan-300 font-semibold flex items-center gap-1">
                🐦 Fuerza Social (c2): <strong className="font-mono">{params.c2.toFixed(1)}</strong>
              </span>
              <span className="text-stone-500 font-mono text-[10px]">Atracción grupal</span>
            </div>
            <input 
              type="range" 
              min="0.0" 
              max="4.0" 
              step="0.1"
              value={params.c2} 
              onChange={(e) => onChangeParams({ c2: parseFloat(e.target.value) })}
              className="accent-cyan-400 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
            />
            <p className="text-[10px] text-stone-400 font-sans leading-relaxed">
              El imán del grupo. Jala todas las partículas hacia el mejor avistamiento logrado por cualquiera de los exploradores.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
