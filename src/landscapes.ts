import { Landscape } from './types';

export const GARDEN_LANDSCAPE: Landscape = {
  id: 'sphere',
  name: 'Campo de Energía Cuadrática (Sphere Function)',
  description: 'Un espacio de búsqueda bidimensional suavemente convexo. Presenta un mínimo global absoluto de energía residual (0.00) ubicado en el centro exacto de las coordenadas.',
  difficulty: 'Fácil',
  globalMin: { x: 0.5, y: 0.5 },
  evaluate: (x, y, width, height) => {
    const u = x / width - 0.5;
    const v = y / height - 0.5;
    const dist = Math.sqrt(u * u + v * v); // Max distance possible is ~0.7
    
    // Sphere function, normalized 0 - 100
    // At the absolute center (u=0, v=0), the energy potential is 0 (global optimum)
    const val = (dist / 0.7) * 100;
    return Math.min(100, Math.max(0, val));
  }
};
