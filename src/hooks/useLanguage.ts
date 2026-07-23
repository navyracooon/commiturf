import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { NativeModules, Platform } from 'react-native';

import {
  type AppLanguage,
  detectLanguage,
  translations,
} from '../i18n/translations';

const LANGUAGE_KEY = '@commiturf/language';

function getDeviceLanguage(): AppLanguage {
  if (Platform.OS === 'ios') {
    const settings = NativeModules.SettingsManager?.settings as
      | { AppleLanguages?: string[]; AppleLocale?: string }
      | undefined;
    return detectLanguage(settings?.AppleLanguages?.[0] ?? settings?.AppleLocale);
  }

  const locale = (NativeModules.I18nManager as { localeIdentifier?: string } | undefined)
    ?.localeIdentifier;
  return detectLanguage(locale ?? Intl.DateTimeFormat().resolvedOptions().locale);
}

export function useLanguage() {
  const [language, setLanguageState] = useState<AppLanguage>(getDeviceLanguage);
  const [isHydratingLanguage, setIsHydratingLanguage] = useState(true);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(LANGUAGE_KEY)
      .then((stored) => {
        if (active && (stored === 'en' || stored === 'ja')) setLanguageState(stored);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setIsHydratingLanguage(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const setLanguage = useCallback((next: AppLanguage) => {
    setLanguageState(next);
    void AsyncStorage.setItem(LANGUAGE_KEY, next).catch(() => undefined);
  }, []);

  return {
    isHydratingLanguage,
    language,
    messages: translations[language],
    setLanguage,
  };
}
