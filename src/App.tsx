import { useState, useEffect } from 'react';
import { Particle, PsoParams } from './types';
import { GARDEN_LANDSCAPE } from './landscapes';
import { LandscapeCanvas } from './components/LandscapeCanvas';
import { MathExplainer } from './components/MathExplainer';
import { ChallengePanel } from './components/ChallengePanel';
import { TutorialOverlay } from './components/TutorialOverlay';
import { HelpCircle, Brain, Target, Compass, Sparkles } from 'lucide-react';

const WIDTH = 450;
const HEIGHT = 400;

export default function App() {
  // PSO Parameters
  const [params, setParams] = useState<PsoParams>({
    w: 0.65,
    c1: 1.5,
    c2: 1.5,
    numParticles: 20,
    maxVelocity: 8
  });

  // Simulation state
  const [swarmState, setSwarmState] = useState<{
    particles: Particle[];
    gBest: { x: number; y: number; val: number } | null;
  }>({
    particles: [],
    gBest: null
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Player search states (Competitive Radar duel)
  const [userSearchActive, setUserSearchActive] = useState(false);
  const [playerScans, setPlayerScans] = useState<{ x: number; y: number; val: number }[]>([]);
  const [playerBestVal, setPlayerBestVal] = useState<number | null>(null);

  // UI options
  const [showTrails, setShowTrails] = useState(true);
  const [showContours, setShowContours] = useState(true);
  const [showTutorial, setShowTutorial] = useState(true);

  // Simple Level Landscape Definition
  const selectedLandscape = GARDEN_LANDSCAPE;

  // Initialize particles over the available garden space
  const initializeSwarm = (psoVal: PsoParams) => {
    const freshParticles: Particle[] = [];
    let initialGBest: { x: number; y: number; val: number } | null = null;

    for (let i = 0; i < psoVal.numParticles; i++) {
      // Gentle initial random dispersion across coordinates
      const x = 40 + Math.random() * (WIDTH - 80);
      const y = 40 + Math.random() * (HEIGHT - 80);
      
      const vx = (Math.random() - 0.5) * 5;
      const vy = (Math.random() - 0.5) * 5;
      
      const fitness = selectedLandscape.evaluate(x, y, WIDTH, HEIGHT);

      const p: Particle = {
        id: i,
        x,
        y,
        vx,
        vy,
        pBestX: x,
        pBestY: y,
        pBestVal: fitness,
        fitness,
        trail: []
      };

      freshParticles.push(p);

      if (initialGBest === null || fitness < initialGBest.val) {
        initialGBest = { x, y, val: fitness };
      }
    }

    setSwarmState({
      particles: freshParticles,
      gBest: initialGBest
    });
    setCurrentStep(0);
  };

  // Perform initial swarm setup on mount
  useEffect(() => {
    initializeSwarm(params);
  }, []);

  const handleParamsChange = (updated: Partial<PsoParams>) => {
    const updatedParams = { ...params, ...updated };
    setParams(updatedParams);
    
    // Re-initialize swarm automatically if pool sizes were altered
    if (updated.numParticles) {
      initializeSwarm(updatedParams);
    }
  };

  // Human Radar scan interaction callback
  const handlePlayerScan = (x: number, y: number) => {
    if (playerScans.length >= 5) return; // 5 absolute guesses for Easy level

    const actualVal = selectedLandscape.evaluate(x, y, WIDTH, HEIGHT);
    const updatedScans = [...playerScans, { x, y, val: actualVal }];
    setPlayerScans(updatedScans);

    // Compute human record (lower is sweeter)
    const minVal = Math.min(...updatedScans.map((s) => s.val));
    setPlayerBestVal(minVal);
  };

  // Soft Reset current scenario
  const handleReset = () => {
    setIsRunning(false);
    setPlayerScans([]);
    setPlayerBestVal(null);
    initializeSwarm(params);
  };

  // Physics update interval loop
  useEffect(() => {
    if (!isRunning) return;

    const tick = () => {
      setSwarmState((prev) => {
        let currentGBest = prev.gBest ? { ...prev.gBest } : null;

        const nextParticles = prev.particles.map((p) => {
          const r1 = Math.random();
          const r2 = Math.random();

          const targetGBackX = currentGBest ? currentGBest.x : p.pBestX;
          const targetGBackY = currentGBest ? currentGBest.y : p.pBestY;

          // PSO Core Physics Equations: Velocities Update
          let nvx = params.w * p.vx + params.c1 * r1 * (p.pBestX - p.x) + params.c2 * r2 * (targetGBackX - p.x);
          let nvy = params.w * p.vy + params.c1 * r1 * (p.pBestY - p.y) + params.c2 * r2 * (targetGBackY - p.y);

          // Apply physical terminal velocity to prevent infinite escaping speed
          const velocityLength = Math.sqrt(nvx * nvx + nvy * nvy);
          if (velocityLength > params.maxVelocity) {
            nvx = (nvx / velocityLength) * params.maxVelocity;
            nvy = (nvy / velocityLength) * params.maxVelocity;
          }

          // Compute new position
          let nx = p.x + nvx;
          let ny = p.y + nvy;

          // Bounce off boundary walls with energy inversion
          if (nx < 2) { nx = 2; nvx = -nvx; }
          if (nx > WIDTH - 2) { nx = WIDTH - 2; nvx = -nvx; }
          if (ny < 2) { ny = 2; nvy = -nvy; }
          if (ny > HEIGHT - 2) { ny = HEIGHT - 2; nvy = -nvy; }

          // Evaluate the energy function (fitness) at the updated coordinates
          const nFit = selectedLandscape.evaluate(nx, ny, WIDTH, HEIGHT);

          // Update Particle individual nostalgia (pBest)
          let npBestX = p.pBestX;
          let npBestY = p.pBestY;
          let npBestVal = p.pBestVal;

          if (nFit < p.pBestVal) {
            npBestX = nx;
            npBestY = ny;
            npBestVal = nFit;
          }

          // Sync Global Leaderboard (gBest)
          if (currentGBest === null || nFit < currentGBest.val) {
            currentGBest = { x: nx, y: ny, val: nFit };
          }

          // Accumulate flight trails
          const updatedTrail = [...p.trail, { x: nx, y: ny }].slice(-6);

          return {
            ...p,
            x: nx,
            y: ny,
            vx: nvx,
            vy: nvy,
            pBestX: npBestX,
            pBestY: npBestY,
            pBestVal: npBestVal,
            fitness: nFit,
            trail: updatedTrail
          };
        });

        return {
          particles: nextParticles,
          gBest: currentGBest
        };
      });

      setCurrentStep((step) => step + 1);
    };

    const intervalId = setInterval(tick, 50); // 50ms ticks represent optimal fluid motion coordinates
    return () => clearInterval(intervalId);
  }, [isRunning, selectedLandscape, params]);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-emerald-605 selection:bg-emerald-700 selection:text-white">
      
      {/* Header Banner Section */}
      <header className="border-b border-stone-850 bg-stone-900/60 backdrop-blur-md sticky top-0 z-40 px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          {/* Logo & Category */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-800 via-emerald-600 to-green-500 flex items-center justify-center text-white shadow-lg shadow-emerald-950/40 border border-emerald-500/20">
              <Brain size={22} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
                Simulador PSO Inteligente
              </h1>
              <span className="font-mono text-[10px] tracking-wider text-emerald-400 block uppercase">
                Optimización de Enjambre de Partículas • UdeA
              </span>
            </div>
          </div>

          {/* Action Header Menu */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowTutorial(true)}
              className="px-3 py-1.5 rounded-lg border border-stone-800 bg-stone-850 hover:bg-stone-800 hover:border-emerald-700/40 text-stone-200 hover:text-white transition duration-150 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <HelpCircle size={14} />
              ¿Qué es PSO?
            </button>
            <span className="h-6 w-px bg-stone-800 hidden sm:inline-block"></span>
            
            {/* Quick dashboard metrics */}
            <div className="bg-stone-950 border border-stone-850 rounded-lg px-3 py-1.5 font-mono text-xs flex gap-4 text-stone-400">
              <div>
                Pasos: <strong className="text-white font-semibold">{currentStep}</strong>
              </div>
              <div>
                Mínimo Global (GBest): <strong className="text-emerald-400 font-bold">{swarmState.gBest ? swarmState.gBest.val.toFixed(2) : '-'} d</strong>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Primary Grid Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* LEFT COLUMN: Core Interactive Parameter HUD (4 columns) */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          
          <ChallengePanel
            landscape={selectedLandscape}
            currentStep={currentStep}
            particlesCount={params.numParticles}
            gBestVal={swarmState.gBest ? swarmState.gBest.val : null}
            playerBestVal={playerBestVal}
            scansLeft={5 - playerScans.length}
            userSearchActive={userSearchActive}
            onToggleUserSearch={() => setUserSearchActive(!userSearchActive)}
            onResetAll={handleReset}
            isRunning={isRunning}
            onToggleRun={() => setIsRunning(!isRunning)}
          />

        </section>

        {/* RIGHT COLUMN: Interactive Arena & Vector Math Simulator (8 columns) */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Active Meadow/Garden title bar */}
          <div className="bg-stone-900 border border-emerald-800/30 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block mb-0.5">TERRENO DE OPTIMIZACIÓN EN VIVO</span>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                <Target size={17} className="text-amber-400" />
                {selectedLandscape.name}
              </h2>
              <p className="text-xs text-stone-450 text-slate-400 mt-1 leading-relaxed">
                {selectedLandscape.description}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded text-[10px] font-semibold font-mono border self-start sm:self-center bg-emerald-950/40 border-emerald-500/30 text-emerald-400 uppercase">
              {selectedLandscape.difficulty}
            </span>
          </div>

          {/* Interactive Simulation Panel */}
          <LandscapeCanvas
            landscape={selectedLandscape}
            particles={swarmState.particles}
            gBest={swarmState.gBest}
            playerScans={playerScans}
            onPlayerScan={handlePlayerScan}
            userSearchActive={userSearchActive}
            showTrails={showTrails}
            showContours={showContours}
            isPlaying={isRunning}
          />

          {/* Interactive Vector Math Component */}
          <MathExplainer
            params={params}
            onChangeParams={handleParamsChange}
          />

          {/* Render parameters toggles */}
          <div className="bg-stone-900 border border-emerald-800/40 rounded-xl p-4 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs w-full">
            <span className="font-mono text-stone-400 uppercase text-[10px] tracking-wide">
              Filtros visuales de la arena:
            </span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none text-stone-300">
                <input
                  type="checkbox"
                  checked={showTrails}
                  onChange={(e) => setShowTrails(e.target.checked)}
                  className="accent-emerald-600 h-4 w-4 rounded border-stone-750 bg-stone-800 cursor-pointer"
                />
                Ver Estelas de Vuelo (Trails)
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none text-stone-300">
                <input
                  type="checkbox"
                  checked={showContours}
                  onChange={(e) => setShowContours(e.target.checked)}
                  className="accent-emerald-600 h-4 w-4 rounded border-stone-750 bg-stone-800 cursor-pointer"
                />
                Líneas de Nivel Contorno
              </label>
            </div>
          </div>

        </section>

      </main>

      {/* FOOTER: Deep mathematical explanations of PSO terms and definitions */}
      <footer className="mt-auto border-t border-stone-850 bg-stone-900/40 py-8 px-4 text-center text-xs text-stone-400 font-sans">
        <div className="max-w-4xl mx-auto flex flex-col gap-4 animate-fade-in">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left text-stone-300">
            <div className="p-4 rounded-lg bg-stone-950/40 border border-stone-900">
              <h5 className="font-semibold text-white mb-2 font-mono uppercase tracking-wider text-[10px] text-emerald-400 flex items-center gap-1">
                <Compass size={12} fill="currentColor" /> EL CÁLCULO HEURÍSTICO
              </h5>
              <p className="text-[11px] leading-relaxed text-stone-400">
                El algoritmo PSO optimiza problemas sin requerir derivadas complejas (gradiente). Se basa puramente en la comunicación síncrona de reportes de calidad sobre coordenadas discretas, emulando la sintonía evolutiva de la fauna.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-stone-950/40 border border-stone-900">
              <h5 className="font-semibold text-white mb-2 font-mono uppercase tracking-wider text-[10px] text-emerald-400 flex items-center gap-1">
                <Sparkles size={12} fill="currentColor" /> BALANCE EXPLORATORIO
              </h5>
              <p className="text-[11px] leading-relaxed text-stone-400">
                Al regular <strong>Inercia (w)</strong> priorizamos conservar el vector previo de vuelo. Con <strong>Nostalgia (c1)</strong> y <strong>Sociabilidad (c2)</strong> balanceamos el egoísmo de la partícula contra el reporte general del enjambre.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-stone-950/40 border border-stone-900">
              <h5 className="font-semibold text-white mb-2 font-mono uppercase tracking-wider text-[10px] text-emerald-400 flex items-center gap-1">
                <Brain size={12} fill="currentColor" /> INTELIGENCIA DE ENJAMBRES
              </h5>
              <p className="text-[11px] leading-relaxed text-stone-400">
                Creado en 1995 por Kennedy y Eberhart, este modelo demostró que la inteligencia colectiva surge de la interacción caótica pero regulada de reglas vectoriales ultra-sencillas. Ideal para docencia y optimización industrial.
              </p>
            </div>
          </div>

          <div className="border-t border-stone-900 pt-5 flex flex-col sm:flex-row items-center justify-between text-[10px] text-stone-500 font-mono gap-2">
            <span>Universidad de Antioquia - Exposición Académica de Algoritmos Inteligentes</span>
            <span>Simulación Didáctica PSO © 2026</span>
          </div>

        </div>
      </footer>

      {/* Educational Tutorial Overlay Modal */}
      {showTutorial && (
        <TutorialOverlay onDismiss={() => setShowTutorial(false)} />
      )}

    </div>
  );
}
