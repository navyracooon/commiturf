import { registerRootComponent } from 'expo';
import { NativeModules, Platform, TurboModuleRegistry } from 'react-native';

import App from './App';

registerRootComponent(App);

const androidWidgetModule =
  Platform.OS === 'android'
    ? (TurboModuleRegistry.get('AndroidWidget') ?? NativeModules.AndroidWidget)
    : null;

if (androidWidgetModule) {
  const { registerWidgetTaskHandler } = require('react-native-android-widget') as typeof import('react-native-android-widget');
  const { widgetTaskHandler } = require('./src/widgets/android/widgetTaskHandler') as typeof import('./src/widgets/android/widgetTaskHandler');
  registerWidgetTaskHandler(widgetTaskHandler);
}
