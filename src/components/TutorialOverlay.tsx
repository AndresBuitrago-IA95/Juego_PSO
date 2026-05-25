import React from 'react';
import { Sparkles, Compass, Users, Radio, X } from 'lucide-react';

interface TutorialOverlayProps {
  onDismiss: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onDismiss }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-emerald-800/40 rounded-2xl p-6 md:p-8 shadow-2xl my-8">
        
        {/* Dismiss Button */}
        <button 
          onClick={onDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-stone-850 text-stone-400 hover:text-white transition cursor-pointer"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles size={24} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-sans text-white tracking-tight">
              Optimización por Enjambre de Partículas (PSO)
            </h2>
            <p className="text-xs text-emerald-400 font-mono tracking-wide uppercase">
              Algoritmo de Inteligencia Colectiva de Partículas • UdeA
            </p>
          </div>
        </div>

        {/* Core Description */}
        <div className="space-y-6 text-sm font-sans text-stone-300 leading-relaxed">
          
          <div className="bg-stone-950/50 border border-stone-850 rounded-xl p-4">
            <h3 className="font-semibold text-white mb-1.5 text-base flex items-center gap-1.5">
              🚀 La décima del Enjambre de Partículas
            </h3>
            <p className="text-stone-300">
              Imagina un enjambre de sondas o partículas robóticas sobrevolando un relieve topográfico desconocido para localizar el <strong className="text-emerald-400">punto de menor altitud (mínimo global de energía potencial)</strong>. 
              Ninguna partícula tiene coordenadas GPS con mapa completo. Solo conocen la altura y las coordenadas de la zona donde están situadas en cada iteración.
            </p>
          </div>

          <p className="text-stone-400 text-xs font-mono uppercase tracking-wider text-center py-1 border-y border-stone-850/40">
            CÓMO CONVERGEN AL MÍNIMO MEDIANTE 3 COMPONENTES VECTORIALES:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Force 1: Inertia */}
            <div className="bg-stone-950/30 border border-stone-850 rounded-lg p-3.5 flex flex-col items-center text-center">
              <Compass size={22} className="text-purple-400 mb-2" />
              <span className="font-semibold text-white text-xs mb-1 font-mono uppercase tracking-wide">1. Inercia (w)</span>
              <p className="text-xs text-stone-400">
                Resistencia física. La tendencia de cada partícula a perseverar en la velocidad y dirección de su movimiento previo. Evita giros o detenciones bruscas.
              </p>
            </div>

            {/* Force 2: Nostalgia */}
            <div className="bg-stone-950/30 border border-stone-850 rounded-lg p-3.5 flex flex-col items-center text-center">
              <Users size={22} className="text-amber-400 mb-2" />
              <span className="font-semibold text-white text-xs mb-1 font-mono uppercase tracking-wide">2. Nostalgia (c1)</span>
              <p className="text-xs text-stone-400">
                Atracción cognitiva individual. Un tirón elástico que jala a la partícula hacia el mejor punto local históricamente registrado por ella misma.
              </p>
            </div>

            {/* Force 3: Social Pull */}
            <div className="bg-stone-950/30 border border-stone-850 rounded-lg p-3.5 flex flex-col items-center text-center">
              <Radio size={22} className="text-emerald-400 mb-2" />
              <span className="font-semibold text-white text-xs mb-1 font-mono uppercase tracking-wide">3. Sociabilidad (c2)</span>
              <p className="text-xs text-stone-400">
                Atracción colectiva. La fuerza electromagnética unificada que tira de todas las partículas hacia el mejor punto óptimo reportado por cualquier miembro del grupo.
              </p>
            </div>

          </div>

          <div className="bg-emerald-950/25 border border-emerald-500/10 rounded-xl p-4 flex flex-col gap-2">
            <h4 className="font-semibold text-emerald-400 flex items-center gap-1.5 text-xs font-mono uppercase tracking-wide">
              🎮 Dinámica del Juego Sencillo
            </h4>
            <p className="text-xs text-stone-300 font-sans">
              1. Activa <strong className="text-rose-450 text-rose-400">Jugar como Buscador</strong>. El mapa se oscurece por completo.<br/>
              2. Tu objetivo es encontrar el centro de menor energía (<strong className="text-white">mínimo global = 0.00</strong>) haciendo solo <strong className="text-white">5 disparos de sonar</strong>.<br/>
              3. Al mismo tiempo, inicia el simulador de enjambre de partículas (PSO).<br/>
              4. El juego dictará quién es más óptimo: tu análisis espacial o los coeficientes vectoriales del enjambre.
            </p>
          </div>

        </div>

        {/* Footer actions */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={onDismiss}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 hover:text-white active:scale-95 text-stone-100 font-semibold transition text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 border border-emerald-500/20 cursor-pointer"
          >
            Aceptar y Comenzar Búsqueda
          </button>
        </div>

      </div>
    </div>
  );
};
