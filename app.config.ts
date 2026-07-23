import type { ConfigContext, ExpoConfig } from 'expo/config';
import type { WithAndroidWidgetsParams } from 'react-native-android-widget';

const androidWidget: WithAndroidWidgetsParams = {
  widgets: [
    {
      name: 'Garden',
      label: 'Commiturf Garden',
      description: 'Your GitHub garden at a glance',
      minWidth: '250dp',
      minHeight: '110dp',
      targetCellWidth: 4,
      targetCellHeight: 2,
      updatePeriodMillis: 1800000,
      resizeMode: 'horizontal|vertical',
    },
  ],
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Commiturf',
  slug: 'commiturf',
  version: '0.1.0',
  icon: './assets/icon.png',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  scheme: 'commiturf',
  backgroundColor: '#F2F0E7',
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'app.commiturf.mobile',
    buildNumber: '3',
    config: {
      usesNonExemptEncryption: false,
    },
    privacyManifests: {
      NSPrivacyAccessedAPITypes: [
        {
          NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryUserDefaults',
          NSPrivacyAccessedAPITypeReasons: ['CA92.1'],
        },
        {
          NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryFileTimestamp',
          NSPrivacyAccessedAPITypeReasons: ['C617.1'],
        },
        {
          NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategorySystemBootTime',
          NSPrivacyAccessedAPITypeReasons: ['35F9.1'],
        },
      ],
      NSPrivacyCollectedDataTypes: [],
      NSPrivacyTracking: false,
    },
  },
  android: {
    package: 'app.commiturf.mobile',
    versionCode: 1,
    allowBackup: false,
    blockedPermissions: [
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.SYSTEM_ALERT_WINDOW',
      'android.permission.WRITE_EXTERNAL_STORAGE',
    ],
    adaptiveIcon: {
      backgroundColor: '#FBFAF4',
      foregroundImage: './assets/adaptive-icon.png',
    },
  },
  plugins: [
    [
      'expo-splash-screen',
      {
        backgroundColor: '#FBFAF4',
        image: './assets/icon.png',
        imageWidth: 148,
        resizeMode: 'contain',
      },
    ],
    [
      'expo-widgets',
      {
        bundleIdentifier: 'app.commiturf.mobile.ExpoWidgetsTarget',
        groupIdentifier: 'group.app.commiturf.mobile',
        widgets: [
          {
            name: 'GardenWidget',
            displayName: 'Commiturf Garden',
            description: 'Your GitHub garden at a glance',
            supportedFamilies: ['systemSmall', 'systemMedium', 'systemLarge'],
          },
        ],
      },
    ],
    ['react-native-android-widget', androidWidget],
  ],
  experiments: {
    typedRoutes: false,
  },
});
