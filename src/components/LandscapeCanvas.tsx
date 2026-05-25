import React, { useRef, useEffect, useState } from 'react';
import { Particle, Landscape } from '../types';

interface LandscapeCanvasProps {
  landscape: Landscape;
  particles: Particle[];
  gBest: { x: number; y: number; val: number } | null;
  playerScans: { x: number; y: number; val: number }[];
  onPlayerScan: (x: number, y: number) => void;
  userSearchActive: boolean;
  showTrails: boolean;
  showContours: boolean;
  isPlaying: boolean;
}

export const LandscapeCanvas: React.FC<LandscapeCanvasProps> = ({
  landscape,
  particles,
  gBest,
  playerScans,
  onPlayerScan,
  userSearchActive,
  showTrails,
  showContours,
  isPlaying
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cacheCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number; val: number } | null>(null);
  const [radarPulse, setRadarPulse] = useState<{ x: number; y: number; size: number } | null>(null);

  const width = 450;
  const height = 400;

  // Render the heightmap to the cache canvas once whenever the landscape or contour setting changes
  useEffect(() => {
    const canvas = cacheCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    const cellSize = 3; // Fast render grid size
    for (let x = 0; x < width; x += cellSize) {
      for (let y = 0; y < height; y += cellSize) {
        const elevation = landscape.evaluate(x, y, width, height);

        let hue, sat, light;
        if (elevation < 15) {
          // Absolute deepest valley (treasure) = Deep violet/black
          const ratio = elevation / 15;
          hue = 260 + ratio * 20;
          sat = 95;
          light = 6 + ratio * 10; // Very dark to medium dark
        } else if (elevation < 45) {
          // Valleys = Indigo to Cyber Cyan
          const ratio = (elevation - 15) / 30;
          hue = 240 - ratio * 60; // 240 down to 180 (Indigo to Cyan)
          sat = 85;
          light = 12 + ratio * 22; // dark-mid
        } else if (elevation < 75) {
          // Slopes = Teal to Emerald Green
          const ratio = (elevation - 45) / 30;
          hue = 180 - ratio * 60; // 180 to 120 (Cyan to Green)
          sat = 80;
          light = 30 + ratio * 15;
        } else {
          // Peaks = Neon Orange to Hot Crimson Pink
          const ratio = (elevation - 75) / 25;
          hue = 30 - ratio * 45; // 30 down to 345 (Orange to Crimson)
          sat = 95;
          light = 45 + ratio * 15;
        }

        // Draw structural topographical lines
        if (showContours) {
          const contourInterval = 10;
          const isBoundary = Math.floor(elevation / contourInterval) !== Math.floor((elevation + 1.2) / contourInterval);
          if (isBoundary) {
            // Lighten the cell of contour boundaries
            light = Math.min(100, light + 14);
          }
        }

        ctx.fillStyle = `hsl(${hue}, ${sat}%, ${light}%)`;
        ctx.fillRect(x, y, cellSize, cellSize);
      }
    }
  }, [landscape, showContours]);

  // Main rendering loop for movements and overlay elements
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Direct 60fps refresh
    ctx.clearRect(0, 0, width, height);

    if (userSearchActive) {
      // Draw a digital "Blind Radar grid" if search mode is active, reinforcing lack of global map knowledge!
      ctx.fillStyle = '#03170d'; // Deep academic forest green dark
      ctx.fillRect(0, 0, width, height);

      // Draw faint UdeA-colored green cybernetic gridlines
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.09)'; // Emerald/green lines
      ctx.lineWidth = 1;
      
      const gridSpacing = 40;
      for (let gX = 0; gX < width; gX += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(gX, 0);
        ctx.lineTo(gX, height);
        ctx.stroke();
      }
      for (let gY = 0; gY < height; gY += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, gY);
        ctx.lineTo(width, gY);
        ctx.stroke();
      }

      // Draw radar circular telemetry design
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.06)';
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 70, 0, Math.PI * 2);
      ctx.arc(width / 2, height / 2, 140, 0, Math.PI * 2);
      ctx.stroke();

      // Hint inside the blind radar: very faint pulse center label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.font = '9px monospace';
      ctx.fillText('MODO: BÚSQUEDA A CIEGAS CON RADAR', 10, height - 12);
    } else {
      // Draw compiled high-contrast landscape background in regular sandbox mode
      if (cacheCanvasRef.current) {
        ctx.drawImage(cacheCanvasRef.current, 0, 0);
      }
    }

    // Play radar scan animation
    if (radarPulse) {
      ctx.beginPath();
      ctx.arc(radarPulse.x, radarPulse.y, radarPulse.size, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(244, 63, 94, ${1 - radarPulse.size / 60})`;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(radarPulse.x, radarPulse.y, radarPulse.size * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(244, 63, 94, ${(1 - radarPulse.size / 60) * 0.5})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Draw Player Scans
    playerScans.forEach((scan, idx) => {
      // Draw crosshair
      ctx.strokeStyle = '#f43f5e'; // rose-500
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      // Horizontal
      ctx.moveTo(scan.x - 8, scan.y);
      ctx.lineTo(scan.x + 8, scan.y);
      // Vertical
      ctx.moveTo(scan.x, scan.y - 8);
      ctx.lineTo(scan.x, scan.y + 8);
      ctx.stroke();

      // Outer target ring
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
      ctx.beginPath();
      ctx.arc(scan.x, scan.y, 6, 0, Math.PI * 2);
      ctx.stroke();

      // Show the numerical energy value directly over the radar point
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`[${idx + 1}] e:${scan.val.toFixed(1)}`, scan.x + 10, scan.y - 4);
    });

    // Draw Particle Trails
    if (showTrails) {
      particles.forEach((p) => {
        if (p.trail.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(p.trail[0].x, p.trail[0].y);
        for (let i = 1; i < p.trail.length; i++) {
          ctx.lineTo(p.trail[i].x, p.trail[i].y);
        }
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.25)'; // faint green trail
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    }

    // Draw Individual Particles (Candidate solutions)
    particles.forEach((p) => {
      // Small velocity vector line
      const arrowMultiplier = 1.6;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.vx * arrowMultiplier, p.y + p.vy * arrowMultiplier);
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.75)'; // vibrant gold velocity line
      ctx.lineWidth = 1.3;
      ctx.stroke();

      // Personal Best marker (where this particle achieved its best individual evaluation)
      ctx.beginPath();
      ctx.arc(p.pBestX, p.pBestY, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'; // clean white bests
      ctx.fill();

      // Body of particle (glowing dot)
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
      
      // Gradient glow
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 6);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#10b981'); // emerald
      grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
      
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    });

    // Draw Global Best (gBest Ring and marker)
    if (gBest) {
      ctx.strokeStyle = '#10b981'; // neon emerald glow for the leader
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.arc(gBest.x, gBest.y, 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash

      // Glow pulse on leader
      ctx.beginPath();
      ctx.arc(gBest.x, gBest.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#facc15'; // yellow core
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0; // Reset shadow blur
    }

    // Draw true mathematical minimum (Subtle dotted white target reticle for guidance, but hidden in search mode)
    if (!userSearchActive) {
      const exactMinX = landscape.globalMin.x * width;
      const exactMinY = landscape.globalMin.y * height;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(exactMinX, exactMinY, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(exactMinX - 12, exactMinY); ctx.lineTo(exactMinX + 12, exactMinY);
      ctx.moveTo(exactMinX, exactMinY - 12); ctx.lineTo(exactMinX, exactMinY + 12);
      ctx.stroke();
    }

  }, [particles, gBest, playerScans, radarPulse, showTrails, landscape, userSearchActive]);

  // Handle radar animation
  useEffect(() => {
    if (!radarPulse) return;
    let animFrame: number;
    const start = Date.now();

    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = elapsed / 450; // 450ms animation
      if (progress >= 1) {
        setRadarPulse(null);
      } else {
        setRadarPulse({
          ...radarPulse,
          size: progress * 65
        });
        animFrame = requestAnimationFrame(animate);
      }
    };

    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [radarPulse ? radarPulse.x + ',' + radarPulse.y : null]);

  // Trigger synth beep on scan/radar
  const triggerSynthTone = (freq: number, type: OscillatorType, dur: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch (e) {
      // Fallback
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    const x = Math.max(0, Math.min(width, (e.clientX - rect.left) * scaleX));
    const y = Math.max(0, Math.min(height, (e.clientY - rect.top) * scaleY));
    const val = landscape.evaluate(x, y, width, height);
    setHoverPos({ x, y, val });
  };

  const handleMouseClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!userSearchActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    const x = Math.max(0, Math.min(width, (e.clientX - rect.left) * scaleX));
    const y = Math.max(0, Math.min(height, (e.clientY - rect.top) * scaleY));

    setRadarPulse({ x, y, size: 0 });
    triggerSynthTone(440, 'triangle', 0.25);
    onPlayerScan(x, y);
  };

  return (
    <div className="flex flex-col items-center bg-stone-900 border border-emerald-800/40 rounded-xl p-4 shadow-xl select-none w-full">
      <div className="relative overflow-hidden rounded-lg cursor-crosshair border border-stone-800 w-full flex justify-center">
        
        {/* Cached Topographic Canvas */}
        <canvas
          ref={cacheCanvasRef}
          style={{ display: 'none' }}
        />

        {/* Foreground Overlay Canvas */}
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverPos(null)}
          onClick={handleMouseClick}
          className="block w-full h-auto max-w-[450px] aspect-[450/400]"
          id="pso-canvas-landscape"
        />

        {/* Floating coordinate inspector */}
        {hoverPos && (
          <div className="absolute top-3 left-3 bg-stone-950/95 border border-emerald-800/60 rounded px-2.5 py-1.5 font-mono text-xs text-stone-300 pointer-events-none backdrop-blur-sm shadow-md flex flex-col gap-0.5">
            <div className="flex justify-between gap-5 text-stone-450">
              <span>Coordenada X:</span>
              <span className="text-white">{(hoverPos.x).toFixed(0)} px</span>
            </div>
            <div className="flex justify-between gap-5 text-stone-450">
              <span>Coordenada Y:</span>
              <span className="text-white">{(hoverPos.y).toFixed(0)} px</span>
            </div>
            <div className="flex justify-between gap-5 font-semibold text-emerald-400 border-t border-stone-800 pt-1 mt-1">
              <span>{userSearchActive ? 'Radar (Energía):' : 'Lectura de Energía:'}</span>
              <span className="glow-green font-bold">{hoverPos.val.toFixed(2)} d</span>
            </div>
          </div>
        )}

        {/* Manual search instructions popup overlay */}
        {userSearchActive && playerScans.length === 0 && (
          <div className="absolute inset-0 bg-stone-950/95 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-6 transition-all duration-300 pointer-events-none animate-pulse">
            <div className="bg-emerald-950/45 border border-emerald-500/40 rounded-xl p-4 max-w-sm pointer-events-auto shadow-xl shadow-emerald-950/20">
              <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-600 text-white mb-2 shadow">¡Lienzo Oculto!</span>
              <p className="text-sm text-emerald-100 font-sans leading-relaxed">
                El mapa está oscurecido. Haz clic en la superficie para <strong className="text-white font-semibold">escanear la energía local</strong> con tu radar. Halla la coordenada del óptimo global (0.00 d) antes que el enjambre de partículas en movimiento.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Visual Color Scale Indicator */}
      <div className="w-full mt-4 flex items-center justify-between px-2 font-mono text-xs">
        <span className="text-emerald-400 flex items-center gap-1.5 font-sans">
          <span className="h-3 w-3 bg-violet-950 border border-emerald-400 rounded-sm"></span>
          Óptimo Global/Mínimo (0.00)
        </span>
        <div className="h-2.5 w-24 rounded bg-gradient-to-r from-violet-950 via-emerald-500 to-rose-500 border border-stone-850"></div>
        <span className="text-rose-400 flex items-center gap-1.5 font-sans">
          Energía Máxima (100.00)
          <span className="h-3 w-3 bg-rose-500 rounded-sm"></span>
        </span>
      </div>
    </div>
  );
};
