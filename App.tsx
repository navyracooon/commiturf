import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from './src/components/BrandMark';
import { GardenField } from './src/components/GardenField';
import { GlobeIcon } from './src/components/GlobeIcon';
import { LanguageSheet } from './src/components/LanguageSheet';
import { PeriodControl } from './src/components/PeriodControl';
import { PrivacySheet } from './src/components/PrivacySheet';
import { ProfileSheet } from './src/components/ProfileSheet';
import { StatsPanel } from './src/components/StatsPanel';
import { useGarden } from './src/hooks/useGarden';
import { useLanguage } from './src/hooks/useLanguage';
import { localeFor } from './src/i18n/translations';
import { colors } from './src/theme/colors';
import type { GardenPeriod } from './src/types/garden';

function moveReferenceDate(date: Date, period: GardenPeriod, amount: number): Date {
  const next = new Date(date);

  if (period === 'week') {
    next.setDate(next.getDate() + amount * 7);
  } else if (period === 'month') {
    next.setDate(1);
    next.setMonth(next.getMonth() + amount);
  } else {
    next.setFullYear(next.getFullYear() + amount, 0, 1);
  }

  return next;
}

function isCurrentPeriod(referenceDate: Date, period: GardenPeriod): boolean {
  const today = new Date();
  if (period === 'year') return referenceDate.getFullYear() === today.getFullYear();
  if (period === 'month') {
    return (
      referenceDate.getFullYear() === today.getFullYear() &&
      referenceDate.getMonth() === today.getMonth()
    );
  }

  const mondayOffset = (date: Date) => (date.getDay() + 6) % 7;
  const referenceMonday = new Date(referenceDate);
  referenceMonday.setDate(referenceMonday.getDate() - mondayOffset(referenceMonday));
  const currentMonday = new Date(today);
  currentMonday.setDate(currentMonday.getDate() - mondayOffset(currentMonday));
  return referenceMonday.toDateString() === currentMonday.toDateString();
}

function GitHubAvatar({ username }: { username: string }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [username]);

  if (failed) {
    return <Text style={styles.avatarInitial}>{username.slice(0, 1).toUpperCase()}</Text>;
  }

  return (
    <Image
      accessibilityIgnoresInvertColors
      onError={() => setFailed(true)}
      resizeMode="contain"
      source={{ uri: `https://github.com/${username}.png?size=96` }}
      style={styles.avatarImage}
    />
  );
}

function CommiturfApp() {
  const [period, setPeriod] = useState<GardenPeriod>('week');
  const [referenceDate, setReferenceDate] = useState(() => new Date());
  const [profileOpen, setProfileOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const { isHydratingLanguage, language, messages, setLanguage } = useLanguage();
  const garden = useGarden(period, language, referenceDate);
  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(localeFor(language), {
        day: 'numeric',
        month: 'long',
        weekday: 'long',
      }).format(new Date()),
    [language],
  );

  const connect = async (username: string) => {
    const success = await garden.sync(username);
    if (success) setProfileOpen(false);
  };

  if (garden.isHydrating || isHydratingLanguage) {
    return (
      <LinearGradient colors={[colors.canvas, '#E7EBDD']} style={styles.loading}>
        <BrandMark size={48} />
        <ActivityIndicator color={colors.forest} style={styles.loadingSpinner} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[colors.canvas, '#E7EBDD', colors.canvasWarm]} locations={[0, 0.55, 1]} style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              colors={[colors.forest]}
              onRefresh={() => void garden.sync()}
              refreshing={garden.isRefreshing && !profileOpen}
              tintColor={colors.forest}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <BrandMark size={31} />
              <Text style={styles.brand}>commiturf</Text>
            </View>
            <View style={styles.headerActions}>
              <Pressable
                accessibilityLabel={messages.accessibility.openLanguage}
                accessibilityRole="button"
                onPress={() => setLanguageOpen(true)}
                style={({ pressed }) => [styles.languageButton, pressed && styles.pressed]}
              >
                <GlobeIcon size={20} />
              </Pressable>
              <Pressable
                accessibilityLabel={
                  garden.username
                    ? messages.accessibility.changeProfile
                    : messages.accessibility.connectProfile
                }
                accessibilityRole="button"
                onPress={() => {
                  garden.setError(null);
                  setProfileOpen(true);
                }}
                style={({ pressed }) => [
                  styles.avatarButton,
                  garden.username ? styles.avatarButtonConnected : styles.avatarButtonDemo,
                  pressed && styles.pressed,
                ]}
              >
                {garden.username ? (
                  <GitHubAvatar username={garden.username} />
                ) : (
                  <Text style={styles.avatarLeaf}>↗</Text>
                )}
              </Pressable>
            </View>
          </View>

          <View style={styles.intro}>
            <Text style={styles.date}>{todayLabel.toUpperCase()}</Text>
            <Text style={[styles.title, language === 'ja' && styles.titleJapanese]}>
              {garden.isDemo ? messages.app.demoTitle : messages.app.connectedTitle}
            </Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, garden.isSyncing && styles.statusDotSyncing]} />
              <Text style={styles.subtitle}>
                {garden.isDemo
                  ? messages.app.demoSubtitle
                  : `@${garden.username}  ·  ${
                      garden.isSyncing
                        ? messages.app.syncing
                        : garden.error
                          ? messages.app.savedGarden
                          : messages.app.upToDate
                    }`}
              </Text>
            </View>
          </View>

          <View style={styles.periodRow}>
            <PeriodControl
              language={language}
              onChange={(nextPeriod) => {
                setPeriod(nextPeriod);
                setReferenceDate(new Date());
              }}
              value={period}
            />
            {garden.isDemo ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => setProfileOpen(true)}
                style={({ pressed }) => [styles.connectButton, pressed && styles.pressed]}
              >
                <Text style={styles.connectText}>{messages.app.connect}</Text>
              </Pressable>
            ) : null}
          </View>

          <GardenField
            canNavigateNext={!isCurrentPeriod(referenceDate, period)}
            days={garden.days}
            isLoading={garden.isLoadingPeriod}
            language={language}
            onNavigate={(amount) => {
              setReferenceDate((current) => moveReferenceDate(current, period, amount));
            }}
            period={period}
          />
          {!garden.isLoadingPeriod ? (
            <StatsPanel language={language} stats={garden.stats} />
          ) : null}

          <View style={styles.footerGroup}>
            <Text style={styles.footer}>{messages.app.footer}</Text>
            <Pressable
              accessibilityLabel={messages.accessibility.openPrivacy}
              accessibilityRole="button"
              hitSlop={10}
              onPress={() => setPrivacyOpen(true)}
              style={({ pressed }) => pressed && styles.footerLinkPressed}
            >
              <Text style={styles.footerLink}>{messages.privacy.title}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>

      <ProfileSheet
        error={garden.error}
        isSyncing={garden.isSyncing}
        language={language}
        onClose={() => {
          if (!garden.isSyncing) setProfileOpen(false);
        }}
        onDisconnect={garden.disconnect}
        onSubmit={(username) => void connect(username)}
        username={garden.username}
        visible={profileOpen}
      />
      <LanguageSheet
        language={language}
        onClose={() => setLanguageOpen(false)}
        onSelect={setLanguage}
        visible={languageOpen}
      />
      <PrivacySheet
        language={language}
        onClose={() => setPrivacyOpen(false)}
        visible={privacyOpen}
      />
      <StatusBar style="dark" />
    </LinearGradient>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <CommiturfApp />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  avatarButton: {
    alignItems: 'center',
    borderRadius: 21,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  avatarButtonConnected: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(20, 55, 45, 0.16)',
    borderWidth: 1,
    elevation: 2,
    shadowColor: colors.forest,
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  avatarButtonDemo: {
    backgroundColor: colors.forest,
    borderColor: 'rgba(255,255,255,0.65)',
    borderWidth: 2,
  },
  avatarImage: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    height: 36,
    width: 36,
  },
  avatarInitial: {
    color: colors.forest,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  avatarLeaf: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
    transform: [{ rotate: '-20deg' }],
  },
  brand: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.7,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 9,
  },
  connectButton: {
    paddingHorizontal: 4,
    paddingVertical: 10,
  },
  connectText: {
    color: colors.forest,
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    gap: 19,
    paddingBottom: 42,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  date: {
    color: colors.inkMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.8,
    marginBottom: 10,
  },
  footer: {
    color: colors.inkMuted,
    fontSize: 11,
    fontStyle: 'italic',
    opacity: 0.74,
    textAlign: 'center',
  },
  footerGroup: {
    alignItems: 'center',
    gap: 9,
    marginTop: 2,
  },
  footerLink: {
    color: colors.inkMuted,
    fontSize: 10,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  footerLinkPressed: {
    opacity: 0.5,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  intro: {
    marginBottom: 2,
  },
  loading: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingSpinner: {
    marginTop: 18,
  },
  languageButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(20, 55, 45, 0.07)',
    borderColor: 'rgba(20, 55, 45, 0.10)',
    borderRadius: 19,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    width: 36,
  },
  periodRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pressed: {
    opacity: 0.68,
    transform: [{ scale: 0.97 }],
  },
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  statusDot: {
    backgroundColor: '#64A873',
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  statusDotSyncing: {
    backgroundColor: colors.sun,
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  subtitle: {
    color: colors.inkMuted,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  title: {
    color: colors.ink,
    fontSize: 42,
    fontWeight: '700',
    letterSpacing: -2.1,
    lineHeight: 44,
  },
  titleJapanese: {
    fontSize: 38,
    letterSpacing: -1.1,
    lineHeight: 46,
  },
});
