import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { type AppLanguage, translations } from '../i18n/translations';
import { colors } from '../theme/colors';

interface PrivacySheetProps {
  language: AppLanguage;
  onClose: () => void;
  visible: boolean;
}

export function PrivacySheet({ language, onClose, visible }: PrivacySheetProps) {
  const messages = translations[language];
  const sections = [
    [messages.privacy.dataTitle, messages.privacy.dataBody],
    [messages.privacy.deletionTitle, messages.privacy.deletionBody],
    [messages.privacy.thirdPartyTitle, messages.privacy.thirdPartyBody],
  ] as const;

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.root}>
        <Pressable
          accessibilityLabel={messages.accessibility.close}
          onPress={onClose}
          style={styles.backdrop}
        />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.heading}>
            <View>
              <Text style={styles.title}>{messages.privacy.title}</Text>
              <Text style={styles.updated}>{messages.privacy.updated}</Text>
            </View>
            <Pressable
              accessibilityLabel={messages.accessibility.close}
              accessibilityRole="button"
              onPress={onClose}
              style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
            >
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.intro}>{messages.privacy.intro}</Text>
            {sections.map(([title, body]) => (
              <View key={title} style={styles.section}>
                <Text style={styles.sectionTitle}>{title}</Text>
                <Text style={styles.body}>{body}</Text>
              </View>
            ))}
          </ScrollView>
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
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(20,55,45,0.07)',
    borderRadius: 17,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  closeButtonPressed: {
    opacity: 0.58,
  },
  closeText: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '400',
    lineHeight: 27,
  },
  content: {
    paddingBottom: 8,
    paddingTop: 22,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: 'rgba(20,55,45,0.16)',
    borderRadius: 3,
    height: 5,
    marginBottom: 19,
    width: 42,
  },
  heading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  intro: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
  },
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  section: {
    borderTopColor: colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 19,
    paddingTop: 17,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '78%',
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  title: {
    color: colors.ink,
    fontSize: 27,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  updated: {
    color: colors.inkMuted,
    fontSize: 10,
    marginTop: 4,
  },
});
