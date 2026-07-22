import { FlexWidget, SvgWidget, TextWidget } from 'react-native-android-widget';

import type { WidgetSnapshot } from '../../types/garden';

interface GardenAndroidWidgetProps {
  snapshot: WidgetSnapshot;
}

const bladePaths = [
  '<path d="M23 51 C21 39 21 21 24 7 C27 22 27 39 25 51 Z"/>',
  '<path d="M21 51 C17 41 13 29 12 18 C19 25 23 38 23 51 Z"/>',
  '<path d="M26 51 C28 39 34 27 40 20 C38 33 33 44 28 51 Z"/>',
  '<path d="M19 51 C13 45 8 37 6 29 C14 34 20 42 22 51 Z"/>',
  '<path d="M28 51 C33 45 40 38 44 31 C43 40 36 47 30 52 Z"/>',
  '<path d="M23 51 C20 37 18 25 20 13 C24 25 26 39 25 51 Z"/>',
  '<path d="M26 51 C27 39 29 30 33 18 C34 31 31 43 28 51 Z"/>',
  '<path d="M30 51 C35 45 40 41 46 38 C43 46 37 50 31 53 Z"/>',
] as const;

const bladeCounts = [0, 3, 4, 6, 8] as const;
const growthColors = ['#A4A89A', '#A7CD9C', '#78B978', '#46A064', '#B5D88F'] as const;

function createGrassSvg(level: number) {
  const safeLevel = Math.max(0, Math.min(4, level));
  const color = growthColors[safeLevel] ?? growthColors[0];
  const blades = bladePaths.slice(0, bladeCounts[safeLevel]).join('');
  const seed = safeLevel === 0 ? '<ellipse cx="24" cy="47" rx="3" ry="2.2" fill="#D4BF74"/>' : '';
  const seedHead =
    safeLevel === 4
      ? '<circle cx="24" cy="8" r="3.2" fill="#F1D77A"/><circle cx="21" cy="6" r="1.1" fill="#F7E6A3"/><circle cx="27" cy="6.5" r="1" fill="#F7E6A3"/>'
      : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 56"><ellipse cx="24" cy="52" rx="15" ry="3" fill="#0C2D23"/>${seed}<g fill="${color}">${blades}</g>${seedHead}</svg>`;
}

export function GardenAndroidWidget({ snapshot }: GardenAndroidWidgetProps) {
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      accessibilityLabel={`Commiturf garden. ${snapshot.total} contributions this week, ${snapshot.streak} day streak.`}
      style={{
        backgroundGradient: { from: '#183F31', to: '#2A6046', orientation: 'TL_BR' },
        borderRadius: 28,
        flexDirection: 'column',
        height: 'match_parent',
        justifyContent: 'space-between',
        padding: 12,
        width: 'match_parent',
      }}
    >
      <FlexWidget style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
        <TextWidget
          text="COMMITURF"
          style={{ color: '#BFD7C1', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 }}
        />
        <TextWidget text={`@${snapshot.username}`} style={{ color: '#DCE7D9', fontSize: 10 }} />
      </FlexWidget>

      <FlexWidget
        style={{ alignItems: 'flex-end', flexDirection: 'row', height: 42, justifyContent: 'space-between' }}
      >
        {snapshot.levels.slice(-7).map((level, index) => (
          <SvgWidget
            key={`${index}-${level}`}
            svg={createGrassSvg(level)}
            style={{ height: 42, width: 28 }}
          />
        ))}
      </FlexWidget>

      <FlexWidget style={{ alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between' }}>
        <FlexWidget style={{ flexDirection: 'column' }}>
          <TextWidget text={`${snapshot.total}`} style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '700' }} />
          <TextWidget text="this week" style={{ color: '#BFD7C1', fontSize: 9 }} />
        </FlexWidget>
        <TextWidget
          text={`${snapshot.streak} day streak`}
          style={{ color: '#F2DA8B', fontSize: 11, fontWeight: '700' }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
