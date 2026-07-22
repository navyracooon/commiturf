import * as Haptics from 'expo-haptics';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { type AppLanguage, translations } from '../i18n/translations';
import { colors } from '../theme/colors';
import { GlobeIcon } from './GlobeIcon';

interface LanguageSheetProps {
  language: AppLanguage;
  onClose: () => void;
  onSelect: (language: AppLanguage) => void;
  visible: boolean;
}

const options: { label: string; value: AppLanguage }[] = [
  { label: 'English', value: 'en' },
  { label: 'Japanese', value: 'ja' },
];

export function LanguageSheet({ language, onClose, onSelect, visible }: LanguageSheetProps) {
  const messages = translations[language];

  const select = (next: AppLanguage) => {
    void Haptics.selectionAsync();
    onSelect(next);
    onClose();
  };

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
          <View style={styles.icon}>
            <GlobeIcon size={25} />
          </View>
          <Text style={styles.title}>{messages.language.title}</Text>
          <Text style={styles.body}>{messages.language.body}</Text>

          <View style={styles.options}>
            {options.map((option, index) => {
              const selected = option.value === language;
              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  key={option.value}
                  onPress={() => select(option.value)}
                  style={({ pressed }) => [
                    styles.option,
                    index > 0 && styles.optionBorder,
                    pressed && styles.optionPressed,
                  ]}
                >
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <View style={[styles.radio, selected && styles.radioSelected]}>
                    {selected ? <View style={styles.radioDot} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
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
    marginTop: 8,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: 'rgba(20,55,45,0.16)',
    borderRadius: 3,
    height: 5,
    marginBottom: 22,
    width: 42,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: '#EDF1E7',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  option: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 68,
    paddingHorizontal: 16,
  },
  optionBorder: {
    borderColor: colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  optionLabel: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  optionPressed: {
    backgroundColor: 'rgba(20,55,45,0.045)',
  },
  options: {
    backgroundColor: '#F2F3EC',
    borderColor: colors.line,
    borderRadius: 19,
    borderWidth: 1,
    marginTop: 22,
    overflow: 'hidden',
  },
  radio: {
    alignItems: 'center',
    borderColor: 'rgba(20,55,45,0.28)',
    borderRadius: 10,
    borderWidth: 1.5,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  radioDot: {
    backgroundColor: colors.white,
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  radioSelected: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: Platform.OS === 'ios' ? 36 : 28,
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
