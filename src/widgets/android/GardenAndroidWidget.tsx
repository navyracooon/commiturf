import { FlexWidget, TextWidget } from 'react-native-android-widget';

import type { WidgetSnapshot } from '../../types/garden';

interface GardenAndroidWidgetProps {
  snapshot: WidgetSnapshot;
}

export function GardenAndroidWidget({ snapshot }: GardenAndroidWidgetProps) {
  const growthColors = ['#B8C8B7', '#9BC69D', '#61A66E', '#2E7A4E', '#E9D27B'] as const;

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
        padding: 18,
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

      <FlexWidget style={{ alignItems: 'flex-end', flexDirection: 'row', flexGap: 7, height: 30 }}>
        {snapshot.levels.slice(-7).map((level, index) => (
          <FlexWidget
            key={`${index}-${level}`}
            style={{
              backgroundColor: growthColors[level],
              borderRadius: 4,
              height: 5 + level * 5,
              width: 9,
            }}
          />
        ))}
      </FlexWidget>

      <FlexWidget style={{ alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between' }}>
        <FlexWidget style={{ flexDirection: 'column' }}>
          <TextWidget text={`${snapshot.total}`} style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '700' }} />
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
