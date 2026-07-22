import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
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
import { PeriodControl } from './src/components/PeriodControl';
import { ProfileSheet } from './src/components/ProfileSheet';
import { StatsPanel } from './src/components/StatsPanel';
import { useGarden } from './src/hooks/useGarden';
import { colors } from './src/theme/colors';
import type { GardenPeriod } from './src/types/garden';

const todayLabel = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'long',
  weekday: 'long',
}).format(new Date());

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
  const [profileOpen, setProfileOpen] = useState(false);
  const garden = useGarden(period);

  const connect = async (username: string) => {
    const success = await garden.sync(username);
    if (success) setProfileOpen(false);
  };

  if (garden.isHydrating) {
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
              refreshing={garden.isSyncing && !profileOpen}
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
            <Pressable
              accessibilityLabel={garden.username ? 'Change GitHub profile' : 'Connect GitHub profile'}
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

          <View style={styles.intro}>
            <Text style={styles.date}>{todayLabel.toUpperCase()}</Text>
            <Text style={styles.title}>{garden.isDemo ? 'Grow with every\ncontribution.' : 'Your garden is\ngrowing.'}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, garden.isSyncing && styles.statusDotSyncing]} />
              <Text style={styles.subtitle}>
                {garden.isDemo
                  ? 'A living record of the work you put in.'
                  : `@${garden.username}  ·  ${
                      garden.isSyncing
                        ? 'tending the garden…'
                        : garden.error
                          ? 'showing the last saved garden'
                          : 'garden is up to date'
                    }`}
              </Text>
            </View>
          </View>

          <View style={styles.periodRow}>
            <PeriodControl onChange={setPeriod} value={period} />
            {garden.isDemo ? (
              <Pressable
                onPress={() => setProfileOpen(true)}
                style={({ pressed }) => [styles.connectButton, pressed && styles.pressed]}
              >
                <Text style={styles.connectText}>Connect GitHub</Text>
              </Pressable>
            ) : null}
          </View>

          <GardenField days={garden.days} period={period} />
          <StatsPanel stats={garden.stats} />

          <View style={styles.widgetCard}>
            <View style={styles.widgetIcon}>
              {[1, 3, 2, 4].map((level, index) => (
                <View key={index} style={[styles.widgetBlade, { height: 5 + level * 4 }]} />
              ))}
            </View>
            <View style={styles.widgetCopy}>
              <Text style={styles.widgetEyebrow}>HOME SCREEN GARDEN</Text>
              <Text style={styles.widgetTitle}>Keep your momentum in sight.</Text>
            </View>
            <Text style={styles.widgetBadge}>iOS + ANDROID</Text>
          </View>

          <Text style={styles.footer}>Small steps become wild places.</Text>
        </ScrollView>
      </SafeAreaView>

      <ProfileSheet
        error={garden.error}
        isSyncing={garden.isSyncing}
        onClose={() => {
          if (!garden.isSyncing) setProfileOpen(false);
        }}
        onSubmit={(username) => void connect(username)}
        username={garden.username}
        visible={profileOpen}
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
    marginTop: 2,
    opacity: 0.74,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  widgetBadge: {
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: 10,
    color: '#AFC7B4',
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 0.5,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  widgetBlade: {
    backgroundColor: colors.meadowLight,
    borderRadius: 3,
    width: 5,
  },
  widgetCard: {
    alignItems: 'center',
    backgroundColor: colors.forest,
    borderRadius: 22,
    flexDirection: 'row',
    padding: 14,
  },
  widgetCopy: {
    flex: 1,
    marginLeft: 13,
  },
  widgetEyebrow: {
    color: '#94B79E',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  widgetIcon: {
    alignItems: 'flex-end',
    backgroundColor: colors.forestSoft,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 3,
    height: 48,
    justifyContent: 'center',
    paddingBottom: 12,
    width: 54,
  },
  widgetTitle: {
    color: '#F7F8EF',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
});
