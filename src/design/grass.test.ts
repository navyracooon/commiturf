import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  grassBladeSpecs,
  grassLevelSpecs,
  grassVarieties,
  type GrassVarietyId,
} from './grass';
import { renderDetailedGrassSvg } from './renderDetailedGrass';

test('defines one progressively larger grass design for every growth level', () => {
  assert.deepEqual(
    [0, 1, 2, 3, 4].map((level) => grassLevelSpecs[level as 0 | 1 | 2 | 3 | 4].bladeCount),
    [0, 3, 5, 7, 9],
  );

  assert.deepEqual(
    [0, 1, 2, 3, 4].map((level) => grassLevelSpecs[level as 0 | 1 | 2 | 3 | 4].heightRatio),
    [0, 0.55, 0.7, 0.85, 1],
  );
  assert.deepEqual(
    [0, 1, 2, 3, 4].map((level) => grassLevelSpecs[level as 0 | 1 | 2 | 3 | 4].spreadRatio),
    [0, 0.45, 0.65, 0.82, 1],
  );
  assert.deepEqual(
    [0, 1, 2, 3, 4].map((level) => grassLevelSpecs[level as 0 | 1 | 2 | 3 | 4].color),
    ['#A4A89A', '#A7CD9C', '#78B978', '#46A064', '#237D4E'],
  );
});

test('uses seed and seed-head treatments only at the intended stages', () => {
  assert.equal(grassLevelSpecs[0].hasSeed, true);
  assert.equal(grassLevelSpecs[0].hasSeedHead, false);
  assert.equal(grassLevelSpecs[4].hasSeed, false);
  assert.equal(grassLevelSpecs[4].hasSeedHead, true);
  assert.equal(grassLevelSpecs[4].color, '#237D4E');
});

test('keeps every detailed blade rooted in the same canonical tuft geometry', () => {
  assert.equal(grassBladeSpecs.length, 9);
  grassBladeSpecs.forEach((blade) => {
    assert.match(blade.path, /^M32 54 C/);
  });
  assert.deepEqual(
    grassBladeSpecs.map((blade) => blade.opacity),
    [0.78, 0.88, 0.98, 0.78, 0.88, 0.98, 0.78, 0.88, 0.98],
  );
});

test('uses one detailed renderer in the app and Android widget', () => {
  const appSource = readFileSync(
    new URL('../components/GrassTuft.tsx', import.meta.url),
    'utf8',
  );
  const androidSource = readFileSync(
    new URL('../widgets/android/GardenAndroidWidget.tsx', import.meta.url),
    'utf8',
  );
  assert.match(appSource, /renderDetailedGrassSvg\(level/);
  assert.match(androidSource, /renderDetailedGrassSvg\(safeLevel/);
});

test('keeps every generated iOS asset tied to the canonical SVG fingerprint', () => {
  const iosSource = readFileSync(
    new URL('../widgets/ios/GardenWidget.tsx', import.meta.url),
    'utf8',
  );
  const manifest = readFileSync(
    new URL('./generatedWidgetGrassAssets.ts', import.meta.url),
    'utf8',
  );
  assert.match(iosSource, /props\.grassImageUris\?\.\[safeLevel\]/);

  (Object.keys(grassVarieties) as GrassVarietyId[]).forEach((variety) => {
    ([0, 1, 2, 3, 4] as const).forEach((level) => {
      const fingerprint = createHash('sha256')
        .update(renderDetailedGrassSvg(level, { variety }))
        .digest('hex')
        .slice(0, 10);
      const filename = `${variety}-level-${level}-${fingerprint}.png`;
      assert.match(manifest, new RegExp(filename));
      const png = readFileSync(
        new URL(`../../assets/widget-grass/${filename}`, import.meta.url),
      );
      assert.equal(png.subarray(1, 4).toString('ascii'), 'PNG');
    });
  });
});
