import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { GitHubDeviceVerification } from '../services/githubAuth';
import { colors } from '../theme/colors';
import { type AppLanguage, translations } from '../i18n/translations';
import { BrandMark } from './BrandMark';

interface ProfileSheetProps {
  error: string | null;
  isConnecting: boolean;
  isSyncing: boolean;
  language: AppLanguage;
  onCancelConnect: () => void;
  onClose: () => void;
  onConnect: (
    onVerification: (verification: GitHubDeviceVerification) => void,
  ) => Promise<boolean>;
  onDisconnect: () => Promise<boolean>;
  username: string | null;
  visible: boolean;
}

export function ProfileSheet({
  error,
  isConnecting,
  isSyncing,
  language,
  onCancelConnect,
  onClose,
  onConnect,
  onDisconnect,
  username,
  visible,
}: ProfileSheetProps) {
  const [verification, setVerification] = useState<GitHubDeviceVerification | null>(null);
  const messages = translations[language];

  const close = () => {
    if (isConnecting) onCancelConnect();
    onClose();
  };

  const confirmDisconnect = () => {
    Alert.alert(messages.profile.disconnectTitle, messages.profile.disconnectBody, [
      { style: 'cancel', text: messages.profile.cancel },
      {
        onPress: async () => {
          const disconnected = await onDisconnect();
          if (disconnected) {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onClose();
          }
        },
        style: 'destructive',
        text: messages.profile.disconnectConfirm,
      },
    ]);
  };

  const beginConnection = () => {
    setVerification(null);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    void onConnect(setVerification).then((connected) => {
      if (connected) onClose();
    });
  };

  useEffect(() => {
    if (visible) setVerification(null);
  }, [visible]);

  return (
    <Modal animationType="fade" onRequestClose={close} transparent visible={visible}>
      <View style={styles.root}>
        <Pressable
          accessibilityLabel={messages.accessibility.close}
          onPress={close}
          style={styles.backdrop}
        />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <BrandMark size={42} />
          <Text style={styles.title}>{messages.profile.title}</Text>

          {username ? (
            <>
              <Text style={styles.connectedUsername}>@{username}</Text>
              <Text style={styles.note}>{messages.profile.note}</Text>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: isSyncing }}
                disabled={isSyncing}
                onPress={confirmDisconnect}
                style={({ pressed }) => [
                  styles.disconnectButton,
                  isSyncing && styles.buttonDisabled,
                  pressed && styles.disconnectButtonPressed,
                ]}
              >
                <Text style={styles.disconnectText}>{messages.profile.disconnect}</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.body}>
                {verification ? messages.profile.codeBody : messages.profile.body}
              </Text>

              {verification ? (
                <>
                  <Text style={styles.codeLabel}>{messages.profile.codeLabel}</Text>
                  <Text selectable style={styles.code}>{verification.userCode}</Text>
                  <Pressable
                    accessibilityRole="link"
                    onPress={() => void Linking.openURL(verification.verificationUri)}
                    style={({ pressed }) => [
                      styles.button,
                      pressed && styles.buttonPressed,
                    ]}
                  >
                    <Text style={styles.buttonText}>{messages.profile.openGitHub}</Text>
                  </Pressable>
                  <View style={styles.waitingRow}>
                    <ActivityIndicator color={colors.forestSoft} size="small" />
                    <Text style={styles.waitingText}>{messages.profile.waiting}</Text>
                  </View>
                </>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ busy: isConnecting, disabled: isSyncing }}
                  disabled={isSyncing}
                  onPress={beginConnection}
                  style={({ pressed }) => [
                    styles.button,
                    isSyncing && styles.buttonDisabled,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  {isConnecting ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : null}
                  <Text style={styles.buttonText}>
                    {isConnecting
                      ? messages.profile.connecting
                      : messages.profile.connect}
                  </Text>
                </Pressable>
              )}

              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Text style={styles.note}>{messages.profile.note}</Text>
              {isConnecting ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={close}
                  style={({ pressed }) => [
                    styles.cancelButton,
                    pressed && styles.cancelButtonPressed,
                  ]}
                >
                  <Text style={styles.cancelText}>{messages.profile.cancel}</Text>
                </Pressable>
              ) : null}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(8, 27, 21, 0.42)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  body: {
    color: colors.inkMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
    marginTop: 10,
    maxWidth: 340,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.forest,
    borderRadius: 17,
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'center',
    marginTop: 16,
    minHeight: 54,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonPressed: {
    transform: [{ scale: 0.985 }],
  },
  buttonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  cancelButton: {
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 7,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  cancelButtonPressed: {
    opacity: 0.6,
  },
  cancelText: {
    color: colors.inkMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  code: {
    color: colors.ink,
    fontSize: 31,
    fontWeight: '800',
    letterSpacing: 4,
    marginTop: 7,
    textAlign: 'center',
  },
  codeLabel: {
    color: colors.inkMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 18,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  connectedUsername: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 14,
  },
  disconnectButton: {
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 15,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  disconnectButtonPressed: {
    opacity: 0.62,
  },
  disconnectText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 10,
    textAlign: 'center',
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: 'rgba(20,55,45,0.16)',
    borderRadius: 3,
    height: 5,
    marginBottom: 22,
    width: 42,
  },
  note: {
    color: '#829088',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 14,
    textAlign: 'center',
  },
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  title: {
    color: colors.ink,
    fontSize: 27,
    fontWeight: '700',
    letterSpacing: -0.9,
    marginTop: 18,
  },
  waitingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 14,
  },
  waitingText: {
    color: colors.inkMuted,
    fontSize: 12,
  },
});
