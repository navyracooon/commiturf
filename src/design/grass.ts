import type { GrowthLevel } from '../types/garden';

export interface GrassLevelSpec {
  bladeCount: number;
  color: string;
  hasSeed: boolean;
  hasSeedHead: boolean;
  heightRatio: number;
  spreadRatio: number;
}

export interface GrassBladeSpec {
  opacity: number;
  path: string;
}

export interface DetailedGrassSpec {
  blades: readonly GrassBladeSpec[];
  head: {
    center: { x: number; y: number };
    fill: string;
    innerFill: string;
    innerRadius: number;
    radius: number;
  };
  levels: Record<GrowthLevel, GrassLevelSpec>;
  root: { x: number; y: number };
  seed: {
    fill: string;
    highlight: { fill: string; radius: number; x: number; y: number };
    radiusX: number;
    radiusY: number;
    x: number;
    y: number;
  };
  viewBoxSize: number;
}

export interface MiniatureBladeSpec {
  endX: number;
  extraHeight: number;
  heightRatio: number;
  minimumLevel: GrowthLevel;
  strokeWidth: number;
}

export interface MiniatureGrassSpec {
  blades: readonly MiniatureBladeSpec[];
  ground: {
    empty: string;
    future: string;
    grown: string;
    halfHeight: number;
    halfWidth: number;
  };
  head: {
    bladeIndex: number;
    color: string;
    radius: number;
  };
  levelHeight: number;
}

export interface GrassVarietySpec {
  detailed: DetailedGrassSpec;
  miniature: MiniatureGrassSpec;
}

export const grassVarieties = {
  classic: {
    detailed: {
      blades: [
        { opacity: 0.78, path: 'M32 54 C30 43 28 36 27 28' },
        { opacity: 0.88, path: 'M32 54 C35 42 38 33 43 24' },
        { opacity: 0.98, path: 'M32 54 C25 46 20 41 15 37' },
        { opacity: 0.78, path: 'M32 54 C39 47 45 43 51 40' },
        { opacity: 0.88, path: 'M32 54 C25 39 22 29 23 19' },
        { opacity: 0.98, path: 'M32 54 C39 38 42 27 48 19' },
        { opacity: 0.78, path: 'M32 54 C29 34 31 22 34 12' },
        { opacity: 0.88, path: 'M32 54 C21 42 15 30 14 23' },
        { opacity: 0.98, path: 'M32 54 C44 43 49 34 52 28' },
      ],
      head: {
        center: { x: 34, y: 12 },
        fill: '#F2D890',
        innerFill: '#A97842',
        innerRadius: 1.1,
        radius: 2.6,
      },
      levels: {
        0: {
          bladeCount: 0,
          color: '#A4A89A',
          hasSeed: true,
          hasSeedHead: false,
          heightRatio: 0,
          spreadRatio: 0,
        },
        1: {
          bladeCount: 3,
          color: '#A7CD9C',
          hasSeed: false,
          hasSeedHead: false,
          heightRatio: 0.55,
          spreadRatio: 0.45,
        },
        2: {
          bladeCount: 5,
          color: '#78B978',
          hasSeed: false,
          hasSeedHead: false,
          heightRatio: 0.7,
          spreadRatio: 0.65,
        },
        3: {
          bladeCount: 7,
          color: '#46A064',
          hasSeed: false,
          hasSeedHead: false,
          heightRatio: 0.85,
          spreadRatio: 0.82,
        },
        4: {
          bladeCount: 9,
          color: '#237D4E',
          hasSeed: false,
          hasSeedHead: true,
          heightRatio: 1,
          spreadRatio: 1,
        },
      },
      root: { x: 32, y: 54 },
      seed: {
        fill: '#886C4B',
        highlight: { fill: '#B99B70', radius: 1.4, x: 34, y: 51 },
        radiusX: 5,
        radiusY: 2.8,
        x: 32,
        y: 53,
      },
      viewBoxSize: 64,
    },
    miniature: {
      blades: [
        {
          endX: 0.6,
          extraHeight: 3,
          heightRatio: 1,
          minimumLevel: 1,
          strokeWidth: 1.55,
        },
        {
          endX: -1.7,
          extraHeight: 1.5,
          heightRatio: 0.72,
          minimumLevel: 1,
          strokeWidth: 1.15,
        },
        {
          endX: 2.3,
          extraHeight: 2,
          heightRatio: 0.8,
          minimumLevel: 3,
          strokeWidth: 1.05,
        },
      ],
      ground: {
        empty: 'rgba(89,90,67,0.17)',
        future: 'rgba(89,90,67,0.10)',
        grown: 'rgba(43,91,58,0.20)',
        halfHeight: 1.8,
        halfWidth: 3,
      },
      head: {
        bladeIndex: 0,
        color: '#F2D890',
        radius: 1.1,
      },
      levelHeight: 1.85,
    },
  },
} as const satisfies Record<string, GrassVarietySpec>;

export type GrassVarietyId = keyof typeof grassVarieties;

export const defaultGrassVarietyId: GrassVarietyId = 'classic';
export const defaultGrassVariety = grassVarieties[defaultGrassVarietyId];

// Compatibility aliases keep existing renderers small while the catalog remains the sole source.
export const grassBladeSpecs = defaultGrassVariety.detailed.blades;
export const grassLevelSpecs = defaultGrassVariety.detailed.levels;
export const miniatureGrassSpec = defaultGrassVariety.miniature;
