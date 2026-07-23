import assert from 'node:assert/strict';
import test from 'node:test';

import { detectLanguage, localeFor, translations } from './translations';

test('selects Japanese only for Japanese locales', () => {
  assert.equal(detectLanguage('ja-JP'), 'ja');
  assert.equal(detectLanguage('en-US'), 'en');
  assert.equal(detectLanguage(undefined), 'en');
});

test('provides localized widget copy', () => {
  assert.equal(localeFor('ja'), 'ja-JP');
  assert.equal(translations.en.widget.streak(3), '3 day streak');
  assert.equal(translations.ja.widget.streak(3), '3日連続');
});
