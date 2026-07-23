import type { GrowthLevel } from '../types/garden';
import {
  defaultGrassVarietyId,
  grassVarieties,
  type GrassVarietyId,
} from './grass';

export interface RenderDetailedGrassOptions {
  includeSoil?: boolean;
  showSeed?: boolean;
  variety?: GrassVarietyId;
}

export function renderDetailedGrassSvg(
  level: GrowthLevel,
  {
    includeSoil = false,
    showSeed = true,
    variety = defaultGrassVarietyId,
  }: RenderDetailedGrassOptions = {},
): string {
  const spec = grassVarieties[variety].detailed;
  const levelSpec = spec.levels[level];
  const strokeWidth = level >= 3 ? 2.8 : 3.2;
  const blades = spec.blades
    .slice(0, levelSpec.bladeCount)
    .map(
      (blade) =>
        `<path d="${blade.path}" fill="none" opacity="${blade.opacity}" stroke="${levelSpec.color}" stroke-linecap="round" stroke-width="${strokeWidth}"/>`,
    )
    .join('');
  const seed =
    levelSpec.hasSeed && showSeed
      ? `<ellipse cx="${spec.seed.x}" cy="${spec.seed.y}" rx="${spec.seed.radiusX}" ry="${spec.seed.radiusY}" fill="${spec.seed.fill}"/><circle cx="${spec.seed.highlight.x}" cy="${spec.seed.highlight.y}" r="${spec.seed.highlight.radius}" fill="${spec.seed.highlight.fill}"/>`
      : '';
  const head = levelSpec.hasSeedHead
    ? `<circle cx="${spec.head.center.x}" cy="${spec.head.center.y}" r="${spec.head.radius}" fill="${spec.head.fill}"/><circle cx="${spec.head.center.x}" cy="${spec.head.center.y}" r="${spec.head.innerRadius}" fill="${spec.head.innerFill}"/>`
    : '';
  const soil = includeSoil
    ? '<ellipse cx="32" cy="56" rx="20" ry="3.4" fill="#5B4A32" fill-opacity=".19" stroke="#FFFFFF" stroke-opacity=".18"/>'
    : '';
  const transform = `translate(${spec.root.x} ${spec.root.y}) scale(${levelSpec.spreadRatio} ${levelSpec.heightRatio}) translate(${-spec.root.x} ${-spec.root.y})`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${spec.viewBoxSize} ${spec.viewBoxSize}">${soil}${seed}<g transform="${transform}">${blades}</g>${head}</svg>`;
}
