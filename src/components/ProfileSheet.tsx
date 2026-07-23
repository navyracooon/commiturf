import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors } from '../theme/colors';
import { type AppLanguage, translations } from '../i18n/translations';
import { BrandMark } from './BrandMark';

interface ProfileSheetProps {
  error: string | null;
  isSyncing: boolean;
  language: AppLanguage;
  onClose: () => void;
  onDisconnect: () => Promise<boolean>;
  onSubmit: (username: string) => void;
  username: string | null;
  visible: boolean;
}

export function ProfileSheet({
  error,
  isSyncing,
  language,
  onClose,
  onDisconnect,
  onSubmit,
  username,
  visible,
}: ProfileSheetProps) {
  const [value, setValue] = useState(username ?? '');
  const messages = translations[language];

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

  useEffect(() => {
    if (visible) setValue(username ?? '');
  }, [username, visible]);

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.root}
      >
        <Pressable accessibilityLabel={messages.accessibility.close} onPress={onClose} style={styles.backdrop} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <BrandMark size={42} />
          <Text style={styles.title}>{messages.profile.title}</Text>
          <Text style={styles.body}>{messages.profile.body}</Text>

          <View style={[styles.inputWrap, error && styles.inputError]}>
            <Text style={styles.at}>@</Text>
            <TextInput
              accessibilityLabel={messages.profile.inputLabel}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSyncing}
              onChangeText={setValue}
              onSubmitEditing={() => {
                if (!isSyncing && value.trim()) onSubmit(value);
              }}
              placeholder="github-username"
              placeholderTextColor="#93A29B"
              returnKeyType="go"
              selectionColor={colors.forestSoft}
              style={styles.input}
              value={value}
            />
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ busy: isSyncing, disabled: isSyncing || !value.trim() }}
            disabled={isSyncing || value.trim().length === 0}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSubmit(value);
            }}
            style={({ pressed }) => [
              styles.button,
              (isSyncing || !value.trim()) && styles.buttonDisabled,
              pressed && styles.buttonPressed,
            ]}
          >
            {isSyncing ? <ActivityIndicator color={colors.white} size="small" /> : null}
            <Text style={styles.buttonText}>
              {isSyncing ? messages.profile.planting : messages.profile.submit}
            </Text>
          </Pressable>
          <Text style={styles.note}>{messages.profile.note}</Text>
          {username ? (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: isSyncing }}
              disabled={isSyncing}
              onPress={confirmDisconnect}
              style={({ pressed }) => [
                styles.disconnectButton,
                isSyncing && styles.disconnectButtonDisabled,
                pressed && styles.disconnectButtonPressed,
              ]}
            >
              <Text style={styles.disconnectText}>{messages.profile.disconnect}</Text>
            </Pressable>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  at: {
    color: colors.inkMuted,
    fontSize: 17,
    fontWeight: '600',
  },
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
    marginBottom: 22,
    marginTop: 10,
    maxWidth: 330,
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
  error: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 8,
  },
  disconnectButton: {
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 13,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  disconnectButtonDisabled: {
    opacity: 0.4,
  },
  disconnectButtonPressed: {
    opacity: 0.62,
  },
  disconnectText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: 'rgba(20,55,45,0.16)',
    borderRadius: 3,
    height: 5,
    marginBottom: 22,
    width: 42,
  },
  input: {
    color: colors.ink,
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    paddingVertical: 0,
  },
  inputError: {
    borderColor: 'rgba(168,72,61,0.55)',
  },
  inputWrap: {
    alignItems: 'center',
    backgroundColor: '#F0F2E9',
    borderColor: colors.line,
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    minHeight: 54,
    paddingHorizontal: 16,
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
});
