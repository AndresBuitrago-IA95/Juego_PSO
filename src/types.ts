export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  pBestX: number;
  pBestY: number;
  pBestVal: number;
  fitness: number;
  trail: { x: number; y: number }[];
}

export type LandscapeId = 'sphere' | 'rastrigin' | 'rosenbrock' | 'ackley';

export interface Landscape {
  id: LandscapeId;
  name: string;
  description: string;
  difficulty: 'Fácil' | 'Media' | 'Difícil' | 'Experto';
  // Returns fitness (elevation to minimize, between 0 and 100)
  evaluate: (x: number, y: number, width: number, height: number, timeShift?: number) => number;
  globalMin: { x: number; y: number }; // Relative coordinates [0..1]
}

export interface PsoParams {
  w: number;      // Inertia weight
  c1: number;     // Cognitive coefficient (nostalgia)
  c2: number;     // Social coefficient (swarm attraction)
  numParticles: number;
  maxVelocity: number;
}

export interface Mission {
  id: number;
  title: string;
  objective: string;
  landscapeId: LandscapeId;
  instructions: string;
  targetMaxSteps: number;
  successCondition: (
    gBestVal: number,
    gBestX: number,
    gBestY: number,
    width: number,
    height: number,
    currentStep: number,
    particles: Particle[],
    targetX?: number,
    targetY?: number
  ) => { success: boolean; progress: number; message: string };
  defaultParams: PsoParams;
}
