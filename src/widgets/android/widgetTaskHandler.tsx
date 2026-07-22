import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

import { loadWidgetSnapshot } from '../../storage/gardenStorage';
import { GardenAndroidWidget } from './GardenAndroidWidget';

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  if (props.widgetAction === 'WIDGET_DELETED') return;

  const snapshot = await loadWidgetSnapshot();
  props.renderWidget(<GardenAndroidWidget snapshot={snapshot} />);
}
